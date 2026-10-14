<script>
	/**
	 * The row over a list or grid of artworks: "All (n)", "Artworks", and
	 * A–Z or Z–A, which switches the order. Give `sortHref` for a link (the
	 * Art landing keeps its order in the URL), or `onsort` for a button.
	 * `class` goes on the row.
	 */
	let { count, descending = false, sortHref, onsort, class: className } = $props();

	let order = $derived(descending ? 'Z–A' : 'A–Z');
	let label = $derived(descending ? 'Z–A, sort A–Z instead' : 'A–Z, sort Z–A instead');
</script>

<div class={['grid grid-cols-3', className]}>
	<p>All ({count})</p>
	<p class="text-center uppercase">Artworks</p>
	{#if sortHref}
		<a href={sortHref} class="justify-self-end" aria-label={label}>{order}</a>
	{:else}
		<button onclick={onsort} class="justify-self-end" aria-label={label}>{order}</button>
	{/if}
</div>
