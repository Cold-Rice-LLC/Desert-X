import { error } from '@sveltejs/kit';
import { artworkEntries, searchEntries, sortEntries } from '$lib/art';

const PAGE_SIZE = 18;

/**
 * The artworks to show, from the URL: `?view=list` for the list (the grid
 * is the default), `?sort=desc` for Z–A, `?q=` to search and, in the grid,
 * `?page=` for the page. The count is of artworks, not of entries, so an
 * artwork by two artists counts once.
 */
export function load({ data, url }) {
	const view = url.searchParams.get('view') === 'list' ? 'list' : 'grid';
	const descending = url.searchParams.get('sort') === 'desc';
	const query = url.searchParams.get('q') ?? '';
	const page = Number(url.searchParams.get('page') ?? 1);
	if (!Number.isInteger(page) || page < 1) error(404, 'Not found');

	const { artworks, ...rest } = data;
	const entries = sortEntries(searchEntries(artworkEntries(artworks), query), descending);
	const count = new Set(entries.map(({ artwork }) => artwork._id)).size;

	const pageCount = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
	if (view === 'grid' && page > pageCount) error(404, 'Not found');
	const shown = view === 'grid' ? entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : entries;

	return { ...rest, view, descending, query, page, pageCount, count, entries: shown };
}
