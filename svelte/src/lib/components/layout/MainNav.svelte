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
	 * Its height is fixed, so pages without a title don't collapse it. With
	 * an `href` the title is a link up a level, like a breadcrumb; `detail`
	 * follows it, e.g. a news article's date.
	 */
	let { home, title, href, detail } = $props();
</script>

{#if home}
	<header
		class="sticky top-0 z-10 flex h-0 items-start gap-[2.3rem] px-edge text-white *:mt-nav-top"
	>
		<button aria-label="Open menu" aria-haspopup="dialog" onclick={() => (ui.menuOpen = true)}>
			<Hamburger class="h-nav-icon w-auto" />
		</button>
		<a href="/" aria-label="Desert X home">
			<Logo class="h-nav-icon w-auto" />
		</a>
	</header>
{:else}
	<header
		class="sticky top-0 z-10 flex h-nav items-center gap-x-[0.8em] bg-white px-gutter text-md"
	>
		<button
			class="absolute top-1/2 left-edge -translate-y-1/2"
			aria-label="Open menu"
			aria-haspopup="dialog"
			onclick={() => (ui.menuOpen = true)}
		>
			<HamburgerAlt class="h-[1.7rem] w-auto" />
		</button>
		{#if title && href}
			<a {href}>{title}</a>
		{:else if title}
			<p>{title}</p>
		{/if}
		{#if detail}
			<p>{detail}</p>
		{/if}
	</header>
{/if}
