<script>
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import AppLink from '$lib/components/AppLink.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import LogoMark from '$lib/components/icons/LogoMark.svelte';
	import TopBar from '$lib/components/layout/TopBar.svelte';
	import { linkHref } from '$lib/sanity/links';
	import { ui } from '$lib/ui.svelte.js';
	import { MediaQuery } from 'svelte/reactivity';

	/**
	 * Full-screen menu, opened by either nav's hamburger. A modal <dialog>,
	 * so focus stays inside, Escape closes it and the page behind is inert.
	 * On phones items are indented by a column of the 12-column grid; ones
	 * with sub-items run across, and the rest fill two columns, down then
	 * across, the second starting halfway along the grid. From md up they
	 * sit in a row, spread across it, never closer than a word-like gap.
	 * Items whose Link Type is Sub-items show them under the item on phones,
	 * always, with the item an underlined label; from md up the item is a
	 * button that opens them in place of the menu text, under the whole
	 * row, placed against it so they stay nested in their item's list. The
	 * rest are plain links. The menu text is left off phones, which have the
	 * site footer at the bottom instead, and the menu scrolls if it runs
	 * past the screen. Sub-items linking to
	 * a location get the Desert X mark; one that goes nowhere, like a
	 * location with no editions yet, shows faded as plain text. The top bar
	 * is the homepage nav's (see TopBar), so the hamburger and logo stay
	 * put. Always
	 * rendered, so it can fade on opacity alone: while closed it's transparent, ignores the
	 * pointer and is inert, and it's fixed and stacked above the nav so the
	 * fade-out isn't cut off when the dialog leaves the top layer.
	 */
	let { menu, footer } = $props();

	const desktop = new MediaQuery('width >= 48rem');
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
		logo
		aria-label="Close menu"
		onclick={() => (ui.menuOpen = false)}
		class="relative shrink-0"
	/>

	<nav aria-label="Main">
		<ul
			class="mt-[0.9rem] grid grid-flow-col grid-cols-[5fr_6fr] pr-edge pl-indent md:relative md:mt-[2.3rem] md:flex md:justify-between md:gap-x-[0.8em] md:px-gutter"
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
								class="my-line flex flex-col md:absolute md:inset-x-0 md:top-full md:mt-md md:mb-0 md:flex-row md:flex-wrap md:gap-x-[0.8em] md:px-gutter"
							>
								{#each item.subItems ?? [] as subItem (subItem._key)}
									{#snippet label()}
										{#if subItem.internal?._type === 'location'}
											<LogoMark class="h-[0.5em] w-auto" />
										{/if}
										{subItem.label}
									{/snippet}
									<li>
										{#if linkHref(subItem)}
											<AppLink
												link={subItem}
												aria-current={current(subItem)}
												class="flex items-center gap-[0.3em] link-fade"
											>
												{@render label()}
											</AppLink>
										{:else}
											<span class="flex items-center gap-[0.3em] opacity-30">{@render label()}</span
											>
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
		<p class="mt-line hidden px-gutter tracking-tight md:block">{menu.text}</p>
	{/if}

	<Footer {footer} menu class="pt-md md:hidden" />
</dialog>
