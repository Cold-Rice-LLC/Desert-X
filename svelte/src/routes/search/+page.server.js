import { loadLanding } from '$lib/sanity/landing';
import { richTextFields } from '$lib/sanity/links';

export const load = () => loadLanding('searchLanding', 'Search', `intro[]{ ${richTextFields} }`);
