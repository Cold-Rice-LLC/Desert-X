<script>
	/**
	 * "All / Filter" over the news grid. All clears the filter; Filter shows
	 * General and each location as links, one active at a time. Open while
	 * a filter is on.
	 */
	let { filter, locations } = $props();

	let open = $state(!!filter);
	let options = $derived([
		{ value: 'general', label: 'General' },
		...locations.map(({ title, slug }) => ({ value: slug, label: title }))
	]);
</script>

<nav aria-label="News filters" class="space-y-line px-gutter">
	<p class="uppercase">
		<a href="/news" class={[!open && 'link-underline']} onclick={() => (open = false)}>All</a>
		/
		<button class={[open && 'link-underline']} aria-expanded={open} onclick={() => (open = !open)}>
			Filter
		</button>
	</p>
	{#if open}
		<ul class="flex flex-wrap gap-x-[0.45em]">
			{#each options as option (option.value)}
				<li>
					<a
						href="/news?filter={option.value}"
						class={[option.value === filter && 'link-underline']}
						aria-current={option.value === filter ? 'page' : undefined}
					>
						{option.label}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</nav>
