/**
 * A random number generator seeded from a string, so the same seed gives
 * the same numbers on the server and in the browser (mulberry32 over a
 * simple string hash).
 */
const seededRandom = (seed) => {
	let state = [...seed].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 2654435761), 1);
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

/**
 * A linear-gradient mixing a palette's colours, varied by `seed` (a
 * document id): the colours' order, where each one sits, and a slight tilt
 * off vertical. The same seed always gives the same gradient. Null without
 * a palette.
 */
export const paletteGradient = (colors, seed) => {
	if (!colors?.length) return null;
	const random = seededRandom(seed);

	// Fisher–Yates shuffle
	const shuffled = [...colors];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	// First and last colours near the ends, the rest spread between them
	const start = random() * 15;
	const end = 85 + random() * 15;
	const stops = shuffled.map((color, i) => {
		if (i === 0) return start;
		if (i === shuffled.length - 1) return end;
		const share = (i + random() * 0.6 - 0.3) / (shuffled.length - 1);
		return start + (end - start) * share;
	});

	const angle = 180 + (random() * 40 - 20);
	const colorStops = shuffled.map((color, i) => `${color} ${stops[i].toFixed(1)}%`);
	return `linear-gradient(${angle.toFixed(1)}deg, ${colorStops.join(', ')})`;
};
