import { urlFor } from '$lib/sanity/client';

/**
 * Schema.org nodes for search engines, written into the head as JSON-LD by
 * Seo. Every page carries the site's Organization and WebSite; a page's
 * own nodes come from its load as `structuredData`, and point back to the
 * Organization by its @id rather than repeating it.
 */

// Profiles that stand for the organization elsewhere, for `sameAs`
const SOCIAL_HOSTS =
	/(^|\.)(instagram|facebook|x|twitter|youtube|tiktok|linkedin|vimeo|threads)\.(com|net)$/;

/** The footer's links to the organization's social profiles, as URLs. */
export const socialProfiles = (links = []) =>
	links
		.filter((link) => link.linkType === 'external' && link.externalUrl)
		.map((link) => link.externalUrl)
		.filter((href) => {
			try {
				return SOCIAL_HOSTS.test(new URL(href).hostname);
			} catch {
				return false;
			}
		});

const organizationId = (origin) => `${origin}/#organization`;

/** The site's Organization and WebSite, for every page. */
export const siteNodes = ({ origin, siteTitle, description, sameAs }) => [
	{
		'@type': 'Organization',
		'@id': organizationId(origin),
		name: siteTitle,
		url: `${origin}/`,
		logo: `${origin}/apple-touch-icon.png`,
		description: description || undefined,
		sameAs: sameAs?.length ? sameAs : undefined
	},
	{
		'@type': 'WebSite',
		'@id': `${origin}/#website`,
		name: siteTitle,
		url: `${origin}/`,
		publisher: { '@id': organizationId(origin) }
	}
];

/** A trail of `{ name, url }` crumbs, home first, as a BreadcrumbList. */
export const breadcrumbs = (crumbs) => ({
	'@type': 'BreadcrumbList',
	itemListElement: crumbs.map(({ name, url }, index) => ({
		'@type': 'ListItem',
		position: index + 1,
		name,
		item: url
	}))
});

// Full-size image URLs, at most `count`, for `image`; none leaves it out
const imageUrls = (images, count = 3) => {
	const urls = (images ?? [])
		.filter((image) => image?.asset)
		.slice(0, count)
		.map((image) => urlFor(image).width(1600).auto('format').url());
	return urls.length ? urls : undefined;
};

const pageUrl = (url) => url.origin + url.pathname;

/**
 * An edition as an ExhibitionEvent, from its start to its end date, at its
 * location. Without a start date it isn't an event yet, and has none.
 */
export const exhibitionEvent = (edition, url) =>
	edition.startDate && {
		'@type': 'ExhibitionEvent',
		name: edition.title,
		url: pageUrl(url),
		startDate: edition.startDate,
		endDate: edition.endDate || undefined,
		eventStatus: 'https://schema.org/EventScheduled',
		eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
		location: edition.location && {
			'@type': 'Place',
			name: edition.location,
			address: edition.location
		},
		description: edition.descriptionText || undefined,
		image: imageUrls(edition.images),
		organizer: { '@id': organizationId(url.origin) }
	};

/** An artwork as a VisualArtwork by its artists. */
export const visualArtwork = (artwork, url) => ({
	'@type': 'VisualArtwork',
	name: artwork.title,
	url: pageUrl(url),
	creator: (artwork.artists ?? [])
		.filter((artist) => artist?.title)
		.map((artist) => ({ '@type': 'Person', name: artist.title })),
	description: artwork.artistInfo || undefined,
	image: imageUrls(artwork.images)
});

/** A news article as a NewsArticle, by and published by the organization. */
export const newsArticle = (news, url) => {
	const organization = { '@id': organizationId(url.origin) };
	return {
		'@type': 'NewsArticle',
		headline: news.title,
		url: pageUrl(url),
		mainEntityOfPage: pageUrl(url),
		datePublished: news.publishDate || undefined,
		dateModified: news._updatedAt || undefined,
		image: imageUrls([news.featuredImage]),
		author: organization,
		publisher: organization
	};
};
