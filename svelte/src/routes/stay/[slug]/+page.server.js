import { error } from '@sveltejs/kit';
import { client } from '$lib/sanity/client';
import { galleryImageFields } from '$lib/sanity/images';
import { richTextFields } from '$lib/sanity/links';
import { pageSeo, seoFields } from '$lib/sanity/seo';

/**
 * A partner hotel by slug: its images as a carousel, then its name and
 * details as a text module, its name in the nav. Shared, it shows its
 * details and first image.
 */
export async function load({ params }) {
	const hotel = await client.fetch(
		`*[_type == "hotel" && slug.current == $slug][0]{
			title,
			"images": images[defined(asset)]{ ${galleryImageFields} },
			details[]{ ${richTextFields} },
			"detailsText": pt::text(details),
			${seoFields}
		}`,
		{ slug: params.slug }
	);

	if (!hotel) error(404, 'Not found');

	return {
		navTitle: hotel.title,
		modules: [
			{ _key: 'images', _type: 'carouselModule', images: hotel.images ?? [] },
			{ _key: 'details', _type: 'textModule', heading: hotel.title, text: hotel.details }
		],
		seo: pageSeo(hotel.seo, {
			title: hotel.title,
			description: hotel.detailsText || undefined,
			image: hotel.images?.[0]
		})
	};
}
