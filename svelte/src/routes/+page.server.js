import { client } from '$lib/sanity/client';
import { imageFields } from '$lib/sanity/images';
import { linkFields } from '$lib/sanity/links';
import { pageSeo, seoFields } from '$lib/sanity/seo';

export async function load() {
	const homepage = await client.fetch(`
		*[_id == "homepage"][0]{
			slides[]{
				_key,
				image{ ${imageFields} },
				${linkFields}
			},
			${seoFields}
		}
	`);

	// The homepage is titled with the site's title alone, unless the
	// Studio sets one
	const seo = pageSeo(homepage?.seo);

	if (homepage?.slides?.length) return { slides: homepage.slides, seo };

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
		`),
		seo
	};
}
