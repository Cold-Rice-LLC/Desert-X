<script>
	import Dropdown from '$lib/components/Dropdown.svelte';
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/**
	 * Optional centred heading over a stack of dropdowns, ruled underneath.
	 * Any number can be open at once. What opens is inset from the rules by
	 * the module's own side padding.
	 */
	let { module } = $props();
</script>

<div class="space-y-line px-module">
	<ModuleHeading heading={module.heading} />

	{#if module.dropdowns?.length}
		<div>
			{#each module.dropdowns as dropdown (dropdown._key)}
				<Dropdown class="border-b-[0.25rem]">
					{#snippet summary()}{dropdown.title}{/snippet}
					{#if dropdown.content}
						<div class="space-y-line px-module pt-base pb-md">
							<Portable value={dropdown.content} />
						</div>
					{/if}
				</Dropdown>
			{/each}
		</div>
	{/if}
</div>
