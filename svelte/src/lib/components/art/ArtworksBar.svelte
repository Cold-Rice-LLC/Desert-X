<script>
	import { SORTS } from '$lib/art';

	/**
	 * The orders a list or grid of artworks can take, "Artist / Artwork /
	 * Location / Year", the current one underlined. Give `sortHref` for
	 * links (the Art landing keeps its order in the URL), or `onsort` for
	 * buttons; each gets the order's key. `sorts` narrows the choice, and
	 * `class` goes on the row.
	 */
	let { sorts = SORTS, sort = 'artist', sortHref, onsort, class: className } = $props();
</script>

<div role="group" aria-label="Sort artworks" class={['uppercase', className]}>
	{#each sorts as key, index (key)}
		{index ? ' / ' : ''}
		{#if sortHref}
			<a
				href={sortHref(key)}
				class={[key === sort && 'link-underline']}
				aria-current={key === sort ? 'page' : undefined}>{key}</a
			>
		{:else}
			<button
				onclick={() => onsort(key)}
				class={[key === sort && 'link-underline']}
				aria-pressed={key === sort}>{key}</button
			>
		{/if}
	{/each}
</div>
