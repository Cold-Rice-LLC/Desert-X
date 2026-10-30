import Fuse from 'fuse.js';

/** Lowercase, without accents, for matching and sorting: "Héctor" is "hector". */
export const plain = (text) =>
	(text ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();

// Fuse's score is about the share of a word's letters that are off, so a
// word may be a letter off from four letters long and two from seven
const fuseOptions = { threshold: 0.3, ignoreLocation: true };

/**
 * The `items` whose text (`textOf` each) has every word of `query` in it,
 * accents and case aside, so "hector zam" finds "Héctor Zamora". A word
 * nothing has in it is taken as misspelt and matched loosely, so "hectr
 * zamora" finds him too; one something has is matched only as typed, so
 * "alula" doesn't find "Tschabalala". Numbers only match as typed, so
 * 2023 doesn't find 2021. An empty query keeps everything. In their order.
 */
export const fuzzySearch = (items, query, textOf) => {
	const words = plain(query).split(/\s+/).filter(Boolean);
	if (!words.length) return items;

	const texts = items.map((item) => plain(textOf(item)));
	const fuse = new Fuse(texts, fuseOptions);
	const matches = words.map((word) => {
		const exact = texts.flatMap((text, index) => (text.includes(word) ? [index] : []));
		if (exact.length || /^\d+$/.test(word)) return new Set(exact);
		return new Set(fuse.search(word).map((result) => result.refIndex));
	});
	return items.filter((_, index) => matches.every((found) => found.has(index)));
};
