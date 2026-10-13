<script>
	import BioModule from '$lib/components/modules/BioModule.svelte';
	import PeopleListModule from '$lib/components/modules/PeopleListModule.svelte';
	import TextModule from '$lib/components/modules/TextModule.svelte';

	/**
	 * Renders a modules array in order, picking a component by type. Types
	 * without a component yet are skipped. Modules sit 10rem apart, or one
	 * blank line between consecutive text modules.
	 */
	let { modules } = $props();

	const components = {
		textModule: TextModule,
		bioModule: BioModule,
		peopleListModule: PeopleListModule
	};
</script>

<div
	class="pt-[9.25rem] pb-[15rem] text-md *:not-first:mt-[10rem] [&>.text-module+.text-module]:mt-line"
>
	{#each modules ?? [] as module (module._key)}
		{@const Module = components[module._type]}
		{#if Module}
			<Module {module} />
		{/if}
	{/each}
</div>
