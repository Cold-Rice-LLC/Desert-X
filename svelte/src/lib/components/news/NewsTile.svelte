<script>
	import ImageFrame from '$lib/components/ImageFrame.svelte';
	import { formatDate } from '$lib/dates';
	import { paletteGradient } from '$lib/gradient';

	/**
	 * A 4:5 news tile. News opens its page, on a gradient from its location's
	 * palette (or the General one), showing its Card Text or else its title,
	 * location and date. Press opens the article in a new tab: its image
	 * with the publication's logo over it, which on hover or focus gives way
	 * to the image blurred under the date, publication, title and Read More.
	 * Either text and its padding scale with the tile: the monospaced font
	 * fits 17 characters to a line, and 13 lines down. Past that, news text
	 * is cut, and press titles lose lines so Read More stays.
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
		class="group @container grid aspect-[4/5] grid-rows-1 font-mono text-white *:col-start-1 *:row-start-1"
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
		<!-- As the news tile's text, with the bottom padding taking what's left
		     under 13 lines, so a title cut to fit ends on a whole line -->
		<div
			class="hidden min-h-0 flex-col space-y-line p-[6cqi] pb-[calc(119cqi-13lh)] text-[length:calc(88cqi/(17*0.62))] leading-none wrap-anywhere backdrop-blur-2xl group-hover:flex group-focus-visible:flex"
		>
			<p>{date}</p>
			<p><span class="uppercase">Featured</span><br />{item.publication}</p>
			<p class="min-h-0 overflow-hidden">{item.title}</p>
			<p class="mt-auto">Read More</p>
		</div>
	</a>
{:else}
	<!-- The text sits in its own element, as only a descendant can size itself
	     to the tile with container units: 17 of the mono font's 0.62em-wide
	     characters across what the 6cqi padding leaves, 13 lines down -->
	<a
		href="/news/{item.slug}"
		class="@container block aspect-[4/5] bg-grey-3 font-mono text-white"
		style:background-image={gradient}
	>
		<div
			class="max-h-[calc(13lh+12cqi)] space-y-line overflow-hidden p-[6cqi] text-[length:calc(88cqi/(17*0.62))] leading-none wrap-anywhere"
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
		</div>
	</a>
{/if}
