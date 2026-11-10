<script>
	import Choice from '$lib/components/Choice.svelte';

	/**
	 * "All / Filter" over a list. All goes to `allHref`, clearing the
	 * filters; Filter shows two `groups` of options as links, each `{ key,
	 * label, href, current }`: in one row from md up, and on phones a line
	 * each, the first down the left half of the page and the second down
	 * the right, as the News landing's General and locations. With
	 * `quarters` the second runs down then across its two quarters, as the
	 * Art landing's years. Halves and quarters are of the page, not between
	 * the gutters, so the last quarter is a gutter narrower. Open while a
	 * filter is on (`active`). `label` names the <nav>, and `class` goes on
	 * it.
	 */
	let { label, allHref, groups, quarters = false, active, class: className } = $props();

	// Only where it starts: the visitor opens and closes it from there
	// svelte-ignore state_referenced_locally
	let open = $state(active);

	const optionsId = $props.id();
</script>

<!-- On phones in the title size, or as large as fits the Art landing's
     years in their quarters -->
<nav
	aria-label={label}
	class={[
		'space-y-line px-gutter text-[length:min(var(--text-title),(100vw-2*var(--spacing-edge))/10)] md:text-md',
		className
	]}
>
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
	{#snippet items(options)}
		{#each options as option (option.key)}
			<li>
				<Choice href={option.href} current={option.current}>{option.label}</Choice>
			</li>
		{/each}
	{/snippet}
	{#if open}
		<!-- From md up the lists give way, so their items share one row -->
		<div id={optionsId} class="grid grid-cols-2 md:flex md:flex-wrap md:gap-x-[0.45em]">
			<ul class="md:contents">{@render items(groups[0])}</ul>
			{#if quarters}
				<!-- Its first column is a quarter of the page: a quarter of the
				     gutters' width plus half a gutter, in this half of it -->
				<ul
					class="grid grid-flow-col grid-cols-[calc(50%+var(--spacing-gutter)/2)_1fr] md:contents"
					style:grid-template-rows="repeat({Math.ceil(groups[1].length / 2)}, auto)"
				>
					{@render items(groups[1])}
				</ul>
			{:else}
				<ul class="md:contents">{@render items(groups[1])}</ul>
			{/if}
		</div>
	{/if}
</nav>
