<script>
	import Gallery from '$lib/components/Gallery.svelte';
	import Modules from '$lib/components/modules/Modules.svelte';

	let { data } = $props();
</script>

<!-- Keyed, so moving to another artwork starts its carousel afresh -->
{#key data.artwork._id}
	{#if data.artwork.images?.length}
		<Gallery images={data.artwork.images} />
	{/if}
{/key}
<Modules modules={data.artwork.modules}>
	<!-- Spaced like a text module, so text straight after sits a line below -->
	<header class="text-module grid gap-y-line px-module md:grid-cols-2">
		<h1>{data.artwork.title}</h1>
		{#if data.artwork.credit || data.artwork.artistInfo}
			<p class="whitespace-pre-line">
				{[data.artwork.credit, data.artwork.artistInfo].filter(Boolean).join('\n')}
			</p>
		{/if}
	</header>
</Modules>
