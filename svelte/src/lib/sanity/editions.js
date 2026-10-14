import { artworkListFields } from '$lib/art';
import { imageFields } from '$lib/sanity/images';
import { richTextFields } from '$lib/sanity/links';
import { newsTileFields } from '$lib/sanity/news';

/**
 * GROQ projection for an edition shown by EditionContent: its own fields,
 * its artworks, and its three newest news items.
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
	"artworks": *[_type == "artwork" && edition._ref == ^._id && defined(slug.current)]{
		${artworkListFields}
	},
	"news": *[_type == "news" && edition._ref == ^._id] | order(publishDate desc) [0...3]{
		${newsTileFields}
	}
`;
