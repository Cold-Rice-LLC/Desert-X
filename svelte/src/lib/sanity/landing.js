import { client } from '$lib/sanity/client';

/**
 * Load for a landing page route: its landing document (whose id is its type
 * name), plus the nav title. Falls back to `title` until the document has
 * been published in the Studio. `fields` adds to the GROQ projection.
 */
export const loadLanding = async (type, title, fields = '') => {
	const landing = await client.fetch(`*[_id == $type][0]{ title, ${fields} }`, { type });

	return { landing, navTitle: landing?.title || title };
};
