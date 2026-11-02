<script>
	import { prefersReducedMotion } from 'svelte/motion';
	import Swiper from 'swiper';
	import { A11y, Keyboard } from 'swiper/modules';
	import 'swiper/css';
	import 'swiper/css/a11y';
	import ImageFrame from '$lib/components/ImageFrame.svelte';

	/**
	 * Images at the top of an artwork or edition page, 4:3 across the middle
	 * 20 of 24 columns on phones, a little below what's above. From md up
	 * they're across the middle 16,
	 * centred in a section that follows the window's height below the nav,
	 * from 60rem to 100rem, and grows to fit a taller image.
	 * One image sits on its own; more become a carousel with the current
	 * slide centred and its neighbours peeking in either side, a column
	 * apart. Three or more loop round, so the last peeks in left of the
	 * first; three are doubled, as Swiper's loop would otherwise put both
	 * others on the left. Click a neighbour, under a resize cursor pointing its way, or
	 * use the arrow keys to move; a mouse can't drag it, but touch screens
	 * still swipe. Tabbing reaches Previous and Next buttons at either edge,
	 * which only show while they have focus.
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
	let swiper;

	// Two would show the same image on both sides
	let loop = $derived(images.length > 2);

	// Numbered, as images sharing one alt would read as the same image:
	// "Bloom by Bahraini-Danish — image 2 of 5"
	const imageAlt = (index) =>
		alt && images.length > 1 ? `${alt} — image ${index + 1} of ${images.length}` : alt;

	let slides = $derived(
		(images.length === 3 ? [0, 1] : [0]).flatMap((copy) =>
			images.map((image, index) => ({ image, alt: imageAlt(index), key: `${image._key}-${copy}` }))
		)
	);

	// How far an image is from the current one, minus to the left, going
	// round the shorter way when the carousel loops
	const offset = (index) => {
		const ahead = index - active;
		if (!loop) return ahead;
		const wrapped = (ahead + slides.length) % slides.length;
		return wrapped > slides.length / 2 ? wrapped - slides.length : wrapped;
	};

	const sizes = '(width >= 768px) calc((100vw - 40px) * 2 / 3), calc((100vw - 40px) * 5 / 6)';
	// The section's space above and height, whichever way the images show
	const section = 'mt-sm md:mt-0 md:min-h-[clamp(60rem,calc(100svh-var(--spacing-nav)),100rem)]';

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

{#if images.length > 1}
	<div class={['swiper w-full items-center', section]} {@attach carousel}>
		<!-- For the keyboard, which can't click a neighbour: shown only while
		     focused, and never in a mouse's way -->
		{#snippet step(label, side, onclick)}
			<button
				type="button"
				aria-label="{label} image"
				class={[
					'pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 bg-white p-xs text-base uppercase opacity-0 focus-visible:opacity-100',
					side
				]}
				{onclick}
			>
				{label}
			</button>
		{/snippet}
		{@render step('Previous', 'left-edge', () => swiper.slidePrev())}
		{@render step('Next', 'right-edge', () => swiper.slideNext())}
		<div class="swiper-wrapper">
			{#each slides as { image, alt, key }, index (key)}
				<!-- The arrow keys move it too (Swiper's Keyboard module) -->
				<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
				<div
					class={[
						'swiper-slide slide',
						offset(index) < 0 && 'cursor-w-resize',
						offset(index) > 0 && 'cursor-e-resize'
					]}
					onclick={() => swiper.slideToLoop(index)}
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
	<div class={['grid grid-cols-24 items-center px-edge', section]}>
		<ImageFrame
			image={images[0]}
			aspect={4 / 3}
			{sizes}
			{alt}
			loading="eager"
			fetchpriority="high"
			class="col-span-20 col-start-3 md:col-span-16 md:col-start-5"
		/>
	</div>
{/if}

<style>
	/* A flex box to centre the slides; Swiper's own CSS makes it a block,
	   which would win over a utility. Its auto side margins would also shrink
	   it to its content in the body's flex column, so it starts at no width
	   and grows as its images load: w-full keeps it full width. */
	.swiper {
		display: flex;
	}

	/* Percentages are of the carousel's width, wherever these are used. Each
	   slide is 20 columns on phones and 16 from md up, plus half a column
	   either side, so slides sit a column apart. */
	.swiper-wrapper {
		--column: calc((100% - 2 * var(--spacing-edge)) / 24);
		--slide: calc(var(--column) * 21);

		@media (width >= 48rem) {
			--slide: calc(var(--column) * 17);
		}
	}

	.slide {
		width: var(--slide);
		padding-inline: calc(var(--column) / 2);
	}

	/* Centre the first slide before Swiper takes over, so it doesn't jump */
	.swiper:not(.swiper-initialized) > .swiper-wrapper {
		transform: translateX(calc((100% - var(--slide)) / 2));
	}
</style>
