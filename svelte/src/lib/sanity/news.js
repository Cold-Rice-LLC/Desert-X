import { imageFields } from '$lib/sanity/images';

/** GROQ projection for a news item shown as a NewsTile. */
export const newsTileFields = `
	_id,
	"kind": coalesce(kind, "news"),
	title,
	"slug": slug.current,
	publishDate,
	cardText,
	publication,
	pressUrl,
	"location": location->{ title, "palette": palette[].hex },
	featuredImage{ ${imageFields} },
	"logo": logo{ "url": asset->url, "alt": asset->altText }
`;

/** GROQ for the three newest news items, as tiles. */
export const latestNews = `*[_type == "news"] | order(publishDate desc) [0...3]{ ${newsTileFields} }`;

/**
 * GROQ projection for what news tiles need from the News landing: the
 * General palette, and its title for links back to it.
 */
export const newsLandingFields = `
	"generalPalette": *[_id == "newsLanding"][0].generalPalette[].hex,
	"landingTitle": *[_id == "newsLanding"][0].title
`;
