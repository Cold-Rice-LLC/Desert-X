/* global console, process, URL */
import {writeFileSync} from 'node:fs'
import {client, key} from './lib/oldSite.js'

/**
 * Makes every caption rich text, so any of them can set a title in italics:
 *
 * - a hotel's Caption on Stay, a string, becomes a paragraph of the same text
 * - a Media module with no Caption (or Second Caption) of its own, which
 *   used to show its file's Description from the Media library, gets that
 *   Description as one, since the site no longer reads it, an artwork
 *   credit's title in italics: "Doug Aitken, *Mirage*, DESERT X 2017."
 *
 * Homepage slide Titles were strings too, but none was set.
 *
 * By default it's a dry run: it writes each change to
 * scripts/richTextCaptions.dry-run.json and touches nothing. With --import
 * it sets the changed fields, only if the document hasn't changed since it
 * was read. Safe to rerun.
 *
 *   npx sanity exec scripts/richTextCaptions.js --with-user-token
 *   npx sanity exec scripts/richTextCaptions.js --with-user-token -- --import
 */
const IMPORT = process.argv.includes('--import')
const DRY_RUN_FILE = new URL('./richTextCaptions.dry-run.json', import.meta.url)

const span = (text, marks = []) => ({_key: key(), _type: 'span', marks, text})

const paragraph = (children) => [
  {_key: key(), _type: 'block', style: 'normal', markDefs: [], children},
]

// An artwork credit: the artist, the title (in curly quotes or not), then
// the edition and anything after it, e.g. "Doug Aitken, Mirage, DESERT X 2017."
const CREDIT = /^([^,]+, )“?(.+?)”?(, DESERT X\b.*)$/

/** A Description as a caption, an artwork credit's title in italics. */
const captionFrom = (text) => {
  const [, artist, title, rest] = text.match(CREDIT) ?? []
  return paragraph(title ? [span(artist), span(title, ['em']), span(rest)] : [span(text)])
}

/**
 * The value with each Media module missing a caption given its file's
 * Description, and the captions it gave, by where they went.
 */
const fillCaptions = (value, descriptions, path = '', added = {}) => {
  if (Array.isArray(value)) {
    return {
      value: value.map(
        (item, i) => fillCaptions(item, descriptions, `${path}[${item?._key ?? i}]`, added).value,
      ),
      added,
    }
  }
  if (!value || typeof value !== 'object') return {value, added}

  const filled = Object.fromEntries(
    Object.entries(value).map(([k, v]) => [
      k,
      fillCaptions(v, descriptions, path ? `${path}.${k}` : k, added).value,
    ]),
  )
  if (filled._type === 'mediaModule') {
    const fill = (field, asset) => {
      const description = descriptions[asset?.asset?._ref]?.trim()
      if (filled[field]?.length || !description) return
      filled[field] = captionFrom(description)
      added[`${path}.${field}`] = filled[field][0].children
        .map(({text, marks}) => (marks.length ? `*${text}*` : text))
        .join('')
    }
    fill('caption', filled.mediaType === 'mp4' ? filled.video : filled.image)
    if (filled.mediaType === 'image' && filled.secondImage)
      fill('secondCaption', filled.secondImage)
  }
  return {value: filled, added}
}

const main = async () => {
  // Drafts too, so publishing one doesn't bring a string back
  const hotels = (
    await client.fetch(`*[_type == "hotel" && defined(caption)]{ _id, _rev, title, caption }`)
  ).filter(({caption}) => typeof caption === 'string')

  const assets = await client.fetch(
    `*[_type in ["sanity.imageAsset", "sanity.fileAsset"] && defined(description)]{ _id, description }`,
  )
  const descriptions = Object.fromEntries(assets.map(({_id, description}) => [_id, description]))

  // Media modules sit in modules and an edition's Visit Info, at any depth
  const documents = await client.fetch(
    `*[defined(modules) || defined(visitModules)]{ _id, _rev, title, modules, visitModules }`,
  )
  const modulePatches = documents.flatMap(({_id, _rev, title, modules, visitModules}) => {
    const added = {}
    const set = {}
    if (modules) set.modules = fillCaptions(modules, descriptions, 'modules', added).value
    if (visitModules) {
      set.visitModules = fillCaptions(visitModules, descriptions, 'visitModules', added).value
    }
    return Object.keys(added).length ? [{_id, _rev, title, added, set}] : []
  })

  writeFileSync(
    DRY_RUN_FILE,
    JSON.stringify(
      {
        hotels: hotels.map(({_id, title, caption}) => ({_id, title, caption})),
        mediaModules: modulePatches.map(({_id, title, added}) => ({_id, title, added})),
      },
      null,
      2,
    ),
  )
  const captions = modulePatches.reduce((sum, {added}) => sum + Object.keys(added).length, 0)
  console.log(
    `${hotels.length} hotel captions, and ${captions} Media module captions in ${modulePatches.length} documents, to change (see ${DRY_RUN_FILE.pathname})`,
  )
  if (!IMPORT) return

  const transaction = client.transaction()
  for (const {_id, _rev, caption} of hotels) {
    transaction.patch(_id, (patch) =>
      patch.ifRevisionId(_rev).set({caption: paragraph([span(caption)])}),
    )
  }
  for (const {_id, _rev, set} of modulePatches) {
    transaction.patch(_id, (patch) => patch.ifRevisionId(_rev).set(set))
  }
  await transaction.commit()
  console.log(`Changed ${hotels.length + modulePatches.length} documents`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
