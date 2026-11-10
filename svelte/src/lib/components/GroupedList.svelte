<script>
	/**
	 * Groups as rows on the 12-column grid, as search results show them:
	 * each group's `name` (an artist, or Editions, Pages or News) across 4
	 * columns on phones and 3 from md up, and its `items` stacked beside it
	 * on a subgrid of the rest, 8 columns or 9, each drawn by `row` and
	 * keyed by `key`. With `flatOnPhones`, phones have the rows
	 * alone, one under another, without the names, and the rows the whole
	 * width; the grid starts at md.
	 */
	let { groups, row, key = (item) => item.key, flatOnPhones = false } = $props();

	// The items' list, and each item, on the subgrid beside the name
	let subgrid = $derived(
		flatOnPhones
			? 'md:col-span-9 md:grid md:grid-cols-subgrid'
			: 'col-span-8 grid grid-cols-subgrid md:col-span-9'
	);
</script>

<ul>
	{#each groups as group, index (index)}
		<li
			class={flatOnPhones
				? 'md:grid md:grid-cols-12 md:gap-x-base'
				: 'grid grid-cols-12 gap-x-xs md:gap-x-base'}
		>
			<p class={flatOnPhones ? 'hidden md:col-span-3 md:block' : 'col-span-4 md:col-span-3'}>
				{group.name}
			</p>
			<ul class={subgrid}>
				{#each group.items as item (key(item))}
					<li class={subgrid}>
						{@render row(item)}
					</li>
				{/each}
			</ul>
		</li>
	{/each}
</ul>
