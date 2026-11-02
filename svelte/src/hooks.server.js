import { env } from '$env/dynamic/public';
import { redirectFor } from '$lib/redirects';

/**
 * Old-site paths redirect to where they live now (see redirectFor). With
 * PUBLIC_NOINDEX=true (on staging), every response asks search engines
 * not to index it. robots.txt still lets them crawl, as they have to fetch
 * a page to see that.
 */
export async function handle({ event, resolve }) {
	const location = redirectFor(event.url.pathname);
	if (location) return new Response(null, { status: 301, headers: { location } });

	const response = await resolve(event);
	if (env.PUBLIC_NOINDEX === 'true') response.headers.set('X-Robots-Tag', 'noindex');
	return response;
}
