import { error } from '@sveltejs/kit';
import { client } from '$lib/sanity/client';
import { formatLongDate } from '$lib/dates';
import { modulesFields } from '$lib/sanity/modules';
import { newsLandingFields, newsTileFields } from '$lib/sanity/news';

const RELATED_COUNT = 3;

// Related news shares the article's location; General goes with General
// (no location, or press, which is always General)
const RELATED = `select(
	defined(^.location) => kind != "press" && location._ref == ^.location._ref,
	kind == "press" || !defined(location)
)`;

const shuffle = (values) => {
	const shuffled = [...values];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
};

/**
 * A news article by slug, with three other news at its end: related ones
 * first, the rest at random, picked afresh on every load. Press has no page
 * of its own: it links out.
 */
export async function load({ params }) {
	const { news, landingTitle } = await client.fetch(
		`{
			"news": *[_type == "news" && coalesce(kind, "news") == "news" && slug.current == $slug][0]{
				title,
				publishDate,
				modules[]{ ${modulesFields} },
				"relatedIds": *[_type == "news" && _id != ^._id && ${RELATED}]._id,
				"otherIds": *[_type == "news" && _id != ^._id && !(${RELATED})]._id
			},
			"landingTitle": *[_id == "newsLanding"][0].title
		}`,
		{ slug: params.slug }
	);

	if (!news) error(404, 'Not found');

	const { relatedIds, otherIds, ...article } = news;
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
					heading: 'Related News',
					...related,
					items: shuffle(related.items)
				}
			]
		},
		navTitle: landingTitle || 'News',
		navHref: '/news',
		navDetail: formatLongDate(news.publishDate)
	};
}
