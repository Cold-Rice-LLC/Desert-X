import { seededRandom, shuffle } from '$lib/random';

/**
 * A linear-gradient mixing a palette's colours, varied by `seed` (a
 * document id): the colours' order and where each one sits, top to
 * bottom. The same seed always gives the same gradient. Null without a
 * palette.
 */
export const paletteGradient = (colors, seed) => {
	if (!colors?.length) return null;
	const random = seededRandom(seed);

	const shuffled = shuffle(colors, random);

	// First and last colours near the ends, the rest spread between them
	const start = random() * 15;
	const end = 85 + random() * 15;
	const stops = shuffled.map((color, i) => {
		if (i === 0) return start;
		if (i === shuffled.length - 1) return end;
		const share = (i + random() * 0.6 - 0.3) / (shuffled.length - 1);
		return start + (end - start) * share;
	});

	const colorStops = shuffled.map((color, i) => `${color} ${stops[i].toFixed(1)}%`);
	return `linear-gradient(${colorStops.join(', ')})`;
};
