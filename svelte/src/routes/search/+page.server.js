import { client } from '$lib/sanity/client';
import { richTextFields } from '$lib/sanity/links';

export async function load() {
	const settings = await client.fetch(`
		*[_id == "siteSettings"][0]{
			searchIntro[]{ ${richTextFields} }
		}
	`);

	return { intro: settings?.searchIntro, navTitle: 'Search' };
}
