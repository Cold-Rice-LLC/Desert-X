<script>
	import { artworkEntries, sortEntries } from '$lib/art';
	import { formatDateRange } from '$lib/dates';
	import ArtGrid from '$lib/components/art/ArtGrid.svelte';
	import ExhibitionMap from '$lib/components/edition/ExhibitionMap.svelte';
	import Sponsors from '$lib/components/edition/Sponsors.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import NewsModule from '$lib/components/modules/NewsModule.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/**
	 * An edition, as its page shows it and as Other Editions shows it when
	 * opened: the gallery, the dates and description, the exhibition map and
	 * its artworks by artist (the map after them from lg up), its sponsors,
	 * then `children` as another section, and last up to three news items,
	 * sections a 2xl step apart. The gallery is the edition's images, or
	 * else each artwork's first. Sections with nothing to show are left out.
	 * `news` holds the News landing fields the news tiles need, and
	 * `headingLevel` sets its sections' headings: h2s on its own page, h3s
	 * in Other Editions. `class` goes on what follows the gallery.
	 */
	let { edition, news, headingLevel, class: className, children } = $props();

	let entries = $derived(sortEntries(artworkEntries(edition.artworks ?? [])));

	// Each artwork's first image, by artist, for an edition without images
	// of its own, without the caption written for the artwork's page
	let images = $derived.by(() => {
		if (edition.images?.length) return edition.images;
		const artworks = new Set(entries.map((entry) => entry.artwork));
		return [...artworks]
			.filter((artwork) => artwork.image?.asset)
			.map((artwork) => ({ ...artwork.image, caption: undefined, _key: artwork._id }));
	});
	let dates = $derived(formatDateRange(edition.startDate, edition.endDate));
</script>

{#if images.length}
	<Gallery {images} />
{/if}

<div class={['space-y-2xl pt-page-top text-md', className]}>
	{#if dates || edition.description}
		<div class="space-y-line px-gutter">
			{#if dates}
				<p class="text-center">{dates}</p>
			{/if}
			{#if edition.description}
				<Portable value={edition.description} />
			{/if}
		</div>
	{/if}

	{#if entries.length}
		<div class="flex flex-col gap-2xl">
			<ExhibitionMap
				artworks={edition.artworks}
				text={edition.mapText}
				{headingLevel}
				class="lg:order-last"
			/>

			<section class="space-y-line">
				<ModuleHeading heading="Artists and Artworks" level={headingLevel} />
				<ArtGrid {entries} edition />
			</section>
		</div>
	{/if}

	<Sponsors
		groups={edition.sponsorGroups ?? []}
		lists={edition.sponsorLists ?? []}
		{headingLevel}
	/>

	{@render children?.()}

	<NewsModule module={{ _type: 'newsModule', items: edition.news, ...news }} {headingLevel} />
</div>
