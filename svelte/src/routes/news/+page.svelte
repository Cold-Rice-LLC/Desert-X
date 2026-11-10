<script>
	import Filter from '$lib/components/Filter.svelte';
	import LoadMore from '$lib/components/LoadMore.svelte';
	import NewsGrid from '$lib/components/news/NewsGrid.svelte';

	let { data } = $props();

	// General, then each location, one at a time: on phones General down
	// the left half and the locations down the right
	const filter = ({ title, slug }) => ({
		key: slug,
		label: title,
		href: `/news?filter=${slug}`,
		current: slug === data.filter
	});
	let filters = $derived([
		[filter({ title: 'General', slug: 'general' })],
		data.locations.map(filter)
	]);
</script>

<h1 class="sr-only">{data.navTitle}</h1>

<!-- Announces how many match as the filter changes; screen readers skip what
     it says on load -->
<p role="status" class="sr-only">{data.total} {data.total === 1 ? 'item' : 'items'}</p>

<div class="pt-page-top pb-page-bottom text-md">
	<Filter label="News filters" allHref="/news" groups={filters} active={!!data.filter} />

	{#if data.items.length}
		<NewsGrid
			items={data.items}
			generalPalette={data.landing?.generalPalette}
			eager
			class="mt-lg"
		/>
	{:else}
		<p class="mt-lg px-gutter">No news yet.</p>
	{/if}

	<LoadMore page={data.page} pageCount={data.pageCount} class="mt-md" />
</div>
