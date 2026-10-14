import { imageFields } from '$lib/sanity/images';

/** GROQ projection for a document's SEO overrides, from the Studio. */
export const seoFields = `seo{ title, description, image{ ${imageFields} } }`;

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
