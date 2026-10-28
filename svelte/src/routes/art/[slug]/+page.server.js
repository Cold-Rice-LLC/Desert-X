import { error } from '@sveltejs/kit';
import { artworkCredit } from '$lib/art';
import { client } from '$lib/sanity/client';
import { imageFields } from '$lib/sanity/images';
import { modulesFields } from '$lib/sanity/modules';
import { pageSeo, seoFields } from '$lib/sanity/seo';

/**
 * An artwork by slug. Its artists' names show beside it and in the nav,
 * unless an Artist Credit replaces them. Shared, it's titled with both,
 * and shows the artist info and its first image.
 */
export async function load({ params }) {
	const { artwork, landingTitle } = await client.fetch(
		`{
			"artwork": *[_type == "artwork" && slug.current == $slug][0]{
				_id,
				title,
				artistCredit,
				"artists": artists[]->{ title },
				artistInfo,
				images[]{ _key, ${imageFields} },
				modules[]{ ${modulesFields} },
				${seoFields}
			},
			"landingTitle": *[_id == "artLanding"][0].title
		}`,
		{ slug: params.slug }
	);

	if (!artwork) error(404, 'Not found');

	const credit = artworkCredit(artwork);

	return {
		artwork: { ...artwork, credit },
		navTitle: landingTitle || 'Art',
		navHref: '/art',
		navDetail: credit,
		seo: pageSeo(artwork.seo, {
			title: credit ? `${credit}, ${artwork.title}` : artwork.title,
			description: artwork.artistInfo,
			image: artwork.images?.[0]
		})
	};
}
