<script>
	import BioModule from '$lib/components/modules/BioModule.svelte';
	import TextModule from '$lib/components/modules/TextModule.svelte';

	/**
	 * Renders a modules array in order, picking a component by type. Types
	 * without a component yet are skipped. Modules sit 10rem apart, or one
	 * blank line between consecutive text modules. The first is 17.5rem from
	 * the top of the window, less the nav's 6.25rem.
	 */
	let { modules } = $props();

	const components = {
		textModule: TextModule,
		bioModule: BioModule
	};
</script>

<div
	class="pt-[11.25rem] pb-[15rem] text-md *:not-first:mt-[10rem] [&>.text-module+.text-module]:mt-[1lh]"
>
	{#each modules ?? [] as module (module._key)}
		{@const Module = components[module._type]}
		{#if Module}
			<Module {module} />
		{/if}
	{/each}
</div>
