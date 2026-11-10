<script>
	import GroupedList from '$lib/components/GroupedList.svelte';
	import { newTabAttributes } from '$lib/sanity/links';

	/**
	 * Search results under "25 Results / Clear", stacked on phones, the link
	 * clearing the search (`clearHref`). From md up each group is a row
	 * (see GroupedList): its name, an artist or Editions, Pages or News,
	 * and its rows beside it, each title across 6 columns with its link,
	 * e.g. "View artwork", at the end, the whole row one link. Phones have
	 * the rows as running text, an artwork's title in italics after its
	 * artist ("Name, *Title*"), wrapped lines hanging one column of 12 in.
	 * Press opens in a new tab. `class` goes on the section.
	 */
	let { groups, count, query, clearHref, class: className } = $props();
</script>

{#snippet row(item)}
	<!-- The indent's padding is a share of the list's width, but text-indent
	     one of the row's own, a twelfth narrower: 1/11 of that is 1/12 -->
	<svelte:element
		this={item.href ? 'a' : 'p'}
		{...item.href && { href: item.href, ...(item.external && newTabAttributes) }}
		class={[
			'block pl-[calc(100%/12)] -indent-[calc(100%/11)] md:col-span-9 md:grid md:grid-cols-subgrid md:pl-0 md:indent-0',
			item.href && 'link-fade'
		]}
	>
		{#if item.artist}<span class="md:hidden">{`${item.artist}, `}</span>{/if}<span
			class={['md:col-span-6', item.artist && 'italic md:not-italic']}>{item.title}</span
		>
		{#if item.href}<span class="hidden md:col-span-3 md:block">{item.action}</span>{/if}
		{#if item.external}<span class="sr-only">(opens in new tab)</span>{/if}
	</svelte:element>
{/snippet}

<section aria-label="Search results" class={['space-y-line md:space-y-md', className]}>
	<!-- Stacked on phones, where the two don't fit on one line at this size -->
	<div class="uppercase">
		<h2 class="md:inline">{count} {count === 1 ? 'Result' : 'Results'}</h2>
		<span class="hidden md:inline">/</span>
		<a href={clearHref} class="link-underline">Clear</a>
	</div>

	{#if groups.length}
		<GroupedList {groups} {row} flatOnPhones />
	{:else}
		<p>No results for “{query.trim()}”.</p>
	{/if}
</section>
