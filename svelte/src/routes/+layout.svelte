<script>
	import './layout.css';
	import 'nprogress/nprogress.css';
	import NProgress from 'nprogress';
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import AnnouncementBar from '$lib/components/layout/AnnouncementBar.svelte';
	import MainNav from '$lib/components/layout/MainNav.svelte';
	import Menu from '$lib/components/layout/Menu.svelte';

	let { children, data } = $props();

	NProgress.configure({ showSpinner: false });

	// Finishes on `complete` rather than in afterNavigate, which doesn't run
	// when a navigation is cancelled or fails, leaving the bar stuck
	beforeNavigate(({ willUnload, complete }) => {
		if (willUnload) return;
		NProgress.start();
		const done = () => NProgress.done();
		complete.then(done, done);
	});

	let home = $derived(page.url.pathname === '/');

	let title = $derived.by(() => {
		if (page.status === 404) return 'Not Found';
		if (page.error) return 'Error';
		return page.data.navTitle;
	});

	// Closed in this visit; the cookie covers later page loads
	let announcementClosed = $state(false);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if home && data.announcement && !data.announcementDismissed && !announcementClosed}
	<AnnouncementBar announcement={data.announcement} onclose={() => (announcementClosed = true)} />
{/if}

<MainNav {home} {title} />

<Menu menu={data.menu} />

{@render children()}
