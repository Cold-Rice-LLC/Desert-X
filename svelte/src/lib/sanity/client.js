import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const client = createClient({
	projectId: '2f7qebi8',
	dataset: 'production',
	apiVersion: '2024-07-19',
	useCdn: false
});

const builder = createImageUrlBuilder(client);

export const urlFor = (source) => {
	return builder.image(source);
};
