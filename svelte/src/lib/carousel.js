import { prefersReducedMotion } from 'svelte/motion';
import { A11y, Keyboard } from 'swiper/modules';
import { croppedSize } from '$lib/sanity/images';

/**
 * How far slide `index` is from the `active` one of `count` looping round,
 * minus to the left, going round the shorter way.
 */
export const loopOffset = (index, active, count) => {
	const wrapped = (index - active + count) % count;
	return wrapped > count / 2 ? wrapped - count : wrapped;
};

/**
 * `alt` for image `index` of `count`, numbered when there are several, as
 * images sharing one alt would read as the same image: "Bloom by
 * Bahraini-Danish — image 2 of 5".
 */
export const numberedAlt = (alt, index, count) =>
	alt && count > 1 ? `${alt} — image ${index + 1} of ${count}` : alt;

/**
 * `sizes` for an image covering the window: as wide as it is or as the
 * window's height makes it, whichever is wider.
 */
export const coverSizes = (image) => {
	const size = croppedSize(image);
	return size ? `max(100vw, calc(100svh * ${(size.width / size.height).toFixed(3)}))` : '100vw';
};

/**
 * Swiper options for a carousel filling the screen, as the homepage's and
 * the lightbox's are: looping, moved by the arrow keys, and by a drag or
 * swipe over the halves too (see CarouselHalves), which isn't a click.
 * Swiper won't drag from a focused button, as a form control, and pressing
 * a half focuses it, so buttons are left off its list. It slides in 300ms,
 * or cuts with reduced motion.
 */
export const fullScreenOptions = () => ({
	modules: [A11y, Keyboard],
	loop: true,
	touchEventsTarget: 'container',
	focusableElements: 'input, select, option, textarea, video, label',
	keyboard: { enabled: true },
	speed: prefersReducedMotion.current ? 0 : 300
});
