/* global console, process, URL */
import {writeFileSync} from 'node:fs'
import {client} from './lib/oldSite.js'

/**
 * Drops what the old site's artwork pages repeated in their text, which the
 * artwork page now shows above it: the title on its own line at the start
 * of the first text module, and the caption that closes the last one (the
 * title, then where it is, then the edition, e.g. "The Lost Path / AlUla,
 * Saudi Arabia / DESERT X AlUla 2020"). A title line with more after it,
 * like "Chimera / This performance took place…", loses just the title. A
 * text module left empty goes too.
 *
 * By default it's a dry run: it writes each change to
 * scripts/dropArtworkCaptions.dry-run.json and touches nothing. With
 * --import it sets the changed modules, only if the artwork hasn't changed
 * since it was read. Safe to rerun.
 *
 *   npx sanity exec scripts/dropArtworkCaptions.js --with-user-token
 *   npx sanity exec scripts/dropArtworkCaptions.js --with-user-token -- --import
 */
const IMPORT = process.argv.includes('--import')
const DRY_RUN_FILE = new URL('./dropArtworkCaptions.dry-run.json', import.meta.url)

// The caption's last line: the edition, e.g. "DESERT X AlUla 2020"
const EDITION_LINE = /^desert ?x( [\w ]+)? \d{4}$/i

const normalise = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, '')
const blockText = (block) => block.children.map((child) => child.text ?? '').join('')
const lines = (block) => blockText(block).trim().split('\n')

// Whether a line is the title, or the start of one that runs over lines.
// A letter off still counts, for the old site's typos ("Amma Qabi").
const isTitle = (line, title) => {
  const [a, b] = [normalise(line), normalise(title)]
  const letterOff = a.length === b.length && [...a].filter((char, i) => char !== b[i]).length === 1
  return a !== '' && (a === b || b.startsWith(a) || letterOff)
}

/** The block without its first line, its spans and their marks kept. */
const withoutFirstLine = (block) => {
  let dropping = true
  const children = block.children
    .map((child) => {
      if (!dropping) return child
      const newline = child.text.indexOf('\n')
      if (newline === -1) return null
      dropping = false
      return {...child, text: child.text.slice(newline + 1)}
    })
    .filter((child) => child && child.text !== '')
  return {...block, children}
}

/** The artwork's modules without the repeats, and what was dropped. */
const dropRepeats = ({title, modules}) => {
  const dropped = []
  const texts = modules.filter((module) => module._type === 'textModule' && module.text?.length)
  const [first, last] = [texts[0], texts.at(-1)]
  const edits = new Map()

  if (first) {
    const [block, ...rest] = first.text
    const blockLines = block._type === 'block' ? lines(block) : []
    if (blockLines.length && isTitle(blockLines[0], title)) {
      dropped.push(blockLines[0])
      edits.set(first._key, blockLines.length > 1 ? [withoutFirstLine(block), ...rest] : rest)
    }
  }

  if (last) {
    const text = edits.get(last._key) ?? last.text
    const block = text.at(-1)
    const blockLines = block?._type === 'block' ? lines(block) : []
    if (
      blockLines.length > 1 &&
      isTitle(blockLines[0], title) &&
      EDITION_LINE.test(blockLines.at(-1).trim())
    ) {
      dropped.push(blockLines.join(' / '))
      edits.set(last._key, text.slice(0, -1))
    }
  }

  return {
    dropped,
    modules: modules
      .map((module) =>
        edits.has(module._key) ? {...module, text: edits.get(module._key)} : module,
      )
      .filter((module) => module._type !== 'textModule' || module.text?.length),
  }
}

const main = async () => {
  const artworks = await client.fetch(
    `*[_type == "artwork" && defined(modules)]{ _id, _rev, title, "slug": slug.current, modules }`,
  )

  const patches = artworks.flatMap((artwork) => {
    const {dropped, modules} = dropRepeats(artwork)
    return dropped.length ? [{...artwork, dropped, modules}] : []
  })

  writeFileSync(
    DRY_RUN_FILE,
    JSON.stringify(
      patches.map(({_id, slug, dropped}) => ({_id, slug, dropped})),
      null,
      2,
    ),
  )
  console.log(`${patches.length} artworks to change (see ${DRY_RUN_FILE.pathname})`)
  if (!IMPORT) return

  const transaction = client.transaction()
  for (const {_id, _rev, modules} of patches) {
    transaction.patch(_id, (patch) => patch.ifRevisionId(_rev).set({modules}))
  }
  await transaction.commit()
  console.log(`Changed ${patches.length} artworks`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
