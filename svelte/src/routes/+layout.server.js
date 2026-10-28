import { client } from '$lib/sanity/client';
import { imageFields } from '$lib/sanity/images';
import { linkFields, richTextFields } from '$lib/sanity/links';

// A menu, Donate or footer link
const navLinkFields = `_key, label, ${linkFields}`;

export async function load() {
	const settings = await client.fetch(`
		*[_id == "siteSettings"][0]{
			siteTitle,
			metaDescription,
			ogImage{ ${imageFields} },
			menuItems[]{ ${navLinkFields}, subItems[]{ ${navLinkFields} } },
			menuText,
			donateLink{ ${navLinkFields} },
			footerLinks1[]{ ${navLinkFields} },
			footerLinks2[]{ ${navLinkFields} },
			footerText[]{ ${richTextFields} },
			credits[]{ ${richTextFields} }
		}
	`);

	return {
		// What pages fall back to for their head tags
		seo: {
			siteTitle: settings?.siteTitle,
			description: settings?.metaDescription,
			image: settings?.ogImage
		},
		menu: {
			items: settings?.menuItems ?? [],
			text: settings?.menuText
		},
		footer: {
			links: [settings?.footerLinks1 ?? [], settings?.footerLinks2 ?? []],
			text: settings?.footerText,
			credits: settings?.credits
		},
		donateLink: settings?.donateLink
	};
}
