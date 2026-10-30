<script>
	import Choice from '$lib/components/Choice.svelte';

	/**
	 * "All / Filter" over the news grid. All clears the filter; Filter shows
	 * General and each location as links, one active at a time. Open while
	 * a filter is on.
	 */
	let { filter, locations } = $props();

	// Only where it starts: the visitor opens and closes it from there
	// svelte-ignore state_referenced_locally
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
					<Choice href="/news?filter={option.value}" current={option.value === filter}>
						{option.label}
					</Choice>
				</li>
			{/each}
		</ul>
	{/if}
</nav>
