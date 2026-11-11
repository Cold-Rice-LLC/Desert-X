<script>
	import MenuButton from '$lib/components/layout/MenuButton.svelte';

	/**
	 * The bar the nav and the menu share, so the hamburger and logo stay put
	 * as the menu opens: the hamburger, then with `logo` the logo in the
	 * menu's size, then `children`. On phones what follows the hamburger is
	 * a fixed 3.2rem on; from md up the hamburger sits in the left margin,
	 * so what follows starts at the gutter. With `stacked`, phones get a
	 * second line, in the column after the hamburger, for what has
	 * `col-start-2`: the bar grows by a line, its first where a single line
	 * would be, so the hamburger doesn't move as the menu opens over it.
	 * `onclick` is the hamburger's and the logo's, other attributes like
	 * `aria-label` go to the hamburger, `as` names the element and `class`
	 * goes on it.
	 */
	let {
		as = 'div',
		logo,
		stacked = false,
		onclick,
		class: className,
		children,
		...button
	} = $props();
</script>

<svelte:element
	this={as}
	class={[
		'items-center gap-x-[3.2rem] px-edge md:gap-x-[0.8em] md:pl-gutter md:text-md',
		stacked
			? 'grid grid-cols-[auto_1fr] py-[calc((var(--spacing-nav)-1lh)/2)] md:flex md:h-nav md:py-0'
			: 'flex h-nav',
		className
	]}
>
	<MenuButton {...button} {onclick} />
	{#if logo}
		<!-- For the mouse: keyboards and screen readers have the hamburger
		     beside it, which does the same. The font draws the logo for
		     "[logo]", its X the same as the menu's "[x]". Its ink centres
		     0.077em below the line's middle, so it's raised by that to centre
		     on the hamburger. -->
		<button tabindex="-1" aria-hidden="true" class="-translate-y-[0.077em] text-menu" {onclick}
			>[logo]</button
		>
	{/if}
	{@render children?.()}
</svelte:element>
