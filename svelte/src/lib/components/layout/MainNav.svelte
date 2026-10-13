<script>
	import Hamburger from '$lib/components/icons/Hamburger.svelte';
	import HamburgerAlt from '$lib/components/icons/HamburgerAlt.svelte';
	import Logo from '$lib/components/icons/Logo.svelte';
	import { ui } from '$lib/ui.svelte.js';

	/**
	 * Sticky (not fixed) so other sticky elements further down a page can
	 * take its place. On the homepage it has no height and floats in white
	 * over the hero. Elsewhere it sits on white with the smaller hamburger
	 * in the left margin, so the page's title starts at the content gutter.
	 * Its height is fixed, so pages without a title don't collapse it.
	 */
	let { home, title } = $props();
</script>

{#if home}
	<header
		class="sticky top-0 z-10 flex h-0 items-start gap-[2.3rem] px-edge text-white *:mt-[2.6rem]"
	>
		<button aria-label="Open menu" aria-haspopup="dialog" onclick={() => (ui.menuOpen = true)}>
			<Hamburger class="h-[3.1rem] w-auto" />
		</button>
		<a href="/" aria-label="Desert X home">
			<Logo class="h-[3.1rem] w-auto" />
		</a>
	</header>
{:else}
	<header class="sticky top-0 z-10 flex h-[7.5rem] items-center bg-white px-gutter text-md">
		<button
			class="absolute top-1/2 left-edge -translate-y-1/2"
			aria-label="Open menu"
			aria-haspopup="dialog"
			onclick={() => (ui.menuOpen = true)}
		>
			<HamburgerAlt class="h-[1.7rem] w-auto" />
		</button>
		{#if title}
			<p>{title}</p>
		{/if}
	</header>
{/if}
