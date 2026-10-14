<script>
	import Dropdown from '$lib/components/Dropdown.svelte';
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/**
	 * Optional centred heading over a stack of dropdowns, ruled underneath.
	 * Any number can be open at once.
	 */
	let { module } = $props();
</script>

<div class="space-y-line px-module">
	<ModuleHeading heading={module.heading} />

	{#if module.dropdowns?.length}
		<div>
			{#each module.dropdowns as dropdown (dropdown._key)}
				<Dropdown class="border-b-[2.5px]">
					{#snippet summary()}{dropdown.title}{/snippet}
					{#if dropdown.content}
						<div class="space-y-line pt-[0.5rem] pb-[3rem]">
							<Portable value={dropdown.content} />
						</div>
					{/if}
				</Dropdown>
			{/each}
		</div>
	{/if}
</div>
