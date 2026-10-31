<script>
	import { groupByArtist } from '$lib/art';
	import GroupedList from '$lib/components/GroupedList.svelte';

	/**
	 * Artworks under a heading per year, newest first, with Other for those
	 * without one. Each artist is a row (see GroupedList), their artworks
	 * stacked beside their name: the title across 5 columns and the location
	 * across 3 on phones, which leave the year to the heading, and from md
	 * up the title across 6, the location across 2 and the year. Entries
	 * arrive sorted by year.
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
	<a href="/art/{artwork.slug}" class="col-span-5 link-fade md:col-span-6">{artwork.title}</a>
	{#if artwork.location}
		<p class="col-span-3 md:col-span-2">{artwork.location}</p>
	{/if}
	{#if artwork.year}
		<p class="hidden md:col-start-9 md:block">{artwork.year}</p>
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
