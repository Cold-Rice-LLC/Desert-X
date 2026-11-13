<script>
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import AppLink from '$lib/components/AppLink.svelte';
	import Search from '$lib/components/icons/Search.svelte';
	import TopBar from '$lib/components/layout/TopBar.svelte';
	import { linkHref } from '$lib/sanity/links';
	import { ui } from '$lib/ui.svelte.js';
	import { MediaQuery } from 'svelte/reactivity';

	/**
	 * Full-screen menu, opened by either nav's hamburger. A modal <dialog>,
	 * so focus stays inside, Escape closes it and the page behind is inert.
	 * Below the menu breakpoint (see layout.css), phones and tablets, items
	 * are indented by a column of the 12-column grid; ones with sub-items
	 * run across, and the rest fill two columns, down then across, the
	 * second starting halfway along the grid. From there up they sit in one
	 * row from the left, a word-like gap apart, never wrapping.
	 * Items whose Link Type is Sub-items show them under the item below the
	 * breakpoint, always, with the item an underlined label; from it the
	 * item is a button that opens them in place of the menu text, under the
	 * whole row, placed against it so they stay nested in their item's
	 * list. The rest are plain links. Below the breakpoint the menu text is
	 * left off, and search is at the bottom left instead; the menu
	 * scrolls if it runs past the screen. Sub-items linking to a location
	 * get the Desert X mark, the font's "[x]", the size of the logo's X;
	 * one that goes nowhere, like a location with no
	 * exhibitions yet, shows faded as plain text. The top bar is the
	 * homepage nav's (see TopBar), so the hamburger and logo stay put; here
	 * the hamburger closes the menu and the logo links home.
	 * Always rendered, so it can fade on opacity alone: while closed it's
	 * transparent, ignores the pointer and is inert, and it's fixed and
	 * stacked above the nav so the fade-out isn't cut off when the dialog
	 * leaves the top layer.
	 */
	let { menu } = $props();

	const desktop = new MediaQuery('width >= 70rem');
	let dialog;
	let activeKey = $state(null);
	let active = $derived(menu.items.find((item) => item._key === activeKey));
	let withSubItems = $derived(menu.items.filter((item) => item.linkType === 'subItems'));
	// The phone layout's rows: one for each item with sub-items, then the
	// two columns of the rest
	let rows = $derived(
		withSubItems.length + Math.ceil((menu.items.length - withSubItems.length) / 2)
	);

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

	// For screen readers: the link to this page, or to the section it's in,
	// like News on a news article. The homepage only matches itself.
	const current = (link) => {
		const href = linkHref(link);
		const { pathname } = page.url;
		const inSection = href !== '/' && pathname.startsWith(`${href}/`);
		return href === pathname || inSection ? 'page' : undefined;
	};

	// Escape: close through ui.menuOpen like every other way out
	const oncancel = (event) => {
		event.preventDefault();
		ui.menuOpen = false;
	};
</script>

<dialog
	bind:this={dialog}
	{oncancel}
	inert={!ui.menuOpen}
	class="pointer-events-none fixed inset-0 z-20 m-0 flex size-full max-h-none max-w-none flex-col overflow-y-auto bg-white text-menu text-black opacity-0 transition-opacity duration-300 open:pointer-events-auto open:opacity-100"
	aria-label="Menu"
>
	<TopBar
		logo="home"
		aria-label="Close menu"
		onclick={() => (ui.menuOpen = false)}
		class="relative shrink-0"
	/>

	<nav aria-label="Main">
		<ul
			class="mt-[0.9rem] grid grid-flow-col grid-cols-[5fr_6fr] pr-edge pl-indent menu:relative menu:mt-[2.3rem] menu:flex menu:gap-x-[0.8em] menu:px-gutter menu:whitespace-nowrap"
			style:grid-template-rows="repeat({rows}, auto)"
		>
			{#each menu.items as item (item._key)}
				<li class={[item.linkType === 'subItems' && 'col-span-2']}>
					{#if item.linkType === 'subItems'}
						{#if desktop.current}
							<button
								class={[item === active ? 'link-underline' : 'link-fade']}
								aria-expanded={item === active}
								aria-controls="menu-sub-items-{item._key}"
								onclick={() => (activeKey = item === active ? null : item._key)}
							>
								{item.label}
							</button>
						{:else}
							<span class="link-current">{item.label}</span>
						{/if}
						{#if item === active || !desktop.current}
							<ul
								id="menu-sub-items-{item._key}"
								class="my-line flex flex-col menu:absolute menu:inset-x-0 menu:top-full menu:mt-md menu:mb-0 menu:flex-row menu:flex-wrap menu:gap-x-[0.8em] menu:px-gutter"
							>
								{#each item.subItems ?? [] as subItem (subItem._key)}
									{#snippet label()}
										{#if subItem.internal?._type === 'location'}<span aria-hidden="true">[x]</span
											>&nbsp;{/if}{subItem.label}
									{/snippet}
									<li>
										{#if linkHref(subItem)}
											<AppLink link={subItem} aria-current={current(subItem)} class="link-fade">
												{@render label()}
											</AppLink>
										{:else}
											<span class="opacity-30">{@render label()}</span>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					{:else}
						<AppLink link={item} aria-current={current(item)} class="link-fade"
							>{item.label}</AppLink
						>
					{/if}
				</li>
			{/each}
		</ul>
	</nav>

	{#if menu.text && !active}
		<p class="mt-line hidden px-gutter tracking-tight menu:block">{menu.text}</p>
	{/if}

	<a
		href="/search"
		aria-label="Search"
		class="mt-auto self-start px-edge pt-md pb-edge link-fade menu:hidden"
	>
		<Search class="h-[2.4rem] w-auto" />
	</a>
</dialog>
