/* global console, process, URL */
import {writeFileSync} from 'node:fs'
import {SITE, client, fetchDocument, key, pendingImage, uploadImage} from './lib/oldSite.js'

/**
 * Adds the photos from the carousel at the foot of the old Donors page
 * (desertx.org/about/donors), in order, to the Donate page as a Carousel
 * module, just above its last text module. They have no captions or alt
 * text there, so they have none here.
 * By default it's a dry run: it writes the module it would add to
 * scripts/migrateDonorsCarousel.dry-run.json and touches nothing. With
 * --import it uploads the photos and adds the module (to the draft too, if
 * there is one), unless the page already has a Carousel, so re-running
 * never adds a second.
 *
 *   npx sanity exec scripts/migrateDonorsCarousel.js --with-user-token
 *   npx sanity exec scripts/migrateDonorsCarousel.js --with-user-token -- --import
 */
const IMPORT = process.argv.includes('--import')
const DRY_RUN_FILE = new URL('./migrateDonorsCarousel.dry-run.json', import.meta.url)

const main = async () => {
  const document = await fetchDocument(`${SITE}/about/donors`)
  const sources = [...document.querySelectorAll('.slide__image')].map((img) => img.src)
  if (!sources.length) throw new Error('No carousel images found on the Donors page')

  const page =
    await client.fetch(`*[_type == "page" && slug.current == "donate" && !(_id in path("drafts.**"))][0]{
    _id,
    "modules": modules[]{_key, _type},
    "hasDraft": defined(*[_id == "drafts." + ^._id][0])
  }`)
  if (!page) throw new Error('No Donate page')
  if (page.modules?.some((module) => module._type === 'carouselModule')) {
    console.log('The Donate page already has a Carousel; nothing to do.')
    return
  }
  const before = page.modules?.findLast((module) => module._type === 'textModule')
  if (!before) throw new Error('The Donate page has no text module to go above')

  const module = {
    _key: key(),
    _type: 'carouselModule',
    images: sources.map((source) => ({_key: key(), ...pendingImage(source)})),
  }

  if (!IMPORT) {
    writeFileSync(
      DRY_RUN_FILE,
      JSON.stringify({page: page._id, before: before._key, module}, null, 2),
    )
    console.log(
      `Dry run: ${sources.length} images, above module ${before._key}. See ${DRY_RUN_FILE.pathname}`,
    )
    return
  }

  for (const [index, image] of module.images.entries()) {
    module.images[index] = {_key: image._key, ...(await uploadImage(image))}
  }

  const at = `modules[_key == "${before._key}"]`
  const transaction = client.transaction()
  transaction.patch(page._id, (patch) => patch.insert('before', at, [module]))
  // A draft keeps its own modules; it gets the carousel only where it
  // still has the same text module
  if (page.hasDraft) {
    transaction.patch(`drafts.${page._id}`, (patch) => patch.insert('before', at, [module]))
  }
  await transaction.commit()
  console.log(`Added a Carousel of ${sources.length} images to the Donate page.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
