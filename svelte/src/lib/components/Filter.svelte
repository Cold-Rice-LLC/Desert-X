<script>
	import Choice from '$lib/components/Choice.svelte';

	/**
	 * "All / Filter" over a list. All goes to `allHref`, clearing the
	 * filters; Filter shows two `groups` of options as links, each `{ key,
	 * label, href, current }`: in one row from md up, and on phones a line
	 * each, the first down the left half of the page and the second down
	 * the right, as the News landing's General and locations, or the Art
	 * landing's locations and years. Open while a filter is on (`active`).
	 * `label` names the <nav>, and `class` goes on it.
	 */
	let { label, allHref, groups, active, class: className } = $props();

	// Only where it starts: the visitor opens and closes it from there
	// svelte-ignore state_referenced_locally
	let open = $state(active);

	const optionsId = $props.id();
</script>

<nav aria-label={label} class={['space-y-line px-gutter text-title md:text-md', className]}>
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
			<ul class="md:contents">{@render items(groups[1])}</ul>
		</div>
	{/if}
</nav>
