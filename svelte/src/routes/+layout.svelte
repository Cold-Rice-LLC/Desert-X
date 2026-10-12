<script>
	import './layout.css';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import AnnouncementBar from '$lib/components/layout/AnnouncementBar.svelte';
	import MainNav from '$lib/components/layout/MainNav.svelte';

	let { children, data } = $props();

	let home = $derived(page.url.pathname === '/');

	// Closed in this visit; the cookie covers later page loads
	let announcementClosed = $state(false);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if home && data.announcement && !data.announcementDismissed && !announcementClosed}
	<AnnouncementBar announcement={data.announcement} onclose={() => (announcementClosed = true)} />
{/if}

<MainNav {home} />

{@render children()}
