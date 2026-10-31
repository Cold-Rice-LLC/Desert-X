<script>
	/**
	 * Groups as rows on the 12-column grid, as the artworks list and search
	 * results show them: each group's `name` (an artist, or Editions, Pages
	 * or News) across 4 columns on phones and 3 from md up, and its `items`
	 * stacked beside it on a subgrid of the rest, 8 columns or 9, each drawn
	 * by `row` and keyed by `key`.
	 */
	let { groups, row, key = (item) => item.key } = $props();
</script>

<ul>
	{#each groups as group, index (index)}
		<li class="grid grid-cols-12 gap-x-xs md:gap-x-base">
			<p class="col-span-4 md:col-span-3">{group.name}</p>
			<ul class="col-span-8 grid grid-cols-subgrid md:col-span-9">
				{#each group.items as item (key(item))}
					<li class="col-span-8 grid grid-cols-subgrid md:col-span-9">{@render row(item)}</li>
				{/each}
			</ul>
		</li>
	{/each}
</ul>
