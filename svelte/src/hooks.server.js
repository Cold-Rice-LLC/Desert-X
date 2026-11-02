import { env } from '$env/dynamic/public';
import { redirectFor } from '$lib/redirects';

// How long Vercel's CDN serves a page before asking for it afresh, in s,
// and how long after that it still serves the old one while it does.
// Browsers always ask again, so a published change shows within a minute.
const CACHE_CONTROL = 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400';

/**
 * Old-site paths redirect to where they live now (see redirectFor). With
 * PUBLIC_NOINDEX=true (on staging), every response asks search engines
 * not to index it. robots.txt still lets them crawl, as they have to fetch
 * a page to see that.
 *
 * Pages are the same for everyone, so successful GETs (pages, their data
 * for client-side navigation, which SvelteKit marks no-store, and
 * endpoints without a cache policy of their own) are cached on the CDN
 * (see CACHE_CONTROL), each URL apart, query included. Without it, every
 * view waits on Sanity.
 */
export async function handle({ event, resolve }) {
	const location = redirectFor(event.url.pathname);
	if (location) return new Response(null, { status: 301, headers: { location } });

	const response = await resolve(event);
	if (env.PUBLIC_NOINDEX === 'true') response.headers.set('X-Robots-Tag', 'noindex');
	if (
		event.request.method === 'GET' &&
		response.status === 200 &&
		(event.isDataRequest || !response.headers.has('cache-control'))
	) {
		response.headers.set('cache-control', CACHE_CONTROL);
	}
	return response;
}
