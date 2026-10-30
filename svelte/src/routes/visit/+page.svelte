<script>
	import ExhibitionMap from '$lib/components/edition/ExhibitionMap.svelte';
	import Modules from '$lib/components/modules/Modules.svelte';

	let { data } = $props();

	// One run of modules, so the editions and news space like the rest: the
	// landing's own, then each edition's Visit Info and map, then the news
	let modules = $derived([
		...(data.landing?.modules ?? []),
		...data.editions.flatMap((edition) => [
			...(edition.visitModules ?? []),
			{ _type: 'editionMap', _key: `${edition._id}-map`, edition }
		]),
		{ _type: 'newsModule', _key: 'news', ...data.news }
	]);
</script>

<h1 class="sr-only">{data.navTitle}</h1>

<Modules {modules}>
	{#snippet custom({ edition })}
		<ExhibitionMap
			artworks={edition.artworks}
			text={edition.mapText}
			href="/editions/{edition.slug}"
			heading="Desert X {edition.location} Exhibition Map"
		/>
	{/snippet}
</Modules>
