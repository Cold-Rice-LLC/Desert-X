<script>
	import ImageFrame from '$lib/components/ImageFrame.svelte';

	/**
	 * Artwork tiles three across, between the gutters: the first image at
	 * 4:3, then in the smaller text the artist, the title in italics cut to
	 * one line, and the edition's year and location. An artwork by two
	 * artists has a tile under each.
	 */
	let { entries } = $props();
</script>

<ul class="grid grid-cols-3 gap-x-[12rem] gap-y-md px-gutter">
	{#each entries as { artwork, artistId, name } (`${artwork._id}-${artistId}`)}
		<li>
			<a href="/art/{artwork.slug}" class="block space-y-xs">
				<ImageFrame image={artwork.image} aspect={4 / 3} sizes="calc((100vw - 37.6rem) / 3)" />
				<p class="text-base">
					{name}
					<!-- Padded past the 1-high line box, where tails like g's and accents
					     reach, so cutting it to one line doesn't clip them; the margins
					     take the padding back out of the layout -->
					<cite class="-my-[0.1em] line-clamp-1 py-[0.1em]">{artwork.title}</cite>
					{[artwork.year, artwork.location].filter(Boolean).join(', ')}
				</p>
			</a>
		</li>
	{/each}
</ul>
