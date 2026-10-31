<script>
	import AppLink from '$lib/components/AppLink.svelte';
	import Portable from '$lib/components/Portable.svelte';
	import Search from '$lib/components/icons/Search.svelte';

	/**
	 * Site footer, on every page but the homepage. On phones the text runs
	 * across the top, then search and the two link columns (the locations,
	 * then Site Settings' links) share a row, the columns centred in the
	 * space after search; the copyright and credits are left off. From md
	 * up, on the 12-column grid: search in column 1, the link columns in
	 * columns 2 and 4, and the text, copyright and credits across columns
	 * 6–12. Everything sits on the bottom edge.
	 */
	let { footer } = $props();
</script>

<footer
	class="mt-auto grid grid-cols-[auto_1fr_1fr] items-end gap-y-md px-edge pb-edge text-base md:grid-cols-12"
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
	<div
		class="order-first col-span-full md:order-none md:col-span-7 md:col-start-6 [&_a]:no-underline"
	>
		{#if footer.text}
			<Portable value={footer.text} />
		{/if}
		<div class="hidden md:block">
			<p>© Desert Biennale {new Date().getFullYear()}. DESERT X is a ® registered trademark.</p>
			{#if footer.credits}
				<Portable value={footer.credits} />
			{/if}
		</div>
	</div>
</footer>
