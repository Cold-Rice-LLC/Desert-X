<script>
	import TextModule from '$lib/components/modules/TextModule.svelte';

	/**
	 * Renders a modules array in order, picking a component by type. Types
	 * without a component yet are skipped. Modules sit one blank line apart;
	 * the first is 17.5rem from the top of the window, less the nav's 6.25rem.
	 */
	let { modules } = $props();

	const components = {
		textModule: TextModule
	};
</script>

<div class="space-y-[1lh] px-gutter pt-[11.25rem] pb-[15rem] text-md">
	{#each modules ?? [] as module (module._key)}
		{@const Module = components[module._type]}
		{#if Module}
			<Module {module} />
		{/if}
	{/each}
</div>
