<script>
	import GroupedList from '$lib/components/GroupedList.svelte';
	import { newTabAttributes } from '$lib/sanity/links';

	/**
	 * Search results under "25 Results / Clear", the link clearing the search
	 * (`clearHref`). Each group is a row, as in the artworks list (see
	 * GroupedList): its name, an artist or Editions, Pages or News, and its
	 * rows beside it, each title across 6 columns and its link at the end,
	 * the whole row one link. Press opens in a new tab. `class` goes on the
	 * section.
	 */
	let { groups, count, query, clearHref, class: className } = $props();
</script>

{#snippet row(item)}
	{#if item.href}
		<a
			{...item.external && newTabAttributes}
			href={item.href}
			class="col-span-9 grid grid-cols-subgrid"
		>
			<span class="col-span-6">{item.title}</span>
			<span class="col-span-3">{item.action}</span>
		</a>
	{:else}
		<p class="col-span-6">{item.title}</p>
	{/if}
{/snippet}

<section aria-label="Search results" class={['space-y-md', className]}>
	<div class="uppercase">
		<h2 class="inline">{count} {count === 1 ? 'Result' : 'Results'}</h2>
		/
		<a href={clearHref} class="link-underline">Clear</a>
	</div>

	{#if groups.length}
		<GroupedList {groups} {row} />
	{:else}
		<p>No results for “{query.trim()}”.</p>
	{/if}
</section>
