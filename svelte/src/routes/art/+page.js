import { error } from '@sveltejs/kit';
import { artLandingContext, artLandingEntries, collator } from '$lib/art';
import { pageParam } from '$lib/url';

const PAGE_SIZE = 18;

/**
 * The artworks to show, newest first and then by artist, from the URL:
 * `?view=list` for the list (the grid is the default), `?location=` (a
 * location's slug) and `?year=` to filter, `?q=` to search artists,
 * titles, locations and years and, in the grid, `?page=` for how many
 * batches of 18 to show (see LoadMore).
 * The filters offer each location A–Z and each year newest first, of the
 * artworks there are. `total` is how many artworks match, all pages' worth.
 * `context` is the query the artworks' links carry (see artLandingContext).
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

	const entries = artLandingEntries(artworks, { location, year, query });

	const pageCount = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
	if (view === 'grid' && page > pageCount) error(404, 'Not found');
	// Artworks, not tiles: one by two artists has a tile under each
	const total = new Set(entries.map(({ artwork }) => artwork._id)).size;
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
		total,
		context: artLandingContext({ location, year, query }),
		entries: shown
	};
}
