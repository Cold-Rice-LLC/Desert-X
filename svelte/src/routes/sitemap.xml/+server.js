import { client } from '$lib/sanity/client';

// The landings the site builds itself. Search is left out, as it isn't
// indexed (nor is Donate's checkout, which isn't a document).
const LANDINGS = ['/', '/art', '/news', '/visit'];

// Where each document type lives, as in linkHref
const PREFIXES = { page: '/', edition: '/editions/', artwork: '/art/', news: '/news/' };

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Every indexed page, for search engines: the landings, then each page,
 * edition, artwork and news article with a slug, with when it last
 * changed. Press has no page of its own, so it's left out. robots.txt
 * points here.
 */
export async function GET({ url }) {
	const documents = await client.fetch(`
		*[
			_type in ["page", "edition", "artwork", "news"]
			&& defined(slug.current)
			&& _id != "homepage"
			&& !(_id in path("drafts.**"))
			&& !(_type == "news" && kind == "press")
		] | order(_type asc, slug.current asc){ _type, "slug": slug.current, _updatedAt }
	`);

	// A page with a landing's slug, like Visit, is that landing's, which
	// its route shows instead, so each URL is listed once
	const entries = [
		...LANDINGS.map((path) => ({ loc: url.origin + path })),
		...documents.map(({ _type, slug, _updatedAt }) => ({
			loc: url.origin + PREFIXES[_type] + slug,
			lastmod: _updatedAt?.slice(0, 10)
		}))
	].filter((entry, index, all) => all.findIndex(({ loc }) => loc === entry.loc) === index);

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		({ loc, lastmod }) =>
			`	<url><loc>${escape(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml',
			'cache-control': 'public, max-age=0, s-maxage=3600'
		}
	});
}
