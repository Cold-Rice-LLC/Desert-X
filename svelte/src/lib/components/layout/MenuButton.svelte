<script>
	import Hamburger from '$lib/components/icons/Hamburger.svelte';

	/**
	 * The hamburger in the left margin of the nav and of the menu's top bar,
	 * which open and close the menu: it sits at the screen edge, so what
	 * follows starts at the gutter. Attributes like `aria-label` and
	 * `onclick` pass through.
	 */
	let props = $props();
</script>

<button {...props} class="absolute top-1/2 left-edge -translate-y-1/2">
	<Hamburger class="h-[1.5rem] w-auto md:h-[1.7rem]" />
</button>
