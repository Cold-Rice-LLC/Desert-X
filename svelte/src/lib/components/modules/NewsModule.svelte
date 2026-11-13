<script>
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import NewsGrid from '$lib/components/news/NewsGrid.svelte';

	/**
	 * A "News" heading, which editors can't change, news tiles (three, or
	 * an exhibition page's eight), in a row that scrolls sideways on phones
	 * and three across from md up, and a link to the News landing. Pages pick the latest or a selection; news articles add one of
	 * related news to their own end. `headingLevel` passes to the heading.
	 */
	let { module, headingLevel } = $props();
</script>

{#if module.items?.length}
	<div>
		<ModuleHeading heading="News" level={headingLevel} />
		<NewsGrid items={module.items} generalPalette={module.generalPalette} row class="mt-line" />
		<p class="mt-base px-gutter">
			Read more <a href="/news" class="link-underline">{module.landingTitle || 'News'}</a>
		</p>
	</div>
{/if}
