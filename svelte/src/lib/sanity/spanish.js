import { richTextFields } from '$lib/sanity/links';

/**
 * Spanish, on the pages that offer EN / ES (artworks). Each translated
 * field has a Spanish twin in the Studio, named with `Es` (titleEs,
 * textEs), and anything without one stays in English. The page loads
 * both and shows the Spanish at ?lang=es, gallery captions included; the nav, footer, SEO and other
 * site-wide text stay English, and the canonical URL is the English one.
 */

// The fields each module type translates
const MODULE_FIELDS = {
	textModule: ['heading', 'text'],
	mediaModule: ['caption', 'secondCaption']
};

/**
 * GROQ projection to add after modulesFields, for the modules' Spanish
 * twins.
 */
export const spanishModuleFields = `
	_type == "textModule" => {
		headingEs,
		textEs[]{ ${richTextFields} }
	},
	_type == "mediaModule" => {
		captionEs[]{ ${richTextFields} },
		secondCaptionEs[]{ ${richTextFields} }
	}
`;

// An empty rich text field is an empty array
const filled = (value) => (Array.isArray(value) ? value.length > 0 : Boolean(value));

/** Whether a document, given its own `fields`, has any Spanish to show. */
export const hasSpanish = (document, fields) =>
	fields.some((field) => filled(document[`${field}Es`])) ||
	(document.images ?? []).some((image) => filled(image.captionEs)) ||
	(document.modules ?? []).some((module) =>
		(MODULE_FIELDS[module._type] ?? []).some((field) => filled(module[`${field}Es`]))
	);

// `fields` of `object` swapped for their Spanish twins wherever filled
const swap = (object, fields) => ({
	...object,
	...Object.fromEntries(
		fields
			.filter((field) => filled(object[`${field}Es`]))
			.map((field) => [field, object[`${field}Es`]])
	)
});

/**
 * Just what changes in Spanish: a document's own `fields`, its gallery's
 * captions and its modules, to spread over the English.
 */
export const inSpanish = (document, fields) => ({
	...Object.fromEntries(
		fields.map((field) => [
			field,
			filled(document[`${field}Es`]) ? document[`${field}Es`] : document[field]
		])
	),
	images: document.images?.map((image) => swap(image, ['caption'])),
	modules: document.modules?.map((module) => swap(module, MODULE_FIELDS[module._type] ?? []))
});
