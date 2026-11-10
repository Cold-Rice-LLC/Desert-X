<script>
	import ImageFrame from '$lib/components/ImageFrame.svelte';

	/**
	 * Artwork tiles, one across on phones, 5 of 6 columns wide and centred,
	 * and three from md up between the gutters: the first image at
	 * 4:3, then in the smaller text the artist, the title in italics cut to
	 * one line, and the edition's year and location. An artwork by two
	 * artists has a tile under each. With `eager`, for a grid at the top of
	 * its page, the first tile's image loads straight away, ahead of the
	 * rest; on phones the next ones are below the fold, and would compete.
	 * With `edition`, for an edition's own artworks, there are two across
	 * from md up, with just the artist and title, in the medium size.
	 */
	let { entries, eager = false, edition = false } = $props();

	let sizes = $derived(
		edition
			? '(width >= 768px) calc((100vw - 286px) / 2), calc((100vw - 50px) * 5 / 6)'
			: '(width >= 768px) calc((100vw - 396px) / 3), calc((100vw - 50px) * 5 / 6)'
	);
</script>

<ul
	class={[
		'grid gap-y-md px-indent md:px-gutter',
		edition ? 'md:grid-cols-2 md:gap-x-[13rem]' : 'md:grid-cols-3 md:gap-x-[12rem]'
	]}
>
	{#each entries as { artwork, artistId, name }, index (`${artwork._id}-${artistId}`)}
		<li>
			<a href="/art/{artwork.slug}" class="block space-y-xs">
				<ImageFrame
					image={artwork.image}
					aspect={4 / 3}
					{sizes}
					loading={eager && index === 0 ? 'eager' : 'lazy'}
					fetchpriority={eager && index === 0 ? 'high' : undefined}
				/>
				{#if edition}
					<p class="text-md">{name}, <cite>{artwork.title}</cite></p>
				{:else}
					<p class="text-base">
						{name}
						<!-- Padded past the 1-high line box, where tails like g's and accents
						     reach, so cutting it to one line doesn't clip them; the margins
						     take the padding back out of the layout -->
						<cite class="-my-[0.1em] line-clamp-1 py-[0.1em]">{artwork.title}</cite>
						{[artwork.year, artwork.location].filter(Boolean).join(', ')}
					</p>
				{/if}
			</a>
		</li>
	{/each}
</ul>
