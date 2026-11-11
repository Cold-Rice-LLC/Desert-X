<script>
	import { page } from '$app/state';
	import { urlFor } from '$lib/sanity/client';
	import { breadcrumbs, siteNodes } from '$lib/structuredData';

	/**
	 * The head tags for search engines and shared links, from the page's
	 * `seo` (see pageSeo), falling back to Menu, Footer & SEO (`defaults`). Titles
	 * read "Page — DESERT X"; a page with no title of its own, like the
	 * homepage, is the site's title alone. Descriptions are cut to about
	 * 160 characters, at a word, and share images cropped to 1200 × 630.
	 * Error pages, and any page whose `seo` says `noindex`, are kept out of
	 * search engines.
	 *
	 * Indexed pages also carry JSON-LD: the site's Organization and WebSite,
	 * a breadcrumb trail for a page whose nav links up a level (navHref),
	 * and the page's own nodes from its load (`structuredData`).
	 */
	let { defaults } = $props();

	const descriptionLength = 160;

	let seo = $derived(page.data.seo ?? {});
	let siteTitle = $derived(defaults?.siteTitle || 'DESERT X');

	let ownTitle = $derived.by(() => {
		if (page.error) return page.status === 404 ? 'Not Found' : 'Error';
		return seo.title || page.data.navTitle;
	});
	let title = $derived(ownTitle ? `${ownTitle} — ${siteTitle}` : siteTitle);

	let description = $derived.by(() => {
		const text = (seo.description || defaults?.description || '').replace(/\s+/g, ' ').trim();
		if (text.length <= descriptionLength) return text;
		return `${text.slice(0, descriptionLength).replace(/\s+\S*$/, '')}…`;
	});

	let image = $derived(seo.image?.asset ? seo.image : defaults?.image);
	let imageUrl = $derived(
		image?.asset && urlFor(image).width(1200).height(630).fit('crop').format('jpg').url()
	);

	// Without the query: ?page=, ?filter= and the like are the same page
	let url = $derived(page.url.origin + page.url.pathname);

	let indexed = $derived(!page.error && !seo.noindex);

	let structuredData = $derived.by(() => {
		const { origin } = page.url;
		const { navTitle, navHref } = page.data;
		const nodes = [
			...siteNodes({
				origin,
				siteTitle,
				description: defaults?.description,
				sameAs: defaults?.sameAs
			}),
			navHref &&
				ownTitle &&
				breadcrumbs([
					{ name: siteTitle, url: `${origin}/` },
					{ name: navTitle, url: origin + navHref },
					{ name: ownTitle, url }
				]),
			...[page.data.structuredData].flat()
		].filter(Boolean);
		// Escaped so no text inside can close the script. The tag is built
		// here, as a closing script tag in the markup would end this block.
		const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
		return `<script type="application/ld+json">${json.replace(/</g, '\\u003c')}</${'script'}>`;
	});
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
	{/if}
	{#if indexed}
		<link rel="canonical" href={url} />
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html structuredData}
	{:else}
		<meta name="robots" content="noindex" />
	{/if}
	<meta property="og:site_name" content={siteTitle} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	<meta property="og:url" content={url} />
	{#if imageUrl}
		<meta property="og:image" content={imageUrl} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta name="twitter:card" content="summary_large_image" />
	{/if}
</svelte:head>
