<script>
	/** A module's optional heading: centred, in capitals. */
	let { heading } = $props();
</script>

{#if heading}
	<h2 class="text-center uppercase">{heading}</h2>
{/if}
