import { error } from '@sveltejs/kit';
import { SORTS, artworkEntries, searchEntries, sortEntries } from '$lib/art';
import { pageParam } from '$lib/url';

const PAGE_SIZE = 18;

/**
 * The artworks to show, from the URL: `?view=list` for the list (the grid
 * is the default), `?sort=` for the order (artwork, location or year;
 * by artist is the default), `?q=` to search and, in the grid, `?page=`
 * for the page.
 */
export function load({ data, url }) {
	const view = url.searchParams.get('view') === 'list' ? 'list' : 'grid';
	const sort = SORTS.find((key) => key === url.searchParams.get('sort')) ?? 'artist';
	const query = url.searchParams.get('q') ?? '';
	const page = pageParam(url);

	const { artworks, ...rest } = data;
	const entries = sortEntries(searchEntries(artworkEntries(artworks), query), sort);

	const pageCount = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
	if (view === 'grid' && page > pageCount) error(404, 'Not found');
	const shown = view === 'grid' ? entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : entries;

	return { ...rest, view, sort, query, page, pageCount, entries: shown };
}
