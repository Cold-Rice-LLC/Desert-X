<script>
	import ImageFrame from '$lib/components/ImageFrame.svelte';
	import { urlFor } from '$lib/sanity/client';

	/**
	 * One piece of media on a 24-column grid (half-columns of the 12-column
	 * one). An image keeps its own shape across the middle 8 columns; with a
	 * second image the two sit side by side, 4:5, across the middle 9.
	 * Videos and embeds are 16:9 across 8. The caption sits underneath.
	 */
	let { module } = $props();

	let pair = $derived(module.mediaType === 'image' && module.secondImage?.asset);
	let span = $derived(pair ? 'col-span-18 col-start-4' : 'col-span-16 col-start-5');

	// Vimeo's page and player URLs both end in the video's id
	let vimeoId = $derived(module.vimeoUrl?.match(/(\d+)(?:[/?#]|$)/)?.[1]);
	let poster = $derived(
		module.poster?.asset && urlFor(module.poster).width(1600).auto('format').url()
	);
</script>

<figure class="grid grid-cols-24 px-edge">
	{#if pair}
		<ImageFrame
			image={module.image}
			aspect={4 / 5}
			sizes="calc((100vw - 40px) * 9 / 24)"
			class="col-span-9 col-start-4"
		/>
		<ImageFrame
			image={module.secondImage}
			aspect={4 / 5}
			sizes="calc((100vw - 40px) * 9 / 24)"
			class="col-span-9"
		/>
	{:else if module.mediaType === 'image'}
		<ImageFrame image={module.image} sizes="calc((100vw - 40px) * 2 / 3)" class={span} />
	{:else if module.mediaType === 'mp4' && module.video}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			src={module.video}
			{poster}
			controls
			playsinline
			preload={poster ? 'none' : 'metadata'}
			class={['aspect-video w-full bg-black', span]}
		></video>
	{:else if module.mediaType === 'youtube' && module.youtubeId}
		<iframe
			src="https://www.youtube-nocookie.com/embed/{module.youtubeId}"
			title={module.caption ?? 'YouTube video'}
			allow="autoplay; fullscreen; picture-in-picture"
			allowfullscreen
			loading="lazy"
			class={['aspect-video w-full', span]}
		></iframe>
	{:else if module.mediaType === 'vimeo' && vimeoId}
		<iframe
			src="https://player.vimeo.com/video/{vimeoId}"
			title={module.caption ?? 'Vimeo video'}
			allow="autoplay; fullscreen; picture-in-picture"
			allowfullscreen
			loading="lazy"
			class={['aspect-video w-full', span]}
		></iframe>
	{/if}
	{#if module.caption}
		<figcaption class={['mt-xs text-base', span]}>{module.caption}</figcaption>
	{/if}
</figure>
