import { env } from '$env/dynamic/public';

/**
 * With PUBLIC_NOINDEX=true (on staging), every response asks search
 * engines not to index it. robots.txt still lets them crawl, as they have
 * to fetch a page to see that.
 */
export async function handle({ event, resolve }) {
	const response = await resolve(event);
	if (env.PUBLIC_NOINDEX === 'true') response.headers.set('X-Robots-Tag', 'noindex');
	return response;
}
