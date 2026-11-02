import { error } from '@sveltejs/kit';
import { client } from '$lib/sanity/client';
import { modulesFields } from '$lib/sanity/modules';
import { moduleDescription, moduleTextField, pageSeo, seoFields } from '$lib/sanity/seo';

// Any page under "All pages" in the Studio, by slug. The homepage has its
// own route, so it's left out here. Shared, it shows the start of its text.
export async function load({ params }) {
	const page = await client.fetch(
		`*[_type == "page" && slug.current == $slug && _id != "homepage"][0]{
			title,
			modules[]{ ${modulesFields} },
			${moduleTextField},
			${seoFields}
		}`,
		{ slug: params.path }
	);

	if (!page) error(404, 'Not found');

	return {
		page,
		navTitle: page.title,
		seo: pageSeo(page.seo, { title: page.title, description: moduleDescription(page) })
	};
}
