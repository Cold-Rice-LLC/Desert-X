import { imageFields } from '$lib/sanity/images';
import { richTextFields } from '$lib/sanity/links';

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
	}
`;
