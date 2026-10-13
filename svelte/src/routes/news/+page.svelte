<script>
	import NewsFilter from '$lib/components/news/NewsFilter.svelte';
	import NewsTile from '$lib/components/news/NewsTile.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	let { data } = $props();
</script>

<h1 class="sr-only">{data.navTitle}</h1>

<div class="pt-page-top pb-page-bottom text-md">
	<NewsFilter filter={data.filter} locations={data.locations} />

	{#if data.items.length}
		<ul class="mt-[8rem] grid grid-cols-3 gap-[2.5rem] px-gutter">
			{#each data.items as item (item._id)}
				<li>
					<NewsTile
						{item}
						generalPalette={data.landing?.generalPalette}
						sizes="calc((100vw - 18.6rem) / 3)"
					/>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="mt-[8rem] px-gutter">No news yet.</p>
	{/if}

	<Pagination page={data.page} pageCount={data.pageCount} class="mt-[5rem]" />
</div>
