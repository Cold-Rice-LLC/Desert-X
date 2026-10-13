<script>
	import NewsFilter from '$lib/components/news/NewsFilter.svelte';
	import NewsGrid from '$lib/components/news/NewsGrid.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	let { data } = $props();
</script>

<h1 class="sr-only">{data.navTitle}</h1>

<div class="pt-page-top pb-page-bottom text-md">
	<NewsFilter filter={data.filter} locations={data.locations} />

	{#if data.items.length}
		<NewsGrid items={data.items} generalPalette={data.landing?.generalPalette} class="mt-[8rem]" />
	{:else}
		<p class="mt-[8rem] px-gutter">No news yet.</p>
	{/if}

	<Pagination page={data.page} pageCount={data.pageCount} class="mt-[5rem]" />
</div>
