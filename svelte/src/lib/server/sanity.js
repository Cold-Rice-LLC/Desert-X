import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { brand } from '$lib/brand';
import { sanity } from '$lib/sanity/client';

/**
 * Draft preview: a request for any page with ?preview=true reads Sanity's
 * drafts, with the viewer token in SANITY_API_READ_TOKEN, so editors see
 * unpublished changes. The Studio's Open preview links there. The token
 * stays on the server; without it, preview shows published content.
 * Preview responses are never cached and carry a banner (see hooks.server.js
 * and PreviewBanner). Following a link out of a preview page drops the
 * param, and so leaves preview.
 */
const token = env.SANITY_API_READ_TOKEN;
const drafts = token && sanity.withConfig({ perspective: 'drafts', useCdn: false, token });

/** Whether a URL asks for preview and the site can give it. */
export const isPreview = (url) => Boolean(drafts) && url.searchParams.get('preview') === 'true';

if (!token)
	console.warn('[preview] SANITY_API_READ_TOKEN is not set; preview shows published content');

/**
 * Sanity's client for loads, its results with the name written DESERT X
 * (see brand), reading drafts for a preview request.
 */
export const client = {
	fetch: async (...args) => {
		const preview = isPreview(getRequestEvent().url);
		return brand(await (preview ? drafts : sanity).fetch(...args));
	}
};
