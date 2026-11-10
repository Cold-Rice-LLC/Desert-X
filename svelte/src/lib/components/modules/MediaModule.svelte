<script>
	import ImageFrame from '$lib/components/ImageFrame.svelte';
	import Portable from '$lib/components/Portable.svelte';
	import { urlFor } from '$lib/sanity/client';

	/**
	 * One piece of media on a 24-column grid (half-columns of the 12-column
	 * one). An image keeps its own shape across the middle 16 columns, or 20
	 * on phones; with a second image the two sit side by side, 4:5, across
	 * the middle 18, or stack across 20 on phones. Videos and embeds are
	 * 16:9 across the middle 20, or the full width on phones. A caption sits
	 * under each, rich text with the title in italics, or else the one on
	 * the asset in the Media library, plain text.
	 */
	let { module } = $props();

	let pair = $derived(module.mediaType === 'image' && module.secondImage?.asset);
	let span = $derived(
		module.mediaType === 'image'
			? 'col-span-20 col-start-3 md:col-span-16 md:col-start-5'
			: 'col-span-24 md:col-span-20 md:col-start-3'
	);

	// Vimeo's page and player URLs both end in the video's id
	let vimeoId = $derived(module.vimeoUrl?.match(/(\d+)(?:[/?#]|$)/)?.[1]);
	let poster = $derived(
		module.poster?.asset && urlFor(module.poster).width(1600).auto('format').url()
	);

	const pairSizes = '(width >= 768px) calc((100vw - 50px) * 9 / 24), calc((100vw - 50px) * 5 / 6)';
</script>

{#snippet caption(value, classes)}
	{#if value}
		<!-- Each place this is rendered is straight inside a figure -->
		<!-- svelte-ignore a11y_figcaption_parent -->
		<figcaption class={['mt-xs text-base', classes]}>
			{#if Array.isArray(value)}
				<Portable {value} />
			{:else}
				{value}
			{/if}
		</figcaption>
	{/if}
{/snippet}

{#if pair}
	<div class="grid grid-cols-24 gap-y-base px-edge">
		<figure class="col-span-20 col-start-3 md:col-span-9 md:col-start-4">
			<ImageFrame image={module.image} aspect={4 / 5} sizes={pairSizes} />
			{@render caption(module.caption)}
		</figure>
		<figure class="col-span-20 col-start-3 md:col-span-9 md:col-start-auto">
			<ImageFrame image={module.secondImage} aspect={4 / 5} sizes={pairSizes} />
			{@render caption(module.secondCaption)}
		</figure>
	</div>
{:else}
	<figure class="grid grid-cols-24 px-edge">
		{#if module.mediaType === 'image'}
			<ImageFrame
				image={module.image}
				sizes="(width >= 768px) calc((100vw - 50px) * 2 / 3), calc((100vw - 50px) * 5 / 6)"
				class={span}
			/>
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
				title={module.embedTitle || 'YouTube video'}
				allow="autoplay; fullscreen; picture-in-picture"
				allowfullscreen
				loading="lazy"
				class={['aspect-video w-full', span]}
			></iframe>
		{:else if module.mediaType === 'vimeo' && vimeoId}
			<iframe
				src="https://player.vimeo.com/video/{vimeoId}"
				title={module.embedTitle || 'Vimeo video'}
				allow="autoplay; fullscreen; picture-in-picture"
				allowfullscreen
				loading="lazy"
				class={['aspect-video w-full', span]}
			></iframe>
		{/if}
		{@render caption(module.caption, span)}
	</figure>
{/if}
