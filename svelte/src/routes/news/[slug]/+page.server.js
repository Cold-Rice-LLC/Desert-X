import { error } from '@sveltejs/kit';
import { client } from '$lib/sanity/client';
import { formatLongDate } from '$lib/dates';
import { modulesFields } from '$lib/sanity/modules';
import { imageFields } from '$lib/sanity/images';
import { newsLandingFields, newsTileFields } from '$lib/sanity/news';
import { moduleDescription, moduleTextField, pageSeo, seoFields } from '$lib/sanity/seo';
import { shuffle } from '$lib/random';
import { newsArticle } from '$lib/structuredData';

const RELATED_COUNT = 3;

// Related news shares the article's location; General goes with General
// (no location, or press, which is always General)
const RELATED = `select(
	defined(^.location) => kind != "press" && location._ref == ^.location._ref,
	kind == "press" || !defined(location)
)`;

/**
 * A news article by slug, with three other news at its end: related ones
 * first, the rest at random, picked afresh on every load. Press has no page
 * of its own: it links out. Shared, an article shows the start of its
 * text (or else its card text) and featured image, and to search engines
 * it's a NewsArticle.
 */
export async function load({ params, url }) {
	const news = await client.fetch(
		`*[_type == "news" && coalesce(kind, "news") == "news" && slug.current == $slug][0]{
				title,
				publishDate,
				_updatedAt,
				modules[]{ ${modulesFields} },
				cardText,
				featuredImage{ ${imageFields} },
				${moduleTextField},
				${seoFields},
				"relatedIds": *[_type == "news" && _id != ^._id && ${RELATED}]._id,
			"otherIds": *[_type == "news" && _id != ^._id && !(${RELATED})]._id
		}`,
		{ slug: params.slug }
	);

	if (!news) error(404, 'Not found');

	const { relatedIds, otherIds, cardText, moduleText, featuredImage, seo, ...article } = news;
	const ids = [...shuffle(relatedIds), ...shuffle(otherIds)].slice(0, RELATED_COUNT);
	const related = await client.fetch(
		`{
			"items": *[_id in $ids]{ ${newsTileFields} },
			${newsLandingFields}
		}`,
		{ ids }
	);

	return {
		news: {
			...article,
			modules: [
				...(article.modules ?? []),
				{
					_key: 'related-news',
					_type: 'newsModule',
					...related,
					items: shuffle(related.items)
				}
			]
		},
		navTitle: related.landingTitle || 'News',
		navHref: '/news',
		navDetail: formatLongDate(news.publishDate),
		navDetailPhone: formatLongDate(news.publishDate, { shortYear: true }),
		seo: pageSeo(seo, {
			title: article.title,
			description: moduleDescription({ moduleText, title: article.title }) || cardText,
			image: featuredImage
		}),
		structuredData: newsArticle({ ...article, featuredImage }, url)
	};
}
