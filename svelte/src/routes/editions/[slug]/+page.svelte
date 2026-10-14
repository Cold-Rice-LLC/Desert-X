<script>
	import EditionContent from '$lib/components/edition/EditionContent.svelte';
	import OtherEditions from '$lib/components/edition/OtherEditions.svelte';

	let { data } = $props();
</script>

<h1 class="sr-only">{data.edition.location} {data.edition.year}</h1>

<!-- Keyed, so moving to another edition starts afresh: its own carousel,
     sort order and open dropdown -->
{#key data.edition._id}
	<div class="pb-page-bottom">
		<EditionContent edition={data.edition} news={data.news}>
			{#if data.edition.others.length}
				<OtherEditions editions={data.edition.others} news={data.news} />
			{/if}
		</EditionContent>
	</div>
{/key}
