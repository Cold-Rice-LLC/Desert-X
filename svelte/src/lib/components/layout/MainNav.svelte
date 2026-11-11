<script>
	import AppLink from '$lib/components/AppLink.svelte';
	import TopBar from '$lib/components/layout/TopBar.svelte';
	import { ui } from '$lib/ui.svelte.js';

	/**
	 * Sticky (not fixed) so other sticky elements further down a page can
	 * take its place. The hamburger leads (see TopBar), then the logo on the
	 * homepage, which opens the menu too, the page's title elsewhere, in
	 * the title size at every width. On the homepage it floats in white
	 * over the hero, taking no space and letting clicks through
	 * between its links; elsewhere it sits on white. Its height is fixed, so
	 * pages without a title don't collapse it. With an `href` the title is a
	 * link up a level, like a breadcrumb; `detail` follows it, e.g. a news
	 * article's date or an artwork's artists, cut to one line on phones,
	 * where `detailPhone` takes its place if given (a news article's date
	 * with a two-digit year). `work`, an artwork's title, follows the title
	 * from md up only, in italics, cut to one line at 40rem.
	 * Lines that get cut keep a little room below them, as the font's
	 * descenders hang below its 1 line height and would be clipped.
	 * With `stacked` it follows the title on phones as it does from md up,
	 * uncut, wrapping to a line of its own under it only where it doesn't
	 * fit, as an edition's location does (see TopBar).
	 * `donateLink` is an underlined link at the right edge from md up; phones
	 * have Donate in the menu.
	 */
	let { home, title, href, detail, detailPhone, work, stacked, donateLink } = $props();

	// Centred in the bar, as the hamburger is, text has its baseline 0.35em
	// below the middle; this lifts it to the hamburger's bottom edge, half
	// its height below the middle
	const onHamburger = '-translate-y-[calc(0.35em-var(--spacing-hamburger)/2)]';
</script>

{#snippet heading()}
	{#if title && href}
		<a {href} class={['link-fade', onHamburger]}>{title}</a>
	{:else if title}
		<p class={onHamburger}>{title}</p>
	{/if}
	{#if detail}
		<p
			class={[
				'-mb-[0.2em] min-w-0 truncate pb-[0.2em]',
				'md:overflow-visible md:whitespace-normal',
				onHamburger
			]}
		>
			{#if detailPhone}
				<span class="md:hidden">{detailPhone}</span>
				<span class="hidden md:inline">{detail}</span>
			{:else}
				{detail}
			{/if}
		</p>
	{/if}
{/snippet}

<TopBar
	as="header"
	logo={home}
	{stacked}
	aria-label="Open menu"
	aria-haspopup="dialog"
	onclick={() => (ui.menuOpen = true)}
	class={[
		'sticky top-0 z-10 text-title',
		home ? 'pointer-events-none -mb-nav text-white *:pointer-events-auto' : 'bg-white'
	]}
>
	{#if stacked}
		<!-- One wrapping row on phones; from md up its two are the bar's own -->
		<div class="row-span-2 flex min-w-0 flex-wrap gap-x-[0.8em] md:contents">
			{@render heading()}
		</div>
	{:else}
		{@render heading()}
	{/if}
	{#if work}
		<p
			class={['-mb-[0.2em] hidden max-w-[40rem] truncate pb-[0.2em] italic md:block', onHamburger]}
		>
			{work}
		</p>
	{/if}
	{#if donateLink?.label}
		<AppLink link={donateLink} class={['ml-auto hidden link-underline md:block', onHamburger]}>
			{donateLink.label}
		</AppLink>
	{/if}
</TopBar>
