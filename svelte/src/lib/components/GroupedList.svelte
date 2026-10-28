<script>
	/**
	 * Groups as rows on the 12-column grid, as the artworks list and search
	 * results show them: each group's `name` (an artist, or Editions, Pages
	 * or News) across 3 columns, and its `items` stacked beside it on a
	 * 9-column subgrid, each drawn by `row` and keyed by `key`.
	 */
	let { groups, row, key = (item) => item.key } = $props();
</script>

<ul>
	{#each groups as group, index (index)}
		<li class="grid grid-cols-12 gap-x-base">
			<p class="col-span-3">{group.name}</p>
			<ul class="col-span-9 grid grid-cols-subgrid">
				{#each group.items as item (key(item))}
					<li class="col-span-9 grid grid-cols-subgrid">{@render row(item)}</li>
				{/each}
			</ul>
		</li>
	{/each}
</ul>
