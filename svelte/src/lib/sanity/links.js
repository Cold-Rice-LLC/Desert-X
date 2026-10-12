/**
 * GROQ projection for a link built from linkTargetFields in the Studio:
 * internal links come back as the target document's type and slug.
 */
export const linkFields = `
	linkType,
	externalUrl,
	"internal": internalLink->{ _id, _type, "slug": slug.current }
`;

// Where each linkable document type lives on the site. Provisional until
// the URL structure is settled.
const paths = {
	page: (slug) => `/${slug}`,
	news: (slug) => `/news/${slug}`,
	artist: (slug) => `/artists/${slug}`,
	artwork: (slug) => `/artworks/${slug}`,
	edition: (slug) => `/editions/${slug}`,
	location: (slug) => `/locations/${slug}`
};

/** The href for a link, or null when it points nowhere. */
export const linkHref = (link) => {
	if (link?.linkType === 'external') return link.externalUrl || null;
	if (link?.linkType !== 'internal' || !link.internal) return null;

	const { _id, _type, slug } = link.internal;
	if (_id === 'homepage') return '/';
	return slug && paths[_type] ? paths[_type](slug) : null;
};

export const isExternalLink = (link) => link?.linkType === 'external';
