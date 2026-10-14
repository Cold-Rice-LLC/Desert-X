import { client } from '$lib/sanity/client';
import { artworkListFields } from '$lib/art';
import { loadLanding } from '$lib/sanity/landing';
import { richTextFields } from '$lib/sanity/links';

/**
 * The Art landing and every artwork. Searching, sorting, the view and
 * paging happen in +page.js, from the URL, so changing them doesn't load
 * the artworks again.
 */
export async function load() {
	const [landing, artworks] = await Promise.all([
		loadLanding('artLanding', 'Art', `intro[]{ ${richTextFields} }`),
		client.fetch(`*[_type == "artwork" && defined(slug.current)]{ ${artworkListFields} }`)
	]);

	return { ...landing, artworks };
}
