<script>
	import { groupByArtist, sortEntries } from '$lib/art';
	import { plain } from '$lib/search';

	/**
	 * Artworks as a list, two ways, a line per artwork, each line a link to
	 * it, named for screen readers by its title, artist, location and year.
	 * An artist's name shows only on their first line.
	 *
	 * From md up, under a heading per year, newest first, with Other for
	 * those without one: the artist across 3 columns of the 12-column grid,
	 * the title across 6, the location across 2 and the year. Entries
	 * arrive sorted by year.
	 *
	 * Phones list them A–Z by artist instead, under the letter their Sort
	 * Name starts with (# for anything but a letter), in the lead size: the
	 * artist across half the grid, then the location across 4 columns and
	 * the year at the right edge.
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

<!-- `line` draws a line's columns, given the artwork and the artist's name
     on their first line -->
{#snippet list(sections, classes, line)}
	<div class={['space-y-line px-gutter', classes]}>
		{#each sections as { heading, artists } (heading)}
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
									class="grid grid-cols-12 gap-x-xs link-fade md:gap-x-base"
								>
									{@render line(artwork, index === 0 && name)}
								</a>
							</li>
						{/each}
					{/each}
				</ul>
			</section>
		{/each}
	</div>
{/snippet}

{#snippet desktopLine(artwork, name)}
	{#if name}
		<span class="col-span-3">{name}</span>
	{/if}
	<span class="col-span-6 col-start-4">{artwork.title}</span>
	{#if artwork.location}
		<span class="col-span-2">{artwork.location}</span>
	{/if}
	{#if artwork.year}
		<span class="col-start-12">{artwork.year}</span>
	{/if}
{/snippet}

{#snippet phoneLine(artwork, name)}
	{#if name}
		<span class="col-span-6">{name}</span>
	{/if}
	{#if artwork.location}
		<span class="col-span-4 col-start-7">{artwork.location}</span>
	{/if}
	{#if artwork.year}
		<span class="col-span-2 col-start-11 text-right">{artwork.year}</span>
	{/if}
{/snippet}

{@render list(byYear, 'hidden md:block', desktopLine)}
{@render list(byLetter, 'text-lead md:hidden', phoneLine)}
