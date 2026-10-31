<script>
	/**
	 * One of a set of choices, like a sort order or a page number,
	 * underlined while it's the `current` one: a link given `href`, marked
	 * as the current page, else a button, marked as pressed. Other
	 * attributes, like `onclick`, pass through.
	 */
	let { current, href, children, ...rest } = $props();
</script>

{#if href}
	<a
		{...rest}
		{href}
		class={[current ? 'link-underline' : 'link-fade']}
		aria-current={current ? 'page' : undefined}>{@render children()}</a
	>
{:else}
	<button {...rest} class={[current ? 'link-underline' : 'link-fade']} aria-pressed={current}
		>{@render children()}</button
	>
{/if}
