/* global console, process, URL */
import {writeFileSync} from 'node:fs'
import {EDITIONS, SITE, block, client, fetchDocument, withUploads} from './lib/oldSite.js'

/**
 * Migrates the Spanish of the old site's artwork pages (desertx.org/es/dx/…)
 * into the artworks' Spanish fields: titleEs and artistInfoEs, and each
 * Text module's headingEs and textEs and each Media module's captionEs
 * and secondCaptionEs.
 * By default it's a dry run: it writes what it would set, and anything
 * that needs a look, to scripts/migrateSpanish.dry-run.json and touches
 * nothing. With --import it patches each artwork, only if it hasn't
 * changed since it was read. Safe to rerun; it only sets Spanish fields.
 *
 *   npx sanity exec scripts/migrateSpanish.js --with-user-token
 *   npx sanity exec scripts/migrateSpanish.js --with-user-token -- --import
 *
 * The Spanish pages follow the English ones section for section, though
 * not always paragraph for paragraph, so each is read into its title,
 * intro (the artist info) and sections of body (see readPage). Each Text
 * module is found among the English sections by its heading or first
 * paragraph, and gets the whole Spanish section in the same place. A
 * module that can't be placed is reported and left English, as is one
 * whose Spanish has a different number of paragraphs (imported, but
 * worth a look). Gallery captions stay English, as the gallery has no
 * Spanish.
 */
const IMPORT = process.argv.includes('--import')
// --only=slug,slug: just those pages, to check a few
const ONLY = (process.argv.find((arg) => arg.startsWith('--only='))?.slice(7) ?? '')
  .split(',')
  .filter(Boolean)
const DRY_RUN_FILE = new URL('./migrateSpanish.dry-run.json', import.meta.url)

// As migrateArtworks names them: artwork-{region}-{year}-{old slug}
const ID_REGIONS = {california: 'coachella-valley', alula: 'alula'}

const normalise = (text = '') => text.replace(/\s+/g, ' ').trim().toLowerCase()
const blockText = (value) => value.children.map((child) => child.text ?? '').join('')
const richText = (blocks = []) => blocks.map(blockText).join('\n\n')

/** An element's text, a line per <br>. */
const lines = (element) => {
  const clone = element.cloneNode(true)
  clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'))
  return clone.textContent
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

/** The block without its first line, its spans and their marks kept. */
const withoutFirstLine = (value) => {
  let dropping = true
  const children = value.children
    .map((child) => {
      if (!dropping) return child
      const newline = child.text.indexOf('\n')
      if (newline === -1) return null
      dropping = false
      return {...child, text: child.text.slice(newline + 1)}
    })
    .filter((child) => child && child.text !== '')
  return {...value, children}
}

// A paragraph giving where the artwork stands has its coordinates
const COORDINATES = /-?\d+\.\d{3,},\s*-?\d+\.\d{3,}/
const BORN = /(^|\()\s*[bn]\.\s/m
// The caption that closed the old pages' text ends with the edition
const EDITION_LINE = /desert ?x( [\w ]+)? \d{4}$/i

/**
 * An artwork page's text, as migrateArtworks reads it: the title (the
 * heading article's h3); the intro, the paragraphs up to the one giving
 * the coordinates (the artist info among them); the figures' captions; and
 * the body in sections, a new one at each heading, after each figure and
 * after each later slideshow, as Text modules split. Slideshows are the
 * gallery, so they're left out: the two languages often show different
 * slides.
 */
const readPage = (document, infoCount) => {
  const page = {title: null, intro: [], figures: [], sections: []}
  let section = null
  let introDone = false
  let sawCoordinates = false
  const startSection = (heading = null) => {
    introDone = true
    section = {heading, items: []}
    page.sections.push(section)
  }
  const addText = (item) => {
    if (!introDone) {
      page.intro.push(item)
      if (COORDINATES.test(item.element.textContent)) introDone = sawCoordinates = true
      return
    }
    if (!section) startSection()
    section.items.push(item)
  }

  let index = -1
  for (const article of document.querySelectorAll('section.container > article')) {
    // Slideshows after the gallery become Media modules between Text ones
    if (article.classList.contains('slideshow') && section?.items.length) section = null
    if (!article.classList.contains('text')) continue
    index += 1
    const inner = article.querySelector('.text__inner') ?? article
    for (const element of inner.children) {
      const tag = element.tagName.toLowerCase()
      if (index === 0 && tag === 'h2' && !page.title) continue
      if (index === 0 && tag === 'h3' && !page.title) page.title = element
      else if (/^h[1-6]$/.test(tag)) startSection(element)
      else if (tag === 'figure') {
        page.figures.push(element.querySelector('figcaption'))
        // A figure before the intro (a cover image) doesn't end it
        if (introDone || page.intro.length) startSection()
      } else if (tag === 'ul' || tag === 'ol') {
        element
          .querySelectorAll(':scope > li')
          .forEach((li) => addText({element: li, prefix: '• '}))
      } else if (tag === 'blockquote' && element.querySelector('p')) {
        element.querySelectorAll('p').forEach((p) => addText({element: p}))
      } else if (tag !== 'hr') addText({element})
    }
  }

  // No coordinates: the intro is just the opening paragraphs that read as
  // artist info ("b. 1973…", "n. 1973…", "(b. Delhi…)"), or as many as
  // `infoCount` (the English page's, for its Spanish), the rest body
  if (!sawCoordinates) {
    const info = page.intro.findIndex(({element}) => !BORN.test(element.textContent))
    const count = infoCount ?? (info === -1 ? page.intro.length : info)
    page.sections.unshift({heading: null, items: page.intro.slice(count)})
    page.intro = page.intro.slice(0, count)
  }
  // DX21 pages give the coordinates after the body: long paragraphs in the
  // intro are body, ahead of the rest
  const body = page.intro.filter(({element}) => element.textContent.trim().length > 250)
  if (body.length) {
    page.intro = page.intro.filter((item) => !body.includes(item))
    const first = page.sections[0]
    if (first && !first.heading) first.items.unshift(...body)
    else page.sections.unshift({heading: null, items: body})
  }
  page.sections = page.sections.filter(({heading, items}) => heading || items.length)
  return page
}

/** The artwork pages an edition page links to. */
const listArtworks = async (edition) => {
  const document = await fetchDocument(`${SITE}/dx/${edition.path}`)
  const prefix = `/dx/${edition.path}/`
  const paths = [...document.querySelectorAll('a[href]')]
    .map((a) => new URL(a.href).pathname.replace(/\/$/, ''))
    .filter((path) => path.startsWith(prefix) && !path.slice(prefix.length).includes('/'))
  return [...new Set(paths)]
}

/**
 * What to set on one artwork from its English and Spanish pages, and what
 * couldn't be matched.
 */
const translate = (artwork, en, es, context) => {
  const set = {}
  const unmatched = []
  const textOf = (element) => element.textContent.replace(/\s+/g, ' ').trim()
  const blockOf = (item) => block(item.element, context, item.prefix)
  const englishOf = (item) => blockText(blockOf(item) ?? {children: []})

  // Title, where its Spanish differs
  if (en.title && es.title && normalise(textOf(en.title)) === normalise(artwork.title)) {
    if (normalise(textOf(es.title)) !== normalise(artwork.title)) set.titleEs = textOf(es.title)
  }

  // Artist info: the intro paragraph whose lines it is, and its Spanish
  // in the same place
  if (artwork.artistInfo) {
    const index = en.intro.findIndex(
      ({element}) => normalise(lines(element).join('\n')) === normalise(artwork.artistInfo),
    )
    const spanish = es.intro[index]
    if (index !== -1 && spanish && !COORDINATES.test(spanish.element.textContent)) {
      set.artistInfoEs = lines(spanish.element).join('\n')
    } else {
      unmatched.push({field: 'artistInfo', english: artwork.artistInfo})
    }
  }

  // Text modules: the English section each opens, then the Spanish one
  // in the same place
  const sectionsMatch = en.sections.length === es.sections.length
  for (const module of artwork.modules ?? []) {
    if (module._type !== 'textModule') continue
    const path = (field) => `modules[_key=="${module._key}"].${field}Es`
    // Some English kept the coordinates paragraph as its first; the
    // section starts after it
    const opening = (module.text ?? []).find(
      (value, index) => index > 0 || !COORDINATES.test(blockText(value)),
    )
    const first = normalise(blockText(opening ?? {children: []}))
    const opens = (section) => {
      if (module.heading)
        return section.heading && normalise(textOf(section.heading)) === normalise(module.heading)
      // dropArtworkCaptions dropped an opening paragraph that only
      // repeated the title
      const letters = (text) => normalise(text).replace(/[^\p{L}\p{N}]/gu, '')
      const repeatsTitle =
        section.items[1] && letters(englishOf(section.items[0])).startsWith(letters(artwork.title))
      if (repeatsTitle && normalise(englishOf(section.items[1])) === first) return 'skipFirst'
      const english = section.items[0] && englishOf(section.items[0])
      if (!english) return false
      if (normalise(english) === first) return 'whole'
      // dropArtworkCaptions took a repeated title off the first line
      return english.includes('\n') && normalise(english.slice(english.indexOf('\n') + 1)) === first
        ? 'trimmed'
        : false
    }
    const index = en.sections.findIndex(opens)
    const english = en.sections[index]
    const spanish = sectionsMatch && es.sections[index]
    if (index === -1 || !spanish) {
      unmatched.push({
        module: module._key,
        field: 'text',
        english: module.heading ?? blockText(module.text?.[0] ?? {children: []}).slice(0, 80),
        why:
          index === -1
            ? 'not on the old page'
            : `${en.sections.length} English sections, ${es.sections.length} Spanish`,
      })
      continue
    }

    if (module.heading && spanish.heading) set[path('heading')] = textOf(spanish.heading)
    let blocks = spanish.items.map(blockOf).filter(Boolean)
    if (!module.heading && opens(english) === 'trimmed' && blocks.length) {
      blocks[0] = withoutFirstLine(blocks[0])
    }
    if (!module.heading && opens(english) === 'skipFirst') blocks = blocks.slice(1)
    // dropArtworkCaptions dropped the closing caption; drop its Spanish too
    const lastEnglish = english.items.at(-1) && lines(english.items.at(-1).element)
    const lastSpanish = blocks.at(-1) && blockText(blocks.at(-1)).trim().split('\n')
    const kept = (module.text ?? []).map((value) => normalise(blockText(value)))
    if (
      lastEnglish?.length > 1 &&
      EDITION_LINE.test(lastEnglish.at(-1)) &&
      !kept.includes(normalise(lastEnglish.join('\n'))) &&
      lastSpanish?.length > 1 &&
      EDITION_LINE.test(lastSpanish.at(-1))
    ) {
      blocks = blocks.slice(0, -1)
    }
    if (blocks.length) set[path('text')] = blocks
    if (spanish.items.length !== english.items.length) {
      unmatched.push({
        module: module._key,
        field: 'text',
        why: `imported, but the Spanish has ${spanish.items.length} paragraphs to the English ${english.items.length}`,
      })
    }
  }

  // Media captions: the figure whose English caption it is, and the
  // Spanish figure in the same place
  if (en.figures.length === es.figures.length) {
    for (const module of artwork.modules ?? []) {
      if (module._type !== 'mediaModule') continue
      for (const [field, english] of [
        ['caption', module.caption ? richText(module.caption) : module.imageDescription],
        [
          'secondCaption',
          module.secondCaption ? richText(module.secondCaption) : module.secondDescription,
        ],
      ]) {
        if (!english) continue
        const index = en.figures.findIndex(
          (caption) => caption && normalise(caption.textContent) === normalise(english),
        )
        const spanish = es.figures[index] && block(es.figures[index], context)
        if (spanish && normalise(blockText(spanish)) !== normalise(english)) {
          set[`modules[_key=="${module._key}"].${field}Es`] = [spanish]
        }
      }
    }
  }
  return {set, unmatched}
}

// --- Run -------------------------------------------------------------------

const main = async () => {
  const existing = await client.fetch(`{
    "artworks": *[_type == "artwork" && !(_id in path("drafts.**"))]{
      _id, _rev, title, artistInfo, "edition": edition->slug.current,
      modules[]{
        _key, _type, heading, text, caption, secondCaption,
        "imageDescription": image.asset->description,
        "secondDescription": secondImage.asset->description
      }
    },
    "newsSlugs": *[_type == "news" && _id match "news-*"].slug.current,
    "aboutId": *[_type == "page" && slug.current == "about"][0]._id
  }`)

  const pages = []
  for (const edition of EDITIONS) {
    for (const path of await listArtworks(edition)) {
      if (!ONLY.length || ONLY.some((only) => path.endsWith(only))) pages.push({edition, path})
    }
  }
  const pageId = (edition, path) =>
    `artwork-${ID_REGIONS[edition.location]}-${edition.year}-${path.split('/').at(-1)}`
  const context = {
    newsSlugs: new Set(existing.newsSlugs),
    artworkIds: new Map(pages.map(({edition, path}) => [path, pageId(edition, path)])),
    aboutId: existing.aboutId,
  }

  const patches = []
  const report = []
  for (const {edition, path} of pages) {
    const english = await fetchDocument(`${SITE}${path}`)
    const spanish = await fetchDocument(`${SITE}/es${path}`)
    // Spanish links lead to the Spanish pages; point them at the English
    spanish.querySelectorAll('a[href]').forEach((a) => {
      a.setAttribute('href', a.href.replace(/^https:\/\/desertx\.org\/es(\/|$)/, `${SITE}/`))
    })

    const en = readPage(english)
    const es = readPage(spanish, en.intro.length)
    // A Spanish page that's the English one, untranslated, has nothing
    const text = ({title, intro, sections}) =>
      normalise(
        [
          title,
          ...intro.map(({element}) => element),
          ...sections.flatMap(({heading, items}) => [
            heading,
            ...items.map(({element}) => element),
          ]),
        ]
          .map((element) => element?.textContent ?? '')
          .join(' '),
      )
    if (text(en) === text(es)) continue

    const title = english.querySelector('section.container > article.text h3')?.textContent
    const artwork =
      existing.artworks.find(({_id}) => _id === pageId(edition, path)) ??
      existing.artworks.find(
        (document) =>
          document.edition?.endsWith(String(edition.year)) &&
          normalise(document.title) === normalise(title),
      )
    if (!artwork) {
      report.push({path, error: 'No artwork in the Studio'})
      continue
    }

    const {set, unmatched} = translate(artwork, en, es, context)
    if (Object.keys(set).length) patches.push({path, _id: artwork._id, _rev: artwork._rev, set})
    if (unmatched.length) report.push({path, _id: artwork._id, unmatched})
    console.log(`Read ${path}: ${Object.keys(set).length} fields`)
  }

  const fields = patches.reduce((sum, {set}) => sum + Object.keys(set).length, 0)
  console.log(`\n${patches.length} artworks, ${fields} Spanish fields; ${report.length} to check`)
  writeFileSync(DRY_RUN_FILE, JSON.stringify({report, patches}, null, 2))
  if (!IMPORT) {
    console.log(`Dry run: wrote ${DRY_RUN_FILE.pathname}. Nothing was imported.`)
    return
  }

  const transaction = client.transaction()
  for (const {_id, _rev, set} of patches) {
    // Re-host linked PDFs, as the English import did
    for (const [field, value] of Object.entries(set)) {
      if (field.endsWith('.textEs')) await withUploads([{text: value}])
    }
    transaction.patch(_id, (patch) => patch.ifRevisionId(_rev).set(set))
  }
  await transaction.commit()
  console.log(`Patched ${patches.length} artworks`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
