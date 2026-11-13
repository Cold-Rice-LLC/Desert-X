<script>
	import AppLink from '$lib/components/AppLink.svelte';
	import Search from '$lib/components/icons/Search.svelte';

	/**
	 * The homepage's quick links: search, then two link columns (`links`:
	 * the locations, then Menu, Footer & SEO's Quick Links), each centred,
	 * for a 12-column grid: search across 2 columns, the link columns
	 * centred on 3–7 and 8–12; from md up search in column 1 and the
	 * columns centred on columns 2 and 4.
	 */
	let { links } = $props();
</script>

<a href="/search" aria-label="Search" class="col-span-2 link-fade md:col-span-1">
	<Search class="h-[2.4rem] w-auto" />
</a>

{#each links as column, i (i)}
	{#if column.length}
		<ul
			class={[
				'col-span-5 text-center md:col-span-1 md:justify-self-center',
				i ? 'col-start-8 md:col-start-4' : 'col-start-3 md:col-start-2'
			]}
		>
			{#each column as link (link._key)}
				<li><AppLink {link} class="link-fade">{link.label}</AppLink></li>
			{/each}
		</ul>
	{/if}
{/each}
