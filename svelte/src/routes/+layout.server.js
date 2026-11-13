import { client } from '$lib/sanity/client';
import { imageFields } from '$lib/sanity/images';
import { linkFields, richTextFields } from '$lib/sanity/links';
import { socialProfiles } from '$lib/structuredData';

// A menu, Donate or footer link
const navLinkFields = `_key, label, ${linkFields}`;

// A location's editions, from inside a projection of the location
const editionsOf = '*[_type == "edition" && location._ref == ^._id]';

// A location as a footer link
const locationLink = `{
	"_key": _id,
	"label": title,
	"linkType": "internal",
	"internal": {
		_id,
		_type,
		"slug": ${editionsOf} | order(year desc)[0].slug.current
	},
	"since": ${editionsOf} | order(year asc)[0].year
}`;

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
			footerGroups[]{
				_key,
				title,
				kind,
				kind != "text" => { links[]{ ${navLinkFields} } },
				kind == "text" => { text[]{ ${richTextFields} } }
			},
			credits[]{ ${richTextFields} }
		},
		// For the homepage's quick links: each location, oldest first, as a
		// link to its newest edition, like a menu link to a location.
		// Locations with no edition have nowhere to go.
		"locations": *[_type == "location" && count(${editionsOf}) > 0]${locationLink} | order(since asc)
	}`);

	return {
		// What pages fall back to for their head tags
		seo: {
			siteTitle: settings?.siteTitle,
			description: settings?.metaDescription,
			image: settings?.ogImage,
			sameAs: socialProfiles([
				...(settings?.footerGroups ?? []).flatMap((group) => group.links ?? []),
				...(settings?.footerLinks2 ?? [])
			])
		},
		menu: {
			items: settings?.menuItems ?? [],
			text: settings?.menuText
		},
		footer: {
			groups: settings?.footerGroups ?? [],
			credits: settings?.credits
		},
		quickLinks: [locations, settings?.footerLinks2 ?? []],
		donateLink: settings?.donateLink
	};
}
