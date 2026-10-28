<script>
	import AppLink from '$lib/components/AppLink.svelte';
	import HamburgerAlt from '$lib/components/icons/HamburgerAlt.svelte';
	import Logo from '$lib/components/icons/Logo.svelte';
	import { ui } from '$lib/ui.svelte.js';

	/**
	 * Sticky (not fixed) so other sticky elements further down a page can
	 * take its place. The hamburger sits in the left margin, so what follows
	 * starts at the content gutter: the logo at the text's cap height on the
	 * homepage, the page's title elsewhere. On the homepage it floats in
	 * white over the hero, taking no space and letting clicks through
	 * between its links; elsewhere it sits on white. Its height is fixed, so
	 * pages without a title don't collapse it. With an `href` the title is a
	 * link up a level, like a breadcrumb; `detail` follows it, e.g. a news
	 * article's date. `donateLink` is a grey button at the right edge.
	 */
	let { home, title, href, detail, donateLink } = $props();
</script>

<header
	class={[
		'sticky top-0 z-10 flex h-nav items-center gap-x-[0.8em] pr-edge pl-gutter text-md',
		home ? 'pointer-events-none -mb-nav text-white *:pointer-events-auto' : 'bg-white'
	]}
>
	<button
		class="absolute top-1/2 left-edge -translate-y-1/2"
		aria-label="Open menu"
		aria-haspopup="dialog"
		onclick={() => (ui.menuOpen = true)}
	>
		<HamburgerAlt class="h-[1.7rem] w-auto" />
	</button>
	{#if home}
		<a href="/" aria-label="Desert X home">
			<Logo class="h-base w-auto" />
		</a>
	{:else if title && href}
		<a {href}>{title}</a>
	{:else if title}
		<p>{title}</p>
	{/if}
	{#if detail}
		<p>{detail}</p>
	{/if}
	{#if donateLink?.label}
		<AppLink link={donateLink} class="ml-auto bg-grey-2 px-[0.7rem] py-[0.4rem] text-black">
			{donateLink.label}
		</AppLink>
	{/if}
</header>
