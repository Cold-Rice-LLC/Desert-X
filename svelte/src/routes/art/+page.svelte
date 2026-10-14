<script>
	import { goto } from '$app/navigation';
	import { page as currentPage } from '$app/state';
	import ArtGrid from '$lib/components/art/ArtGrid.svelte';
	import ArtList from '$lib/components/art/ArtList.svelte';
	import ArtworksBar from '$lib/components/art/ArtworksBar.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import Portable from '$lib/components/Portable.svelte';
	import SearchField from '$lib/components/SearchField.svelte';
	import { queryHref } from '$lib/url';

	let { data } = $props();

	// Changing what's shown starts again from the first page
	const href = (changes) => queryHref(currentPage.url, { page: null, ...changes });

	// Typing replaces the history entry rather than adding one per letter
	const search = (event) =>
		goto(href({ q: event.currentTarget.value }), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
</script>

<h1 class="sr-only">{data.navTitle}</h1>

<div class="pt-page-top pb-page-bottom text-md">
	<header class="mb-md px-gutter">
		{#if data.landing?.intro}
			<Portable value={data.landing.intro} />
		{/if}

		<nav aria-label="Artwork views" class="mt-line uppercase">
			<a
				href={href({ view: null })}
				class={[data.view === 'grid' && 'link-underline']}
				aria-current={data.view === 'grid' ? 'page' : undefined}>Grid</a
			>
			/
			<a
				href={href({ view: 'list' })}
				class={[data.view === 'list' && 'link-underline']}
				aria-current={data.view === 'list' ? 'page' : undefined}>List</a
			>
		</nav>

		<SearchField value={data.query} label="Search artworks" oninput={search} class="mt-lg" />

		<ArtworksBar
			count={data.count}
			descending={data.descending}
			sortHref={href({ sort: data.descending ? null : 'desc' })}
			class="mt-2xl"
		/>
	</header>

	{#if !data.entries.length}
		<p class="px-gutter">No artworks found.</p>
	{:else if data.view === 'list'}
		<ArtList entries={data.entries} />
	{:else}
		<ArtGrid entries={data.entries} />
		<Pagination page={data.page} pageCount={data.pageCount} class="mt-md" />
	{/if}
</div>
