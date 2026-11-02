<script>
	/**
	 * A module's optional heading: centred, in capitals. An h2 unless `level`
	 * says otherwise, as for an edition opened under Other Editions' own h2.
	 */
	let { heading, level = 2 } = $props();
</script>

{#if heading}
	<svelte:element this={`h${level}`} class="text-center uppercase">{heading}</svelte:element>
{/if}
