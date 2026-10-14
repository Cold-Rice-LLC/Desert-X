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
  pendingImage,
  uploadCount,
  uploadImage,
  withUploads,
} from './lib/oldSite.js'

/**
 * Migrates artworks from the old site's edition pages (desertx.org/dx/…)
 * into `artwork` documents, with their artists and editions. By default
 * it's a dry run: it writes what it would import, and anything that needs
 * a look, to scripts/migrateArtworks.dry-run.json and touches nothing.
 * With --import it uploads the images and creates or replaces each
 * document, so re-running updates rather than duplicates.
 *
 *   npx sanity exec scripts/migrateArtworks.js --with-user-token
 *   npx sanity exec scripts/migrateArtworks.js --with-user-token -- --import
 *
 * Editions, artists and artworks already in the Studio are reused, matched
 * by slug, name, and edition and title. Re-running replaces the artworks
 * it imports, so edits made to them since are lost.
 *
 * The old site's /dx/archive repeats these pages with smaller images and
 * nothing new, so it's left out.
 */
const IMPORT = process.argv.includes('--import')
const DRY_RUN_FILE = new URL('./migrateArtworks.dry-run.json', import.meta.url)

// The old site's editions, oldest first. DX27 has no artworks yet.
const EDITIONS = [
  {path: 'desert-x-17', location: 'california', year: 2017},
  {path: 'desert-x-19', location: 'california', year: 2019},
  {path: 'desert-x-alula-2020', location: 'alula', year: 2020},
  {path: 'desert-x-21', location: 'california', year: 2021},
  {path: 'desert-x-alula-2022', location: 'alula', year: 2022},
  {path: 'dx-23', location: 'california', year: 2023},
  {path: 'dx24-alula', location: 'alula', year: 2024},
  {path: 'dx-25-coachella-valley', location: 'california', year: 2025},
  {path: 'dx-26-alula', location: 'alula', year: 2026},
  {path: 'dx-27-coachella-valley', location: 'california', year: 2027},
]

// Edition titles and slugs go by the region, as the Studio's do
const REGIONS = {
  california: {title: 'Coachella Valley', slug: 'coachella-valley'},
  alula: {title: 'AlUla', slug: 'alula'},
}

// Pages under an edition that aren't artworks
const SKIP = new Set([
  '/dx/desert-x-21/artist-editions',
  '/dx/desert-x-21/donors',
  '/dx/desert-x-21/dx21-the-film',
  '/dx/desert-x-21/family-guide',
  '/dx/desert-x-21/sponsors',
  '/dx/dx-23/dx-23-sponsors',
])

// Pages whose heading isn't "Artist" over "Title". `drop` removes the
// paragraph that credits the artists instead.
const OVERRIDES = {
  '/dx/desert-x-19/shybot': {title: 'Shybot', artists: ['Norma Jeane']},
  '/dx/desert-x-19/encyclopedia': {
    title: 'Encyclopedia / Desert Edition / Coachella Valley',
    artists: ['Johannes Heldén', 'Håkan Jonson'],
    drop: /^by Johannes Heldén/,
  },
}

// Long titles make unwieldy URLs
const SLUG_MAX = 96

const slugify = (text) => {
  const slug = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug.length > SLUG_MAX ? slug.slice(0, SLUG_MAX).replace(/-[^-]*$/, '') : slug
}

// Names match whatever their accents, spacing and capitals:
// "Juliao Sarmento" is "Julião Sarmento", "Aseel Al Yaquob" "Aseel AlYaquob"
const nameKey = (name) => slugify(name).replace(/-/g, '')

const textOf = (element) => element.textContent.replace(/\s+/g, ' ').trim()

/** An element's text, a line per <br>. */
const lines = (element) => {
  const clone = element.cloneNode(true)
  clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'))
  return clone.textContent
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

const COORDINATES = /^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/

const geopoint = (lat, lng) => ({_type: 'geopoint', lat: Number(lat), lng: Number(lng)})

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
 * An artwork page's content. The first text module's h2 and h3 are the
 * artist and title. The first slideshow, or a cover image, is the gallery;
 * later ones become Media modules in place. In the text, a short paragraph
 * with a "b. …" line is the artist info, and the paragraph giving the coordinates
 * (title, coordinates, site, edition) the site and coordinates, unless a
 * map gives them. The rest becomes modules as news does: Text modules,
 * split at headings, with images and embeds between them.
 */
const readArtwork = (document, override, context) => {
  const artwork = {artists: [], images: [], modules: [], warnings: []}
  let text = null

  const flush = () => {
    if (text && (text.heading || text.text.length)) artwork.modules.push(text)
    text = null
  }
  const addBlock = (value) => {
    if (!value) return
    text ??= {_key: key(), _type: 'textModule', text: []}
    text.text.push(value)
  }

  const paragraph = (element) => {
    const paragraphLines = lines(element)
    const born = paragraphLines.some((line) => /^b\.\s/.test(line))
    if (!artwork.artistInfo && born && paragraphLines.length <= 4) {
      artwork.artistInfo = paragraphLines.join('\n')
      return
    }
    const coordinates = paragraphLines[1]?.match(COORDINATES)
    if (coordinates) {
      artwork.textCoordinates = geopoint(coordinates[1], coordinates[2])
      const site = paragraphLines.slice(2).filter((line) => !/^Desert X\b/i.test(line))
      if (site.length) artwork.site = site.join('\n')
      return
    }
    addBlock(block(element, context))
  }

  const textElement = (element) => {
    const tag = element.tagName.toLowerCase()
    if (/^h[1-6]$/.test(tag)) {
      flush()
      text = {_key: key(), _type: 'textModule', heading: textOf(element), text: []}
      return
    }
    if (tag === 'figure') {
      const media = element.querySelector('img, iframe')
      if (!media) return
      flush()
      artwork.modules.push(
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
      element.querySelectorAll('p').forEach((p) => paragraph(p))
      return
    }
    if (tag === 'hr') return
    paragraph(element)
  }

  const addImage = (image, caption) => {
    if (!image) return
    if (artwork.images.length && artwork.galleryDone) {
      flush()
      artwork.modules.push(imageModule(image.getAttribute('src'), caption))
    } else {
      artwork.images.push({_key: key(), ...pendingImage(image.getAttribute('src'), caption)})
    }
  }

  const articles = [...document.querySelectorAll('section.container > article')]
  const heading = articles.find((article) => article.classList.contains('text'))
  articles.forEach((article) => {
    if (article.classList.contains('slideshow')) {
      article.querySelectorAll('.slide').forEach((slide) => {
        addImage(
          slide.querySelector('img'),
          slide.querySelector('.slide__caption')?.textContent.trim(),
        )
      })
      artwork.galleryDone = artwork.images.length > 0
    } else if (article.classList.contains('cover')) {
      addImage(article.querySelector('img'))
      artwork.galleryDone = artwork.images.length > 0
    } else if (article.classList.contains('map')) {
      const item = article.querySelector('[data-latitude]')
      if (item) artwork.coordinates = geopoint(item.dataset.latitude, item.dataset.longitude)
    } else if (article.classList.contains('text')) {
      const inner = article.querySelector('.text__inner') ?? article
      ;[...inner.children].forEach((element) => {
        const tag = element.tagName.toLowerCase()
        if (article === heading && tag === 'h2' && !artwork.name) artwork.name = textOf(element)
        else if (article === heading && tag === 'h3' && !artwork.title)
          artwork.title = textOf(element)
        else if (override?.drop?.test(textOf(element))) return
        else textElement(element)
      })
    }
    // Specials are banners: "now closed", "still on view"
  })
  flush()

  artwork.coordinates ??= artwork.textCoordinates
  if (override?.title) artwork.title = override.title
  artwork.artists = override?.artists ?? (artwork.name ? artwork.name.split(' & ') : [])

  if (!artwork.title) artwork.warnings.push('No title')
  if (!artwork.artists.length) artwork.warnings.push('No artist')
  if (!artwork.images.length) artwork.warnings.push('No images')
  if (!artwork.coordinates) artwork.warnings.push('No coordinates')
  return artwork
}

// --- Run -------------------------------------------------------------------

const ref = (_ref) => ({_type: 'reference', _ref})

const main = async () => {
  const existing = await client.fetch(`{
    "locations": *[_type == "location" && !(_id in path("drafts.**"))]{ _id, "slug": slug.current },
    "editions": *[_type == "edition" && !(_id in path("drafts.**"))]{ _id, "slug": slug.current },
    "artists": *[_type == "artist" && !(_id in path("drafts.**"))]{ _id, title },
    "artworks": *[_type == "artwork" && !(_id in path("drafts.**"))]{ _id, title, "edition": edition._ref },
    "newsSlugs": *[_type == "news" && _id match "news-*"].slug.current,
    "aboutId": *[_type == "page" && slug.current == "about"][0]._id
  }`)

  // Editions: reuse the Studio's, create the rest
  const documents = []
  const editionIds = new Map()
  for (const edition of EDITIONS) {
    const location = existing.locations.find(({slug}) => slug === edition.location)
    if (!location) throw new Error(`No location with the slug ${edition.location}`)
    const region = REGIONS[edition.location]
    const slug = `${region.slug}-${edition.year}`
    const found = existing.editions.find((document) => document.slug === slug)
    editionIds.set(edition.path, found?._id ?? `edition-${slug}`)
    if (!found) {
      documents.push({
        _id: `edition-${slug}`,
        _type: 'edition',
        title: `${region.title} ${edition.year}`,
        slug: {_type: 'slug', current: slug},
        location: ref(location._id),
        year: edition.year,
      })
    }
  }

  // Every artwork's old path and id first, so links between them resolve
  const pages = []
  for (const edition of EDITIONS) {
    for (const path of await listArtworks(edition)) {
      if (!SKIP.has(path)) pages.push({edition, path})
    }
  }
  const pageId = (edition, path) =>
    `artwork-${REGIONS[edition.location].slug}-${edition.year}-${path.split('/').at(-1)}`
  const context = {
    newsSlugs: new Set(existing.newsSlugs),
    artworkIds: new Map(pages.map(({edition, path}) => [path, pageId(edition, path)])),
    aboutId: existing.aboutId,
  }

  const artistIds = new Map(existing.artists.map(({_id, title}) => [nameKey(title), _id]))
  const artistId = (name) => {
    const nameId = nameKey(name)
    if (!artistIds.has(nameId)) {
      const slug = slugify(name)
      artistIds.set(nameId, `artist-${slug}`)
      documents.push({
        _id: `artist-${slug}`,
        _type: 'artist',
        title: name,
        slug: {_type: 'slug', current: slug},
      })
    }
    return artistIds.get(nameId)
  }

  const artworks = []
  const report = []
  for (const {edition, path} of pages) {
    const page = await fetchDocument(`${SITE}${path}`)
    const {name, warnings, artists, galleryDone, textCoordinates, ...artwork} = readArtwork(
      page,
      OVERRIDES[path],
      context,
    )
    const editionId = editionIds.get(edition.path)
    const match = existing.artworks.find(
      (document) =>
        document.edition === editionId &&
        artwork.title &&
        nameKey(document.title) === nameKey(artwork.title),
    )
    artworks.push({
      _id: match?._id ?? pageId(edition, path),
      _type: 'artwork',
      title: artwork.title ?? name ?? path,
      artists: artists.map((artist) => ({_key: key(), ...ref(artistId(artist))})),
      edition: ref(editionId),
      ...artwork,
      _year: edition.year,
    })
    if (warnings.length) report.push({path, warnings})
    console.log(`Read ${path}`)
  }

  // Slugs from titles; where titles clash, the oldest keeps the plain slug
  // and the rest add their year
  const taken = new Set()
  const clashes = []
  artworks
    .toSorted((a, b) => a._year - b._year)
    .forEach((artwork) => {
      let slug = slugify(artwork.title)
      if (taken.has(slug)) {
        clashes.push(`${slug} → ${slug}-${artwork._year}`)
        slug = `${slug}-${artwork._year}`
      }
      taken.add(slug)
      artwork.slug = {_type: 'slug', current: slug}
      delete artwork._year
    })
  documents.push(...artworks)

  const created = (type) => documents.filter((document) => document._type === type).length
  console.log(
    `\n${artworks.length} artworks, ${created('artist')} new artists, ${created('edition')} new editions`,
  )
  if (clashes.length) console.log(`Slugs with a year added:\n  ${clashes.join('\n  ')}`)
  if (report.length) {
    console.log(
      `To check:\n  ${report.map(({path, warnings}) => `${path}: ${warnings.join(', ')}`).join('\n  ')}`,
    )
  }

  if (!IMPORT) {
    writeFileSync(DRY_RUN_FILE, JSON.stringify({clashes, report, documents}, null, 2))
    console.log(`\nDry run: wrote ${DRY_RUN_FILE.pathname}. Nothing was imported.`)
    return
  }

  for (const artwork of artworks) {
    for (const [index, image] of artwork.images.entries()) {
      artwork.images[index] = {_key: image._key, ...(await uploadImage(image))}
    }
    await withUploads(artwork.modules)
    console.log(`Uploaded media for ${artwork._id}`)
  }
  // One transaction, so references between new documents resolve
  await documents
    .reduce((transaction, document) => transaction.createOrReplace(document), client.transaction())
    .commit()
  console.log(`\nImported ${documents.length} documents and ${uploadCount()} images and files.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
