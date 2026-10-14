import { error } from '@sveltejs/kit';
import { client } from '$lib/sanity/client';
import { imageFields } from '$lib/sanity/images';
import { modulesFields } from '$lib/sanity/modules';
import { pageSeo, seoFields } from '$lib/sanity/seo';

// "A", "A & B", "A, B & C"
const joinNames = (names) =>
	names.length > 1 ? `${names.slice(0, -1).join(', ')} & ${names.at(-1)}` : (names[0] ?? '');

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
				"artistNames": artists[]->title,
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

	const { artistCredit, artistNames, ...rest } = artwork;
	const credit = artistCredit || joinNames((artistNames ?? []).filter(Boolean));

	return {
		artwork: { ...rest, credit },
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
