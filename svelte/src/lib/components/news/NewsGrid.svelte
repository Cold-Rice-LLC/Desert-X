<script>
	import NewsTile from '$lib/components/news/NewsTile.svelte';

	/**
	 * News tiles, one across on phones and three from md up, between the
	 * gutters. `class` goes on the <ul>. With `eager`, for a grid at the top
	 * of its page, the first image in the first row loads straight away,
	 * ahead of the rest. Only press tiles show one.
	 */
	let { items, generalPalette, eager = false, class: className } = $props();

	// The first row is the first three tiles on wider screens
	let firstImage = $derived(
		eager
			? items.slice(0, 3).findIndex((item) => item.kind === 'press' && item.featuredImage?.asset)
			: -1
	);
</script>

<ul class={['grid gap-base px-gutter md:grid-cols-3', className]}>
	{#each items as item, index (item._id)}
		<li>
			<NewsTile
				{item}
				{generalPalette}
				sizes="(width >= 768px) calc((100vw - 186px) / 3), calc(100vw - 40px)"
				loading={index === firstImage ? 'eager' : 'lazy'}
				fetchpriority={index === firstImage ? 'high' : undefined}
			/>
		</li>
	{/each}
</ul>
