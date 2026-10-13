<script>
	import AppLink from '$lib/components/AppLink.svelte';
	import Portable from '$lib/components/Portable.svelte';
	import Search from '$lib/components/icons/Search.svelte';

	/**
	 * Site footer, on every page but the homepage. On the 12-column grid:
	 * search in column 1, the two link columns centred in columns 2 and 4,
	 * and the text, copyright and credits across columns 6–12. Everything
	 * sits on the bottom edge.
	 */
	let { footer } = $props();
</script>

<footer class="mt-auto grid grid-cols-12 items-end px-edge pb-edge text-base leading-none">
	<a href="/search" aria-label="Search">
		<Search class="h-[2.4rem] w-auto" />
	</a>

	{#each footer.links as links, i (i)}
		{#if links.length}
			<ul class={['text-center', i ? 'col-start-4' : 'col-start-2']}>
				{#each links as link (link._key)}
					<li><AppLink {link}>{link.label}</AppLink></li>
				{/each}
			</ul>
		{/if}
	{/each}

	<div class="col-span-7 col-start-6 [&_a]:no-underline">
		{#if footer.text}
			<Portable value={footer.text} />
		{/if}
		<p>© Desert Biennale {new Date().getFullYear()}. DESERT X is a ® registered trademark.</p>
		{#if footer.credits}
			<Portable value={footer.credits} />
		{/if}
	</div>
</footer>
