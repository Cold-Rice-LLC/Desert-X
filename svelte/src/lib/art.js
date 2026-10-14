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

/**
 * Entries by artist, A–Z or Z–A (`descending`), and each artist's artworks
 * oldest first either way.
 */
export const sortEntries = (entries, descending = false) => {
	const direction = descending ? -1 : 1;
	return entries.toSorted(
		(a, b) =>
			direction * collator.compare(plain(a.sortName), plain(b.sortName)) ||
			direction * collator.compare(a.name, b.name) ||
			(a.artwork.year ?? 0) - (b.artwork.year ?? 0) ||
			collator.compare(a.artwork.title, b.artwork.title)
	);
};

/** The letter an entry is grouped under: its sort name's first, or #. */
export const entryLetter = (entry) => {
	const letter = plain(entry.sortName).charAt(0).toUpperCase();
	return /[A-Z]/.test(letter) ? letter : '#';
};
