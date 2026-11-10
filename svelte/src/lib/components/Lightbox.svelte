<script>
	import { tick } from 'svelte';
	import Swiper from 'swiper';
	import 'swiper/css';
	import 'swiper/css/a11y';
	import { coverSizes, fullScreenOptions, loopOffset, numberedAlt } from '$lib/carousel';
	import CarouselHalves from '$lib/components/CarouselHalves.svelte';
	import Close from '$lib/components/icons/Close.svelte';
	import Image from '$lib/components/Image.svelte';
	import { hotspotPosition } from '$lib/sanity/images';

	/**
	 * A gallery's images full screen, opened at image `start`, as the
	 * homepage's carousel shows its slides: from md up each covers the
	 * window around its hotspot; phones, upright, show it whole on white.
	 * It fades in as it opens and out as it closes, or cuts with reduced
	 * motion.
	 * Clicking the left half goes back an image and the right half on, under
	 * a resize cursor pointing that way; the arrow keys, a swipe and a mouse
	 * drag move it too, and the last loops round to the first. Tabbing
	 * reaches the halves as Previous and Next buttons, labelled while they
	 * have focus, and a close button top right.
	 *
	 * A modal <dialog>, so focus stays inside and the page behind is inert;
	 * Escape closes it too. Mounted to open, it calls `onchange` with each
	 * image it moves to, for its gallery to follow along behind it, and
	 * `onclose` once it has faded out, for its gallery to unmount it. The
	 * current image and its neighbours load straight away, the rest as they
	 * come near. `alt` is as Gallery's.
	 */
	let { images, start = 0, alt, onchange, onclose } = $props();

	// Mounted afresh each time it opens, so only the first start counts
	// svelte-ignore state_referenced_locally
	let active = $state(start);
	let closing = $state(false);
	let dialog;
	let swiper;

	let several = $derived(images.length > 1);

	const near = (index) => Math.abs(loopOffset(index, active, images.length)) <= 1;

	// Closed here, not by the dialog's close event, which Chrome only fires
	// once the page next renders; closing hands focus back to what opened it
	const closed = () => {
		dialog.close();
		onclose();
	};

	// Fades out first, then closes once the fade has finished, or at once
	// where there's none to wait for, as with reduced motion
	const close = async () => {
		if (closing) return;
		closing = true;
		await tick();
		await Promise.allSettled(dialog.getAnimations().map((animation) => animation.finished));
		closed();
	};

	const open = (node) => {
		node.showModal();
		if (several) {
			swiper = new Swiper(node.querySelector('.swiper'), {
				...fullScreenOptions(),
				initialSlide: start,
				on: {
					realIndexChange: ({ realIndex }) => {
						active = realIndex;
						onchange(realIndex);
					}
				}
			});
		}
		return () => swiper?.destroy();
	};
</script>

<dialog
	bind:this={dialog}
	{@attach open}
	oncancel={(event) => {
		event.preventDefault();
		close();
	}}
	aria-label="Images"
	class={[
		'm-0 size-full max-h-none max-w-none bg-white transition-opacity duration-300 motion-reduce:transition-none starting:opacity-0',
		closing && 'pointer-events-none opacity-0'
	]}
>
	<!-- Where the menu's close button would be, mirrored to the right. First,
	     so opening focuses it rather than Previous, whose label would show. -->
	<button
		type="button"
		aria-label="Close"
		class="absolute top-0 right-edge z-20 flex h-nav items-center link-fade md:text-white"
		onclick={close}
	>
		<Close class="h-hamburger w-auto" />
	</button>

	<div class="swiper size-full">
		{#if several}
			<CarouselHalves
				noun="image"
				onprevious={() => swiper.slidePrev()}
				onnext={() => swiper.slideNext()}
			/>
		{/if}
		<div class="swiper-wrapper">
			{#each images as image, index (image._key)}
				<div class="swiper-slide">
					<Image
						{image}
						sizes={coverSizes(image)}
						alt={numberedAlt(alt, index, images.length)}
						loading={near(index) ? 'eager' : 'lazy'}
						class="size-full object-contain md:object-cover md:object-(--hotspot)"
						style="--hotspot: {hotspotPosition(image)}"
					/>
				</div>
			{/each}
		</div>
	</div>
</dialog>
