/* global console, process, URL */
import {writeFileSync} from 'node:fs'
import {client, key} from './lib/oldSite.js'

/**
 * Turns the partner hotels, moved from the old site as pages under the
 * Stay page (stay/<slug>), into Hotel documents, and the Stay page into
 * the Stay landing that lists them. Each hotel keeps its name, slug,
 * images and details; its photo and caption on Stay become its Photo on
 * Stay (unless it's the first of its images anyway) and Caption on Stay
 * (unless it's just its name). The landing keeps the Stay page's title,
 * SEO and any modules that aren't a hotel's, and lists the hotels in the
 * Stay page's order.
 * By default it's a dry run: it writes what it would create to
 * scripts/hotelPagesToHotels.dry-run.json and touches nothing.
 *
 * With --import it creates the hotels and the landing, leaving any that
 * already exist alone. The old pages stay, so the site keeps working
 * until its new /stay routes are deployed.
 * With --remove-pages, once they are, it points links to the old Stay
 * page at the landing instead, then deletes the old pages, drafts too.
 *
 *   npx sanity exec scripts/hotelPagesToHotels.js --with-user-token
 *   npx sanity exec scripts/hotelPagesToHotels.js --with-user-token -- --import
 *   npx sanity exec scripts/hotelPagesToHotels.js --with-user-token -- --remove-pages
 */
const IMPORT = process.argv.includes('--import')
const REMOVE = process.argv.includes('--remove-pages')
const DRY_RUN_FILE = new URL('./hotelPagesToHotels.dry-run.json', import.meta.url)
const PREFIX = 'stay/'

const textOf = (blocks = []) =>
  blocks.map((block) => block.children?.map((span) => span.text).join('') ?? '').join('\n')

// An image field without the projection's extras, as stored
const imageOf = ({_type, asset, crop, hotspot}) => ({_type, asset, crop, hotspot})

/** Paths to every reference to `id` in a document, by _key where there is one. */
const referencePaths = (value, id, path = '') => {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      referencePaths(item, id, `${path}[${item?._key ? `_key == "${item._key}"` : index}]`),
    )
  }
  if (!value || typeof value !== 'object') return []
  if (value._ref === id) return [`${path}._ref`]
  return Object.entries(value).flatMap(([name, child]) =>
    referencePaths(child, id, path ? `${path}.${name}` : name),
  )
}

const main = async () => {
  const {stay, pages} = await client.fetch(
    `{
    "stay": *[_type == "page" && slug.current == "stay" && !(_id in path("drafts.**"))][0]{
      _id, title, seo, modules
    },
    "pages": *[_type == "page" && string::startsWith(slug.current, $prefix) && !(_id in path("drafts.**"))]{
      _id, title, "slug": slug.current, seo, modules
    }
  }`,
    {prefix: PREFIX},
  )
  if (!stay) throw new Error('No Stay page: already moved?')

  if (REMOVE) {
    const ids = [stay._id, ...pages.map(({_id}) => _id)]
    const landing = await client.fetch(`*[_id == "stayLanding"][0]._id`)
    if (!landing) throw new Error('No Stay landing yet: run with --import first')
    const referrers = await client.fetch(
      `*[references($ids) && !(_id in $ids) && !(_id in path("drafts.**") && string::split(_id, "drafts.")[1] in $ids)]`,
      {ids},
    )
    const transaction = client.transaction()
    for (const document of referrers) {
      const toStay = referencePaths(document, stay._id)
      const toHotel = pages.filter(({_id}) => referencePaths(document, _id).length)
      if (toHotel.length) {
        throw new Error(`${document._id} links to ${toHotel.map(({_id}) => _id).join(', ')}`)
      }
      transaction.patch(document._id, (patch) =>
        patch.set(Object.fromEntries(toStay.map((path) => [path, 'stayLanding']))),
      )
      console.log(`Pointing ${toStay.length} link(s) in ${document._id} at the Stay landing`)
    }
    ids.forEach((id) => transaction.delete(id).delete(`drafts.${id}`))
    await transaction.commit()
    console.log(`Deleted the Stay page and ${pages.length} hotel pages.`)
    return
  }

  // The Stay page's Media modules linking to a hotel page, by that page
  const listed = new Map(
    stay.modules
      .filter((module) => module._type === 'mediaModule' && module.link?.internalLink?._ref)
      .map((module) => [module.link.internalLink._ref, module]),
  )

  const hotels = pages.map((page) => {
    const carousel = page.modules?.find(({_type}) => _type === 'carouselModule')
    const text = page.modules?.find(({_type}) => _type === 'textModule')
    const media = listed.get(page._id)
    const caption = textOf(media?.caption).trim()
    const firstImage = carousel?.images?.[0]?.asset?._ref
    return {
      _id: `hotel-${page.slug.slice(PREFIX.length)}`,
      _type: 'hotel',
      title: page.title,
      slug: {_type: 'slug', current: page.slug.slice(PREFIX.length)},
      ...(caption && caption !== page.title && {caption}),
      ...(media?.image?.asset &&
        media.image.asset._ref !== firstImage && {stayImage: imageOf(media.image)}),
      images: carousel?.images ?? [],
      ...(text?.text && {details: text.text}),
      ...(page.seo && {seo: page.seo}),
      _page: page._id,
    }
  })

  // Hotels in the Stay page's order, then any it didn't list
  const rank = ({_page}) => {
    const index = stay.modules.indexOf(listed.get(_page))
    return index < 0 ? Infinity : index
  }
  const ordered = hotels.toSorted((a, b) => rank(a) - rank(b))
  const landing = {
    _id: 'stayLanding',
    _type: 'stayLanding',
    title: stay.title,
    ...(stay.seo && {seo: stay.seo}),
    modules: stay.modules.filter((module) => ![...listed.values()].includes(module)),
    hotels: ordered.map(({_id}) => ({_key: key(), _type: 'reference', _ref: _id})),
  }
  const documents = [...ordered.map(({_page, ...hotel}) => hotel), landing]

  if (!IMPORT) {
    writeFileSync(DRY_RUN_FILE, JSON.stringify(documents, null, 2))
    console.log(
      `Dry run: ${hotels.length} hotels and the Stay landing (${landing.modules.length} modules of its own). See ${DRY_RUN_FILE.pathname}`,
    )
    return
  }

  const transaction = client.transaction()
  documents.forEach((document) => transaction.createIfNotExists(document))
  const {results} = await transaction.commit()
  const created = results.filter(({operation}) => operation === 'create').length
  console.log(`Created ${created} of ${documents.length} documents (the rest already existed).`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
