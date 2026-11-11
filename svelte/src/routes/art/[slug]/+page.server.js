import { error } from '@sveltejs/kit';
import { artworkCredit } from '$lib/art';
import { client } from '$lib/sanity/client';
import { galleryImageFields } from '$lib/sanity/images';
import { modulesFields } from '$lib/sanity/modules';
import { moduleDescription, moduleTextField, pageSeo, seoFields } from '$lib/sanity/seo';
import { hasSpanish, inSpanish, spanishModuleFields } from '$lib/sanity/spanish';
import { visualArtwork } from '$lib/structuredData';

// The artwork's own fields with Spanish twins
const SPANISH_FIELDS = ['title', 'artistInfo'];

/**
 * An artwork by slug. Its artists' names show beside it, unless an
 * Artist Credit replaces them, and its title after Art in the nav from
 * md up, with its exhibition (location and year) linked after it under
 * the carousel. Shared,
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
				"edition": edition->{
					year,
					"slug": slug.current,
					"location": location->title
				},
				artistInfo,
				artistInfoEs,
				images[]{ ${galleryImageFields} },
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
		navWork: artwork.title,
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
