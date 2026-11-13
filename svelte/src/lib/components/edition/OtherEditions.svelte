<script>
	import { page } from '$app/state';
	import { editionImages } from '$lib/art';
	import { preloadGallery } from '$lib/carousel';
	import { formatDateRange } from '$lib/dates';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import EditionContent from '$lib/components/edition/EditionContent.svelte';
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import { showUnderNav } from '$lib/ui.svelte.js';
	import { replaceQuery } from '$lib/url';

	/**
	 * The location's other editions as dropdowns, one open at a time, each
	 * titled with its year and location, and its dates from md up, ruled
	 * underneath while closed. Opening one shows the edition as its own page
	 * does, on phones twice as far below the title as a page's gallery sits
	 * below the nav (the two margins collapse into the larger). Its content is
	 * only built while open, so closed ones load no images and the carousel
	 * can measure itself. While the open one passes under the nav, the nav
	 * shows its year and location. They show no news (see EditionContent).
	 * Clicking one shut doesn't open it straight away: its gallery's first
	 * images load first, under a progress cursor, so it opens with them
	 * there rather than filling in (preloadGallery gives up after a few
	 * seconds). Find-in-page and Back open one at once.
	 *
	 * The open one is in the URL, as ?edition=its-slug, replacing the history
	 * entry rather than adding one: Back from a page linked inside it comes
	 * back with it open, so the scroll position it restores is the one left.
	 * Changing it is a navigation, which loads nothing: the page's data
	 * doesn't depend on it.
	 */
	let { editions } = $props();

	// The URL is the open one's only record, so Back, which restores it,
	// reopens it
	let openSlug = $derived(page.url.searchParams.get('edition'));

	// Only on a change: a dropdown open from the URL can report opening as
	// the page starts. Opening one closes another, which reports closing
	// too; the one opening sets the URL.
	const toggle = (slug, open) => {
		if (open === (openSlug === slug)) return;
		if (!open && document.querySelector('details[name="other-editions"][open]')) return;
		replaceQuery(page.url, { edition: open ? slug : null });
	};

	// The one whose images are loading before it opens
	let loading = $state(null);

	const openWhenLoaded = async (event, edition) => {
		if (openSlug === edition.slug) return;
		event.preventDefault();
		if (loading === edition.slug) return;
		loading = edition.slug;
		await preloadGallery(editionImages(edition));
		// Unless another was clicked meanwhile
		if (loading !== edition.slug) return;
		loading = null;
		replaceQuery(page.url, { edition: edition.slug });
	};

	// The progress cursor everywhere while loading, the titles' pointer too
	$effect(() => {
		document.documentElement.classList.toggle('[&_*]:cursor-progress!', !!loading);
	});

	$effect(() => {
		const edition = editions.find(({ slug }) => slug === openSlug);
		if (!edition) return;
		return showUnderNav([
			{
				element: document.getElementById(`edition-${edition.slug}`),
				nav: { title: String(edition.year), detail: edition.location }
			}
		]);
	});
</script>

<section class="space-y-line">
	<ModuleHeading heading="Previous Exhibitions" />
	<div>
		{#each editions as edition (edition._id)}
			<Dropdown
				id="edition-{edition.slug}"
				name="other-editions"
				bind:open={() => openSlug === edition.slug, (open) => toggle(edition.slug, open)}
				onsummaryclick={(event) => openWhenLoaded(event, edition)}
				summaryClass="mx-gutter border-b-2 group-open:border-transparent group-open:mb-[calc(2*var(--spacing-sm))] md:border-b-[0.25rem] md:group-open:mb-0"
			>
				{#snippet summary()}
					<span class="flex gap-x-[0.8em]">
						<span>{edition.year}</span>
						<span>{edition.location}</span>
						<span class="hidden md:inline">
							{formatDateRange(edition.startDate, edition.endDate, { short: true })}
						</span>
					</span>
				{/snippet}
				{#if openSlug === edition.slug}
					<EditionContent {edition} headingLevel={3} class="pb-2xl" />
				{/if}
			</Dropdown>
		{/each}
	</div>
</section>
