<script>
	import { afterNavigate } from '$app/navigation';
	import AppLink from '$lib/components/AppLink.svelte';
	import Close from '$lib/components/icons/Close.svelte';
	import Logo from '$lib/components/icons/Logo.svelte';
	import LogoMark from '$lib/components/icons/LogoMark.svelte';
	import Search from '$lib/components/icons/Search.svelte';
	import { ui } from '$lib/ui.svelte.js';

	/**
	 * Full-screen menu, opened by either nav's hamburger. A modal <dialog>,
	 * so focus stays inside, Escape closes it and the page behind is inert.
	 * Items whose Link Type is Sub-items open them in place of the menu text;
	 * the rest are plain links. Sub-items linking to a location get the
	 * Desert X mark. Hidden while closed; flex once open.
	 */
	let { menu } = $props();

	let dialog;
	let activeKey = $state(null);
	let active = $derived(menu.items.find((item) => item._key === activeKey));

	// ui.menuOpen drives the dialog, rather than the dialog's close event,
	// which Chrome only fires once the page next renders
	$effect(() => {
		if (ui.menuOpen && !dialog.open) {
			activeKey = null;
			dialog.showModal();
		}
		if (!ui.menuOpen && dialog.open) dialog.close();
	});

	afterNavigate(() => (ui.menuOpen = false));

	// Escape: close through ui.menuOpen like every other way out
	const oncancel = (event) => {
		event.preventDefault();
		ui.menuOpen = false;
	};
</script>

<dialog
	bind:this={dialog}
	{oncancel}
	class="m-0 hidden size-full max-h-none max-w-none flex-col bg-white text-menu text-black open:flex"
	aria-label="Menu"
>
	<div class="flex items-start justify-between px-edge pt-nav-top">
		<a href="/" aria-label="Desert X home">
			<Logo class="h-nav-icon w-auto" />
		</a>
		<button aria-label="Close menu" onclick={() => (ui.menuOpen = false)}>
			<Close class="h-nav-icon w-auto" />
		</button>
	</div>

	<ul class="mt-[4rem] flex justify-between px-gutter">
		{#each menu.items as item (item._key)}
			<li>
				{#if item.linkType === 'subItems'}
					<button
						class={[item._key === activeKey && 'link-underline']}
						aria-expanded={item._key === activeKey}
						aria-controls="menu-sub-items"
						onclick={() => (activeKey = item._key === activeKey ? null : item._key)}
					>
						{item.label}
					</button>
				{:else}
					<AppLink link={item}>{item.label}</AppLink>
				{/if}
			</li>
		{/each}
	</ul>

	{#if active}
		<ul id="menu-sub-items" class="mt-[5rem] flex flex-wrap gap-x-[0.8em] px-gutter">
			{#each active.subItems ?? [] as subItem (subItem._key)}
				<li>
					<AppLink link={subItem} class="flex items-center gap-[0.3em]">
						{#if subItem.internal?._type === 'location'}
							<LogoMark class="h-[0.5em] w-auto" />
						{/if}
						{subItem.label}
					</AppLink>
				</li>
			{/each}
		</ul>
	{:else if menu.text}
		<p class="mt-[5rem] px-gutter">{menu.text}</p>
	{/if}

	<div class="mt-auto flex items-center gap-[5.4rem] px-edge pb-edge">
		<a href="/search" aria-label="Search">
			<Search class="h-[4rem] w-auto" />
		</a>
		{#if menu.donateLink?.label}
			<AppLink link={menu.donateLink}>{menu.donateLink.label}</AppLink>
		{/if}
	</div>
</dialog>
