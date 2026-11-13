<script>
	import './layout.css';
	import 'nprogress/nprogress.css';
	import NProgress from 'nprogress';
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import Footer from '$lib/components/layout/Footer.svelte';
	import MainNav from '$lib/components/layout/MainNav.svelte';
	import Menu from '$lib/components/layout/Menu.svelte';
	import Seo from '$lib/components/layout/Seo.svelte';
	import { linkHref } from '$lib/sanity/links';
	import { ui } from '$lib/ui.svelte.js';

	let { children, data } = $props();

	NProgress.configure({ showSpinner: false });

	// Finishes on `complete` rather than in afterNavigate, which doesn't run
	// when a navigation is cancelled or fails, leaving the bar stuck. Query
	// changes made in code on the same page (searching as you type, opening
	// an edition) load nothing, so they skip it.
	beforeNavigate(({ willUnload, type, from, to, complete }) => {
		if (willUnload || (type === 'goto' && from?.url.pathname === to?.url.pathname)) return;
		NProgress.start();
		const done = () => NProgress.done();
		complete.then(done, done);
	});

	// Whether a pointer or Tab last moved focus, for text fields' focus
	// styles (the keyboard variant in layout.css). Only Tab counts as the
	// keyboard: typing in a field clicked into mustn't bring its ring up.
	const pointer = (on) => document.documentElement.toggleAttribute('data-pointer', on);

	let home = $derived(page.url.pathname === '/');

	// On the page the Donate link goes to, or a page under it (checkout)
	let onDonate = $derived.by(() => {
		const href = linkHref(data.donateLink);
		const path = page.url.pathname;
		return !!href && (path === href || path.startsWith(`${href}/`));
	});

	// What the nav shows beside the menu button: the page's title, which
	// can link up a level (navHref), and an optional detail after it, with
	// a shorter one for phones (navDetailPhone), or an artwork's title
	// (navWork)
	let nav = $derived.by(() => {
		if (page.status === 404) return { title: 'Not Found' };
		if (page.error) return { title: 'Error' };
		if (ui.nav) return ui.nav;
		const { navTitle, navHref, navDetail, navDetailPhone, navWork } = page.data;
		return {
			title: navTitle,
			href: navHref,
			detail: navDetail,
			detailPhone: navDetailPhone,
			work: navWork
		};
	});
</script>

<!-- Capturing, so nothing on the page can stop them first -->
<svelte:document
	onpointerdowncapture={() => pointer(true)}
	onkeydowncapture={(event) => event.key === 'Tab' && pointer(false)}
/>

<Seo defaults={data.seo} />

<!-- Above the nav, and only shown while it has keyboard focus -->
<a
	href="#main"
	class="fixed top-0 left-0 z-30 -translate-y-full bg-white p-xs text-base focus-visible:translate-y-0"
>
	Skip to content
</a>

<!-- Without the Donate link where it would only lead back -->
<MainNav
	{home}
	{...nav}
	stacked={page.data.navStacked}
	donateLink={onDonate ? null : data.donateLink}
/>

<Menu menu={data.menu} />

<!-- A flex column like the body, so pages lay out as they would directly
     in it: the homepage carousel fills the height left -->
<main id="main" class="flex flex-1 flex-col">
	{@render children()}
</main>

{#if !home}
	<Footer footer={data.footer} />
{/if}
