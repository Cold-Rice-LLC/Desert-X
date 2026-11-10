import { error } from '@sveltejs/kit';
import { artworkCredit } from '$lib/art';
import { client } from '$lib/sanity/client';
import { imageFields } from '$lib/sanity/images';
import { modulesFields } from '$lib/sanity/modules';
import { moduleDescription, moduleTextField, pageSeo, seoFields } from '$lib/sanity/seo';
import { hasSpanish, inSpanish, spanishModuleFields } from '$lib/sanity/spanish';
import { visualArtwork } from '$lib/structuredData';

// The artwork's own fields with Spanish twins
const SPANISH_FIELDS = ['title', 'artistInfo'];

/**
 * An artwork by slug. Its artists' names show beside it and in the nav,
 * under Art on phones, unless an Artist Credit replaces them. Shared,
 * it's titled with both, and shows the start of its text (or else the
 * artist info) and its first image; to search engines it's a
 * VisualArtwork, all in English. With any Spanish, it also comes in
 * Spanish (`spanish`), for the page's EN / ES (see $lib/sanity/spanish).
 */
export async function load({ params, url, untrack }) {
	const { artwork, landingTitle } = await client.fetch(
		`{
			"artwork": *[_type == "artwork" && slug.current == $slug][0]{
				_id,
				title,
				titleEs,
				artistCredit,
				"artists": artists[]->{ title },
				artistInfo,
				artistInfoEs,
				images[]{ _key, ${imageFields} },
				modules[]{ ${modulesFields}, ${spanishModuleFields} },
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
		spanish: hasSpanish(artwork, SPANISH_FIELDS) ? inSpanish(artwork, SPANISH_FIELDS) : undefined,
		navTitle: landingTitle || 'Art',
		navHref: '/art',
		navDetail: credit,
		navStacked: true,
		seo: pageSeo(artwork.seo, {
			title: credit ? `${credit}, ${artwork.title}` : artwork.title,
			description,
			image: artwork.images?.[0]
		}),
		// Untracked, so EN / ES (?lang=es) doesn't load the artwork again
		structuredData: visualArtwork(
			{ ...artwork, description },
			untrack(() => new URL(url.origin + url.pathname))
		)
	};
}
