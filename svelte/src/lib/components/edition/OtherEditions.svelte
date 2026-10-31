<script>
	import { page } from '$app/state';
	import { formatDateRange } from '$lib/dates';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import EditionContent from '$lib/components/edition/EditionContent.svelte';
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import { ui } from '$lib/ui.svelte.js';
	import { replaceQuery } from '$lib/url';

	/**
	 * The location's other editions as dropdowns, one open at a time, each
	 * titled with its year and location, and its dates from md up. Opening
	 * one shows the edition as its own page does, with a link to that page,
	 * and on phones twice as far below the title as a page's gallery sits
	 * below the nav (the two margins collapse into the larger). Its content is
	 * only built while open, so closed ones load no images and the carousel
	 * can measure itself. While the open one passes under the nav, the nav
	 * shows its year and location. `news` passes to EditionContent.
	 *
	 * The open one is in the URL, as ?edition=its-slug, replacing the history
	 * entry rather than adding one: Back from a page linked inside it comes
	 * back with it open, so the scroll position it restores is the one left.
	 * Changing it is a navigation, which loads nothing: the page's data
	 * doesn't depend on it.
	 */
	let { editions, news } = $props();

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

	$effect(() => {
		const edition = editions.find(({ slug }) => slug === openSlug);
		if (!edition) return;
		const details = document.getElementById(`edition-${edition.slug}`);
		const root = getComputedStyle(document.documentElement);
		const navBottom =
			parseFloat(root.getPropertyValue('--spacing-nav')) * parseFloat(root.fontSize);
		let under = false;

		const update = () => {
			const { top, bottom } = details.getBoundingClientRect();
			if (under === (top <= navBottom && bottom > navBottom)) return;
			under = !under;
			ui.nav = under ? { title: String(edition.year), detail: edition.location } : null;
		};
		update();
		addEventListener('scroll', update, { passive: true });
		addEventListener('resize', update);
		return () => {
			removeEventListener('scroll', update);
			removeEventListener('resize', update);
			if (under) ui.nav = null;
		};
	});
</script>

<section class="space-y-line">
	<ModuleHeading heading="Other Editions" />
	<div>
		{#each editions as edition (edition._id)}
			<Dropdown
				id="edition-{edition.slug}"
				name="other-editions"
				bind:open={() => openSlug === edition.slug, (open) => toggle(edition.slug, open)}
				summaryClass="mx-gutter border-b-2 group-open:mb-[calc(2*var(--spacing-sm))] md:border-b-[0.25rem] md:group-open:mb-0"
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
					<EditionContent {edition} {news}>
						<p class="px-gutter pb-2xl">
							<a href="/editions/{edition.slug}" class="link-underline">
								View {edition.location}
								{edition.year}
							</a>
						</p>
					</EditionContent>
				{/if}
			</Dropdown>
		{/each}
	</div>
</section>
