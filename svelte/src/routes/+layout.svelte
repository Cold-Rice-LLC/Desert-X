<script>
	import './layout.css';
	import 'nprogress/nprogress.css';
	import NProgress from 'nprogress';
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import AnnouncementBar from '$lib/components/layout/AnnouncementBar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import MainNav from '$lib/components/layout/MainNav.svelte';
	import Menu from '$lib/components/layout/Menu.svelte';
	import Seo from '$lib/components/layout/Seo.svelte';
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

	let home = $derived(page.url.pathname === '/');

	// What the nav shows beside the menu button: the page's title, which
	// can link up a level (navHref), and an optional detail after it
	let nav = $derived.by(() => {
		if (page.status === 404) return { title: 'Not Found' };
		if (page.error) return { title: 'Error' };
		if (ui.nav) return ui.nav;
		const { navTitle, navHref, navDetail } = page.data;
		return { title: navTitle, href: navHref, detail: navDetail };
	});

	// Closed in this visit; the cookie covers later page loads
	let announcementClosed = $state(false);
</script>

<Seo defaults={data.seo} />

{#if home && data.announcement && !data.announcementDismissed && !announcementClosed}
	<AnnouncementBar announcement={data.announcement} onclose={() => (announcementClosed = true)} />
{/if}

<MainNav {home} {...nav} />

<Menu menu={data.menu} />

{@render children()}

{#if !home}
	<Footer footer={data.footer} />
{/if}
