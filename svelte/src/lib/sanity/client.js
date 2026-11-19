import { dev } from '$app/environment';
import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

/**
 * Sanity's client, for image URLs here and, on the server, for loads,
 * which fetch through $lib/server/sanity (for draft preview and branding).
 */
export const sanity = createClient({
	projectId: '2f7qebi8',
	dataset: 'production',
	apiVersion: '2024-07-19',
	// Live from the API locally, so edits show on reload; cached on the site
	useCdn: !dev
});

const builder = createImageUrlBuilder(sanity);

export const urlFor = (source) => {
	return builder.image(source);
};
