<script>
	import AppLink from '$lib/components/AppLink.svelte';
	import Portable from '$lib/components/Portable.svelte';
	import Search from '$lib/components/icons/Search.svelte';

	/**
	 * Site footer, on every page but the homepage. On phones it's search and
	 * the two link columns (the locations, then Site Settings' links),
	 * centred in the space after search. From md up, on the 12-column grid:
	 * search in column 1, the link columns in columns 2 and 4, and the
	 * text, copyright and credits across columns 6–12. Everything sits on
	 * the bottom edge. The menu shows it too, on phones. `class` goes on the
	 * <footer>.
	 */
	let { footer, class: className } = $props();
</script>

<footer
	class={[
		'mt-auto grid grid-cols-[auto_1fr_1fr] items-end px-edge pb-edge text-base md:grid-cols-12',
		className
	]}
>
	<a href="/search" aria-label="Search">
		<Search class="h-[1.6rem] w-auto md:h-[2.4rem]" />
	</a>

	{#each footer.links as links, i (i)}
		{#if links.length}
			<ul class={['text-center', i ? 'md:col-start-4' : 'md:col-start-2']}>
				{#each links as link (link._key)}
					<li><AppLink {link}>{link.label}</AppLink></li>
				{/each}
			</ul>
		{/if}
	{/each}

	<!-- Rich text links are underlined elsewhere, but not here -->
	<div class="col-span-7 col-start-6 hidden md:block [&_a]:no-underline">
		{#if footer.text}
			<Portable value={footer.text} />
		{/if}
		<p>© Desert Biennale {new Date().getFullYear()}. DESERT X is a ® registered trademark.</p>
		{#if footer.credits}
			<Portable value={footer.credits} />
		{/if}
	</div>
</footer>
