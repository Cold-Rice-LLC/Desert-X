<script>
	import { page } from '$app/state';
	import { urlFor } from '$lib/sanity/client';

	/**
	 * The head tags for search engines and shared links, from the page's
	 * `seo` (see pageSeo), falling back to Site Settings (`defaults`). Titles
	 * read "Page — Desert X"; a page with no title of its own, like the
	 * homepage, is the site's title alone. Descriptions are cut to about
	 * 160 characters, at a word, and share images cropped to 1200 × 630.
	 * Error pages, and any page whose `seo` says `noindex`, are kept out of
	 * search engines.
	 */
	let { defaults } = $props();

	const descriptionLength = 160;

	let seo = $derived(page.data.seo ?? {});
	let siteTitle = $derived(defaults?.siteTitle || 'Desert X');

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
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
	{/if}
	{#if page.error || seo.noindex}
		<meta name="robots" content="noindex" />
	{:else}
		<link rel="canonical" href={url} />
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
