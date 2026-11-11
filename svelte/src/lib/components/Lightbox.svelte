<script>
	import { tick, untrack } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import Swiper from 'swiper';
	import 'swiper/css';
	import 'swiper/css/a11y';
	import {
		coverSizes,
		fullScreenOptions,
		heightSizes,
		loopOffset,
		numberedAlt
	} from '$lib/carousel';
	import CarouselHalves from '$lib/components/CarouselHalves.svelte';
	import Image from '$lib/components/Image.svelte';
	import Portable from '$lib/components/Portable.svelte';
	import { hotspotPosition } from '$lib/sanity/images';

	/**
	 * A gallery's images full screen, opened at image `start`. It fades in
	 * as it opens and out as it closes, or cuts with reduced motion. Close,
	 * top right in white, underlined as the map card's, is focused on
	 * opening, with its ring only if the keyboard opened it (see
	 * layout.css). Images sit a column of the 24-column grid apart, as the
	 * gallery's do, on white, and an image's caption sits over it bottom
	 * left, in white at the body size.
	 *
	 * From md up it's a carousel, as the homepage's is: each image covers the
	 * window around its hotspot. Clicking the left half goes back an image
	 * and the right half on, under a resize cursor pointing that way; the
	 * arrow keys, a swipe and a mouse drag move it too, and the last loops
	 * round to the first. Tabbing reaches the halves as Previous and Next
	 * buttons, labelled while they have focus.
	 *
	 * On phones the images sit in a row as tall as the window,
	 * each whole in its own shape, that scrolls sideways freely, without
	 * snapping or looping, starting with the chosen one at the left. The
	 * current image is the one most in view. Switching between the two, as
	 * a phone turns or a window resizes, keeps the current image.
	 *
	 * A modal <dialog>, so focus stays inside and the page behind is inert
	 * and, as with any open dialog, doesn't scroll (see layout.css); nor
	 * does the dialog itself. Escape closes it too. Mounted to open, it
	 * calls `onchange` with each image it moves to, for its gallery to follow along behind it, and
	 * `onclose` once it has faded out, for its gallery to unmount it. The
	 * current image and its neighbours load straight away, the rest as they
	 * come near. `alt` is as Gallery's.
	 */
	let { images, start = 0, alt, onchange, onclose } = $props();

	const wide = new MediaQuery('width >= 48rem');

	// The gallery's gap, a column of the 24 between the screen edges: the
	// row's own gap, and on the carousel only read, in px, for Swiper
	const gap = 'gap-x-[calc((100vw-2*var(--spacing-edge))/24)]';
	const spaceBetween = (node) => parseFloat(getComputedStyle(node).columnGap);

	// Mounted afresh each time it opens, so only the first start counts
	// svelte-ignore state_referenced_locally
	let active = $state(start);
	let closing = $state(false);
	let dialog;
	let swiper;

	let several = $derived(images.length > 1);

	// The carousel loops; the row doesn't
	const near = (index) =>
		Math.abs(wide.current ? loopOffset(index, active, images.length) : index - active) <= 1;

	const moveTo = (index) => {
		if (index === active) return;
		active = index;
		onchange(index);
	};

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

	// Opened by whichever of the carousel and the row is shown, before it
	// measures itself: their attachments run before the dialog's own would,
	// and a closed dialog has no size, so every image would measure 0
	const open = (node) => {
		const parent = node.closest('dialog');
		if (!parent.open) parent.showModal();
	};

	// Untracked, so moving doesn't build it again
	const carousel = (node) => {
		open(node);
		if (!untrack(() => several)) return;
		swiper = new Swiper(node, {
			...fullScreenOptions(),
			initialSlide: untrack(() => active),
			spaceBetween: spaceBetween(node),
			on: {
				realIndexChange: ({ realIndex }) => moveTo(realIndex),
				// The gap scales with the window, so it's measured again
				beforeResize: (instance) => (instance.params.spaceBetween = spaceBetween(node))
			}
		});
		return () => {
			swiper.destroy();
			swiper = null;
		};
	};

	// Starts at the current image, then follows whichever shows the most
	// as it scrolls, once a frame at most. Untracked, so scrolling doesn't
	// send it back to the start
	const row = (node) => {
		open(node);
		node.scrollLeft = node.children[untrack(() => active)]?.offsetLeft ?? 0;

		let frame;
		const follow = () => {
			const { left, right } = node.getBoundingClientRect();
			const shown = [...node.children].map((child) => {
				const box = child.getBoundingClientRect();
				return Math.min(box.right, right) - Math.max(box.left, left);
			});
			moveTo(shown.indexOf(Math.max(...shown)));
		};
		const onscroll = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(follow);
		};

		node.addEventListener('scroll', onscroll, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			node.removeEventListener('scroll', onscroll);
		};
	};
</script>

{#snippet caption(value)}
	{#if value?.length}
		<!-- Each place this is rendered is straight inside a figure -->
		<!-- svelte-ignore a11y_figcaption_parent -->
		<figcaption
			class="pointer-events-auto absolute right-edge bottom-edge left-edge text-md text-white"
		>
			<Portable {value} />
		</figcaption>
	{/if}
{/snippet}

<dialog
	bind:this={dialog}
	oncancel={(event) => {
		event.preventDefault();
		close();
	}}
	aria-label="Images"
	class={[
		'm-0 size-full max-h-none max-w-none overflow-hidden bg-white transition-opacity duration-300 motion-reduce:transition-none starting:opacity-0',
		closing && 'pointer-events-none opacity-0'
	]}
>
	<!-- Where the menu's hamburger would be, mirrored to the right. Opening
	     focuses it, as a dialog's autofocus, rather than Previous, whose
	     label would show. -->
	<button
		type="button"
		autofocus
		class="absolute top-0 right-edge z-20 flex h-nav items-center font-mono text-card text-white"
		onclick={close}
	>
		<span class="link-underline">Close</span>
	</button>

	{#if wide.current}
		<div class={['swiper size-full', gap]} {@attach carousel}>
			{#if several}
				<CarouselHalves
					noun="image"
					onprevious={() => swiper.slidePrev()}
					onnext={() => swiper.slideNext()}
				/>
			{/if}
			<div class="swiper-wrapper">
				{#each images as image, index (image._key)}
					<figure class="swiper-slide">
						<Image
							{image}
							sizes={coverSizes(image)}
							alt={numberedAlt(alt, index, images.length)}
							loading={near(index) ? 'eager' : 'lazy'}
							class="size-full object-cover object-(--hotspot)"
							style="--hotspot: {hotspotPosition(image)}"
						/>
						{@render caption(image.caption)}
					</figure>
				{/each}
			</div>
		</div>
	{:else}
		<!-- Focusable, so the arrow keys scroll it -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			role="region"
			aria-label="Images, scrolling sideways"
			tabindex="0"
			class={['scroll-row flex size-full', gap]}
			{@attach row}
		>
			{#each images as image, index (image._key)}
				<figure class="relative h-full shrink-0">
					<Image
						{image}
						sizes={heightSizes(image)}
						alt={numberedAlt(alt, index, images.length)}
						loading={near(index) ? 'eager' : 'lazy'}
						class="h-full w-auto max-w-none"
					/>
					{@render caption(image.caption)}
				</figure>
			{/each}
		</div>
	{/if}
</dialog>

<style>
	/* Over the halves, for the captions' links, but letting clicks through
	   everywhere else; Swiper's own CSS puts it under them */
	.swiper-wrapper {
		z-index: 20;
		pointer-events: none;
	}
</style>
