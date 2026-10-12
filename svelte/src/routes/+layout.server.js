import { createHash } from 'node:crypto';
import { client } from '$lib/sanity/client';
import { linkFields } from '$lib/sanity/links';

export async function load({ cookies }) {
	const settings = await client.fetch(`
		*[_id == "siteSettings"][0]{
			announcementBar{
				text,
				linkLabel,
				${linkFields}
			}
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
		announcement,
		// Read here rather than in the browser so a dismissed bar never flashes
		announcementDismissed:
			!!announcement && cookies.get('announcement-dismissed') === announcement.key
	};
}
