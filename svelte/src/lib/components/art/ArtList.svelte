<script>
	import { entryHeading } from '$lib/art';

	/**
	 * Artworks under a heading per letter, location or year, as they're
	 * sorted (`sort`), only for headings with artworks. Each artist is a row
	 * on the 12-column grid: their name across 3 columns, and their artworks
	 * stacked beside it, the title across 6, then location across 2 and
	 * year. Entries arrive sorted.
	 */
	let { entries, sort = 'artist' } = $props();

	// Headings, each with its artists in order, each with their artworks
	let sections = $derived(
		entries.reduce((sections, entry) => {
			const heading = entryHeading(entry, sort);
			if (sections.at(-1)?.heading !== heading) sections.push({ heading, artists: [] });
			const { artists } = sections.at(-1);
			const last = artists.at(-1);
			if (last && last.id === entry.artistId && last.name === entry.name) {
				last.artworks.push(entry.artwork);
			} else {
				artists.push({ id: entry.artistId, name: entry.name, artworks: [entry.artwork] });
			}
			return sections;
		}, [])
	);
</script>

<div class="space-y-line px-gutter">
	{#each sections as { heading, artists } (heading)}
		<section>
			<h2>{heading}</h2>
			<ul>
				{#each artists as artist, index (`${artist.id}-${index}`)}
					<li class="grid grid-cols-12 gap-x-base">
						<p class="col-span-3">{artist.name}</p>
						<ul class="col-span-9 grid grid-cols-subgrid">
							{#each artist.artworks as artwork (artwork._id)}
								<li class="col-span-9 grid grid-cols-subgrid">
									<a href="/art/{artwork.slug}" class="col-span-6">{artwork.title}</a>
									{#if artwork.location}
										<p class="col-span-2">{artwork.location}</p>
									{/if}
									{#if artwork.year}
										<p class="col-start-9">{artwork.year}</p>
									{/if}
								</li>
							{/each}
						</ul>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>
