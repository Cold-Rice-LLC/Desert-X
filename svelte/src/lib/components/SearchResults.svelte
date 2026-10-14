<script>
	/**
	 * Search results under a row of the count, "Search Results" and a link
	 * clearing the search (`clearHref`). Each group is a row on the 12-column
	 * grid, as in the artworks list: its name (an artist, or Editions, Pages
	 * or News) across 3 columns, and its rows stacked beside it, each title
	 * across 6 and its link at the end. The title links there too, kept out
	 * of the tab order so each result is one stop. Press opens in a new tab.
	 * `class` goes on the section.
	 */
	let { groups, count, query, clearHref, class: className } = $props();
</script>

<section aria-label="Search results" class={['space-y-md', className]}>
	<div class="grid grid-cols-3">
		<p>({count})</p>
		<h2 class="text-center uppercase">Search Results</h2>
		<a href={clearHref} class="justify-self-end link-underline">Clear</a>
	</div>

	{#if groups.length}
		<ul>
			{#each groups as group (group.key)}
				<li class="grid grid-cols-12 gap-x-base">
					<p class="col-span-3">{group.name}</p>
					<ul class="col-span-9 grid grid-cols-subgrid">
						{#each group.rows as row (row.key)}
							{@const target = row.external ? '_blank' : undefined}
							{@const rel = row.external ? 'noopener' : undefined}
							<li class="col-span-9 grid grid-cols-subgrid">
								{#if row.href}
									<a href={row.href} {target} {rel} tabindex="-1" class="col-span-6">{row.title}</a>
									<a href={row.href} {target} {rel} class="col-span-3">{row.action}</a>
								{:else}
									<p class="col-span-6">{row.title}</p>
								{/if}
							</li>
						{/each}
					</ul>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No results for “{query.trim()}”.</p>
	{/if}
</section>
