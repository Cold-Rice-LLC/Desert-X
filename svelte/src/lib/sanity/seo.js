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
 * The first image in a page's Carousel or Media modules, in order, as its
 * share image: a carousel's first image, a media module's image or, for
 * an MP4, its poster. YouTube and Vimeo modules have none of their own.
 */
export const firstModuleImage = (modules) => {
	for (const module of modules ?? []) {
		const image =
			module._type === 'carouselModule'
				? module.images?.[0]
				: module._type === 'mediaModule' &&
					{ image: module.image, mp4: module.poster }[module.mediaType];
		if (image?.asset) return image;
	}
	return undefined;
};

/**
 * A page's title, description and share image for the layout's head
 * tags: the Studio's overrides where set, or else `defaults` from the page
 * itself. Whatever's still empty falls back to Menu, Footer & SEO there.
 */
export const pageSeo = (overrides, defaults = {}) => ({
	title: overrides?.title || defaults.title,
	description: overrides?.description || defaults.description,
	image: overrides?.image?.asset ? overrides.image : defaults.image
});
