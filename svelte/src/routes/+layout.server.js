import { client } from '$lib/sanity/client';
import { imageFields } from '$lib/sanity/images';
import { linkFields, richTextFields } from '$lib/sanity/links';

export async function load() {
	const settings = await client.fetch(`
		*[_id == "siteSettings"][0]{
			siteTitle,
			metaDescription,
			ogImage{ ${imageFields} },
			menuItems[]{
				_key,
				label,
				${linkFields},
				subItems[]{ _key, label, ${linkFields} }
			},
			menuText,
			donateLink{ label, ${linkFields} },
			footerLinks1[]{ _key, label, ${linkFields} },
			footerLinks2[]{ _key, label, ${linkFields} },
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
