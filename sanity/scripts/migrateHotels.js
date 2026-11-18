/* global console, process, URL */
import {writeFileSync} from 'node:fs'
import {
  SITE,
  block,
  client,
  fetchDocument,
  key,
  pendingImage,
  slugOf,
  uploadImage,
} from './lib/oldSite.js'

/**
 * Moves the old Partner Hotels page (desertx.org/visit/stay) to the Stay
 * page. Each hotel's old page becomes a page of its own under Stay
 * (stay/<slug>): a Carousel of its photos, or its one cover photo, then a
 * Text module with its name, address, phone and website. On Stay, each
 * hotel gets a Media module, its photo and caption from the old list,
 * linking to its page, in the old order. A Media module already there
 * with a hotel's caption (Parker, added by hand) gets the link instead.
 * By default it's a dry run: it writes what it would do to
 * scripts/migrateHotels.dry-run.json and touches nothing. With --import it
 * uploads the photos and creates the pages and modules (on Stay's draft
 * too, if there is one). Pages that already exist are left as they are,
 * and modules already linking to their hotel aren't added again, so
 * re-running is safe.
 *
 *   npx sanity exec scripts/migrateHotels.js --with-user-token
 *   npx sanity exec scripts/migrateHotels.js --with-user-token -- --import
 */
const IMPORT = process.argv.includes('--import')
const DRY_RUN_FILE = new URL('./migrateHotels.dry-run.json', import.meta.url)

// Old slugs fixed on the way over (redirects.js sends the old URL on)
const SLUG_FIXES = {'thompson-palm-springa': 'thompson-palm-springs'}

const textBlock = (text) => ({
  _key: key(),
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [{_key: key(), _type: 'span', text, marks: []}],
})

const textOf = (element) => element.textContent.replace(/\s+/g, ' ').trim()

/** A hotel's page, from its old one. */
const hotelPage = async ({href}) => {
  const document = await fetchDocument(href)
  const text = document.querySelector('.text__inner')
  const title = textOf(text.querySelector('h2'))
  const sources = [...document.querySelectorAll('.slide__image, .cover__image img')].map(
    (img) => img.src,
  )
  if (!sources.length) throw new Error(`No photos on ${href}`)

  const oldSlug = slugOf(href)
  const slug = SLUG_FIXES[oldSlug] ?? oldSlug
  return {
    _id: `page-hotel-${slug}`,
    _type: 'page',
    title,
    slug: {_type: 'slug', current: `stay/${slug}`},
    modules: [
      {
        _key: key(),
        _type: 'carouselModule',
        images: sources.map((source) => ({_key: key(), ...pendingImage(source)})),
      },
      {
        _key: key(),
        _type: 'textModule',
        heading: title,
        text: [...text.querySelectorAll('p')].map((p) => block(p)).filter(Boolean),
      },
    ],
  }
}

const main = async () => {
  const list = await fetchDocument(`${SITE}/visit/stay`)
  const items = [...list.querySelectorAll('a.list__item')].map((a) => ({
    href: a.href,
    caption: textOf(a.querySelector('.list__title')),
    image: a.querySelector('.list__image img').src,
  }))
  if (!items.length) throw new Error('No hotels found on the old Stay page')

  const stay =
    await client.fetch(`*[_type == "page" && slug.current == "stay" && !(_id in path("drafts.**"))][0]{
    _id,
    "modules": modules[]{_key, _type, "caption": pt::text(caption), "linksTo": link.internalLink._ref},
    "hasDraft": defined(*[_id == "drafts." + ^._id][0])
  }`)
  if (!stay) throw new Error('No Stay page')
  const pages = []
  const links = [] // Media modules already on Stay, to link
  const modules = [] // Media modules to add to Stay
  for (const item of items) {
    const page = await hotelPage(item)
    pages.push(page)
    const link = {linkType: 'internal', internalLink: {_type: 'reference', _ref: page._id}}
    const media = stay.modules?.filter(({_type}) => _type === 'mediaModule') ?? []
    if (media.some(({linksTo}) => linksTo === page._id)) continue
    const same = media.find(({caption, linksTo}) => caption === item.caption && !linksTo)
    if (same) {
      links.push({_key: same._key, link})
      continue
    }
    modules.push({
      _key: key(),
      _type: 'mediaModule',
      mediaType: 'image',
      image: pendingImage(item.image),
      caption: [textBlock(item.caption)],
      link,
    })
  }
  const existing = new Set(
    await client.fetch(`*[_id in $ids]._id`, {ids: pages.map(({_id}) => _id)}),
  )
  const newPages = pages.filter(({_id}) => !existing.has(_id))

  if (!IMPORT) {
    writeFileSync(
      DRY_RUN_FILE,
      JSON.stringify({stay: stay._id, pages: newPages, links, modules}, null, 2),
    )
    console.log(
      `Dry run: ${newPages.length} new hotel pages (${pages.length - newPages.length} already there), ${links.length} Media modules to link and ${modules.length} to add on Stay. See ${DRY_RUN_FILE.pathname}`,
    )
    return
  }

  for (const page of newPages) {
    const carousel = page.modules[0]
    for (const [index, image] of carousel.images.entries()) {
      carousel.images[index] = {_key: image._key, ...(await uploadImage(image))}
    }
  }
  for (const module of modules) module.image = await uploadImage(module.image)

  const transaction = client.transaction()
  newPages.forEach((page) => transaction.createIfNotExists(page))
  // A draft keeps its own modules: it gets the links where it still has
  // the same module, and the new modules at its end
  const ids = [stay._id, ...(stay.hasDraft ? [`drafts.${stay._id}`] : [])]
  for (const id of ids) {
    transaction.patch(id, (patch) => {
      links.forEach(({_key, link}) => patch.set({[`modules[_key == "${_key}"].link`]: link}))
      return modules.length ? patch.setIfMissing({modules: []}).append('modules', modules) : patch
    })
  }
  await transaction.commit()
  console.log(
    `Created ${newPages.length} hotel pages, linked ${links.length} and added ${modules.length} Media modules on Stay.`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
