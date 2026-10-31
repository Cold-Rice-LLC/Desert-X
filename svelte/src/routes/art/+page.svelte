<script>
	import { page as currentPage } from '$app/state';
	import Choice from '$lib/components/Choice.svelte';
	import ArtGrid from '$lib/components/art/ArtGrid.svelte';
	import ArtList from '$lib/components/art/ArtList.svelte';
	import Filter from '$lib/components/Filter.svelte';
	import LoadMore from '$lib/components/LoadMore.svelte';
	import Portable from '$lib/components/Portable.svelte';
	import SearchField from '$lib/components/SearchField.svelte';
	import { queryHref, replaceQuery } from '$lib/url';

	let { data } = $props();

	// Changing what's shown starts again from the first page
	const href = (changes) => queryHref(currentPage.url, { page: null, ...changes });

	// Typing replaces the history entry rather than adding one per letter
	const search = (event) =>
		replaceQuery(currentPage.url, { page: null, q: event.currentTarget.value });

	// A location and a year, one of each at a time; choosing the current
	// one again clears it
	const option = (param, value, label) => {
		const current = data[param] === String(value);
		return { key: value, label, href: href({ [param]: current ? null : value }), current };
	};
	let filters = $derived([
		...data.locations.map(({ slug, title }) => option('location', slug, title)),
		...data.years.map((year) => option('year', year, year))
	]);
</script>

<h1 class="sr-only">{data.navTitle}</h1>

<div class="pt-page-top pb-page-bottom text-md">
	<header class="px-gutter">
		{#if data.landing?.intro}
			<Portable value={data.landing.intro} />
		{/if}

		<nav aria-label="Artwork views" class="mt-line uppercase">
			<Choice href={href({ view: null })} current={data.view === 'grid'}>Grid</Choice>
			/
			<Choice href={href({ view: 'list' })} current={data.view === 'list'}>List</Choice>
		</nav>

		<SearchField value={data.query} label="Search artworks" oninput={search} class="mt-lg" />
	</header>

	<Filter
		label="Artwork filters"
		allHref={href({ location: null, year: null })}
		options={filters}
		active={!!(data.location || data.year)}
		stacked
		class="mt-2xl mb-md"
	/>

	{#if !data.entries.length}
		<p class="px-gutter">No artworks found.</p>
	{:else if data.view === 'list'}
		<ArtList entries={data.entries} />
	{:else}
		<ArtGrid entries={data.entries} />
		<LoadMore page={data.page} pageCount={data.pageCount} class="mt-md" />
	{/if}
</div>
