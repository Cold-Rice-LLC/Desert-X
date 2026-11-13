<script>
	import NewsTile from '$lib/components/news/NewsTile.svelte';

	/**
	 * News tiles, one across on phones, 5 of 6 columns wide and centred, as
	 * the Art landing's are, and three from md up, between the gutters.
	 * `class` goes on the <ul>. With `eager`, for a grid at the top
	 * of its page, the first image in the first row loads straight away,
	 * ahead of the rest. Only press tiles show one. With `row`, on phones
	 * they're a row instead, between the gutters, that scrolls sideways
	 * freely, without a scrollbar, a tile and a fifth of the next across;
	 * from md up it's the grid, cut to its first three.
	 */
	let { items, generalPalette, eager = false, row = false, class: className } = $props();

	// The first row is the first three tiles on wider screens
	let firstImage = $derived(
		eager
			? items.slice(0, 3).findIndex((item) => item.kind === 'press' && item.featuredImage?.asset)
			: -1
	);
</script>

<ul
	class={[
		'gap-base',
		row ? 'scroll-row flex px-gutter md:grid' : 'grid px-indent md:px-gutter',
		'md:grid-cols-3',
		className
	]}
>
	{#each items as item, index (item._id)}
		<li class={row && 'w-5/6 shrink-0 md:w-auto md:nth-[n+4]:hidden'}>
			<NewsTile
				{item}
				{generalPalette}
				sizes="(width >= 768px) calc((100vw - 206px) / 3), calc((100vw - 50px) * 5 / 6)"
				loading={index === firstImage ? 'eager' : 'lazy'}
				fetchpriority={index === firstImage ? 'high' : undefined}
			/>
		</li>
	{/each}
</ul>
