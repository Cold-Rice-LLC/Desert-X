<script>
	import { groupByArtist, sortEntries } from '$lib/art';
	import GroupedList from '$lib/components/GroupedList.svelte';
	import { plain } from '$lib/search';

	/**
	 * Artworks as a list, two ways. From md up, under a heading per year,
	 * newest first, with Other for those without one: each artist is a row
	 * (see GroupedList), their artworks stacked beside their name, the title
	 * across 6 columns, the location across 2 and the year. Entries arrive
	 * sorted by year.
	 *
	 * Phones list them A–Z by artist instead, under the letter their Sort
	 * Name starts with (# for anything but a letter), in the lead size: the
	 * artist across half the grid, then the location across 4 columns and
	 * the year at the right edge, a line per artwork, an artist's name only
	 * on their first. Each line links to its artwork, named for screen
	 * readers by its title too.
	 */
	let { entries } = $props();

	// Sorted entries under a heading per run with the same `heading`, each
	// section's grouped by artist
	const sections = (entries, heading) =>
		entries
			.reduce((sections, entry) => {
				const text = heading(entry);
				if (sections.at(-1)?.heading !== text) sections.push({ heading: text, entries: [] });
				sections.at(-1).entries.push(entry);
				return sections;
			}, [])
			.map(({ heading, entries }) => ({ heading, artists: groupByArtist(entries) }));

	const year = ({ artwork }) => (artwork.year ? String(artwork.year) : 'Other');
	const letter = ({ sortName }) => {
		const first = plain(sortName).charAt(0).toUpperCase();
		return /[A-Z]/.test(first) ? first : '#';
	};

	let byYear = $derived(sections(entries, year));
	let byLetter = $derived(sections(sortEntries(entries), letter));
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

<div class="hidden space-y-line px-gutter md:block">
	{#each byYear as { heading, artists } (heading)}
		<section>
			<h2>{heading}</h2>
			<GroupedList groups={artists} {row} key={(artwork) => artwork._id} />
		</section>
	{/each}
</div>

<div class="space-y-line px-gutter text-lead md:hidden">
	{#each byLetter as { heading, artists } (heading)}
		<section>
			<h2>{heading}</h2>
			<ul>
				{#each artists as { name, items }, group (group)}
					{#each items as artwork, index (artwork._id)}
						<li>
							<a
								href="/art/{artwork.slug}"
								aria-label="{artwork.title} by {name}, {[artwork.location, artwork.year]
									.filter(Boolean)
									.join(' ')}"
								class="grid grid-cols-12 gap-x-xs link-fade"
							>
								{#if index === 0}
									<span class="col-span-6">{name}</span>
								{/if}
								{#if artwork.location}
									<span class="col-span-4 col-start-7">{artwork.location}</span>
								{/if}
								{#if artwork.year}
									<span class="col-span-2 col-start-11 text-right">{artwork.year}</span>
								{/if}
							</a>
						</li>
					{/each}
				{/each}
			</ul>
		</section>
	{/each}
</div>
