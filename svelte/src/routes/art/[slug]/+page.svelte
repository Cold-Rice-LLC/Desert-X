<script>
	import ArtworkGallery from '$lib/components/ArtworkGallery.svelte';
	import Modules from '$lib/components/modules/Modules.svelte';

	let { data } = $props();
</script>

{#if data.artwork.images?.length}
	<ArtworkGallery images={data.artwork.images} />
{/if}
<Modules modules={data.artwork.modules}>
	<!-- Spaced like a text module, so text straight after sits a line below -->
	<header class="text-module grid grid-cols-2 gap-x-gutter px-module">
		<h1>{data.artwork.title}</h1>
		{#if data.artwork.credit || data.artwork.artistInfo}
			<p class="whitespace-pre-line">
				{[data.artwork.credit, data.artwork.artistInfo].filter(Boolean).join('\n')}
			</p>
		{/if}
	</header>
</Modules>
