import { artworkListFields } from '$lib/art';
import { galleryImageFields, imageFields } from '$lib/sanity/images';
import { richTextFields } from '$lib/sanity/links';

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
 * (map text and sponsors included) and its artworks with where they stand
 * for the map. News is the exhibition page's own (see its load).
 */
export const editionFields = `
	_id,
	year,
	"slug": slug.current,
	startDate,
	endDate,
	"location": location->title,
	images[]{ ${galleryImageFields} },
	description[]{ ${richTextFields} },
	mapText[]{ ${richTextFields} },
	sponsorGroups[]{
		_key,
		title,
		fullWidth,
		logos[defined(image.asset)]{ _key, name, url, image{ ${imageFields} } }
	},
	sponsorLists[]{ _key, title, text[]{ ${richTextFields} } },
	${editionArtworksFields}
`;
