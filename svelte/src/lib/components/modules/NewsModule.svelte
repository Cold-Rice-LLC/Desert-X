<script>
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import NewsGrid from '$lib/components/news/NewsGrid.svelte';

	/**
	 * A "News" heading, which editors can't change, up to three news tiles
	 * and a link to the News landing. Pages pick the latest or a selection; news
	 * articles add one of related news to their own end.
	 */
	let { module } = $props();
</script>

{#if module.items?.length}
	<div>
		<ModuleHeading heading="News" />
		<NewsGrid items={module.items} generalPalette={module.generalPalette} class="mt-line" />
		<p class="mt-base px-gutter">
			Read more <a href="/news" class="link-underline">{module.landingTitle || 'News'}</a>
		</p>
	</div>
{/if}
