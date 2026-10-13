<script>
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/**
	 * Optional centred heading over a list of times and what happens then.
	 * The time column is as wide as the longest time, so every row's details
	 * line up, and wrapped details stay under themselves.
	 */
	let { module } = $props();
</script>

<div class="space-y-line px-module">
	<ModuleHeading heading={module.heading} />
	{#if module.items?.length}
		<dl class="grid grid-cols-[max-content_1fr] gap-x-[1.4em]">
			{#each module.items as item (item._key)}
				<dt>{item.time}</dt>
				<dd class="space-y-line">
					{#if item.details}
						<Portable value={item.details} />
					{/if}
				</dd>
			{/each}
		</dl>
	{/if}
</div>
