<script>
	import { goto } from '$app/navigation';
	import { page as currentPage } from '$app/state';
	import Portable from '$lib/components/Portable.svelte';
	import SearchField from '$lib/components/SearchField.svelte';
	import SearchResults from '$lib/components/SearchResults.svelte';
	import { queryHref } from '$lib/url';

	let { data } = $props();

	// Typing replaces the history entry rather than adding one per letter
	const search = (event) =>
		goto(queryHref(currentPage.url, { q: event.currentTarget.value }), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
</script>

<h1 class="sr-only">{data.navTitle}</h1>

<main class="px-gutter pt-page-top pb-page-bottom text-md">
	{#if data.landing?.intro}
		<Portable value={data.landing.intro} />
	{/if}

	<SearchField value={data.query} label="Search the site" oninput={search} class="mt-lg" />

	{#if data.groups}
		<SearchResults
			groups={data.groups}
			count={data.count}
			query={data.query}
			clearHref={queryHref(currentPage.url, { q: null })}
			class="mt-2xl"
		/>
	{/if}
</main>
