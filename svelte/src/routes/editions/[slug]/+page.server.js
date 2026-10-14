import { error } from '@sveltejs/kit';
import { client } from '$lib/sanity/client';
import { editionFields } from '$lib/sanity/editions';
import { newsLandingFields } from '$lib/sanity/news';

/**
 * An edition by slug, with every other edition at its location, newest
 * first, for Other Editions. The nav shows its year and location.
 */
export async function load({ params }) {
	const { edition, news } = await client.fetch(
		`{
			"edition": *[_type == "edition" && slug.current == $slug][0]{
				${editionFields},
				"others": *[_type == "edition" && location._ref == ^.location._ref && _id != ^._id]
					| order(year desc){ ${editionFields} }
			},
			"news": { ${newsLandingFields} }
		}`,
		{ slug: params.slug }
	);

	if (!edition) error(404, 'Not found');

	return { edition, news, navTitle: String(edition.year), navDetail: edition.location };
}
