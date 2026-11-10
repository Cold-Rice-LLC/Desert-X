<script>
	import Logo from '$lib/components/icons/Logo.svelte';
	import MenuButton from '$lib/components/layout/MenuButton.svelte';

	/**
	 * The bar the nav and the menu share, so the hamburger and logo stay put
	 * as the menu opens: the hamburger, then with `logo` the logo in the
	 * menu's size, then `children`. On phones what follows the hamburger is
	 * a fixed 3.2rem on; from md up the hamburger sits in the left margin,
	 * so what follows starts at the gutter. `onclick` is the hamburger's and
	 * the logo's, other attributes like `aria-label` go to the hamburger,
	 * `as` names the element and `class` goes on it.
	 */
	let { as = 'div', logo, onclick, class: className, children, ...button } = $props();
</script>

<svelte:element
	this={as}
	class={[
		'flex h-nav items-center gap-x-[3.2rem] px-edge md:gap-x-[0.8em] md:pl-gutter md:text-md',
		className
	]}
>
	<MenuButton {...button} {onclick} />
	{#if logo}
		<!-- For the mouse: keyboards and screen readers have the hamburger
		     beside it, which does the same. The height the font gives its own
		     logo, which it draws for "[logo]" at 0.576em tall. -->
		<button tabindex="-1" aria-hidden="true" class="text-menu" {onclick}>
			<Logo class="h-[0.58em] w-auto" />
		</button>
	{/if}
	{@render children?.()}
</svelte:element>
