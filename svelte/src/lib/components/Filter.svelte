<script>
	import { MediaQuery } from 'svelte/reactivity';
	import Choice from '$lib/components/Choice.svelte';

	/**
	 * "All / Filter" over a list. From md up All goes to `allHref`,
	 * clearing the filter; on phones it only says what's shown, All or the
	 * choice. Filter shows two `groups` of options as links, each `{ key,
	 * label, href, current }`, one current at most: in one row from md up,
	 * and on phones a line each, the first down the left half of the page
	 * and the second down the right, as the News landing's General and
	 * locations, or the Art landing's locations and years.
	 * From md up the options stay open while a filter is on (`active`). On
	 * phones they close once one is chosen, and the choice, as it's written
	 * rather than in capitals, takes All's place; choosing it again clears
	 * it. While a filter is on, Filter is the one underlined, open or not.
	 * `label` names the <nav>, and `class` goes on it.
	 */
	let { label, allHref, groups, active, class: className } = $props();

	// Open or not on phones and from md up apart, so each renders right
	// from the server; only where they start, as the visitor opens and
	// closes them from there
	// svelte-ignore state_referenced_locally
	let openWide = $state(active);
	let openNarrow = $state(false);
	const wide = new MediaQuery('width >= 48rem');

	let selected = $derived(groups.flat().find((option) => option.current));

	const toggle = () => {
		if (wide.current) openWide = !openWide;
		else openNarrow = !openNarrow;
	};

	const optionsId = $props.id();
</script>

<nav aria-label={label} class={['space-y-line px-gutter text-title md:text-md', className]}>
	<p class="uppercase">
		<!-- On phones only a record of what's shown, as the options clear it -->
		<span
			class={['md:hidden', !openNarrow && !active && 'link-current', selected && 'normal-case']}
		>
			{selected?.label ?? 'All'}
		</span>
		<a
			href={allHref}
			class={['max-md:hidden', openWide || active ? 'link-fade' : 'link-current']}
			onclick={() => (openWide = false)}>All</a
		>
		/
		<button
			class={[
				openNarrow || active ? 'max-md:link-current' : 'max-md:link-fade',
				openWide || active ? 'md:link-current' : 'md:link-fade'
			]}
			aria-expanded={wide.current ? openWide : openNarrow}
			aria-controls={optionsId}
			onclick={toggle}
		>
			Filter
		</button>
	</p>
	{#snippet items(options)}
		{#each options as option (option.key)}
			<li>
				<Choice href={option.href} current={option.current} onclick={() => (openNarrow = false)}
					>{option.label}</Choice
				>
			</li>
		{/each}
	{/snippet}
	{#if openWide || openNarrow}
		<!-- From md up the lists give way, so their items share one row -->
		<div
			id={optionsId}
			class={[
				'grid grid-cols-2',
				!openNarrow && 'max-md:hidden',
				openWide ? 'md:flex md:flex-wrap md:gap-x-[0.45em]' : 'md:hidden'
			]}
		>
			<ul class="md:contents">{@render items(groups[0])}</ul>
			<ul class="md:contents">{@render items(groups[1])}</ul>
		</div>
	{/if}
</nav>
