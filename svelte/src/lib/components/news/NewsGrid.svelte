<script>
	import NewsTile from '$lib/components/news/NewsTile.svelte';

	/**
	 * News tiles, one across on phones and three from md up, between the
	 * gutters. `class` goes on the <ul>.
	 */
	let { items, generalPalette, class: className } = $props();
</script>

<ul class={['grid gap-base px-gutter md:grid-cols-3', className]}>
	{#each items as item (item._id)}
		<li>
			<NewsTile
				{item}
				{generalPalette}
				sizes="(width >= 768px) calc((100vw - 186px) / 3), calc(100vw - 40px)"
			/>
		</li>
	{/each}
</ul>
