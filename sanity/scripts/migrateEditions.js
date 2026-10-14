/* global console, process, URL */
import {writeFileSync} from 'node:fs'
import {
  EDITIONS,
  SITE,
  block,
  client,
  editionSlug,
  fetchDocument,
  key,
  pendingImage,
  uploadImage,
} from './lib/oldSite.js'

/**
 * Fills in each edition's dates and description, and images where the
 * old page has a slideshow (only DX27), from the old site's edition pages
 * (desertx.org/dx/…). By default it's a dry run: it writes what it would
 * set to scripts/migrateEditions.dry-run.json and touches nothing. With
 * --import it sets each field only where it's still empty, so re-running
 * never overwrites what editors have changed.
 *
 *   npx sanity exec scripts/migrateEditions.js --with-user-token
 *   npx sanity exec scripts/migrateEditions.js --with-user-token -- --import
 */
const IMPORT = process.argv.includes('--import')
const DRY_RUN_FILE = new URL('./migrateEditions.dry-run.json', import.meta.url)

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

const isoDate = (year, month, day) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

/**
 * The dates in a line like "February 25 – April 30", "January 16 –
 * February 28, 2026" or "October 30, 2027 – May 7, 2028". A missing year
 * is the end's, or the edition's; a start month after the end month is in
 * the year before.
 */
const parseDates = (line, editionYear) => {
  const parts = line.split(/\s+[–—-]\s+/)
  if (parts.length !== 2) return null
  const parse = (part) => {
    const match = part.trim().match(/^(?:([a-z]+)\s+)?(\d{1,2})(?:,\s*(\d{4}))?$/i)
    if (!match) return null
    const month = match[1] ? MONTHS.indexOf(match[1].toLowerCase()) + 1 : null
    return {month, day: Number(match[2]), year: match[3] ? Number(match[3]) : null}
  }
  const start = parse(parts[0])
  const end = parse(parts[1])
  if (!start?.month || !end) return null
  end.month ??= start.month
  end.year ??= start.year ?? editionYear
  start.year ??= start.month > end.month ? end.year - 1 : end.year
  return {
    startDate: isoDate(start.year, start.month, start.day),
    endDate: isoDate(end.year, end.month, end.day),
  }
}

/**
 * An edition page's dates, description and slideshow images. The first
 * text module opens with three headings: "Desert X 2017", the place and
 * the dates. The description is the rest of the text before the list of
 * artworks, headings included as paragraphs; banners are left out.
 */
const readEdition = (document, edition, context) => {
  const result = {description: [], images: [], warnings: []}
  for (const article of document.querySelectorAll('section.container > article')) {
    if (article.classList.contains('list')) break
    if (article.classList.contains('slideshow')) {
      article.querySelectorAll('.slide').forEach((slide) => {
        const image = slide.querySelector('img')
        if (image) {
          const caption = slide.querySelector('.slide__caption')?.textContent.trim()
          result.images.push({_key: key(), ...pendingImage(image.getAttribute('src'), caption)})
        }
      })
    }
    if (!article.classList.contains('text')) continue
    const inner = article.querySelector('.text__inner') ?? article
    for (const element of inner.children) {
      if (element.tagName === 'H2' && !result.dates) {
        const dates = parseDates(element.textContent.trim(), edition.year)
        if (dates) result.dates = dates
        continue
      }
      if (element.tagName === 'H2' && !result.description.length) continue
      const value = block(element, context)
      if (value) result.description.push(value)
    }
  }
  if (!result.dates) result.warnings.push('No dates')
  if (!result.description.length) result.warnings.push('No description')
  return result
}

const main = async () => {
  const existing = await client.fetch(`{
    "editions": *[_type == "edition" && !(_id in path("drafts.**"))]{
      _id, "slug": slug.current, startDate, endDate, "hasDescription": defined(description),
      "hasImages": count(images) > 0
    },
    "newsSlugs": *[_type == "news" && _id match "news-*"].slug.current,
    "aboutId": *[_type == "page" && slug.current == "about"][0]._id
  }`)
  const context = {newsSlugs: new Set(existing.newsSlugs), aboutId: existing.aboutId}

  const patches = []
  for (const edition of EDITIONS) {
    const slug = editionSlug(edition)
    const document = existing.editions.find((found) => found.slug === slug)
    if (!document) {
      console.log(`No edition ${slug} in the Studio, skipped`)
      continue
    }
    const page = await fetchDocument(`${SITE}/dx/${edition.path}`)
    const {dates, description, images, warnings} = readEdition(page, edition, context)
    const set = {
      ...(dates && !document.startDate && {startDate: dates.startDate}),
      ...(dates && !document.endDate && {endDate: dates.endDate}),
      ...(description.length && !document.hasDescription && {description}),
      ...(images.length && !document.hasImages && {images}),
    }
    patches.push({_id: document._id, slug, set, warnings})
    console.log(
      `${slug}: ${dates ? `${dates.startDate} to ${dates.endDate}` : 'no dates'}, ${description.length} paragraphs, ${images.length} images${warnings.length ? ` (${warnings.join(', ')})` : ''}`,
    )
  }

  if (!IMPORT) {
    writeFileSync(DRY_RUN_FILE, JSON.stringify(patches, null, 2))
    console.log(`\nDry run: wrote ${DRY_RUN_FILE.pathname}. Nothing was imported.`)
    return
  }

  const transaction = client.transaction()
  for (const {_id, set} of patches) {
    if (set.images) {
      for (const [index, image] of set.images.entries()) {
        set.images[index] = {_key: image._key, ...(await uploadImage(image))}
      }
    }
    if (Object.keys(set).length) transaction.patch(_id, {set})
  }
  await transaction.commit()
  console.log(`\nUpdated ${patches.filter(({set}) => Object.keys(set).length).length} editions.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
