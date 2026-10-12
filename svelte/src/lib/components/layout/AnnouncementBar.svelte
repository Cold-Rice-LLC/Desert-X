<script>
	import AppLink from '$lib/components/AppLink.svelte';
	import { linkHref } from '$lib/sanity/links';

	/**
	 * Grey bar above the homepage nav: the announcement's text, its optional
	 * link and a close button. Closing it sets a day-long cookie for this
	 * announcement, which the layout's server load reads.
	 */
	let { announcement, onclose } = $props();

	const close = () => {
		document.cookie = `announcement-dismissed=${announcement.key}; max-age=86400; path=/; samesite=lax`;
		onclose();
	};
</script>

<aside
	class="flex items-center gap-[2.4rem] bg-grey-2 px-[2rem] py-[1.4rem] font-mono text-sm"
	aria-label="Announcement"
>
	<p class="flex-1">{announcement.text}</p>

	{#if linkHref(announcement) && announcement.linkLabel}
		<AppLink link={announcement} class="uppercase underline underline-offset-[0.4rem]">
			{announcement.linkLabel}
		</AppLink>
	{/if}

	<button aria-label="Close announcement" onclick={close}>X</button>
</aside>
