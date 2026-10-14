<script>
	import Swiper from 'swiper';
	import { A11y, Keyboard } from 'swiper/modules';
	import 'swiper/css';
	import 'swiper/css/a11y';
	import ImageFrame from '$lib/components/ImageFrame.svelte';

	/**
	 * An artwork's images at the top of its page, 4:3 across the middle 16
	 * of 24 columns, centred in a section that follows the window's height
	 * below the nav, from 60rem to 100rem, and grows to fit a taller image.
	 * One image sits on its own; more become a carousel with the current
	 * slide centred and its neighbours peeking in either side, a column
	 * apart. Click a neighbour, under a resize cursor pointing its way, or
	 * use the arrow keys to move; a mouse can't drag it, but touch screens
	 * still swipe.
	 *
	 * The browser's lazy loading only looks again on scroll, not when a
	 * slide moves into view, so the current slide and its neighbours are
	 * switched to eager to load them; the rest wait their turn.
	 */
	let { images } = $props();

	let active = $state(0);
	let swiper;

	const sizes = 'calc((100vw - 4rem) * 2 / 3)';
	// The section's height, whichever way the images show
	const height = 'min-h-[clamp(60rem,calc(100svh-var(--spacing-nav)),100rem)]';

	const carousel = (node) => {
		swiper = new Swiper(node, {
			modules: [A11y, Keyboard],
			slidesPerView: 'auto',
			centeredSlides: true,
			simulateTouch: false,
			keyboard: { enabled: true },
			on: { slideChange: ({ activeIndex }) => (active = activeIndex) }
		});
		return () => swiper.destroy();
	};
</script>

{#if images.length > 1}
	<div class={['swiper w-full items-center', height]} {@attach carousel}>
		<div class="swiper-wrapper">
			{#each images as image, index (image._key)}
				<!-- The arrow keys move it too (Swiper's Keyboard module) -->
				<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
				<div
					class={[
						'swiper-slide slide',
						index < active && 'cursor-w-resize',
						index > active && 'cursor-e-resize'
					]}
					onclick={() => swiper.slideTo(index)}
				>
					<ImageFrame
						{image}
						aspect={4 / 3}
						{sizes}
						loading={Math.abs(index - active) <= 1 ? 'eager' : 'lazy'}
					/>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class={['grid grid-cols-24 items-center px-edge', height]}>
		<ImageFrame
			image={images[0]}
			aspect={4 / 3}
			{sizes}
			loading="eager"
			class="col-span-16 col-start-5"
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
	   slide is 16 columns plus half a column either side, so slides sit a
	   column apart. */
	.swiper-wrapper {
		--column: calc((100% - 2 * var(--spacing-edge)) / 24);
		--slide: calc(var(--column) * 17);
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
