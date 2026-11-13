import { imageFields } from '$lib/sanity/images';
import { fuzzySearch, plain } from '$lib/search';

/**
 * GROQ projection for an artwork listed by artist, as search lists them:
 * what artworkEntries and sortEntries read.
 */
export const artworkEntryFields = `
	_id,
	title,
	"slug": slug.current,
	artistCredit,
	"artists": artists[]->{ _id, title, sortName },
	"year": edition->year
`;

/** GROQ projection for an artwork on the Art landing and edition pages. */
export const artworkListFields = `
	${artworkEntryFields},
	"image": images[0]{ ${imageFields} },
	"location": edition->location->title,
	"locationSlug": edition->location->slug.current
`;

/**
 * One entry per artwork, so an artwork by several artists is listed once,
 * under its Artist Credit or else all their names ("A & B"), and filed by
 * its first artist. Artists sort by their Sort Name, or else the last word
 * of their name.
 */
export const artworkEntries = (artworks) =>
	artworks.map((artwork) => {
		const [first] = (artwork.artists ?? []).filter(Boolean);
		const name = artworkCredit(artwork);
		return {
			artwork,
			artistId: first?._id ?? null,
			name,
			sortName: first ? first.sortName || first.title.split(/\s+/).at(-1) : name || artwork.title
		};
	});

/**
 * The entries matching `query` (see fuzzySearch) by artist or title, or
 * with `details` by the artwork's location and year too.
 */
export const searchEntries = (entries, query, { details = false } = {}) =>
	fuzzySearch(entries, query, ({ artwork, name }) =>
		[name, artwork.title, ...(details ? [artwork.location, artwork.year] : [])].join(' ')
	);

/** Compares text A–Z, case and accents aside. */
export const collator = new Intl.Collator('en', { sensitivity: 'base' });

// Artists' names together: "A", "A & B", "A, B & C"
const joinNames = (names) =>
	names.length > 1 ? `${names.slice(0, -1).join(', ')} & ${names.at(-1)}` : (names[0] ?? '');

/** Whether an artwork has coordinates, for an exhibition map's X. */
export const isLocated = (artwork) =>
	Number.isFinite(artwork.coordinates?.lat) && Number.isFinite(artwork.coordinates?.lng);

/**
 * Whether an edition's artworks can go on its exhibition map: only when
 * those with coordinates stand in at least two different places, so a map
 * of one X, or of every X stacked on one placeholder point, is left out.
 */
export const isMapped = (artworks) =>
	new Set(
		(artworks ?? [])
			.filter(isLocated)
			.map(({ coordinates }) => `${coordinates.lat},${coordinates.lng}`)
	).size > 1;

/**
 * An artwork's artists as one credit: its Artist Credit, or else all
 * their names (`artists` with a title each), "A & B".
 */
export const artworkCredit = ({ artistCredit, artists }) =>
	artistCredit || joinNames((artists ?? []).map((artist) => artist?.title).filter(Boolean));

// A title without leading quotes or a leading "The", "A" or "An", for
// sorting: "“The End”" sorts under E
const titleKey = (title) =>
	plain(title)
		.replace(/^[^a-z0-9]+/, '')
		.replace(/^(the|an?)\s+/, '');

const byArtist = (a, b) =>
	collator.compare(plain(a.sortName), plain(b.sortName)) || collator.compare(a.name, b.name);
const byTitle = (a, b) => collator.compare(titleKey(a.artwork.title), titleKey(b.artwork.title));
const oldestFirst = (a, b) => (a.artwork.year ?? 0) - (b.artwork.year ?? 0);
// Newest first, artworks without a year last
const newestFirst = (a, b) => (b.artwork.year ?? 0) - (a.artwork.year ?? 0);

const orders = {
	artist: [byArtist, oldestFirst, byTitle],
	artwork: [byTitle, byArtist],
	year: [newestFirst, byArtist, byTitle]
};

/**
 * Entries in a `sort`: by artist A–Z, each artist's artworks oldest
 * first; by artwork title A–Z, articles aside; or by year, newest first.
 * Ties go by artist, then title.
 */
export const sortEntries = (entries, sort = 'artist') =>
	entries.toSorted((a, b) => orders[sort].reduce((result, compare) => result || compare(a, b), 0));

/**
 * Sorted entries with runs by the same artist (or credit) gathered into
 * one group each, in order, with its name and artworks as `items`.
 */
export const groupByArtist = (entries) =>
	entries.reduce((groups, { artwork, artistId, name }) => {
		const last = groups.at(-1);
		if (last?.artistId === artistId && last.name === name) last.items.push(artwork);
		else groups.push({ artistId, name, items: [artwork] });
		return groups;
	}, []);

/**
 * The Art landing's entries for its `location` and `year` filters (a
 * location's slug, a year) and its search `query`, newest first, as it
 * shows them and as an artwork reached from it steps through them.
 */
export const artLandingEntries = (artworks, { location, year, query }) =>
	sortEntries(
		searchEntries(
			artworkEntries(
				artworks.filter(
					(artwork) =>
						(!location || artwork.locationSlug === location) &&
						(!year || String(artwork.year) === year)
				)
			),
			query,
			{ details: true }
		),
		'year'
	);

/**
 * The query an artwork's link carries from the Art landing, so its
 * Previous and Next step through what the landing showed: `from=art` and
 * any filter and search. Links from elsewhere carry none, and step through
 * the artwork's own edition.
 */
export const artLandingContext = ({ location, year, query }) =>
	`?${new URLSearchParams({ from: 'art', ...(location && { location }), ...(year && { year }), ...(query && { q: query }) })}`;

/**
 * The artworks before and after the one with `id` in sorted `entries`,
 * each artwork once, round to the last before the first and the first
 * after the last. None unless it's there among others.
 */
export const neighbours = (entries, id) => {
	const artworks = [...new Map(entries.map(({ artwork }) => [artwork._id, artwork])).values()];
	const index = artworks.findIndex((artwork) => artwork._id === id);
	if (index < 0 || artworks.length < 2) return undefined;
	return { previous: artworks.at(index - 1), next: artworks[(index + 1) % artworks.length] };
};

/**
 * An edition's gallery: its images, or else each artwork's first, by
 * artist, without the caption written for the artwork's page.
 */
export const editionImages = (edition) => {
	if (edition.images?.length) return edition.images;
	return sortEntries(artworkEntries(edition.artworks ?? []))
		.map(({ artwork }) => artwork)
		.filter((artwork) => artwork.image?.asset)
		.map((artwork) => ({ ...artwork.image, caption: undefined, _key: artwork._id }));
};
