<script>
	import NewsTile from '$lib/components/news/NewsTile.svelte';

	/** News tiles three across, between the gutters. `class` goes on the <ul>. */
	let { items, generalPalette, class: className } = $props();
</script>

<ul class={['grid grid-cols-3 gap-[2.5rem] px-gutter', className]}>
	{#each items as item (item._id)}
		<li>
			<NewsTile {item} {generalPalette} sizes="calc((100vw - 18.6rem) / 3)" />
		</li>
	{/each}
</ul>
