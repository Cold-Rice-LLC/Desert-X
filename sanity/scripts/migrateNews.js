/* global Buffer, console, fetch, process, URL */
import {randomBytes} from 'node:crypto'
import {writeFileSync} from 'node:fs'
import {JSDOM} from 'jsdom'
import {getCliClient} from 'sanity/cli'

/**
 * Migrates news from the old site (desertx.org/learn/news) into `news`
 * documents. By default it's a dry run: it writes what it would import to
 * scripts/migrateNews.dry-run.json and touches nothing. With --import it
 * uploads the images (captions go on the asset, for the media library) and
 * creates or replaces each document as `news-<slug>`, so re-running updates
 * rather than duplicates.
 *
 *   npx sanity exec scripts/migrateNews.js --with-user-token
 *   npx sanity exec scripts/migrateNews.js --with-user-token -- --import
 *
 * Listing items that link outside /learn/news, or nowhere, are skipped.
 */
const SITE = 'https://desertx.org'
const LISTING = `${SITE}/learn/news`
const IMPORT = process.argv.includes('--import')
const DRY_RUN_FILE = new URL('./migrateNews.dry-run.json', import.meta.url)

// Publish dates by slug, for articles with no dateline (from the date in
// their press release's file name where there is one, otherwise the day
// after the article below them in the old listing, to keep its order) and
// one whose dateline has the wrong year
const DATES = {
  'desert-x-2026-alula': '2025-12-10', // dateline says December 10, 2026
  'desert-x-2025-the-living-pyramid-by-agnes-denes-is-now-open': '2024-12-10',
  dxu2024: '2023-09-10',
  'desert-x-at-untitled-art': '2023-09-09',
  'desert-x-alula-2024': '2023-09-08',
  'kaitlin-garcia-maestas-co-curator-announcement': '2023-09-07',
  'desert-x-media-alert-for-dsusd': '2023-01-31',
  'second-edition-of-desert-x-alula-will-open-in-february-2022': '2021-12-08',
  // Last in the listing: the day before the article above it
  'the-third-edition-of-desert-x-in-the-coachella-valley-will-be-curated-by-cesar-garcia-alvarez-and-neville-wakefield':
    '2021-02-15',
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
// A dateline opens the press release: "Palm Springs, CA | November 13,
// 2025 –", "(Palm Springs, CA, January 30, 2025) –", "AlUla, Saudi Arabia
// (January 9, 2026):". Only the opening paragraphs are searched.
const DATELINE = new RegExp(`[(|,]\\s*(${MONTHS.join('|')})\\s+(\\d{1,2}),?\\s+(\\d{4})`)
const DATELINE_PARAGRAPHS = 6

const client = getCliClient({apiVersion: '2024-07-19'})
const key = () => randomBytes(6).toString('hex')

const fetchDocument = async (url) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${response.status} for ${url}`)
  return new JSDOM(await response.text(), {url}).window.document
}

const slugOf = (url) => new URL(url).pathname.split('/').filter(Boolean).at(-1)

/** The listing's items, newest first: title and URL (null if unlinked). */
const listArticles = async () => {
  const document = await fetchDocument(LISTING)
  return [...document.querySelectorAll('article.grid__item')].map((item) => ({
    title: item.querySelector('.homepage__title')?.textContent.trim(),
    url: item.querySelector('a.homepage__title')?.href ?? null,
  }))
}

// --- Rich text -------------------------------------------------------------

// Weak references may point at a document that isn't published yet (the
// homepage, so far); it resolves once it is
const internal = (_key, _ref, weak = false) => ({
  _key,
  _type: 'link',
  linkType: 'internal',
  internalLink: {_type: 'reference', _ref, ...(weak && {_weak: true})},
})
const external = (_key, externalUrl) => ({_key, _type: 'link', linkType: 'external', externalUrl})

/**
 * A link annotation for an old-site href, or null to drop the link and
 * keep its text. Fixes the old site's broken hrefs (emails without
 * mailto:, URLs without https://), and points links at the old site to
 * their new homes: imported articles, the homepage, the About page for
 * people, and PDFs, which are re-hosted on import (`_file`). Other
 * old-site pages have no new home yet.
 */
const linkFor = (rawHref, {slugs, aboutId}) => {
  const raw = rawHref.trim()
  const markKey = key()
  if (/^(mailto|tel):/i.test(raw)) return external(markKey, raw)
  if (/^[^\s/:@]+@[^\s/@]+\.[a-z]+$/i.test(raw)) return external(markKey, `mailto:${raw}`)

  const href = new URL(/^www\./i.test(raw) ? `https://${raw}` : raw, SITE)
  if (!/(^|\.)desertx\.org$/.test(href.hostname)) return external(markKey, href.href)

  const path = href.pathname.replace(/\/$/, '')
  // Broken relative links: an email or domain after the old site's address
  const stray = path.slice(1)
  if (/^[^\s/@]+@[^\s/@]+\.[a-z]+$/i.test(stray)) return external(markKey, `mailto:${stray}`)
  if (/^www\./i.test(stray)) return external(markKey, `https://${stray}`)

  if (path === '') return internal(markKey, 'homepage', true)
  if (path.startsWith('/learn/news/') && slugs.has(slugOf(href.href))) {
    return internal(markKey, `news-${slugOf(href.href)}`)
  }
  if (/\.pdf$/i.test(path)) return {...external(markKey, href.href), _file: true}
  if (/^\/(about\/team-board|dx\/about)\//.test(path) && aboutId) return internal(markKey, aboutId)
  return null
}

/**
 * Portable Text spans for an element's contents: italics become `em`,
 * links become link annotations (see linkFor), <br> a line break. Bold
 * has no style here, so it's dropped.
 */
const inlineSpans = (element, context) => {
  const spans = []
  const markDefs = []

  const walk = (node, marks) => {
    if (node.nodeType === 3) {
      spans.push({text: node.textContent.replace(/\s+/g, ' '), marks})
      return
    }
    if (node.nodeType !== 1) return
    const tag = node.tagName.toLowerCase()
    if (tag === 'br') {
      spans.push({text: '\n', marks})
      return
    }
    let childMarks = marks
    if (tag === 'em' || tag === 'i') childMarks = [...marks, 'em']
    const link =
      tag === 'a' && node.getAttribute('href') && linkFor(node.getAttribute('href'), context)
    if (link) {
      markDefs.push(link)
      childMarks = [...marks, link._key]
    }
    node.childNodes.forEach((child) => walk(child, childMarks))
  }
  element.childNodes.forEach((child) => walk(child, []))

  // Merge neighbours with the same marks, then trim the block's ends and
  // the spaces either side of line breaks
  const merged = spans.reduce((all, span) => {
    const last = all.at(-1)
    if (last && last.marks.join() === span.marks.join()) last.text += span.text
    else all.push({...span})
    return all
  }, [])
  merged.forEach((span) => (span.text = span.text.replace(/ *\n */g, '\n')))
  if (merged.length) {
    merged[0].text = merged[0].text.trimStart()
    merged.at(-1).text = merged.at(-1).text.trimEnd()
  }
  const children = merged
    .filter((span) => span.text)
    .map((span) => ({_key: key(), _type: 'span', text: span.text, marks: span.marks}))
  const usedMarks = new Set(children.flatMap((span) => span.marks))
  return {children, markDefs: markDefs.filter((def) => usedMarks.has(def._key))}
}

const block = (element, context, prefix = '') => {
  const {children, markDefs} = inlineSpans(element, context)
  if (!children.length) return null
  if (prefix) children[0].text = prefix + children[0].text
  return {_key: key(), _type: 'block', style: 'normal', markDefs, children}
}

// --- Modules ---------------------------------------------------------------

const imageModule = (src, caption) => ({
  _key: key(),
  _type: 'mediaModule',
  mediaType: 'image',
  image: {_type: 'image', _source: new URL(src, SITE).href, _caption: caption || undefined},
})

const embedModule = (src) => {
  const url = new URL(src, SITE)
  if (url.hostname.includes('vimeo')) {
    return {_key: key(), _type: 'mediaModule', mediaType: 'vimeo', vimeoUrl: url.href}
  }
  const youtubeId = url.pathname.split('/').at(-1)
  return {_key: key(), _type: 'mediaModule', mediaType: 'youtube', youtubeId}
}

/**
 * The old article's content as modules. Text runs become Text modules,
 * a new one at each heading (our rich text has no heading styles); images
 * and embeds, inline or in slideshows and covers, become Media modules.
 */
const articleModules = (document, context) => {
  const modules = []
  let text = null

  const flush = () => {
    if (text && (text.heading || text.text.length)) modules.push(text)
    text = null
  }
  const addBlock = (value) => {
    if (!value) return
    text ??= {_key: key(), _type: 'textModule', text: []}
    text.text.push(value)
  }

  const textElement = (element, isFirst) => {
    const tag = element.tagName.toLowerCase()
    // The first module's h2 and h3 are the headline and standfirst
    if (isFirst && (tag === 'h2' || tag === 'h3')) return addBlock(block(element, context))
    if (/^h[1-6]$/.test(tag)) {
      flush()
      text = {_key: key(), _type: 'textModule', heading: element.textContent.trim(), text: []}
      return
    }
    if (tag === 'figure') {
      const media = element.querySelector('img, iframe')
      if (!media) return
      flush()
      modules.push(
        media.tagName === 'IMG'
          ? imageModule(
              media.getAttribute('src'),
              element.querySelector('figcaption')?.textContent.trim(),
            )
          : embedModule(media.getAttribute('src')),
      )
      return
    }
    if (tag === 'ul' || tag === 'ol') {
      element.querySelectorAll(':scope > li').forEach((li) => addBlock(block(li, context, '• ')))
      return
    }
    if (tag === 'blockquote' && element.querySelector('p')) {
      element.querySelectorAll('p').forEach((p) => addBlock(block(p, context)))
      return
    }
    if (tag === 'hr') return
    addBlock(block(element, context))
  }

  const articles = [...document.querySelectorAll('section.container > article')]
  const firstText = articles.find((article) => article.classList.contains('text'))
  articles.forEach((article) => {
    if (article.classList.contains('slideshow')) {
      flush()
      article.querySelectorAll('.slide').forEach((slide) => {
        const image = slide.querySelector('img')
        if (image) {
          modules.push(
            imageModule(
              image.getAttribute('src'),
              slide.querySelector('.slide__caption')?.textContent.trim(),
            ),
          )
        }
      })
    } else if (article.classList.contains('cover')) {
      flush()
      const image = article.querySelector('img')
      const caption = [...article.querySelectorAll('.cover__text__item')]
        .map((item) => item.textContent.trim())
        .filter(Boolean)
        .join(' ')
      if (image) modules.push(imageModule(image.getAttribute('src'), caption))
    } else if (!article.classList.contains('special')) {
      // Specials are banners: the title again, or a notice linking elsewhere
      const inner = article.querySelector('.text__inner') ?? article
      ;[...inner.children].forEach((element) => textElement(element, article === firstText))
    }
  })
  flush()
  return modules
}

const publishDate = (document, slug) => {
  if (DATES[slug]) return DATES[slug]
  const match = [...document.querySelectorAll('section.container article.text p')]
    .slice(0, DATELINE_PARAGRAPHS)
    .map((p) => p.textContent.match(DATELINE))
    .find(Boolean)
  if (!match) return null
  const [, month, day, year] = match
  const monthNumber = String(MONTHS.indexOf(month) + 1).padStart(2, '0')
  return `${year}-${monthNumber}-${day.padStart(2, '0')}`
}

// --- Uploads ---------------------------------------------------------------

const uploaded = new Map()

/** Uploads a file or image once per URL, returning its asset. */
const upload = async (kind, source) => {
  if (!uploaded.has(source)) {
    const response = await fetch(source)
    if (!response.ok) throw new Error(`${response.status} for ${source}`)
    const buffer = Buffer.from(await response.arrayBuffer())
    uploaded.set(source, await client.assets.upload(kind, buffer, {filename: slugOf(source)}))
  }
  return uploaded.get(source)
}

/**
 * Swaps the dry run's placeholders for uploads: images (with their caption
 * on the asset, for the media library) and linked PDFs (re-hosted, so they
 * outlive the old site).
 */
const withUploads = async (modules) => {
  for (const module of modules) {
    if (module.image?._source) {
      const {_source, _caption} = module.image
      const asset = await upload('image', _source)
      if (_caption) await client.patch(asset._id).set({description: _caption}).commit()
      module.image = {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}
    }
    for (const link of (module.text ?? []).flatMap((block) => block.markDefs)) {
      if (link._file) {
        link.externalUrl = (await upload('file', link.externalUrl)).url
        delete link._file
      }
    }
  }
  return modules
}

// --- Run -------------------------------------------------------------------

const main = async () => {
  const listed = await listArticles()
  const articles = listed.filter(({url}) => url && new URL(url).pathname.startsWith('/learn/news/'))
  const skipped = listed.filter((article) => !articles.includes(article))
  const context = {
    slugs: new Set(articles.map(({url}) => slugOf(url))),
    aboutId: await client.fetch(`*[_type == "page" && slug.current == "about"][0]._id`),
  }

  const locations = await client.fetch(`*[_type == "location"]{ _id, "slug": slug.current }`)
  const locationId = (title) => {
    const slug = /alula/i.test(title) ? 'alula' : 'california'
    return locations.find((location) => location.slug === slug)?._id
  }

  const documents = []
  for (const {title, url} of articles) {
    const slug = slugOf(url)
    const page = await fetchDocument(url)
    const location = locationId(title)
    documents.push({
      _id: `news-${slug}`,
      _type: 'news',
      kind: 'news',
      title,
      slug: {_type: 'slug', current: slug},
      publishDate: publishDate(page, slug),
      location: location ? {_type: 'reference', _ref: location} : undefined,
      modules: articleModules(page, context),
    })
    console.log(`Read ${slug}`)
  }

  const undated = documents.filter((document) => !document.publishDate)
  console.log(
    `\n${documents.length} articles, ${skipped.length} skipped (link outside news or nowhere)`,
  )
  if (undated.length) {
    console.log(
      `No dateline, so no publish date (add to DATES):\n  ${undated.map((d) => d.slug.current).join('\n  ')}`,
    )
  }

  if (!IMPORT) {
    writeFileSync(DRY_RUN_FILE, JSON.stringify({skipped, documents}, null, 2))
    console.log(`\nDry run: wrote ${DRY_RUN_FILE.pathname}. Nothing was imported.`)
    return
  }

  for (const document of documents) {
    await withUploads(document.modules)
    console.log(`Uploaded media for ${document._id}`)
  }
  // One transaction, so links between imported articles resolve
  await documents
    .reduce((transaction, document) => transaction.createOrReplace(document), client.transaction())
    .commit()
  console.log(`\nImported ${documents.length} articles and ${uploaded.size} images and PDFs.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
