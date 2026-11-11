<script>
	import { isLocated } from '$lib/art';
	import ExhibitionMap from '$lib/components/edition/ExhibitionMap.svelte';
	import Modules from '$lib/components/modules/Modules.svelte';
	import { showUnderNav } from '$lib/ui.svelte.js';

	let { data } = $props();

	// Editions with Visit Info or a map to show; an edition without either
	// would leave an empty run
	let editions = $derived(
		data.editions.filter(
			(edition) => edition.visitModules?.length || edition.artworks?.some(isLocated)
		)
	);

	// One run of modules, so the editions and news space like the rest: the
	// landing's own, then each edition as a run of its own, its Visit Info
	// and map, then the news
	let modules = $derived([
		...(data.landing?.modules ?? []),
		...editions.map((edition) => ({
			_type: 'visitEdition',
			_key: edition._id,
			edition,
			modules: [
				...(edition.visitModules ?? []),
				{ _type: 'editionMap', _key: `${edition._id}-map`, edition }
			]
		})),
		{ _type: 'newsModule', _key: 'news', ...data.news }
	]);

	// While an edition passes under the nav, the nav shows its location
	// after the page's title, so it's clear whose information is in view
	$effect(() =>
		showUnderNav(
			editions.map((edition) => ({
				element: document.getElementById(`visit-${edition.slug}`),
				nav: { title: data.navTitle, detail: edition.location }
			}))
		)
	);
</script>

<h1 class="sr-only">{data.navTitle}</h1>

<Modules {modules}>
	{#snippet custom(module)}
		{#if module._type === 'visitEdition'}
			<Modules modules={module.modules} nested id="visit-{module.edition.slug}">
				{#snippet custom({ edition })}
					<ExhibitionMap
						artworks={edition.artworks}
						text={edition.mapText}
						href="/exhibitions/{edition.slug}"
						heading="DESERT X {edition.location} Exhibition Map"
					/>
				{/snippet}
			</Modules>
		{/if}
	{/snippet}
</Modules>
