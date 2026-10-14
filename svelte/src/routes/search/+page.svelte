<script>
	import Portable from '$lib/components/Portable.svelte';
	import SearchField from '$lib/components/SearchField.svelte';

	let { data } = $props();
</script>

<!-- UI only for now: submitting does nothing until search is built -->
<main class="px-gutter pt-page-top text-md">
	{#if data.landing?.intro}
		<Portable value={data.landing.intro} />
	{/if}

	<SearchField class="mt-lg" />
</main>
