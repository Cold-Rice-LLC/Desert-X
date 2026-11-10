<script>
	import { prefersReducedMotion } from 'svelte/motion';
	import Swiper from 'swiper';
	import { A11y, Keyboard } from 'swiper/modules';
	import 'swiper/css';
	import 'swiper/css/a11y';
	import { loopOffset, numberedAlt } from '$lib/carousel';
	import ImageFrame from '$lib/components/ImageFrame.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';

	/**
	 * Images at the top of an artwork or edition page, 4:3 across the middle
	 * 20 of 24 columns on phones, a little below what's above. From md up
	 * they're across the middle 18, or narrower where that would be too
	 * tall, centred in a section the window's height below the nav, at
	 * least 60rem, with base space above and below at most.
	 * One image sits on its own; more become a carousel with the current
	 * slide centred and its neighbours peeking in either side, a column
	 * apart. Three or more loop round, so the last peeks in left of the
	 * first; three are doubled, as Swiper's loop would otherwise put both
	 * others on the left. Click a neighbour, under a resize cursor pointing its way, or
	 * use the arrow keys to move; a mouse can't drag it, but touch screens
	 * still swipe. Click the current image to see them all full screen (see
	 * Lightbox), and come back to the one left on. Tabbing reaches Previous,
	 * Full Screen and Next buttons, which only show while they have focus;
	 * a single image is a button itself.
	 *
	 * The browser's lazy loading only looks again on scroll, not when a
	 * slide moves into view, so the current slide and its neighbours are
	 * switched to eager to load them; the rest wait their turn. The current
	 * one is fetched ahead of the page's other images, as its largest, and
	 * the rest behind them, so the neighbours don't hold it up. `alt` stands
	 * in for any image's missing alt text.
	 */
	let { images, alt } = $props();

	let active = $state(0);
	// The image the lightbox opens at, while it's open
	let lightbox = $state(null);
	let swiper;

	// Two would show the same image on both sides
	let loop = $derived(images.length > 2);

	let slides = $derived(
		(images.length === 3 ? [0, 1] : [0]).flatMap((copy) =>
			images.map((image, index) => ({
				image,
				alt: numberedAlt(alt, index, images.length),
				key: `${image._key}-${copy}`
			}))
		)
	);

	// How far an image is from the current one, minus to the left
	const offset = (index) => (loop ? loopOffset(index, active, slides.length) : index - active);

	// The arrow keys are the lightbox's while it's open
	const openLightbox = () => {
		lightbox = active % images.length;
		swiper?.keyboard.disable();
	};

	const closeLightbox = () => {
		lightbox = null;
		swiper?.keyboard.enable();
	};

	const sizes = '(width >= 768px) calc((100vw - 50px) * 3 / 4), calc((100vw - 50px) * 5 / 6)';
	// The section's space above and height, whichever way the images show
	const section = 'gallery mt-sm md:mt-0 md:h-[max(60rem,calc(100svh-var(--spacing-nav)))]';

	const carousel = (node) => {
		swiper = new Swiper(node, {
			modules: [A11y, Keyboard],
			slidesPerView: 'auto',
			centeredSlides: true,
			loop,
			simulateTouch: false,
			keyboard: { enabled: true },
			// Swiper's own 300ms slide, or a cut with reduced motion
			speed: prefersReducedMotion.current ? 0 : 300,
			on: { realIndexChange: ({ realIndex }) => (active = realIndex) }
		});
		return () => swiper.destroy();
	};
</script>

<!-- For the keyboard, which can't click a slide: shown only while focused,
     and never in a mouse's way -->
{#snippet step(label, ariaLabel, place, onclick)}
	<button
		type="button"
		aria-label={ariaLabel}
		class={[
			'pointer-events-none absolute top-1/2 z-10 bg-white p-xs text-base uppercase opacity-0 focus-visible:opacity-100',
			place
		]}
		{onclick}
	>
		{label}
	</button>
{/snippet}

{#if images.length > 1}
	<!-- Swiper's own auto side margins would shrink it to its content in the
	     body's flex column, so it would start at no width and grow as its
	     images load: w-full keeps it full width -->
	<div class={['swiper w-full', section]} {@attach carousel}>
		{@render step('Previous', 'Previous image', 'left-edge -translate-y-1/2', () =>
			swiper.slidePrev()
		)}
		{@render step('Full Screen', undefined, 'left-1/2 -translate-1/2', openLightbox)}
		{@render step('Next', 'Next image', 'right-edge -translate-y-1/2', () => swiper.slideNext())}
		<div class="swiper-wrapper items-center">
			{#each slides as { image, alt, key }, index (key)}
				<!-- The arrow keys move it too (Swiper's Keyboard module) -->
				<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
				<div
					class={[
						'swiper-slide slide',
						offset(index) < 0 && 'cursor-w-resize',
						offset(index) === 0 && 'cursor-zoom-in',
						offset(index) > 0 && 'cursor-e-resize'
					]}
					onclick={() => (offset(index) === 0 ? openLightbox() : swiper.slideToLoop(index))}
				>
					<ImageFrame
						{image}
						aspect={4 / 3}
						{sizes}
						{alt}
						loading={Math.abs(offset(index)) <= 1 ? 'eager' : 'lazy'}
						fetchpriority={offset(index) === 0 ? 'high' : 'low'}
					/>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class={['flex items-center justify-center', section]}>
		<button
			type="button"
			aria-label="Full screen"
			class="w-(--image) cursor-zoom-in"
			onclick={openLightbox}
		>
			<ImageFrame
				image={images[0]}
				aspect={4 / 3}
				{sizes}
				{alt}
				loading="eager"
				fetchpriority="high"
			/>
		</button>
	</div>
{/if}

{#if lightbox !== null}
	<!-- Following the lightbox behind it, so it's on the same image as it
	     fades out -->
	<Lightbox
		{images}
		start={lightbox}
		{alt}
		onchange={(index) => swiper?.slideToLoop(index, 0)}
		onclose={closeLightbox}
	/>
{/if}

<style>
	/* Percentages are of the gallery's width, wherever these are used. An
	   image is 20 columns on phones, and from md up 18, or as wide as fits
	   the section's height at 4:3, less base space above and below. */
	.gallery {
		--column: calc((100% - 2 * var(--spacing-edge)) / 24);
		--image: calc(var(--column) * 20);

		@media (width >= 48rem) {
			--image: min(
				var(--column) * 18,
				(max(60rem, 100svh - var(--spacing-nav)) - 2 * var(--spacing-base)) * 4 / 3
			);
		}
	}

	/* Each slide is an image plus half a column either side, so slides sit
	   a column apart. Its own height, not Swiper's full one, so the wrapper
	   can centre it. */
	.slide {
		height: auto;
		width: calc(var(--image) + var(--column));
		padding-inline: calc(var(--column) / 2);
	}

	/* Centre the first slide before Swiper takes over, so it doesn't jump */
	.swiper:not(.swiper-initialized) > .swiper-wrapper {
		transform: translateX(calc((100% - var(--image) - var(--column)) / 2));
	}
</style>
