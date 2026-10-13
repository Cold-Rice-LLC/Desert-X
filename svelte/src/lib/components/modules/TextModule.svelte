<script>
	import Portable from '$lib/components/Portable.svelte';

	/** Optional centred heading over rich text, all one blank line apart. */
	let { module } = $props();
</script>

<div class="space-y-[1lh]">
	{#if module.heading}
		<h2 class="text-center uppercase">{module.heading}</h2>
	{/if}
	{#if module.text}
		<Portable value={module.text} />
	{/if}
</div>
