<script>
	/**
	 * "All / Filter" over a list, where All says what's shown: All, or the
	 * choice, as it's written rather than in capitals. Filter opens two
	 * `groups` of options as links, each `{ key, label, href, current }`,
	 * one current at most, led by an All that goes to `allHref`, clearing
	 * the filter (current while none is on): in one row from md up, and on
	 * phones a line each, the first down the left half of the page and the
	 * second down the right, as the News landing's General and locations,
	 * or the Art landing's locations and years. They close once one is
	 * chosen; choosing the current one again clears it.
	 * Filter is underlined while they're open or a filter is on (`active`);
	 * the options never are, the current one included, which is only
	 * marked as the current page.
	 * `label` names the <nav>, and `class` goes on it.
	 */
	let { label, allHref, groups, active, class: className } = $props();

	let open = $state(false);

	let selected = $derived(groups.flat().find((option) => option.current));
	let all = $derived({ key: 'all', label: 'All', href: allHref, current: !selected });

	const optionsId = $props.id();
</script>

<nav aria-label={label} class={['space-y-line px-gutter text-title md:text-md', className]}>
	<p class="uppercase">
		<span class={[selected && 'normal-case']}>{selected?.label ?? 'All'}</span>
		/
		<button
			class={open || active ? 'link-current' : 'link-fade'}
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
				<a
					href={option.href}
					aria-current={option.current ? 'page' : undefined}
					class="link-fade"
					onclick={() => (open = false)}>{option.label}</a
				>
			</li>
		{/each}
	{/snippet}
	{#if open}
		<!-- From md up the lists give way, so their items share one row -->
		<div id={optionsId} class="grid grid-cols-2 md:flex md:flex-wrap md:gap-x-[0.45em]">
			<ul class="md:contents">{@render items([all, ...groups[0]])}</ul>
			<ul class="md:contents">{@render items(groups[1])}</ul>
		</div>
	{/if}
</nav>
