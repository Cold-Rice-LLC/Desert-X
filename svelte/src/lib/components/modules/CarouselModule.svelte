<script>
	import Gallery from '$lib/components/Gallery.svelte';

	/**
	 * The carousel from the top of an artwork or edition page (see Gallery),
	 * as a module: one image on its own, more sliding, each with its caption
	 * under it from md up.
	 */
	let { module } = $props();
</script>

{#if module.images?.length}
	<Gallery images={module.images} />
{/if}
