/* global console, process, URL */
import {writeFileSync} from 'node:fs'
import {SITE, client, fetchDocument, key, pendingImage, uploadImage} from './lib/oldSite.js'

/**
 * Fills in DX21's and DX23's sponsors from their old sponsors pages
 * (desertx.org/dx/…/sponsors), the only editions that had one. Each tier's
 * logos are a single composite image there, so each logo here is that
 * image cropped to it: the boxes below were found by scanning the
 * composites for blank gaps, then checked by eye. Logos are named after
 * what the composites show, which doesn't always match the page's lists;
 * links come from the page's list of the same name. The lists under the
 * logos are the page's Galleries, Cultural, Media and Hotel Partners, one
 * rich text line per name, linked where the page links that name. Lists
 * still stored as plain text are converted the same way, keeping the
 * Studio's own lines.
 *
 * By default it's a dry run: it writes what it would set to
 * scripts/migrateSponsors.dry-run.json and touches nothing. With --import
 * it sets each field only where it's still empty, or the lists where
 * they're still plain text, so re-running never overwrites what editors
 * have changed.
 *
 *   npx sanity exec scripts/migrateSponsors.js --with-user-token
 *   npx sanity exec scripts/migrateSponsors.js --with-user-token -- --import
 */
const IMPORT = process.argv.includes('--import')
const DRY_RUN_FILE = new URL('./migrateSponsors.dry-run.json', import.meta.url)

const LIST_TITLES = ['Galleries', 'Cultural Partners', 'Media Partners', 'Hotel Partners']

// Each group's composite (its file name and size on the old site) and its
// logos, as [name, [left, top, right, bottom]] in the composite's pixels
const PAGES = [
  {
    editionId: 'edition-coachella-valley-2021',
    path: '/dx/desert-x-21/sponsors',
    groups: [
      {
        title: 'Presenting Sponsor',
        fullWidth: true,
        image: ['presentedby.png', 1757, 378],
        logos: [['Richard Mille', [15, 124, 1741, 253]]],
      },
      {
        title: 'Premier Sponsor',
        fullWidth: true,
        image: ['premier.png', 1099, 378],
        logos: [['Gucci', [18, 104, 1077, 273]]],
      },
      {
        title: 'Gold Sponsors',
        image: ['gold.png', 814, 343],
        logos: [
          ['Bentley Motors Inc.', [12, 9, 241, 128]],
          ['Champagne Barons De Rothschild', [292, 9, 490, 158]],
          ['Diptyque', [527, 28, 773, 140]],
          ['Fiji Water', [33, 197, 185, 326]],
          ['Maestro Dobel Tequila', [281, 217, 520, 310]],
        ],
      },
      {
        title: 'Silver Sponsors',
        image: ['silver.png', 2560, 491],
        logos: [
          ['Tamarisk Country Club', [64, 142, 800, 267]],
          ['Vizzy Hard Seltzer', [1175, 126, 1664, 274]],
          ['Lighthouse Dispensary', [1997, 47, 2513, 358]],
        ],
      },
      {
        title: 'Municipalities',
        image: ['municipal.png', 698, 158],
        logos: [
          ['City of Desert Hot Springs', [2, 20, 143, 132]],
          ['City of Rancho Mirage', [242, 36, 444, 116]],
          ['City of Palm Desert', [542, 30, 691, 123]],
        ],
      },
      {
        title: 'Additional Support',
        image: ['additional.png', 2000, 1402],
        logos: [
          ['Blick Art Materials', [10, 61, 430, 221]],
          ['Cerámica Suro', [634, 46, 1072, 241]],
          ['Enterprise', [1268, 103, 1832, 216]],
          ['Grit Development', [23, 391, 645, 582]],
          ['Hot Purple Energy', [779, 331, 1195, 620]],
          ['Lord Jones', [1338, 364, 1646, 608]],
          ['Palm Springs Life Magazine', [23, 773, 885, 846]],
          ['Rbhu Engineering', [1087, 741, 1926, 901]],
          ['Timeless Refinery', [24, 1118, 604, 1225]],
          ['Windmill City Screen Printing', [711, 1014, 1024, 1327]],
          ['Vagabond Roasting Co.', [1139, 1046, 1551, 1296]],
        ],
      },
    ],
  },
  {
    editionId: 'edition-coachella-valley-2023',
    path: '/dx/dx-23/dx-23-sponsors',
    groups: [
      {
        title: 'Premier Sponsors',
        fullWidth: true,
        image: ['dx23_support_premier.png', 2560, 870],
        logos: [
          ['Hennessy Paradis', [11, 334, 875, 734]],
          ['Hourglass Cosmetics', [1360, 540, 2412, 664]],
        ],
      },
      {
        title: 'Producing Sponsor',
        image: ['dx23_support_producing.png', 2560, 706],
        logos: [['Diptyque', [11, 333, 525, 570]]],
      },
      {
        title: 'Supporting Sponsors',
        image: ['dx23_support_supporting.png', 2560, 566],
        logos: [
          ['Oliver Blandi', [16, 333, 829, 425]],
          ['Sachin & Babi', [1309, 357, 2203, 425]],
        ],
      },
      {
        title: 'Municipalities',
        image: ['dx23_support_municipal.png', 2560, 706],
        logos: [
          ['City of Desert Hot Springs', [4, 305, 335, 567]],
          ['City of Palm Desert', [564, 334, 883, 532]],
          ['PS Resorts', [1118, 340, 1630, 538]],
          ['City of Rancho Mirage', [1866, 332, 2408, 547]],
        ],
      },
      {
        title: 'Additional Support',
        image: ['dx23_support_additional.png', 2560, 912],
        logos: [
          ['The Webster', [128, 406, 674, 465]],
          ['Windmill City Screen Printing', [879, 305, 1086, 510]],
          ['Rbhu Engineering', [1291, 378, 1836, 482]],
          ['Mojave Flea Trading Post', [2041, 307, 2238, 510]],
          ['Palm Springs Life Magazine', [379, 701, 926, 748]],
          ['Market Market', [1112, 640, 1445, 808]],
          ['El Mirasol Cocina Mexicana', [1635, 626, 2009, 815]],
        ],
      },
    ],
  },
]

// Room around each box, in pixels, so antialiased edges aren't clipped
const PAD = 4

/** A Studio crop, as fractions of each side, for a box in a composite. */
const cropFor = ([left, top, right, bottom], width, height) => {
  const fraction = (value, size) => Math.max(0, value) / size
  return {
    _type: 'sanity.imageCrop',
    left: fraction(left - PAD, width),
    top: fraction(top - PAD, height),
    right: fraction(width - right - 1 - PAD, width),
    bottom: fraction(height - bottom - 1 - PAD, height),
  }
}

/** A paragraph's lines, split at its <br>s. */
const linesOf = (paragraph) => {
  const lines = ['']
  paragraph.childNodes.forEach((node) => {
    if (node.nodeName === 'BR') lines.push('')
    else lines[lines.length - 1] += node.textContent
  })
  return lines.map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean)
}

/**
 * Rich text with a line per name, each linked to the page's link of the
 * same text if there is one.
 */
const listBlocks = (names, links) =>
  names.map((text) => {
    const url = links.get(text)
    const link = url && {_key: key(), _type: 'link', linkType: 'external', externalUrl: url}
    return {
      _key: key(),
      _type: 'block',
      style: 'normal',
      markDefs: link ? [link] : [],
      children: [{_key: key(), _type: 'span', text, marks: link ? [link._key] : []}],
    }
  })

/**
 * The page's links by their text, its composites' URLs by file name, and
 * the names under each of its list headings.
 */
const readPage = (document) => {
  const links = new Map()
  const lists = new Map()
  const columns = document.querySelector('article.twocolumns')
  columns.querySelectorAll('a[href]').forEach((link) => {
    const text = link.textContent.replace(/\s+/g, ' ').trim()
    if (!links.has(text)) links.set(text, link.href)
  })
  let heading
  for (const element of columns.querySelectorAll('h3, p')) {
    if (element.tagName === 'H3' && !element.querySelector('a')) {
      heading = element.textContent.trim()
    } else if (LIST_TITLES.includes(heading)) {
      lists.set(heading, [...(lists.get(heading) ?? []), ...linesOf(element)])
    }
  }
  const images = new Map(
    [...document.querySelectorAll('figure img')].map((image) => [
      image.src.split('/').at(-1),
      image.src,
    ]),
  )
  return {links, lists, images}
}

const main = async () => {
  const editions = await client.fetch(
    `*[_id in $ids]{ _id, "hasGroups": count(sponsorGroups) > 0, sponsorLists }`,
    {ids: PAGES.map((page) => page.editionId)},
  )

  const patches = []
  for (const page of PAGES) {
    const edition = editions.find((found) => found._id === page.editionId)
    if (!edition) {
      console.log(`No edition ${page.editionId} in the Studio, skipped`)
      continue
    }
    const {links, lists, images} = readPage(await fetchDocument(`${SITE}${page.path}`))
    const warnings = []

    const sponsorGroups = page.groups.map((group) => {
      const [file, width, height] = group.image
      const source = images.get(file)
      if (!source) throw new Error(`No ${file} on ${page.path}`)
      return {
        _key: key(),
        _type: 'sponsorGroup',
        title: group.title,
        fullWidth: Boolean(group.fullWidth),
        logos: group.logos.map(([name, box]) => {
          const url = links.get(name)
          if (!url) warnings.push(`No link for ${name}`)
          return {
            _key: key(),
            _type: 'sponsorLogo',
            name,
            image: {...pendingImage(source), crop: cropFor(box, width, height)},
            ...(url && {url}),
          }
        }),
      }
    })

    // The Studio's lists, if it has any, else the page's
    const plainText = edition.sponsorLists?.some((list) => typeof list.text === 'string')
    const sponsorLists = edition.sponsorLists?.length
      ? edition.sponsorLists.map((list) =>
          typeof list.text === 'string'
            ? {
                ...list,
                text: listBlocks(
                  list.text
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean),
                  links,
                ),
              }
            : list,
        )
      : LIST_TITLES.filter((title) => lists.has(title)).map((title) => ({
          _key: key(),
          _type: 'sponsorList',
          title,
          text: listBlocks(lists.get(title), links),
        }))

    const set = {
      ...(!edition.hasGroups && {sponsorGroups}),
      ...((!edition.sponsorLists?.length || plainText) && sponsorLists.length && {sponsorLists}),
    }
    patches.push({_id: edition._id, set, warnings})
    const logoCount = sponsorGroups.reduce((count, group) => count + group.logos.length, 0)
    console.log(
      `${edition._id}: ${sponsorGroups.length} groups, ${logoCount} logos, ${sponsorLists.length} lists${warnings.length ? ` (${warnings.join(', ')})` : ''}`,
    )
  }

  if (!IMPORT) {
    writeFileSync(DRY_RUN_FILE, JSON.stringify(patches, null, 2))
    console.log(`\nDry run: wrote ${DRY_RUN_FILE.pathname}. Nothing was imported.`)
    return
  }

  const transaction = client.transaction()
  for (const {_id, set} of patches) {
    for (const logo of (set.sponsorGroups ?? []).flatMap((group) => group.logos)) {
      const {crop, ...image} = logo.image
      logo.image = {...(await uploadImage(image)), crop}
    }
    if (Object.keys(set).length) transaction.patch(_id, {set})
  }
  await transaction.commit()
  console.log(`\nUpdated ${patches.filter(({set}) => Object.keys(set).length).length} editions.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
