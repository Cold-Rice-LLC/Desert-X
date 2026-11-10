<script>
	import AppLink from '$lib/components/AppLink.svelte';
	import Search from '$lib/components/icons/Search.svelte';

	/**
	 * Search, then the footer's two link columns (`links`: the locations,
	 * then Site Settings' links), each centred, for a 12-column grid from md
	 * up: search in column 1 and the columns centred on columns 2 and 4. On
	 * phones they suit the grid the footer has there, or, `compact`, a
	 * 12-column one, as the menu has them: search across 2 columns, the link
	 * columns centred on 3–7 and 8–12, the icon its md size.
	 */
	let { links, compact } = $props();
</script>

<a href="/search" aria-label="Search" class={['link-fade', compact && 'col-span-2 md:col-span-1']}>
	<Search class={['w-auto', compact ? 'h-[2.4rem]' : 'h-[1.6rem] md:h-[2.4rem]']} />
</a>

{#each links as column, i (i)}
	{#if column.length}
		<ul
			class={[
				'text-center md:justify-self-center',
				compact && ['col-span-5 md:col-span-1', i ? 'col-start-8' : 'col-start-3'],
				i ? 'md:col-start-4' : 'md:col-start-2'
			]}
		>
			{#each column as link (link._key)}
				<li><AppLink {link} class="link-fade">{link.label}</AppLink></li>
			{/each}
		</ul>
	{/if}
{/each}
