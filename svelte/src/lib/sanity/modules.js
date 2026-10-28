import { imageFields } from '$lib/sanity/images';
import { richTextFields } from '$lib/sanity/links';
import { newsLandingFields, newsTileFields } from '$lib/sanity/news';

/** GROQ projection for a modules array, with a branch per module type. */
export const modulesFields = `
	_key,
	_type,
	_type == "textModule" => {
		heading,
		text[]{ ${richTextFields} }
	},
	_type == "bioModule" => {
		heading,
		bios[]{
			_key,
			image{ ${imageFields} },
			imageText,
			text[]{ ${richTextFields} }
		}
	},
	_type == "peopleListModule" => {
		leftList,
		rightList
	},
	_type == "mediaModule" => {
		mediaType,
		image{ ${imageFields} },
		secondImage{ ${imageFields} },
		"caption": coalesce(caption, image.asset->description, video.asset->description),
		"video": video.asset->url,
		poster{ ${imageFields} },
		youtubeId,
		vimeoUrl
	},
	_type == "scheduleModule" => {
		heading,
		items[]{
			_key,
			time,
			details[]{ ${richTextFields} }
		}
	},
	_type == "newsModule" => {
		"items": select(
			show == "selected" => selected[defined(@->_id)]->{ ${newsTileFields} },
			*[_type == "news"] | order(publishDate desc) [0...3]{ ${newsTileFields} }
		),
		${newsLandingFields}
	},
	_type == "donateModule" => {
		heading,
		image{ ${imageFields} },
		title,
		text,
		amounts
	},
	_type == "interviewModule" => {
		heading,
		exchanges[]{
			_key,
			speaker,
			text[]{ ${richTextFields} }
		}
	},
	_type == "dropdownsModule" => {
		heading,
		dropdowns[]{
			_key,
			title,
			content[]{ ${richTextFields} }
		}
	}
`;
