import { error } from '@sveltejs/kit';
import { client } from '$lib/sanity/client';
import { loadLanding } from '$lib/sanity/landing';
import { newsTileFields } from '$lib/sanity/news';

const PAGE_SIZE = 12;

// Press is always General. News with no kind predates the field: it's news.
const filterConditions = {
	general: '(kind == "press" || !defined(location))',
	location: 'kind != "press" && location->slug.current == $filter'
};

/**
 * One page of news, newest first, optionally filtered to General or one
 * location by `?filter=`; `?page=` picks the page.
 */
export async function load({ url }) {
	const filter = url.searchParams.get('filter');
	const page = Number(url.searchParams.get('page') ?? 1);
	if (!Number.isInteger(page) || page < 1) error(404, 'Not found');

	const condition = filter
		? filterConditions[filter === 'general' ? 'general' : 'location']
		: 'true';
	const start = (page - 1) * PAGE_SIZE;

	const [landing, results] = await Promise.all([
		loadLanding('newsLanding', 'News', '"generalPalette": generalPalette[].hex'),
		client.fetch(
			`{
				"total": count(*[_type == "news" && ${condition}]),
				"items": *[_type == "news" && ${condition}] | order(publishDate desc) [$start...$end]{
					${newsTileFields}
				},
				"locations": *[_type == "location"] | order(title asc){ title, "slug": slug.current }
			}`,
			{ filter, start, end: start + PAGE_SIZE }
		)
	]);

	const pageCount = Math.max(1, Math.ceil(results.total / PAGE_SIZE));
	if (page > pageCount) error(404, 'Not found');

	return { ...landing, ...results, filter, page, pageCount };
}
