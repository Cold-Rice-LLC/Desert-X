import { client } from '$lib/sanity/client';
import { imageFields } from '$lib/sanity/images';
import { linkFields } from '$lib/sanity/links';

export async function load() {
	const slides = await client.fetch(`
		*[_id == "homepage"][0].slides[]{
			_key,
			image{ ${imageFields} },
			${linkFields}
		}
	`);

	if (slides?.length) return { slides };

	// PROTOTYPE: until the Homepage has slides in the Studio, stand in the
	// newest artworks' first images, each linking to its artwork
	return {
		slides: await client.fetch(`
			*[_type == "artwork" && defined(images[0])] | order(edition->year desc)[0...20]{
				"_key": _id,
				"image": images[0]{ ${imageFields} },
				"linkType": "internal",
				"internal": { _id, _type, "slug": slug.current }
			}
		`)
	};
}
