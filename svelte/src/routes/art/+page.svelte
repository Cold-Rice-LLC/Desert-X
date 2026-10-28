<script>
	import { page as currentPage } from '$app/state';
	import Choice from '$lib/components/Choice.svelte';
	import ArtGrid from '$lib/components/art/ArtGrid.svelte';
	import ArtList from '$lib/components/art/ArtList.svelte';
	import ArtworksBar from '$lib/components/art/ArtworksBar.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import Portable from '$lib/components/Portable.svelte';
	import SearchField from '$lib/components/SearchField.svelte';
	import { queryHref, replaceQuery } from '$lib/url';

	let { data } = $props();

	// Changing what's shown starts again from the first page
	const href = (changes) => queryHref(currentPage.url, { page: null, ...changes });

	// Typing replaces the history entry rather than adding one per letter
	const search = (event) =>
		replaceQuery(currentPage.url, { page: null, q: event.currentTarget.value });
</script>

<h1 class="sr-only">{data.navTitle}</h1>

<div class="pt-page-top pb-page-bottom text-md">
	<header class="mb-md px-gutter">
		{#if data.landing?.intro}
			<Portable value={data.landing.intro} />
		{/if}

		<nav aria-label="Artwork views" class="mt-line uppercase">
			<Choice href={href({ view: null })} current={data.view === 'grid'}>Grid</Choice>
			/
			<Choice href={href({ view: 'list' })} current={data.view === 'list'}>List</Choice>
		</nav>

		<SearchField value={data.query} label="Search artworks" oninput={search} class="mt-lg" />

		<ArtworksBar
			sort={data.sort}
			sortHref={(sort) => href({ sort: sort === 'artist' ? null : sort })}
			class="mt-2xl"
		/>
	</header>

	{#if !data.entries.length}
		<p class="px-gutter">No artworks found.</p>
	{:else if data.view === 'list'}
		<ArtList entries={data.entries} sort={data.sort} />
	{:else}
		<ArtGrid entries={data.entries} />
		<Pagination page={data.page} pageCount={data.pageCount} class="mt-md" />
	{/if}
</div>
