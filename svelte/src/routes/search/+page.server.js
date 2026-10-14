import { artworkListFields } from '$lib/art';
import { client } from '$lib/sanity/client';
import { loadLanding } from '$lib/sanity/landing';
import { richTextFields } from '$lib/sanity/links';

/**
 * The Search landing, and the titles and names of everything search can
 * find: artworks, editions, pages, the other landings and news. Searching
 * happens in +page.js, from the URL, so typing doesn't load them again.
 * Kept out of search engines, results and all.
 */
export async function load() {
	const [landing, index] = await Promise.all([
		loadLanding('searchLanding', 'Search', `intro[]{ ${richTextFields} }`),
		client.fetch(`{
			"artworks": *[_type == "artwork" && defined(slug.current)]{ ${artworkListFields} },
			"editions": *[_type == "edition" && defined(slug.current)]{
				_id, _type, title, "slug": slug.current, year, "location": location->title
			},
			"pages": *[
				(_type == "page" && defined(slug.current)) ||
				_id in ["newsLanding", "artLanding", "visitLanding"]
			]{ _id, _type, title, "slug": slug.current },
			"news": *[_type == "news" && defined(slug.current)]{
				_id, _type, "kind": coalesce(kind, "news"), title, "slug": slug.current, pressUrl,
				publishDate
			}
		}`)
	]);

	return { ...landing, seo: { ...landing.seo, noindex: true }, index };
}
