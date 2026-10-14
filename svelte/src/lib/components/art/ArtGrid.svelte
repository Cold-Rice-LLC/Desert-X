<script>
	import ImageFrame from '$lib/components/ImageFrame.svelte';

	/**
	 * Artwork tiles three across, between the gutters: the first image at
	 * 4:3, then the artist and the title. An artwork by two artists has a
	 * tile under each.
	 */
	let { entries } = $props();
</script>

<ul class="grid grid-cols-3 gap-x-[12rem] gap-y-md px-gutter">
	{#each entries as { artwork, artistId, name } (`${artwork._id}-${artistId}`)}
		<li>
			<a href="/art/{artwork.slug}" class="block space-y-xs">
				<ImageFrame image={artwork.image} aspect={4 / 3} sizes="calc((100vw - 37.6rem) / 3)" />
				<p>{name}<br />{artwork.title}</p>
			</a>
		</li>
	{/each}
</ul>
