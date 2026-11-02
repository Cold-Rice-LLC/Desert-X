/**
 * Lets every crawler in, and points them to the sitemap on this host,
 * so staging's points to staging's. Staging still isn't indexed: its
 * pages say noindex (see hooks.server.js).
 */
export function GET({ url }) {
	return new Response(`User-agent: *\nDisallow:\n\nSitemap: ${url.origin}/sitemap.xml\n`, {
		headers: { 'content-type': 'text/plain' }
	});
}
