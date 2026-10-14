/* global console, process, URL */
import {writeFileSync} from 'node:fs'
import {client} from './lib/oldSite.js'

/**
 * Sets the Edition on news that has a location but no edition yet: the
 * edition at that location in the year the title names ("Desert X 2021 is
 * now closed"), or else the one running or next to open when it was
 * published. News with no location (press, General) is left for editors.
 * By default it's a dry run: it writes the matches to
 * scripts/linkNewsEditions.dry-run.json and touches nothing.
 *
 *   npx sanity exec scripts/linkNewsEditions.js --with-user-token
 *   npx sanity exec scripts/linkNewsEditions.js --with-user-token -- --import
 */
const IMPORT = process.argv.includes('--import')
const DRY_RUN_FILE = new URL('./linkNewsEditions.dry-run.json', import.meta.url)

const editionFor = (item, editions) => {
  const here = editions.filter((edition) => edition.location === item.location)
  const year = Number(item.title.match(/\b(20\d\d)\b/)?.[1])
  return (
    here.find((edition) => edition.year === year) ??
    here.find((edition) => edition.endDate && edition.endDate >= item.publishDate)
  )
}

const main = async () => {
  const {news, editions} = await client.fetch(`{
    "news": *[_type == "news" && !(_id in path("drafts.**")) && !defined(edition)]
      | order(publishDate asc){ _id, title, publishDate, "location": location._ref },
    "editions": *[_type == "edition" && !(_id in path("drafts.**"))]
      | order(year asc){ _id, "slug": slug.current, year, endDate, "location": location._ref }
  }`)

  const matches = news.map((item) => ({item, edition: item.location && editionFor(item, editions)}))
  matches.forEach(({item, edition}) =>
    console.log(`${item.publishDate}  ${edition?.slug ?? '(none)'}  ${item.title}`),
  )
  const linked = matches.filter(({edition}) => edition)
  console.log(`\n${linked.length} of ${news.length} to link`)

  if (!IMPORT) {
    writeFileSync(
      DRY_RUN_FILE,
      JSON.stringify(
        matches.map(({item, edition}) => ({...item, edition: edition?.slug ?? null})),
        null,
        2,
      ),
    )
    console.log(`Dry run: wrote ${DRY_RUN_FILE.pathname}. Nothing was changed.`)
    return
  }

  await linked
    .reduce(
      (transaction, {item, edition}) =>
        transaction.patch(item._id, {set: {edition: {_type: 'reference', _ref: edition._id}}}),
      client.transaction(),
    )
    .commit()
  console.log(`Linked ${linked.length} news items.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
