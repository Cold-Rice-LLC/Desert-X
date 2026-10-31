<script>
	import { afterNavigate } from '$app/navigation';
	import AppLink from '$lib/components/AppLink.svelte';
	import Logo from '$lib/components/icons/Logo.svelte';
	import LogoMark from '$lib/components/icons/LogoMark.svelte';
	import MenuButton from '$lib/components/layout/MenuButton.svelte';
	import { linkHref } from '$lib/sanity/links';
	import { ui } from '$lib/ui.svelte.js';

	/**
	 * Full-screen menu, opened by either nav's hamburger. A modal <dialog>,
	 * so focus stays inside, Escape closes it and the page behind is inert.
	 * Items stack on phones and sit in a row from md up. Items whose Link
	 * Type is Sub-items open them in place of the menu text: under the item
	 * on phones, pushing the rest down, and under the whole row from md up,
	 * placed against the row so they stay nested in their item's list. The
	 * rest are plain links. The menu text is left off phones, and the menu
	 * scrolls if it runs past the screen. Sub-items linking to
	 * a location get the Desert X mark; one that goes nowhere, like a
	 * location with no editions yet, shows faded as plain text. Always
	 * rendered, so it can fade on opacity alone: while closed it's transparent, ignores the
	 * pointer and is inert, and it's fixed and stacked above the nav so the
	 * fade-out isn't cut off when the dialog leaves the top layer.
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
	inert={!ui.menuOpen}
	class="pointer-events-none fixed inset-0 z-20 m-0 flex size-full max-h-none max-w-none flex-col overflow-y-auto bg-white text-menu text-black opacity-0 transition-opacity duration-300 open:pointer-events-auto open:opacity-100"
	aria-label="Menu"
>
	<div class="relative flex h-nav shrink-0 items-center gap-x-[0.8em] px-edge text-md md:pl-gutter">
		<MenuButton aria-label="Close menu" onclick={() => (ui.menuOpen = false)} />
		<button aria-label="Close menu" onclick={() => (ui.menuOpen = false)}>
			<Logo class="h-[1.6rem] w-auto md:h-base" />
		</button>
	</div>

	<ul class="mt-sm flex flex-col px-gutter md:relative md:mt-md md:flex-row md:justify-between">
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
					{#if item === active}
						<ul
							id="menu-sub-items"
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
										<AppLink link={subItem} class="flex items-center gap-[0.3em]">
											{@render label()}
										</AppLink>
									{:else}
										<span class="flex items-center gap-[0.3em] opacity-30">{@render label()}</span>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				{:else}
					<AppLink link={item}>{item.label}</AppLink>
				{/if}
			</li>
		{/each}
	</ul>

	{#if menu.text && !active}
		<p class="mt-md hidden px-gutter md:block">{menu.text}</p>
	{/if}
</dialog>
