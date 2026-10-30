import { error } from '@sveltejs/kit';
import { artworkEntries, collator, searchEntries, sortEntries } from '$lib/art';
import { pageParam } from '$lib/url';

const PAGE_SIZE = 18;

/**
 * The artworks to show, newest first and then by artist, from the URL:
 * `?view=list` for the list (the grid is the default), `?location=` (a
 * location's slug) and `?year=` to filter, `?q=` to search artists,
 * titles, locations and years and, in the grid, `?page=` for how many
 * batches of 18 to show (see LoadMore).
 * The filters offer each location A–Z and each year newest first, of the
 * artworks there are.
 */
export function load({ data, url }) {
	const view = url.searchParams.get('view') === 'list' ? 'list' : 'grid';
	const location = url.searchParams.get('location');
	const year = url.searchParams.get('year');
	const query = url.searchParams.get('q') ?? '';
	const page = pageParam(url);

	const { artworks, ...rest } = data;

	const locations = [
		...new Map(
			artworks
				.filter((artwork) => artwork.locationSlug)
				.map((artwork) => [artwork.locationSlug, artwork.location])
		)
	]
		.map(([slug, title]) => ({ slug, title }))
		.toSorted((a, b) => collator.compare(a.title, b.title));
	const years = [...new Set(artworks.map((artwork) => artwork.year).filter(Boolean))].toSorted(
		(a, b) => b - a
	);

	const filtered = artworks.filter(
		(artwork) =>
			(!location || artwork.locationSlug === location) && (!year || String(artwork.year) === year)
	);
	const entries = sortEntries(
		searchEntries(artworkEntries(filtered), query, { details: true }),
		'year'
	);

	const pageCount = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
	if (view === 'grid' && page > pageCount) error(404, 'Not found');
	const shown = view === 'grid' ? entries.slice(0, page * PAGE_SIZE) : entries;

	return {
		...rest,
		view,
		location,
		year,
		locations,
		years,
		query,
		page,
		pageCount,
		entries: shown
	};
}
