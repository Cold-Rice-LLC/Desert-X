<script>
	/**
	 * "All / Filter" over a list, where All says what's shown: All, or the
	 * choice, as it's written rather than in capitals. Filter opens two
	 * `groups` of options as links, each `{ key, label, href, current }`,
	 * one current at most, led by an All that goes to `allHref`, clearing
	 * the filter (current while none is on): in one row from md up, and on
	 * phones a line each, the first down the left half of the page and the
	 * second down the right, as the News landing's General and Press and
	 * its locations, or the Art landing's locations and years. They close
	 * once one is chosen, which shows straight away as the label; choosing
	 * the current one again clears it (the `href` given should).
	 * Filter is underlined while they're open or a filter is on (`active`);
	 * the options never are, the current one included, which is only
	 * marked as the current page.
	 * `label` names the <nav>, and `class` goes on it.
	 */
	let { label, allHref, groups, active, class: className } = $props();

	let open = $state(false);

	// Set straight away on choosing, rather than once the page it goes to
	// has loaded, then put right by that page's `groups` and `active`
	let selected = $derived(groups.flat().find((option) => option.current));
	let filtered = $derived(active);
	let all = $derived({ key: 'all', label: 'All', href: allHref, current: !selected });

	// A click that opens the link elsewhere, as in a new tab, leaves this
	// page as it is
	const choose = (event, option) => {
		open = false;
		if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		selected = option.current || option.key === 'all' ? undefined : option;
		filtered = !!selected;
	};

	const optionsId = $props.id();
</script>

<nav aria-label={label} class={['space-y-line px-gutter text-title md:text-md', className]}>
	<p class="uppercase">
		<span class={[selected && 'normal-case']}>{selected?.label ?? 'All'}</span>
		/
		<button
			class={open || filtered ? 'link-current' : 'link-fade'}
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
					onclick={(event) => choose(event, option)}>{option.label}</a
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
