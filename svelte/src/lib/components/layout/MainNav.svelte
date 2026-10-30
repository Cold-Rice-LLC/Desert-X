<script>
	import AppLink from '$lib/components/AppLink.svelte';
	import Logo from '$lib/components/icons/Logo.svelte';
	import MenuButton from '$lib/components/layout/MenuButton.svelte';
	import { ui } from '$lib/ui.svelte.js';

	/**
	 * Sticky (not fixed) so other sticky elements further down a page can
	 * take its place. The hamburger sits in the left margin, so what follows
	 * starts at the content gutter: the logo at the text's cap height on the
	 * homepage, which opens the menu too, the page's title elsewhere. On the homepage it floats in
	 * white over the hero, taking no space and letting clicks through
	 * between its links; elsewhere it sits on white. Its height is fixed, so
	 * pages without a title don't collapse it. With an `href` the title is a
	 * link up a level, like a breadcrumb; `detail` follows it, e.g. a news
	 * article's date. `donateLink` is an underlined link at the right edge,
	 * in the smaller text on phones so it fits beside the logo.
	 */
	let { home, title, href, detail, donateLink } = $props();
</script>

<header
	class={[
		'sticky top-0 z-10 flex h-nav items-center gap-x-[0.8em] pr-edge pl-gutter text-md',
		home ? 'pointer-events-none -mb-nav text-white *:pointer-events-auto' : 'bg-white'
	]}
>
	<MenuButton aria-label="Open menu" aria-haspopup="dialog" onclick={() => (ui.menuOpen = true)} />
	{#if home}
		<button aria-label="Open menu" aria-haspopup="dialog" onclick={() => (ui.menuOpen = true)}>
			<Logo class="h-[1.6rem] w-auto md:h-base" />
		</button>
	{:else if title && href}
		<a {href}>{title}</a>
	{:else if title}
		<p>{title}</p>
	{/if}
	{#if detail}
		<p>{detail}</p>
	{/if}
	{#if donateLink?.label}
		<AppLink link={donateLink} class="ml-auto text-sm link-underline md:text-md">
			{donateLink.label}
		</AppLink>
	{/if}
</header>
