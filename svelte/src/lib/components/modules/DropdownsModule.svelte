<script>
	import Caret from '$lib/components/icons/Caret.svelte';
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/**
	 * Optional centred heading over a stack of dropdowns, each a native
	 * <details> so it opens without JavaScript and find-in-page can open it.
	 * Any number can be open at once. The first title sits one line under
	 * the heading, so its row has no top padding.
	 */
	let { module } = $props();
</script>

<div class="space-y-line px-gutter">
	<ModuleHeading heading={module.heading} />

	{#if module.dropdowns?.length}
		<div>
			{#each module.dropdowns as dropdown (dropdown._key)}
				<details class="group border-b-[2.5px]">
					<summary
						class="flex cursor-pointer list-none items-center justify-between py-6 group-first:pt-0 [&::-webkit-details-marker]:hidden"
					>
						{dropdown.title}
						<Caret class="h-[1.8rem] w-auto group-open:rotate-180" />
					</summary>
					{#if dropdown.content}
						<div class="space-y-line pt-2 pb-12">
							<Portable value={dropdown.content} />
						</div>
					{/if}
				</details>
			{/each}
		</div>
	{/if}
</div>
