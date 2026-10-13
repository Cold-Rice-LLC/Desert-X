<script>
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/** Optional centred heading over rich text, all one blank line apart. */
	let { module } = $props();
</script>

<div class="text-module space-y-line px-gutter">
	<ModuleHeading heading={module.heading} />
	{#if module.text}
		<Portable value={module.text} />
	{/if}
</div>
