import { error } from '@sveltejs/kit';
import { editionStatus } from '$lib/dates';
import { client } from '$lib/sanity/client';
import { editionFields } from '$lib/sanity/editions';
import { newsLandingFields } from '$lib/sanity/news';
import { pageSeo, seoFields } from '$lib/sanity/seo';

/**
 * An edition by slug, with every other edition at its location, newest
 * first, for Other Editions. The nav shows its location after Upcoming,
 * On View or, once it's over, its year (see editionStatus).
 * Shared, it shows its title, the start of its description and its first
 * image.
 */
export async function load({ params }) {
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
		seo: pageSeo(edition.seo, {
			title: edition.title,
			description: edition.descriptionText,
			image: edition.images?.[0]
		})
	};
}
