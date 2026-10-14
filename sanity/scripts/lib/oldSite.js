/* global Buffer, fetch, URL */
import {randomBytes} from 'node:crypto'
import {JSDOM} from 'jsdom'
import {getCliClient} from 'sanity/cli'

/**
 * Shared by the scripts that migrate content from the old site
 * (desertx.org): fetching its pages, turning their HTML into Portable Text
 * and modules, and uploading their images and files.
 */
export const SITE = 'https://desertx.org'

export const client = getCliClient({apiVersion: '2024-07-19'})
export const key = () => randomBytes(6).toString('hex')

export const fetchDocument = async (url) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${response.status} for ${url}`)
  return new JSDOM(await response.text(), {url}).window.document
}

export const slugOf = (url) => new URL(url).pathname.split('/').filter(Boolean).at(-1)

// --- Rich text -------------------------------------------------------------

// Weak references may point at a document that isn't published yet (the
// homepage, so far); it resolves once it is
const internal = (_key, _ref, weak = false) => ({
  _key,
  _type: 'link',
  linkType: 'internal',
  internalLink: {_type: 'reference', _ref, ...(weak && {_weak: true})},
})
const external = (_key, externalUrl) => ({_key, _type: 'link', linkType: 'external', externalUrl})

/**
 * A link annotation for an old-site href, or null to drop the link and
 * keep its text. Fixes the old site's broken hrefs (emails without
 * mailto:, URLs without https://), and points links at the old site to
 * their new homes: imported news (`newsSlugs`) and artworks (`artworkIds`,
 * by old path), the homepage, the About page (`aboutId`) for people, and
 * PDFs, which are re-hosted on import (`_file`). Other old-site pages have
 * no new home yet.
 */
const linkFor = (rawHref, {newsSlugs, artworkIds, aboutId} = {}) => {
  const raw = rawHref.trim()
  const markKey = key()
  if (/^(mailto|tel):/i.test(raw)) return external(markKey, raw)
  if (/^[^\s/:@]+@[^\s/@]+\.[a-z]+$/i.test(raw)) return external(markKey, `mailto:${raw}`)

  const href = new URL(/^www\./i.test(raw) ? `https://${raw}` : raw, SITE)
  if (!/(^|\.)desertx\.org$/.test(href.hostname)) return external(markKey, href.href)

  const path = href.pathname.replace(/\/$/, '')
  // Broken relative links: an email or domain after the old site's address
  const stray = path.slice(1)
  if (/^[^\s/@]+@[^\s/@]+\.[a-z]+$/i.test(stray)) return external(markKey, `mailto:${stray}`)
  if (/^www\./i.test(stray)) return external(markKey, `https://${stray}`)

  if (path === '') return internal(markKey, 'homepage', true)
  if (path.startsWith('/learn/news/') && newsSlugs?.has(slugOf(href.href))) {
    return internal(markKey, `news-${slugOf(href.href)}`)
  }
  if (artworkIds?.has(path)) return internal(markKey, artworkIds.get(path))
  if (/\.pdf$/i.test(path)) return {...external(markKey, href.href), _file: true}
  if (/^\/(about\/team-board|dx\/about)\//.test(path) && aboutId) return internal(markKey, aboutId)
  return null
}

/**
 * Portable Text spans for an element's contents: italics become `em`,
 * links become link annotations (see linkFor), <br> a line break. Bold
 * has no style here, so it's dropped.
 */
const inlineSpans = (element, context) => {
  const spans = []
  const markDefs = []

  const walk = (node, marks) => {
    if (node.nodeType === 3) {
      spans.push({text: node.textContent.replace(/\s+/g, ' '), marks})
      return
    }
    if (node.nodeType !== 1) return
    const tag = node.tagName.toLowerCase()
    if (tag === 'br') {
      spans.push({text: '\n', marks})
      return
    }
    let childMarks = marks
    if (tag === 'em' || tag === 'i') childMarks = [...marks, 'em']
    const link =
      tag === 'a' && node.getAttribute('href') && linkFor(node.getAttribute('href'), context)
    if (link) {
      markDefs.push(link)
      childMarks = [...marks, link._key]
    }
    node.childNodes.forEach((child) => walk(child, childMarks))
  }
  element.childNodes.forEach((child) => walk(child, []))

  // Merge neighbours with the same marks, then trim the block's ends and
  // the spaces either side of line breaks
  const merged = spans.reduce((all, span) => {
    const last = all.at(-1)
    if (last && last.marks.join() === span.marks.join()) last.text += span.text
    else all.push({...span})
    return all
  }, [])
  merged.forEach((span) => (span.text = span.text.replace(/ *\n */g, '\n')))
  if (merged.length) {
    merged[0].text = merged[0].text.trimStart()
    merged.at(-1).text = merged.at(-1).text.trimEnd()
  }
  const children = merged
    .filter((span) => span.text)
    .map((span) => ({_key: key(), _type: 'span', text: span.text, marks: span.marks}))
  const usedMarks = new Set(children.flatMap((span) => span.marks))
  return {children, markDefs: markDefs.filter((def) => usedMarks.has(def._key))}
}

/** A Portable Text block for an element, or null if it has no text. */
export const block = (element, context, prefix = '') => {
  const {children, markDefs} = inlineSpans(element, context)
  if (!children.length) return null
  if (prefix) children[0].text = prefix + children[0].text
  return {_key: key(), _type: 'block', style: 'normal', markDefs, children}
}

// --- Media -----------------------------------------------------------------

/**
 * An image to upload on import: `_source` is its old-site URL, and
 * `_caption` goes on the asset (see withUploads).
 */
export const pendingImage = (src, caption) => ({
  _type: 'image',
  _source: new URL(src, SITE).href,
  _caption: caption || undefined,
})

export const imageModule = (src, caption) => ({
  _key: key(),
  _type: 'mediaModule',
  mediaType: 'image',
  image: pendingImage(src, caption),
})

export const embedModule = (src) => {
  const url = new URL(src, SITE)
  if (url.hostname.includes('vimeo')) {
    return {_key: key(), _type: 'mediaModule', mediaType: 'vimeo', vimeoUrl: url.href}
  }
  const youtubeId = url.pathname.split('/').at(-1)
  return {_key: key(), _type: 'mediaModule', mediaType: 'youtube', youtubeId}
}

// --- Uploads ---------------------------------------------------------------

const uploaded = new Map()

/** How many images and files have been uploaded so far. */
export const uploadCount = () => uploaded.size

/** Uploads a file or image once per URL, returning its asset. */
const upload = async (kind, source) => {
  if (!uploaded.has(source)) {
    const response = await fetch(source)
    if (!response.ok) throw new Error(`${response.status} for ${source}`)
    const buffer = Buffer.from(await response.arrayBuffer())
    uploaded.set(source, await client.assets.upload(kind, buffer, {filename: slugOf(source)}))
  }
  return uploaded.get(source)
}

/** Uploads a pendingImage, returning the image that references its asset. */
export const uploadImage = async ({_source, _caption}) => {
  const asset = await upload('image', _source)
  if (_caption) await client.patch(asset._id).set({description: _caption}).commit()
  return {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}
}

/**
 * Swaps the dry run's placeholders in modules for uploads: images (with
 * their caption on the asset, for the media library) and linked PDFs
 * (re-hosted, so they outlive the old site).
 */
export const withUploads = async (modules) => {
  for (const module of modules) {
    if (module.image?._source) module.image = await uploadImage(module.image)
    for (const link of (module.text ?? []).flatMap((block) => block.markDefs)) {
      if (link._file) {
        link.externalUrl = (await upload('file', link.externalUrl)).url
        delete link._file
      }
    }
  }
  return modules
}
