/**
 * Where each document lives on the site, for the Studio's Open preview,
 * as the site's linkHref (svelte/src/lib/sanity/links.js) works it out.
 * SANITY_STUDIO_SITE_URL points it at another deployment, like a staging
 * site or http://localhost:5173.
 */
// import.meta.env only exists in the Studio's build, not when the CLI
// loads the config
const SITE_URL = (import.meta.env?.SANITY_STUDIO_SITE_URL || 'https://www.desertx.org').replace(
  /\/$/,
  '',
)

// Pages the site builds itself, and Menu, Footer & SEO, which every page
// shows, so its preview is the homepage
const fixedPaths = {
  siteSettings: '/',
  newsLanding: '/news',
  artLanding: '/art',
  visitLanding: '/visit',
  stayLanding: '/stay',
  searchLanding: '/search',
}

const slugPaths = {
  page: (slug) => `/${slug}`,
  news: (slug) => `/news/${slug}`,
  artwork: (slug) => `/art/${slug}`,
  edition: (slug) => `/exhibitions/${slug}`,
  hotel: (slug) => `/stay/${slug}`,
}

/** The types Open preview is offered on. */
export const previewTypes = [...Object.keys(fixedPaths), ...Object.keys(slugPaths)]

/**
 * A document's path on the site, or null while it has none: no slug yet,
 * or a press item, which links off the site. `id` is its published id.
 */
export const previewPath = (type, id, doc) => {
  if (id === 'homepage') return '/'
  if (fixedPaths[type]) return fixedPaths[type]
  if (type === 'news' && doc?.kind === 'press') return null
  const slug = doc?.slug?.current
  return slug && slugPaths[type] ? slugPaths[type](slug) : null
}

/** The full preview URL, or null when previewPath has none. */
export const previewUrl = (type, id, doc) => {
  const path = previewPath(type, id, doc)
  return path === null ? null : `${SITE_URL}${path}?preview=true`
}
