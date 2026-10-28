/**
 * A random number generator seeded from a string, so the same seed gives
 * the same numbers on the server and in the browser (mulberry32 over a
 * simple string hash).
 */
export const seededRandom = (seed) => {
	let state = [...seed].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 2654435761), 1);
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

/** A shuffled copy of `values` (Fisher–Yates), from `random` if given. */
export const shuffle = (values, random = Math.random) => {
	const shuffled = [...values];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
};
