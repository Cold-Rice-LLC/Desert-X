<script>
	import Choice from '$lib/components/Choice.svelte';

	/**
	 * "All / Filter" over a list. All goes to `allHref`, clearing the
	 * filters; Filter shows a row of `options` as links, each `{ key,
	 * label, href, current }`. Open while a filter is on (`active`). `label` names the <nav>, and `class` goes on it.
	 */
	let { label, allHref, options, active, class: className } = $props();

	// Only where it starts: the visitor opens and closes it from there
	// svelte-ignore state_referenced_locally
	let open = $state(active);
</script>

<nav aria-label={label} class={['space-y-line px-gutter', className]}>
	<p class="uppercase">
		<a href={allHref} class={[!open && 'link-underline']} onclick={() => (open = false)}>All</a>
		/
		<button class={[open && 'link-underline']} aria-expanded={open} onclick={() => (open = !open)}>
			Filter
		</button>
	</p>
	{#if open}
		<ul class="flex flex-wrap gap-x-[0.45em]">
			{#each options as option (option.key)}
				<li>
					<Choice href={option.href} current={option.current}>{option.label}</Choice>
				</li>
			{/each}
		</ul>
	{/if}
</nav>
