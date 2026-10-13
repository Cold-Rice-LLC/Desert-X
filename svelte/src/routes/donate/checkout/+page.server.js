import { client } from '$lib/sanity/client';

// The nav reads as the Donate page's title, linking back to it
export const load = async () => {
	const title = await client.fetch(`*[_type == "page" && slug.current == "donate"][0].title`);
	return { navTitle: title || 'Donate', navHref: '/donate' };
};
