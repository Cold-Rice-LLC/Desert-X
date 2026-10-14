<script>
	import { entryLetter } from '$lib/art';

	/**
	 * Artworks under a heading per letter, only for letters with artists. Each
	 * artist is a row on the 12-column grid: their name across 3 columns, and
	 * their artworks stacked beside it, the title across 6, then location
	 * across 2 and year. Entries arrive sorted.
	 */
	let { entries } = $props();

	// Letters, each with its artists in order, each with their artworks
	let letters = $derived(
		entries.reduce((letters, entry) => {
			const letter = entryLetter(entry);
			if (letters.at(-1)?.letter !== letter) letters.push({ letter, artists: [] });
			const { artists } = letters.at(-1);
			const last = artists.at(-1);
			if (last && last.id === entry.artistId && last.name === entry.name) {
				last.artworks.push(entry.artwork);
			} else {
				artists.push({ id: entry.artistId, name: entry.name, artworks: [entry.artwork] });
			}
			return letters;
		}, [])
	);
</script>

<div class="space-y-line px-gutter">
	{#each letters as { letter, artists } (letter)}
		<section>
			<h2>{letter}</h2>
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
