<script>
	import Choice from '$lib/components/Choice.svelte';

	/**
	 * The orders a grid of artworks can take, e.g. "Artist / Artwork", as
	 * buttons, the current one underlined. `onsort` gets the chosen order's
	 * key, and `class` goes on the row.
	 */
	let { sorts, sort = 'artist', onsort, class: className } = $props();
</script>

<div role="group" aria-label="Sort artworks" class={['uppercase', className]}>
	{#each sorts as key, index (key)}
		{index ? ' / ' : ''}
		<Choice onclick={() => onsort(key)} current={key === sort}>{key}</Choice>
	{/each}
</div>
