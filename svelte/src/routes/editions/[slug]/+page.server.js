import { error } from '@sveltejs/kit';
import { editionStatus } from '$lib/dates';
import { client } from '$lib/sanity/client';
import { editionFields } from '$lib/sanity/editions';
import { newsLandingFields } from '$lib/sanity/news';
import { pageSeo, seoFields } from '$lib/sanity/seo';
import { exhibitionEvent } from '$lib/structuredData';

/**
 * An edition by slug, with every other edition at its location, newest
 * first, for Other Editions. The nav shows its location after Upcoming,
 * On View or, once it's over, its year (see editionStatus), on a line of
 * its own on phones.
 * Shared, it shows its title, the start of its description and its first
 * image, and to search engines as an ExhibitionEvent.
 */
export async function load({ params, url }) {
	const { edition, news } = await client.fetch(
		`{
			"edition": *[_type == "edition" && slug.current == $slug][0]{
				${editionFields},
				title,
				"descriptionText": pt::text(description),
				${seoFields},
				"others": *[_type == "edition" && location._ref == ^.location._ref && _id != ^._id]
					| order(year desc){ ${editionFields} }
			},
			"news": { ${newsLandingFields} }
		}`,
		{ slug: params.slug }
	);

	if (!edition) error(404, 'Not found');

	return {
		edition,
		news,
		navTitle: editionStatus(edition),
		navDetail: edition.location,
		navStacked: true,
		seo: pageSeo(edition.seo, {
			title: edition.title,
			description: edition.descriptionText,
			image: edition.images?.[0]
		}),
		structuredData: exhibitionEvent(edition, url)
	};
}
