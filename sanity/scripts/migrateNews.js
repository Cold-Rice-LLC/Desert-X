/* global console, process, URL */
import {writeFileSync} from 'node:fs'
import {
  SITE,
  block,
  client,
  embedModule,
  fetchDocument,
  imageModule,
  key,
  slugOf,
  uploadCount,
  withUploads,
} from './lib/oldSite.js'

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

/** The listing's items, newest first: title and URL (null if unlinked). */
const listArticles = async () => {
  const document = await fetchDocument(LISTING)
  return [...document.querySelectorAll('article.grid__item')].map((item) => ({
    title: item.querySelector('.homepage__title')?.textContent.trim(),
    url: item.querySelector('a.homepage__title')?.href ?? null,
  }))
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

// --- Run -------------------------------------------------------------------

const main = async () => {
  const listed = await listArticles()
  const articles = listed.filter(({url}) => url && new URL(url).pathname.startsWith('/learn/news/'))
  const skipped = listed.filter((article) => !articles.includes(article))
  const context = {
    newsSlugs: new Set(articles.map(({url}) => slugOf(url))),
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
  console.log(`\nImported ${documents.length} articles and ${uploadCount()} images and PDFs.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
