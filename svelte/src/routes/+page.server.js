import { artworkCredit } from '$lib/art';
import { client } from '$lib/sanity/client';
import { imageFields } from '$lib/sanity/images';
import { linkFields } from '$lib/sanity/links';
import { pageSeo, seoFields } from '$lib/sanity/seo';

// What links to a slide's caption needs from the document it links to
const linkedFields = `{ _type, title, artistCredit, "artists": artists[]->{ title } }`;

// What a slide shows bottom left: its own Title, or else what it links to,
// an artwork by its artist then its title in italics, anything else by
// its title
const caption = ({ title, linked }) => {
	if (title) return { name: title };
	if (linked?._type === 'artwork') {
		return { name: artworkCredit(linked), work: linked.title };
	}
	return linked?.title ? { name: linked.title } : null;
};

const withCaptions = (slides) => slides.map((slide) => ({ ...slide, caption: caption(slide) }));

// The carousel shows still images only: an animated GIF is many times the
// weight of a photo, and holds up the slides around it
const still = 'asset->extension != "gif"';

export async function load() {
	const homepage = await client.fetch(`
		*[_id == "homepage"][0]{
			slides[image.${still}]{
				_key,
				image{ ${imageFields} },
				title,
				${linkFields},
				"linked": internalLink->${linkedFields}
			},
			${seoFields}
		}
	`);

	// The homepage is titled with the site's title alone, unless the
	// Studio sets one
	const seo = pageSeo(homepage?.seo);

	if (homepage?.slides?.length) return { slides: withCaptions(homepage.slides), seo };

	// PROTOTYPE: until the Homepage has slides in the Studio, stand in the
	// newest artworks' first still images, each linking to its artwork
	return {
		slides: withCaptions(
			await client.fetch(`
				*[_type == "artwork" && defined(images[${still}][0])] | order(edition->year desc)[0...20]{
					"_key": _id,
					"image": images[${still}][0]{ ${imageFields} },
					"linkType": "internal",
					"internal": { _id, _type, "slug": slug.current },
					"linked": @${linkedFields}
				}
			`)
		),
		seo
	};
}
