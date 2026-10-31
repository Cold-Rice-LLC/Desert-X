<script>
	import Hamburger from '$lib/components/icons/Hamburger.svelte';

	/**
	 * The hamburger leading the nav and the menu's top bar, which open and
	 * close the menu. From md up it sits in the left margin at the screen
	 * edge, so what follows starts at the gutter. Attributes like
	 * `aria-label` and `onclick` pass through.
	 */
	let props = $props();
</script>

<button {...props} class="md:absolute md:top-1/2 md:left-edge md:-translate-y-1/2">
	<Hamburger class="h-[1.5rem] w-auto md:h-[1.7rem]" />
</button>
