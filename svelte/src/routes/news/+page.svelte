<script>
	import Filter from '$lib/components/Filter.svelte';
	import LoadMore from '$lib/components/LoadMore.svelte';
	import NewsGrid from '$lib/components/news/NewsGrid.svelte';

	let { data } = $props();

	// General, then each location, one at a time
	let filters = $derived(
		[{ title: 'General', slug: 'general' }, ...data.locations].map(({ title, slug }) => ({
			key: slug,
			label: title,
			href: `/news?filter=${slug}`,
			current: slug === data.filter
		}))
	);
</script>

<h1 class="sr-only">{data.navTitle}</h1>

<div class="pt-page-top pb-page-bottom text-md">
	<Filter label="News filters" allHref="/news" options={filters} active={!!data.filter} />

	{#if data.items.length}
		<NewsGrid items={data.items} generalPalette={data.landing?.generalPalette} class="mt-lg" />
	{:else}
		<p class="mt-lg px-gutter">No news yet.</p>
	{/if}

	<LoadMore page={data.page} pageCount={data.pageCount} class="mt-md" />
</div>
