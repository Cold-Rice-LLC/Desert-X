import { createHash } from 'node:crypto';
import { client } from '$lib/sanity/client';
import { linkFields, richTextFields } from '$lib/sanity/links';

export async function load({ cookies }) {
	const settings = await client.fetch(`
		*[_id == "siteSettings"][0]{
			announcementBar{
				text,
				linkLabel,
				${linkFields}
			},
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

	const bar = settings?.announcementBar;
	const announcement = bar?.text
		? {
				...bar,
				// Identifies this announcement's content, so dismissing one
				// doesn't hide the next
				key: createHash('sha1').update(JSON.stringify(bar)).digest('hex').slice(0, 12)
			}
		: null;

	return {
		menu: {
			items: settings?.menuItems ?? [],
			text: settings?.menuText,
			donateLink: settings?.donateLink
		},
		footer: {
			links: [settings?.footerLinks1 ?? [], settings?.footerLinks2 ?? []],
			text: settings?.footerText,
			credits: settings?.credits
		},
		announcement,
		// Read here rather than in the browser so a dismissed bar never flashes
		announcementDismissed:
			!!announcement && cookies.get('announcement-dismissed') === announcement.key
	};
}
