<script>
	import { artworkEntries, sortEntries } from '$lib/art';
	import { formatDateRange } from '$lib/dates';
	import ArtGrid from '$lib/components/art/ArtGrid.svelte';
	import ArtworksBar from '$lib/components/art/ArtworksBar.svelte';
	import ExhibitionMap from '$lib/components/edition/ExhibitionMap.svelte';
	import Sponsors from '$lib/components/edition/Sponsors.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import NewsModule from '$lib/components/modules/NewsModule.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/**
	 * An edition, as its page shows it and as Other Editions shows it when
	 * opened: the gallery, the dates and description, the exhibition map, its
	 * artworks, its sponsors and up to three news items, sections a 2xl step
	 * apart. The gallery is the edition's images, or else each artwork's
	 * first. Sections with nothing to show are left out. `children` follows
	 * as another section. `news` holds the News landing fields the news tiles
	 * need.
	 */
	let { edition, news, children } = $props();

	let descending = $state(false);
	let entries = $derived(sortEntries(artworkEntries(edition.artworks ?? []), descending));

	// Each artwork's first image, A–Z whichever way the grid is sorted, for an
	// edition without images of its own
	let images = $derived.by(() => {
		if (edition.images?.length) return edition.images;
		const artworks = new Set(
			sortEntries(artworkEntries(edition.artworks ?? [])).map((entry) => entry.artwork)
		);
		return [...artworks]
			.filter((artwork) => artwork.image?.asset)
			.map((artwork) => ({ ...artwork.image, _key: artwork._id }));
	});
	let dates = $derived(formatDateRange(edition.startDate, edition.endDate));
</script>

{#if images.length}
	<Gallery {images} />
{/if}

<div class="space-y-2xl pt-page-top text-md">
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

	<ExhibitionMap artworks={edition.artworks ?? []} {dates} text={edition.mapText} />

	{#if entries.length}
		<section aria-label="Artworks" class="space-y-md">
			<ArtworksBar
				count={edition.artworks.length}
				{descending}
				onsort={() => (descending = !descending)}
				class="px-gutter"
			/>
			<ArtGrid {entries} />
		</section>
	{/if}

	<Sponsors groups={edition.sponsorGroups ?? []} lists={edition.sponsorLists ?? []} />

	<NewsModule
		module={{ _type: 'newsModule', heading: 'Read More', items: edition.news, ...news }}
	/>

	{@render children?.()}
</div>
