/* global console, process, URL */
import {writeFileSync} from 'node:fs'
import {client, key} from './lib/oldSite.js'

/**
 * Links sponsors' names to their websites in the credit lines of
 * artworks, news, editions and pages: "Generous support is provided by
 * …", "presented by …", "Media Partners: …". The old site rarely linked
 * them. Only lines that read as credits are touched, so a sponsor named
 * in passing elsewhere stays plain, and text that's already linked keeps
 * its link. People aren't linked, only organizations.
 *
 * The websites are the editions' sponsor logos and lists, plus SPONSORS
 * below for those the editions don't name. Names are matched whole,
 * ignoring case.
 *
 * By default it's a dry run: it writes each line it would link to
 * scripts/linkSponsors.dry-run.json, and the credit lines it found
 * nothing to link in, and touches nothing. With --import it sets the
 * changed fields, only if the document hasn't changed since it was read.
 * Safe to rerun.
 *
 *   npx sanity exec scripts/linkSponsors.js --with-user-token
 *   npx sanity exec scripts/linkSponsors.js --with-user-token -- --import
 */
const IMPORT = process.argv.includes('--import')
const DRY_RUN_FILE = new URL('./linkSponsors.dry-run.json', import.meta.url)

// Websites for sponsors the editions don't list, checked by hand. Each
// name is matched as written, so a few appear as each credit spells them.
const SPONSORS = {
  '1800 Tequila': 'https://www.1800tequila.com/',
  '1800®️ Tequila': 'https://www.1800tequila.com/',
  'Harold & Arlene Schnitzer CARE Foundation': 'https://jordanschnitzer.org/',
  'Jordan Schnitzer Family Foundation': 'https://jordanschnitzer.org/',
  'National Endowment for the Arts': 'https://www.arts.gov/',
  'California Arts Council': 'https://arts.ca.gov/',
  'Association of Arts Administration Educators': 'https://www.artsadministration.org/',
  'Swiss Arts Council Pro Helvetia': 'https://prohelvetia.ch/en/',
  'Pro Helvetia': 'https://prohelvetia.ch/en/',
  Amazon: 'https://www.amazon.com/',
  'Design Within Reach': 'https://www.dwr.com/',
  'City of Palm Springs Public Arts Commission': 'https://www.palmspringsca.gov/',
  'Palm Springs Public Arts Commission': 'https://www.palmspringsca.gov/',
  'City of Palm Springs': 'https://www.palmspringsca.gov/',
  'City of Cathedral City': 'https://www.cathedralcity.gov/',
  'C Magazine': 'https://cmagazine.com/',
  Canvas: 'https://canvasonline.com/',
  'Canvas Magazine': 'https://canvasonline.com/',
  'KGAY Palm Springs': 'https://gaydesertguide.com/kgay/',
  GayDesertGuide: 'https://gaydesertguide.com/',
  'Desert Magazine': 'https://www.desertsun.com/desert-magazine/',
  'Farrow & Ball': 'https://www.farrow-ball.com/',
  Missoni: 'https://www.missoni.com/',
  'Stayner Architects': 'https://staynerarchitects.com/',
  'TBA21-Academy': 'https://tba21.org/academy',
  'Faena Art': 'https://www.faena.com/faena-art',
  'Sub Pop Records': 'https://www.subpop.com/',
  'Proyectos Ultravioleta': 'https://uvuvuv.com/',
  'Garth Greenan Gallery': 'https://garthgreenan.com/',
  'Athr Foundation': 'https://athrart.com/',
  SOLARPUNKS: 'https://www.solarpunks.club/',
  Rayform: 'https://rayform.ch/',
  'Pilar Corrias Gallery': 'https://www.pilarcorrias.com/',
  Artnet: 'http://www.artnet.com/',
}

// Lines that credit sponsors
const CREDIT =
  /generous(ly)? support|support(ed)? (is provided )?(by|from)|made possible|presented by|sponsor(ed)? by|with support|additional support|media partners|in partnership with|in collaboration with|executive producer|thank .* for (their|its) generous/i

// Names in the editions' lists that are a hotel's or a school's
// description, not a name: "Ace Hotel & Swim Club - Home of the DESERT X Hub"
const describes = (name) => / [-–] /.test(name) || name.length > 48

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * The block with each sponsor's first mention linked, and the names it
 * linked. Spans already linked are left alone; a name split across spans
 * (part in italics, say) isn't found.
 */
const linkBlock = (block, sponsors) => {
  const linked = []
  let children = block.children
  const markDefs = [...block.markDefs]
  const isLink = (mark) => markDefs.some((def) => def._key === mark && def._type === 'link')

  for (const [name, url, pattern] of sponsors) {
    const done = children.some((span) => span.marks?.some(isLink) && pattern.test(span.text))
    if (done) continue
    const index = children.findIndex(
      (span) => span._type === 'span' && !span.marks.some(isLink) && pattern.test(span.text),
    )
    if (index === -1) continue
    const span = children[index]
    const match = span.text.match(pattern)
    const start = match.index + match[1].length
    const end = start + match[2].length
    const link = {_key: key(), _type: 'link', linkType: 'external', externalUrl: url}
    markDefs.push(link)
    const parts = [
      {text: span.text.slice(0, start), marks: span.marks},
      {text: span.text.slice(start, end), marks: [...span.marks, link._key]},
      {text: span.text.slice(end), marks: span.marks},
    ]
      .filter((part) => part.text)
      .map((part, i) => ({...span, _key: i === 0 ? span._key : key(), ...part}))
    children = [...children.slice(0, index), ...parts, ...children.slice(index + 1)]
    linked.push(name)
  }
  return {block: {...block, children, markDefs}, linked}
}

/** The value with credit lines linked, logging each line it changes. */
const linkCredits = (value, sponsors, log) => {
  if (Array.isArray(value)) return value.map((item) => linkCredits(item, sponsors, log))
  if (!value || typeof value !== 'object') return value
  if (value._type === 'block') {
    const text = value.children.map((span) => span.text ?? '').join('')
    if (!CREDIT.test(text)) return value
    const {block, linked} = linkBlock(value, sponsors)
    log.push({text, linked})
    return linked.length ? block : value
  }
  return Object.fromEntries(
    Object.entries(value).map(([field, item]) => [field, linkCredits(item, sponsors, log)]),
  )
}

const main = async () => {
  const {named, documents} = await client.fetch(`{
    "named": [
      ...*[_type == "edition"].sponsorGroups[].logos[defined(url)]{name, url},
      ...*[_type == "edition"].sponsorLists[].text[]{
        "name": pt::text(@), "url": markDefs[_type == "link"][0].externalUrl
      }[defined(url)]
    ],
    "documents": *[_type in ["artwork", "news", "edition", "page"]]
  }`)

  // Longest names first, so "City of Palm Springs Public Arts Commission"
  // links whole before "City of Palm Springs" can
  const urls = new Map(
    named
      .filter((sponsor) => sponsor?.name && !describes(sponsor.name))
      .map(({name, url}) => [name.trim(), url]),
  )
  Object.entries(SPONSORS).forEach(([name, url]) => urls.set(name, url))
  const sponsors = [...urls]
    .toSorted(([a], [b]) => b.length - a.length)
    .map(([name, url]) => [name, url, new RegExp(`(^|[^\\w])(${escape(name)})(?![\\w])`, 'i')])

  const patches = []
  const unlinked = []
  for (const document of documents) {
    const set = {}
    const lines = []
    for (const [field, value] of Object.entries(document)) {
      if (field.startsWith('_')) continue
      const log = []
      const linked = linkCredits(value, sponsors, log)
      if (log.some((line) => line.linked.length)) set[field] = linked
      lines.push(...log)
    }
    const changed = lines.filter((line) => line.linked.length)
    unlinked.push(
      ...lines.filter((line) => !line.linked.length).map(({text}) => ({_id: document._id, text})),
    )
    if (changed.length) {
      patches.push({_id: document._id, _rev: document._rev, title: document.title, set, changed})
    }
  }

  const count = patches.reduce(
    (total, patch) => total + patch.changed.flatMap((line) => line.linked).length,
    0,
  )
  console.log(`${count} links in ${patches.length} documents`)
  console.log(`${unlinked.length} credit lines with nothing to link`)

  if (!IMPORT) {
    writeFileSync(
      DRY_RUN_FILE,
      JSON.stringify(
        {
          documents: patches.map(({_id, title, changed}) => ({_id, title, changed})),
          unlinked,
        },
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
