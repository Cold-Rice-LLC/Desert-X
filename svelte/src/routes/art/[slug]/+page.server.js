import { error } from '@sveltejs/kit';
import { artworkCredit } from '$lib/art';
import { client } from '$lib/sanity/client';
import { imageFields } from '$lib/sanity/images';
import { modulesFields } from '$lib/sanity/modules';
import { moduleDescription, moduleTextField, pageSeo, seoFields } from '$lib/sanity/seo';
import { visualArtwork } from '$lib/structuredData';

/**
 * An artwork by slug. Its artists' names show beside it and in the nav,
 * under Art on phones, unless an Artist Credit replaces them. Shared,
 * it's titled with both, and shows the start of its text (or else the
 * artist info) and its first image; to search engines it's a
 * VisualArtwork.
 */
export async function load({ params, url }) {
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
				${moduleTextField},
				${seoFields}
			},
			"landingTitle": *[_id == "artLanding"][0].title
		}`,
		{ slug: params.slug }
	);

	if (!artwork) error(404, 'Not found');

	const credit = artworkCredit(artwork);
	const description = moduleDescription(artwork) || artwork.artistInfo;

	return {
		artwork: { ...artwork, credit },
		navTitle: landingTitle || 'Art',
		navHref: '/art',
		navDetail: credit,
		navStacked: true,
		seo: pageSeo(artwork.seo, {
			title: credit ? `${credit}, ${artwork.title}` : artwork.title,
			description,
			image: artwork.images?.[0]
		}),
		structuredData: visualArtwork({ ...artwork, description }, url)
	};
}
