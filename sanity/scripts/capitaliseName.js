/* global console, process, URL */
import {writeFileSync} from 'node:fs'
import {client} from './lib/oldSite.js'

/**
 * Writes the name as DESERT X wherever "Desert X" or "DesertX" is text:
 * in every document, drafts included, and the titles, captions and alt
 * text of images and files. Addresses, handles and hashtags keep theirs
 * (desertx.org, @_desertx, #DesertX), as do ids, slugs, links and file
 * names. The site does the same to whatever it shows (svelte's brand.js);
 * this makes the Studio and its search match.
 *
 * By default it's a dry run: it writes each change to
 * scripts/capitaliseName.dry-run.json and touches nothing. With --import
 * it sets the changed fields, only if the document hasn't changed since
 * it was read. Safe to rerun.
 *
 *   npx sanity exec scripts/capitaliseName.js --with-user-token
 *   npx sanity exec scripts/capitaliseName.js --with-user-token -- --import
 */
const IMPORT = process.argv.includes('--import')
const DRY_RUN_FILE = new URL('./capitaliseName.dry-run.json', import.meta.url)

// As in svelte's brand.js
const NAME = /(?<![\w#@./-])desert([ \u00a0]?)x(?![\w@/-]|\.[a-z])/gi
const RAW_KEY = /^_|url$|href|slug|current|email|filename/i

const brandText = (text) => text.replace(NAME, (_, space) => `DESERT${space || ' '}X`)

/** The value with the name capitalised, and each text that changed. */
const brand = (value, key, changes) => {
  if (typeof value === 'string') {
    if (RAW_KEY.test(key)) return value
    const branded = brandText(value)
    if (branded !== value) changes.push({from: value, to: branded})
    return branded
  }
  if (Array.isArray(value)) return value.map((item) => brand(item, '', changes))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([name, item]) => [name, brand(item, name, changes)]),
    )
  }
  return value
}

const main = async () => {
  const documents = await client.fetch(
    `*[!(_type match "system.*") && !(_type match "sanity.*")
      || _type in ["sanity.imageAsset", "sanity.fileAsset"]]`,
  )

  const patches = []
  for (const document of documents) {
    const set = {}
    const changes = []
    for (const [field, value] of Object.entries(document)) {
      if (RAW_KEY.test(field)) continue
      const before = changes.length
      const branded = brand(value, field, changes)
      if (changes.length > before) set[field] = branded
    }
    if (changes.length) {
      patches.push({_id: document._id, _rev: document._rev, _type: document._type, set, changes})
    }
  }

  const count = patches.reduce((total, patch) => total + patch.changes.length, 0)
  console.log(`${count} texts in ${patches.length} documents`)

  if (!IMPORT) {
    writeFileSync(
      DRY_RUN_FILE,
      JSON.stringify(
        patches.map(({_id, _type, changes}) => ({_id, _type, changes})),
        null,
        2,
      ),
    )
    console.log(`\nDry run: wrote ${DRY_RUN_FILE.pathname}. Nothing was changed.`)
    return
  }

  await patches
    .reduce(
      (transaction, {_id, _rev, set}) =>
        transaction.patch(_id, (patch) => patch.ifRevisionId(_rev).set(set)),
      client.transaction(),
    )
    .commit()
  console.log(`\nUpdated ${patches.length} documents.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
