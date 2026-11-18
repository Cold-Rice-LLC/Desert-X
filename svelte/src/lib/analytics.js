const MEASUREMENT_ID = 'G-JQEH2Y1FE8';

// Only the public site's visits count: not local, staging or Vercel's
// preview deployments
const HOSTS = ['desertx.org', 'www.desertx.org'];

const enabled = () => HOSTS.includes(window.location.hostname);

function gtag() {
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push(arguments);
}

/**
 * Loads Google Analytics. Its own page views are off: the site never
 * refreshes, so trackPageView sends them, the first included. Client-side
 * only, so call it from onMount.
 */
export function loadAnalytics() {
	if (!enabled()) return;
	gtag('js', new Date());
	gtag('config', MEASUREMENT_ID, { send_page_view: false });
	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
	document.head.append(script);
}

export function trackPageView() {
	if (!enabled()) return;
	gtag('event', 'page_view', {
		page_location: window.location.href,
		page_title: document.title
	});
}
