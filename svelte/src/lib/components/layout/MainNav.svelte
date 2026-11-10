<script>
	import AppLink from '$lib/components/AppLink.svelte';
	import TopBar from '$lib/components/layout/TopBar.svelte';
	import { ui } from '$lib/ui.svelte.js';

	/**
	 * Sticky (not fixed) so other sticky elements further down a page can
	 * take its place. The hamburger leads (see TopBar), then the logo on the
	 * homepage, which opens the menu too, the page's title elsewhere. On
	 * phones the text is the wireframes' 3.5rem, the size it has from md up.
	 * On the homepage it floats in white over
	 * the hero, taking no space and letting clicks through
	 * between its links; elsewhere it sits on white. Its height is fixed, so
	 * pages without a title don't collapse it. With an `href` the title is a
	 * link up a level, like a breadcrumb; `detail` follows it, e.g. a news
	 * article's date or an artwork's artists, cut to one line on phones.
	 * `donateLink` is an underlined link at the right edge from md up; phones
	 * have Donate in the menu.
	 */
	let { home, title, href, detail, donateLink } = $props();

	// Centred in the bar, as the hamburger is, text has its baseline 0.35em
	// below the middle; this lifts it to the hamburger's bottom edge, half
	// its height below the middle
	const onHamburger = '-translate-y-[calc(0.35em-var(--spacing-hamburger)/2)]';
</script>

<TopBar
	as="header"
	logo={home}
	aria-label="Open menu"
	aria-haspopup="dialog"
	onclick={() => (ui.menuOpen = true)}
	class={[
		'sticky top-0 z-10 text-[3.5rem]',
		home ? 'pointer-events-none -mb-nav text-white *:pointer-events-auto' : 'bg-white'
	]}
>
	{#if title && href}
		<a {href} class={['link-fade', onHamburger]}>{title}</a>
	{:else if title}
		<p class={onHamburger}>{title}</p>
	{/if}
	{#if detail}
		<p class={['min-w-0 truncate md:overflow-visible md:whitespace-normal', onHamburger]}>
			{detail}
		</p>
	{/if}
	{#if donateLink?.label}
		<AppLink link={donateLink} class={['ml-auto hidden link-underline md:block', onHamburger]}>
			{donateLink.label}
		</AppLink>
	{/if}
</TopBar>
