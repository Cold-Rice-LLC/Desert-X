/**
 * GROQ projection for a link built from linkTargetFields in the Studio:
 * internal links come back as the target document's type and slug.
 */
export const linkFields = `
	linkType,
	externalUrl,
	"internal": internalLink->{ _id, _type, "slug": slug.current }
`;

// Where each landing document lives: pages the site builds itself
const landingPaths = {
	newsLanding: '/news',
	artistsLanding: '/artists',
	artLanding: '/art',
	locationsLanding: '/locations',
	visitLanding: '/visit',
	searchLanding: '/search'
};

// Where each linkable document type lives on the site. Provisional until
// the URL structure is settled.
const paths = {
	page: (slug) => `/${slug}`,
	news: (slug) => `/news/${slug}`,
	artist: (slug) => `/artists/${slug}`,
	artwork: (slug) => `/art/${slug}`,
	edition: (slug) => `/editions/${slug}`,
	location: (slug) => `/locations/${slug}`
};

/** The href for a link, or null when it points nowhere. */
export const linkHref = (link) => {
	if (link?.linkType === 'external') return link.externalUrl || null;
	if (link?.linkType !== 'internal' || !link.internal) return null;

	const { _id, _type, slug } = link.internal;
	if (_id === 'homepage') return '/';
	if (landingPaths[_type]) return landingPaths[_type];
	return slug && paths[_type] ? paths[_type](slug) : null;
};

// Opens in a new tab: web URLs only, not mailto:/tel:
export const isExternalLink = (link) =>
	link?.linkType === 'external' && /^https?:/.test(link.externalUrl ?? '');

/** GROQ projection for a richText field, resolving its link annotations. */
export const richTextFields = `
	...,
	markDefs[]{
		...,
		_type == "link" => { ${linkFields} }
	}
`;
