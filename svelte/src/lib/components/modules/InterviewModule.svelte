<script>
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/**
	 * Optional centred heading over an interview: each exchange is the
	 * speaker, centred with a colon, over what they said. Exchanges sit one
	 * blank line apart.
	 */
	let { module } = $props();
</script>

<div class="space-y-line px-module">
	<ModuleHeading heading={module.heading} />
	{#if module.exchanges?.length}
		<dl class="space-y-line">
			{#each module.exchanges as exchange (exchange._key)}
				<div>
					<dt class="text-center">{exchange.speaker}:</dt>
					{#if exchange.text}
						<dd class="space-y-line"><Portable value={exchange.text} /></dd>
					{/if}
				</div>
			{/each}
		</dl>
	{/if}
</div>
