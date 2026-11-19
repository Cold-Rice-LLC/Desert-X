/* global console, process, URL */
import {writeFileSync} from 'node:fs'
import {client} from './lib/oldSite.js'

/**
 * Drops the title that news carried over from the old site repeats as the
 * first paragraph of its first text module, which the news page now
 * shows above it as its heading. A paragraph counts when it reads the same
 * as the title, ignoring case and punctuation, or when it's one of the two
 * headlines below that reword their titles. A text module left empty goes
 * too. Drafts get the same change, so publishing one doesn't bring the
 * title back.
 *
 * By default it's a dry run: it writes each change to
 * scripts/dropNewsTitles.dry-run.json and touches nothing. With --import
 * it sets the changed modules, only if the document hasn't changed since it
 * was read. Safe to rerun.
 *
 *   npx sanity exec scripts/dropNewsTitles.js --with-user-token
 *   npx sanity exec scripts/dropNewsTitles.js --with-user-token -- --import
 */
const IMPORT = process.argv.includes('--import')
const DRY_RUN_FILE = new URL('./dropNewsTitles.dry-run.json', import.meta.url)

const normalise = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, '')
const blockText = (block) => block.children?.map((child) => child.text ?? '').join('') ?? ''

// Headlines that reword their news item's title, by the item's published id
const REWORDED = {
  'news-desert-x-alula-2024': 'DESERT X AlUla 2024 will open February 9 – March 23',
  'news-dxu2024': 'DESERT X AlUla 2024',
}

const isTitle = (text, {_id, title}) => {
  const reworded = REWORDED[_id.replace(/^drafts\./, '')]
  return (
    (normalise(text) !== '' && normalise(text) === normalise(title ?? '')) ||
    (reworded !== undefined && normalise(text) === normalise(reworded))
  )
}

/** The item's modules without the repeated title, and what was dropped. */
const dropTitle = (item) => {
  const first = item.modules.find((module) => module._type === 'textModule' && module.text?.length)
  const block = first?.text[0]
  if (block?._type !== 'block' || !isTitle(blockText(block), item)) return {}

  return {
    dropped: blockText(block),
    modules: item.modules
      .map((module) => (module === first ? {...module, text: module.text.slice(1)} : module))
      .filter((module) => module._type !== 'textModule' || module.text?.length),
  }
}

const main = async () => {
  const news = await client.fetch(
    `*[_type == "news" && defined(modules)]{ _id, _rev, title, "slug": slug.current, modules }`,
  )

  const patches = news.flatMap((item) => {
    const {dropped, modules} = dropTitle(item)
    return dropped ? [{...item, dropped, modules}] : []
  })

  writeFileSync(
    DRY_RUN_FILE,
    JSON.stringify(
      patches.map(({_id, slug, title, dropped}) => ({_id, slug, title, dropped})),
      null,
      2,
    ),
  )
  console.log(`${patches.length} news documents to change (see ${DRY_RUN_FILE.pathname})`)
  if (!IMPORT) return

  const transaction = client.transaction()
  for (const {_id, _rev, modules} of patches) {
    transaction.patch(_id, (patch) => patch.ifRevisionId(_rev).set({modules}))
  }
  await transaction.commit()
  console.log(`Changed ${patches.length} news documents`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
