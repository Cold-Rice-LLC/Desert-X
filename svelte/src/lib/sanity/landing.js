import { client } from '$lib/sanity/client';
import { pageSeo, seoFields } from '$lib/sanity/seo';

/**
 * Load for a landing page route: its landing document (whose id is its type
 * name), plus the nav title. Falls back to `title` until the document has
 * been published in the Studio. `fields` adds to the GROQ projection.
 * Its SEO title is its title, unless the Studio sets another.
 */
export const loadLanding = async (type, title, fields = '') => {
	const landing = await client.fetch(`*[_id == $type][0]{ title, ${seoFields}, ${fields} }`, {
		type
	});

	const navTitle = landing?.title || title;

	return { landing, navTitle, seo: pageSeo(landing?.seo, { title: navTitle }) };
};
