<script>
	import Choice from '$lib/components/Choice.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import Modules from '$lib/components/modules/Modules.svelte';
	import { page } from '$app/state';
	import { artworkCredit } from '$lib/art';
	import { queryHref } from '$lib/url';

	let { data } = $props();

	// ES is the same page at ?lang=es, so it can be linked to; an artwork
	// with no Spanish stays English and offers no choice
	let spanish = $derived(page.url.searchParams.get('lang') === 'es' && data.spanish);
	let artwork = $derived(spanish ? { ...data.artwork, ...spanish } : data.artwork);

	// Its exhibition, "Coachella Valley 2023", linked when it has a page
	let exhibition = $derived.by(() => {
		const { location, year, slug } = data.artwork.edition ?? {};
		return slug && [location, year].filter(Boolean).join(' ');
	});

	// For images with no alt text of their own, in English as the gallery's
	// alt text is, though its captions follow the language: "Bloom by
	// Bahraini-Danish"
	let alt = $derived([data.artwork.title, data.artwork.credit].filter(Boolean).join(' by '));

	// Previous and Next keep the query, so they stay among the same
	// artworks (see the load) and in the same language
	const neighbourLink = (artwork) => ({
		href: `/art/${artwork.slug}${page.url.search}`,
		name: [artwork.title, artworkCredit(artwork)].filter(Boolean).join(' by ')
	});
	let previous = $derived(data.neighbours && neighbourLink(data.neighbours.previous));
	let next = $derived(data.neighbours && neighbourLink(data.neighbours.next));
</script>

<!-- Keyed, so moving to another artwork starts its carousel afresh -->
{#key data.artwork._id}
	{#if data.artwork.images?.length}
		<Gallery images={artwork.images} {alt} />
	{/if}
{/key}
<Modules modules={artwork.modules} lang={spanish ? 'es' : undefined}>
	<!-- Spaced like a text module, so text straight after sits a line below -->
	<header class="text-module grid gap-y-line px-module md:grid-cols-2">
		{#if data.spanish}
			<!-- Swapped in place: no jump to the top, no history entry -->
			<p
				role="group"
				aria-label="Language"
				class="md:col-span-2"
				data-sveltekit-noscroll
				data-sveltekit-replacestate
				data-sveltekit-keepfocus
			>
				<Choice
					current={!spanish}
					href={queryHref(page.url, { lang: null })}
					hreflang="en"
					lang="en"
					aria-label="English">EN</Choice
				>
				/
				<Choice
					current={Boolean(spanish)}
					href={queryHref(page.url, { lang: 'es' })}
					hreflang="es"
					lang="es"
					aria-label="Español">ES</Choice
				>
			</p>
		{/if}
		<!-- Clear of the credit beside it from md up -->
		<h1 class="md:pr-gutter">
			<span class="italic">{artwork.title}</span>{#if exhibition},
				<a href="/exhibitions/{data.artwork.edition.slug}" class="link-fade">{exhibition}</a>{/if}
		</h1>
		{#if artwork.credit || artwork.artistInfo}
			<p class="whitespace-pre-line">
				{[artwork.credit, artwork.artistInfo].filter(Boolean).join('\n')}
			</p>
		{/if}
	</header>

	{#snippet footer()}
		{#if previous && next}
			<nav aria-label="Artworks" class="flex justify-between gap-x-edge px-module text-title md:justify-start md:text-md">
				<a
					href={previous.href}
					rel="prev"
					aria-label="Previous: {previous.name}"
					class="link-underline">Prev Art</a
				>
				<a href={next.href} rel="next" aria-label="Next: {next.name}" class="link-underline"
					>Next Art</a
				>
			</nav>
		{/if}
	{/snippet}
</Modules>
