<script module>
	// The choice just followed, until the page it goes to has loaded:
	// which query parameter, its value there, and the page it was chosen on
	let chosen = $state(null);
</script>

<script>
	import { page } from '$app/state';

	/**
	 * One of a set of choices, like a sort order or a page number,
	 * underlined while it's the `current` one: a link given `href`, marked
	 * as the current page, else a button, marked as pressed. A link whose
	 * set chooses query parameter `param` shows as current the moment it's
	 * clicked, and the rest of its set as not, rather than once the page it
	 * goes to has loaded. Other attributes, like `onclick`, pass through.
	 */
	let { current, href, param, onclick, children, ...rest } = $props();

	const value = (url) => url.searchParams.get(param);

	let shown = $derived(
		param && chosen?.param === param && chosen.from === page.url.href
			? value(new URL(href, page.url)) === chosen.value
			: current
	);

	// A click that opens the link elsewhere, as in a new tab, leaves this
	// page as it is
	const choose = (event) => {
		onclick?.(event);
		if (!param || event.defaultPrevented) return;
		if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		chosen = { param, value: value(new URL(href, page.url)), from: page.url.href };
	};
</script>

{#if href}
	<a
		{...rest}
		{href}
		class={[shown ? 'link-current' : 'link-fade']}
		aria-current={shown ? 'page' : undefined}
		onclick={choose}>{@render children()}</a
	>
{:else}
	<button
		{...rest}
		{onclick}
		class={[current ? 'link-current' : 'link-fade']}
		aria-pressed={current}>{@render children()}</button
	>
{/if}
