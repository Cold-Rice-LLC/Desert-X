import { imageFields } from '$lib/sanity/images';

/** GROQ projection for an artwork on the Art landing. */
export const artworkListFields = `
	_id,
	title,
	"slug": slug.current,
	artistCredit,
	"artists": artists[]->{ _id, title, sortName },
	"image": images[0]{ ${imageFields} },
	"location": edition->location->title,
	"year": edition->year
`;

// Lowercase, without accents, for matching and sorting: "Héctor" is "hector"
const plain = (text) =>
	(text ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();

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
 * Whether `text` contains every word of `query`, accents and case aside,
 * so "hector zam" finds "Héctor Zamora". An empty query matches anything.
 */
export const matchesQuery = (text, query) => {
	const plainText = plain(text);
	return plain(query)
		.split(/\s+/)
		.filter(Boolean)
		.every((word) => plainText.includes(word));
};

/** The entries whose artist or title contains `query`, accents aside. */
export const searchEntries = (entries, query) =>
	entries.filter(({ artwork, name }) => matchesQuery(`${name} ${artwork.title}`, query));

const collator = new Intl.Collator('en', { sensitivity: 'base' });

/** The orders artworks can be listed in, by artist first. */
export const SORTS = ['artist', 'artwork', 'location', 'year'];

/** Artists' names together: "A", "A & B", "A, B & C". */
export const joinNames = (names) =>
	names.length > 1 ? `${names.slice(0, -1).join(', ')} & ${names.at(-1)}` : (names[0] ?? '');

// A title without leading quotes or a leading "The", "A" or "An", for
// sorting and grouping: "“The End”" goes under E
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
			const name = entry.artwork.artistCredit || joinNames(artists.map(({ title }) => title));
			return { ...entry, artistId: null, name };
		});
};

const byArtist = (a, b) =>
	collator.compare(plain(a.sortName), plain(b.sortName)) || collator.compare(a.name, b.name);
const byTitle = (a, b) => collator.compare(titleKey(a.artwork.title), titleKey(b.artwork.title));
const oldestFirst = (a, b) => (a.artwork.year ?? 0) - (b.artwork.year ?? 0);
// Newest first, artworks without a year last
const newestFirst = (a, b) => (b.artwork.year ?? 0) - (a.artwork.year ?? 0);
// A–Z, artworks without a location last
const byLocation = (a, b) =>
	!a.artwork.location - !b.artwork.location ||
	collator.compare(a.artwork.location ?? '', b.artwork.location ?? '');

const orders = {
	artist: [byArtist, oldestFirst, byTitle],
	artwork: [byTitle, byArtist],
	location: [byLocation, newestFirst, byArtist, byTitle],
	year: [newestFirst, byArtist, byTitle]
};

/**
 * Entries in one of the SORTS: by artist A–Z, each artist's artworks
 * oldest first; by artwork title A–Z, articles aside; by location A–Z,
 * then newest first; or by year, newest first. Ties go by artist, then
 * title. Only the artist order lists an artwork under each of its artists.
 */
export const sortEntries = (entries, sort = 'artist') =>
	(sort === 'artist' ? entries : onePerArtwork(entries)).toSorted((a, b) =>
		orders[sort].reduce((result, compare) => result || compare(a, b), 0)
	);

/**
 * The heading an entry is listed under in a sort: the first letter of its
 * sort name or title (or #), its location, or its year.
 */
export const entryHeading = (entry, sort = 'artist') => {
	if (sort === 'location') return entry.artwork.location ?? 'Other';
	if (sort === 'year') return entry.artwork.year ? String(entry.artwork.year) : 'Other';
	const text = sort === 'artwork' ? titleKey(entry.artwork.title) : plain(entry.sortName);
	const letter = text.charAt(0).toUpperCase();
	return /[A-Z]/.test(letter) ? letter : '#';
};
