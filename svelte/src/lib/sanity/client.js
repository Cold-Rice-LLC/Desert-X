import { dev } from '$app/environment';
import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import { brand } from '$lib/brand';

const sanity = createClient({
	projectId: '2f7qebi8',
	dataset: 'production',
	apiVersion: '2024-07-19',
	// Live from the API locally, so edits show on reload; cached on the site
	useCdn: !dev
});

/** Sanity's client, its results with the name written DESERT X (see brand). */
export const client = {
	fetch: async (...args) => brand(await sanity.fetch(...args))
};

const builder = createImageUrlBuilder(sanity);

export const urlFor = (source) => {
	return builder.image(source);
};
