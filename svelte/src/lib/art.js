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
 * One entry per artist of each artwork, so an artwork by two artists is
 * listed under both. An artwork's Artist Credit replaces its one artist's
 * name; with several artists each shows their own. Artists sort by their
 * Sort Name, or else the last word of their name.
 */
export const artworkEntries = (artworks) =>
	artworks.flatMap((artwork) => {
		const artists = (artwork.artists ?? []).filter(Boolean);
		if (!artists.length) {
			const name = artwork.artistCredit ?? '';
			return [{ artwork, artistId: null, name, sortName: name || artwork.title }];
		}
		return artists.map((artist) => ({
			artwork,
			artistId: artist._id,
			name: (artists.length === 1 && artwork.artistCredit) || artist.title,
			sortName: artist.sortName || artist.title.split(/\s+/).at(-1)
		}));
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

/**
 * One entry per artwork, for the orders that aren't by artist, so an
 * artwork by several artists shows once under its Artist Credit, or else
 * all their names.
 */
const onePerArtwork = (entries) => {
	const seen = new Set();
	return entries
		.filter(({ artwork }) => !seen.has(artwork._id) && seen.add(artwork._id))
		.map((entry) => {
			const artists = (entry.artwork.artists ?? []).filter(Boolean);
			if (artists.length < 2) return entry;
			return { ...entry, artistId: null, name: artworkCredit(entry.artwork) };
		});
};

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
 * Ties go by artist, then title. Only the artist order lists an artwork
 * under each of its artists.
 */
export const sortEntries = (entries, sort = 'artist') =>
	(sort === 'artist' ? entries : onePerArtwork(entries)).toSorted((a, b) =>
		orders[sort].reduce((result, compare) => result || compare(a, b), 0)
	);

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
