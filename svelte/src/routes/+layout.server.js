import { client } from '$lib/sanity/client';
import { imageFields } from '$lib/sanity/images';
import { linkFields, richTextFields } from '$lib/sanity/links';

// A menu, Donate or footer link
const navLinkFields = `_key, label, ${linkFields}`;

// A location's editions, from inside a projection of the location
const editionsOf = '*[_type == "edition" && location._ref == ^._id]';

export async function load() {
	const { settings, locations } = await client.fetch(`{
		"settings": *[_id == "siteSettings"][0]{
			siteTitle,
			metaDescription,
			ogImage{ ${imageFields} },
			menuItems[]{ ${navLinkFields}, subItems[]{ ${navLinkFields} } },
			menuText,
			donateLink{ ${navLinkFields} },
			footerLinks2[]{ ${navLinkFields} },
			footerText[]{ ${richTextFields} },
			credits[]{ ${richTextFields} }
		},
		// For the footer: each location with an edition, oldest first, as a
		// link to its newest edition, like a menu link to a location
		"locations": *[_type == "location" && count(${editionsOf}) > 0]{
			"_key": _id,
			"label": title,
			"linkType": "internal",
			"internal": {
				_id,
				_type,
				"slug": ${editionsOf} | order(year desc)[0].slug.current
			},
			"since": ${editionsOf} | order(year asc)[0].year
		} | order(since asc)
	}`);

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
			links: [locations, settings?.footerLinks2 ?? []],
			text: settings?.footerText,
			credits: settings?.credits
		},
		donateLink: settings?.donateLink
	};
}
