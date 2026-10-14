import { client } from '$lib/sanity/client';

// The nav reads as the Donate page's title, linking back to it. Kept out
// of search engines: it's a step of donating, not a page of its own.
export const load = async () => {
	const title = await client.fetch(`*[_type == "page" && slug.current == "donate"][0].title`);
	return { navTitle: title || 'Donate', navHref: '/donate', seo: { noindex: true } };
};
