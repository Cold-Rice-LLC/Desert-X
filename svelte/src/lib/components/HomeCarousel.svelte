<script>
	import { prefersReducedMotion } from 'svelte/motion';
	import Swiper from 'swiper';
	import 'swiper/css';
	import 'swiper/css/a11y';
	import { coverSizes, fullScreenOptions, loopOffset } from '$lib/carousel';
	import AppLink from '$lib/components/AppLink.svelte';
	import CarouselHalves from '$lib/components/CarouselHalves.svelte';
	import Image from '$lib/components/Image.svelte';
	import FooterLinks from '$lib/components/layout/FooterLinks.svelte';
	import { urlFor } from '$lib/sanity/client';
	import { hotspotPosition } from '$lib/sanity/images';
	import { linkHref } from '$lib/sanity/links';

	/**
	 * The homepage: slides that fill the window below the nav, an image
	 * or a muted video on a loop, each covering it around its hotspot.
	 * Clicking the left half goes back a slide and the right half on, under
	 * a resize cursor pointing that way; the arrow keys, a swipe and a mouse drag move it
	 * too, and the last loops round to the first. Tabbing reaches the halves
	 * as Previous and Next buttons, labelled while they have focus. Over
	 * the halves, `quickLinks`, the footer's search and two link columns,
	 * sit on its bottom edge, as the menu has them on phones and the footer
	 * from md up (see FooterLinks). A slide can have a headline, a caption
	 * or both, moving with it. Its caption sits bottom right, linking to
	 * where the slide goes, or flush left above the links on phones. Its
	 * headline sits centred in the menu's size, fading in as the slide
	 * arrives.
	 *
	 * Only the current slide's video plays, and none with reduced motion,
	 * which also cuts between slides. The browser's lazy loading only looks
	 * again on scroll, so the current slide and its neighbours are switched
	 * to eager; the first is fetched ahead of everything else.
	 */
	let { slides, quickLinks } = $props();

	let active = $state(0);
	// The slide moving away, whose headline stays while it goes
	let leaving = $state(null);
	let swiper;

	// The links' height, which captions sit above on phones. Until it's
	// measured they're hidden there.
	let linksHeight = $state();

	let several = $derived(slides.length > 1);

	const offset = (index) => loopOffset(index, active, slides.length);
	const near = (index) => Math.abs(offset(index)) <= 1;

	// Flush left above the links on phones, and bottom right beside them
	// from md up, over the halves so clicking it follows the link
	let captionClass = $derived([
		'pointer-events-auto absolute inset-x-edge bottom-[calc(var(--spacing-edge)_+_var(--quick-links)_+_var(--spacing-sm))] w-fit text-base text-white md:bottom-edge md:left-1/2 md:ml-auto',
		!linksHeight && 'invisible md:visible'
	]);

	const posterUrl = (poster) => poster?.asset && urlFor(poster).width(2400).auto('format').url();

	// Plays while its slide is the current one
	const playing = (index) => (video) => {
		if (offset(index) === 0 && !prefersReducedMotion.current) video.play().catch(() => {});
		else video.pause();
	};

	const carousel = (node) => {
		swiper = new Swiper(node, {
			...fullScreenOptions(),
			on: {
				realIndexChange: ({ realIndex }) => {
					leaving = active;
					active = realIndex;
				},
				slideChangeTransitionEnd: () => (leaving = null)
			}
		});
		return () => swiper.destroy();
	};
</script>

{#snippet caption({ name, work })}
	{name}
	{#if work}<i>{work}</i>{/if}
{/snippet}

<section
	class="relative flex-1 bg-grey-1"
	style:--quick-links="{linksHeight}px"
	aria-roledescription="carousel"
	aria-label="Featured"
>
	<div class="swiper" {@attach several && carousel}>
		{#if several}
			<CarouselHalves
				noun="slide"
				onprevious={() => swiper.slidePrev()}
				onnext={() => swiper.slideNext()}
			/>
		{/if}
		<div class="swiper-wrapper">
			{#each slides as slide, index (slide._key)}
				<div class="swiper-slide">
					{#if slide.mediaType === 'video'}
						<video
							src={slide.video}
							poster={posterUrl(slide.poster)}
							muted
							loop
							playsinline
							disablepictureinpicture
							preload={offset(index) === 0 ? 'auto' : near(index) ? 'metadata' : 'none'}
							aria-hidden="true"
							class="size-full object-cover"
							style:object-position={hotspotPosition(slide.poster)}
							{@attach playing(index)}
						></video>
					{:else}
						<Image
							image={slide.image}
							sizes={coverSizes(slide.image)}
							loading={near(index) ? 'eager' : 'lazy'}
							fetchpriority={index === 0 ? 'high' : undefined}
							class="size-full object-cover"
							style="object-position: {hotspotPosition(slide.image)}"
						/>
					{/if}
					<!-- In its slide, so it moves with it. It fades in as its slide
					     arrives, and is hidden at once after it's gone, ready to fade in
					     again -->
					{#if slide.headline}
						<p
							class={[
								'absolute inset-0 flex items-center justify-center px-gutter text-center text-menu tracking-tight text-balance text-white',
								index === active || index === leaving
									? 'opacity-100 transition-opacity delay-150 duration-800 motion-reduce:transition-none'
									: 'opacity-0'
							]}
						>
							{slide.headline}
						</p>
					{/if}
					{#if slide.caption && linkHref(slide)}
						<!-- Only the current slide's link is tabbed to -->
						<AppLink
							link={slide}
							tabindex={index === active ? undefined : -1}
							class={[captionClass, 'link-underline']}
						>
							{@render caption(slide.caption)}
						</AppLink>
					{:else if slide.caption}
						<p class={captionClass}>{@render caption(slide.caption)}</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Outside Swiper, over the halves, so clicking them follows the link -->
	<nav
		aria-label="Quick links"
		class="pointer-events-none absolute inset-x-0 bottom-edge z-20 grid grid-cols-12 items-end px-edge text-lead text-white *:pointer-events-auto md:text-md md:tracking-tight"
		bind:offsetHeight={linksHeight}
	>
		<FooterLinks links={quickLinks} compact />
	</nav>
</section>

<style>
	/* Filling the section, which only grows to the height left: Swiper's own
	   CSS makes it relative, which would win over a utility */
	.swiper {
		position: absolute;
		inset: 0;
	}

	/* Over the halves, for the captions' links, but letting clicks through
	   everywhere else; Swiper's own CSS puts it under them */
	.swiper-wrapper {
		z-index: 20;
		pointer-events: none;
	}
</style>
