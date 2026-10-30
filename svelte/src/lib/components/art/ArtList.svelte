<script>
	import { groupByArtist } from '$lib/art';
	import GroupedList from '$lib/components/GroupedList.svelte';

	/**
	 * Artworks under a heading per year, newest first, with Other for those
	 * without one. Each artist is a row on the 12-column grid: their name
	 * across 3 columns, and their artworks stacked beside it, the title
	 * across 6, then location across 2 and year. Entries arrive sorted by
	 * year.
	 */
	let { entries } = $props();

	// Headings, each with its entries in order, grouped by artist
	let sections = $derived(
		entries
			.reduce((sections, entry) => {
				const heading = entry.artwork.year ? String(entry.artwork.year) : 'Other';
				if (sections.at(-1)?.heading !== heading) sections.push({ heading, entries: [] });
				sections.at(-1).entries.push(entry);
				return sections;
			}, [])
			.map(({ heading, entries }) => ({ heading, artists: groupByArtist(entries) }))
	);
</script>

{#snippet row(artwork)}
	<a href="/art/{artwork.slug}" class="col-span-6">{artwork.title}</a>
	{#if artwork.location}
		<p class="col-span-2">{artwork.location}</p>
	{/if}
	{#if artwork.year}
		<p class="col-start-9">{artwork.year}</p>
	{/if}
{/snippet}

<div class="space-y-line px-gutter">
	{#each sections as { heading, artists } (heading)}
		<section>
			<h2>{heading}</h2>
			<GroupedList groups={artists} {row} key={(artwork) => artwork._id} />
		</section>
	{/each}
</div>
