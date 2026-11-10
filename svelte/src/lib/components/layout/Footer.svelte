<script>
	import Portable from '$lib/components/Portable.svelte';
	import FooterLinks from '$lib/components/layout/FooterLinks.svelte';

	/**
	 * Site footer, on every page but the homepage. On phones it's search and
	 * the two link columns (the locations, then Site Settings' links),
	 * centred in the space after search. From md up, on the 12-column grid:
	 * search in column 1, the link columns in columns 2 and 4, and the
	 * text, copyright and credits across columns 6–12. Everything sits on
	 * the bottom edge. The menu shows it too, on phones only, with `menu`
	 * set: in the larger sizes it has from md up, on the 12-column grid (see
	 * FooterLinks). `class` goes on the <footer>.
	 */
	let { footer, menu, class: className } = $props();
</script>

<footer
	class={[
		'mt-auto grid items-end px-edge pb-edge md:grid-cols-12',
		menu ? 'grid-cols-12 text-[2.2rem]/none' : 'grid-cols-[auto_1fr_1fr] text-base',
		className
	]}
>
	<FooterLinks links={footer.links} compact={menu} />

	<!-- Rich text links are underlined elsewhere, but not here, so they fade instead -->
	<div class="col-span-7 col-start-6 hidden md:block [&_a]:no-underline [&_a]:link-fade">
		{#if footer.text}
			<Portable value={footer.text} />
		{/if}
		<p>© Desert Biennale {new Date().getFullYear()}. DESERT X is a ® registered trademark.</p>
		{#if footer.credits}
			<Portable value={footer.credits} />
		{/if}
	</div>
</footer>
