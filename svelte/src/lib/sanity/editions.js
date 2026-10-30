import { artworkListFields } from '$lib/art';
import { imageFields } from '$lib/sanity/images';
import { richTextFields } from '$lib/sanity/links';
import { newsTileFields } from '$lib/sanity/news';

/**
 * GROQ projection for an edition's artworks, with where they stand and
 * their thumbnail (or else first image) for its map.
 */
export const editionArtworksFields = `
	"artworks": *[_type == "artwork" && edition._ref == ^._id && defined(slug.current)]{
		${artworkListFields},
		coordinates,
		"thumbnail": select(defined(thumbnail.asset) => thumbnail, images[0]){ ${imageFields} }
	}
`;

/**
 * GROQ projection for an edition shown by EditionContent: its own fields
 * (map text and sponsors included), its artworks with where they stand for
 * the map, and its three newest news items.
 */
export const editionFields = `
	_id,
	year,
	"slug": slug.current,
	startDate,
	endDate,
	"location": location->title,
	images[]{ _key, ${imageFields} },
	description[]{ ${richTextFields} },
	mapText[]{ ${richTextFields} },
	sponsorGroups[]{
		_key,
		title,
		fullWidth,
		logos[defined(image.asset)]{ _key, name, url, image{ ${imageFields} } }
	},
	sponsorLists[]{ _key, title, text[]{ ${richTextFields} } },
	${editionArtworksFields},
	"news": *[_type == "news" && edition._ref == ^._id] | order(publishDate desc) [0...3]{
		${newsTileFields}
	}
`;
