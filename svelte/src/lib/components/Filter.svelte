<script>
	import Choice from '$lib/components/Choice.svelte';

	/**
	 * "All / Filter" over a list. All goes to `allHref`, clearing the
	 * filters; Filter shows a row of `options` as links, each `{ key,
	 * label, href, current }`, or a line each on phones if `stacked`. Open while a filter is on (`active`).
	 * `label` names the <nav>, and `class` goes on it.
	 */
	let { label, allHref, options, active, stacked = false, class: className } = $props();

	// Only where it starts: the visitor opens and closes it from there
	// svelte-ignore state_referenced_locally
	let open = $state(active);

	const optionsId = $props.id();
</script>

<nav aria-label={label} class={['space-y-line px-gutter', className]}>
	<p class="uppercase">
		<a href={allHref} class={[open ? 'link-fade' : 'link-current']} onclick={() => (open = false)}
			>All</a
		>
		/
		<button
			class={[open ? 'link-current' : 'link-fade']}
			aria-expanded={open}
			aria-controls={optionsId}
			onclick={() => (open = !open)}
		>
			Filter
		</button>
	</p>
	{#if open}
		<ul id={optionsId} class={['flex flex-wrap gap-x-[0.45em]', stacked && 'flex-col md:flex-row']}>
			{#each options as option (option.key)}
				<li>
					<Choice href={option.href} current={option.current}>{option.label}</Choice>
				</li>
			{/each}
		</ul>
	{/if}
</nav>
