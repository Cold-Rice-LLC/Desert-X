<script>
	import ImageFrame from '$lib/components/ImageFrame.svelte';
	import { formatDate } from '$lib/dates';
	import { paletteGradient } from '$lib/gradient';

	/**
	 * A 4:5 news tile. News opens its page, on a gradient from its location's
	 * palette (or the General one), showing its Card Text or else its title,
	 * location and date. Press opens the article in a new tab: its image
	 * with the publication's logo over it, which on hover or focus gives way
	 * to the image blurred under the date, publication and title.
	 */
	let { item, generalPalette, sizes } = $props();

	// The logo waits for the image (if there is one), so it doesn't show on
	// the grey frame first
	let imageLoaded = $state(false);

	let date = $derived(formatDate(item.publishDate));
	let gradient = $derived(paletteGradient(item.location?.palette ?? generalPalette, item._id));
</script>

{#if item.kind === 'press'}
	<a
		href={item.pressUrl}
		target="_blank"
		rel="noopener noreferrer"
		class="group grid aspect-[4/5] font-mono text-white *:col-start-1 *:row-start-1"
	>
		<ImageFrame image={item.featuredImage} aspect={4 / 5} {sizes} bind:loaded={imageLoaded} />
		{#if item.logo?.url}
			<img
				src={item.logo.url}
				alt={item.logo.alt ?? item.publication ?? ''}
				class={[
					'w-[60%] place-self-center transition-opacity duration-300 group-hover:hidden group-focus-visible:hidden',
					item.featuredImage?.asset && !imageLoaded && 'opacity-0'
				]}
			/>
		{/if}
		<div
			class="hidden flex-col space-y-line p-[2.5rem] backdrop-blur-2xl group-hover:flex group-focus-visible:flex"
		>
			<p>{date}</p>
			<p><span class="uppercase">Featured</span><br />{item.publication}</p>
			<p>{item.title}</p>
			<p class="mt-auto">Read More</p>
		</div>
	</a>
{:else}
	<a
		href="/news/{item.slug}"
		class="block aspect-[4/5] space-y-line overflow-hidden bg-grey-3 p-[2.5rem] font-mono text-white"
		style:background-image={gradient}
	>
		{#if item.cardText}
			<p class="whitespace-pre-line">{item.cardText}</p>
		{:else}
			<p>{item.title}</p>
			{#if item.location}
				<p>{item.location.title}</p>
			{/if}
			<p>{date}</p>
		{/if}
	</a>
{/if}
