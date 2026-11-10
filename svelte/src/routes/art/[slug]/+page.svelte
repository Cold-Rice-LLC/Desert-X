<script>
	import Choice from '$lib/components/Choice.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import Modules from '$lib/components/modules/Modules.svelte';
	import { page } from '$app/state';

	let { data } = $props();

	// ES is the same page at ?lang=es, so it can be linked to; an artwork
	// with no Spanish stays English and offers no choice
	let spanish = $derived(page.url.searchParams.get('lang') === 'es' && data.spanish);
	let artwork = $derived(spanish ? { ...data.artwork, ...spanish } : data.artwork);

	// For images with no alt text of their own, in English as the gallery
	// is: "Bloom by Bahraini-Danish"
	let alt = $derived([data.artwork.title, data.artwork.credit].filter(Boolean).join(' by '));
</script>

<!-- Keyed, so moving to another artwork starts its carousel afresh -->
{#key data.artwork._id}
	{#if data.artwork.images?.length}
		<Gallery images={data.artwork.images} {alt} />
	{/if}
{/key}
<Modules modules={artwork.modules} lead lang={spanish ? 'es' : undefined}>
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
					href={page.url.pathname}
					hreflang="en"
					lang="en"
					aria-label="English">EN</Choice
				>
				/
				<Choice
					current={Boolean(spanish)}
					href="?lang=es"
					hreflang="es"
					lang="es"
					aria-label="Español">ES</Choice
				>
			</p>
		{/if}
		<h1>{artwork.title}</h1>
		{#if artwork.credit || artwork.artistInfo}
			<p class="whitespace-pre-line">
				{[artwork.credit, artwork.artistInfo].filter(Boolean).join('\n')}
			</p>
		{/if}
	</header>
</Modules>
