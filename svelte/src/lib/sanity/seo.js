import { imageFields } from '$lib/sanity/images';

/** GROQ projection for a document's SEO overrides, from the Studio. */
export const seoFields = `seo{ title, description, image{ ${imageFields} } }`;

/**
 * GROQ projection for the plain text of a document's Text modules, in
 * order, as `moduleText`: a description for a page with none of its own
 * (see moduleDescription). A module can be just a heading, with no text.
 */
export const moduleTextField = `"moduleText": pt::text(modules[_type == "textModule"].text[])`;

// Text compared case and spacing aside
const comparable = (text = '') => text.replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * A document's `moduleText` as a description, without a first paragraph
 * that only repeats its title, as news often opens with, in any case.
 * Seo cuts it to length.
 */
export const moduleDescription = ({ moduleText, title }) => {
	if (!moduleText) return undefined;
	const [first, ...rest] = moduleText.split(/\n{2,}/);
	if (comparable(first) !== comparable(title)) return moduleText;
	return rest.join('\n\n') || undefined;
};

/**
 * A page's title, description and share image for the layout's head
 * tags: the Studio's overrides where set, or else `defaults` from the page
 * itself. Whatever's still empty falls back to Site Settings there.
 */
export const pageSeo = (overrides, defaults = {}) => ({
	title: overrides?.title || defaults.title,
	description: overrides?.description || defaults.description,
	image: overrides?.image?.asset ? overrides.image : defaults.image
});
