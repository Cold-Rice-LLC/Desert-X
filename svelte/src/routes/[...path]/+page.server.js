import { error } from '@sveltejs/kit';
import { client } from '$lib/sanity/client';

// Any page under "All pages" in the Studio, by slug. The homepage has its
// own route, so it's left out here.
export async function load({ params }) {
	const page = await client.fetch(
		`*[_type == "page" && slug.current == $slug && _id != "homepage"][0]{
			title,
			modules
		}`,
		{ slug: params.path }
	);

	if (!page) error(404, 'Not found');

	return { page, navTitle: page.title };
}
