<script>
	import Hamburger from '$lib/components/icons/Hamburger.svelte';
	import HamburgerAlt from '$lib/components/icons/HamburgerAlt.svelte';
	import Logo from '$lib/components/icons/Logo.svelte';

	/**
	 * Sticky (not fixed) so other sticky elements further down a page can
	 * take its place. On the homepage it has no height and floats in white
	 * over the hero; elsewhere it sits on white with the smaller hamburger.
	 */
	let { home } = $props();
</script>

{#if home}
	<header
		class="sticky top-0 z-10 flex h-0 items-start gap-[2.3rem] px-[2rem] text-white *:mt-[2.6rem]"
	>
		<button aria-label="Open menu">
			<Hamburger class="h-[3.1rem] w-auto" />
		</button>
		<a href="/" aria-label="Desert X home">
			<Logo class="h-[3.1rem] w-auto" />
		</a>
	</header>
{:else}
	<header class="sticky top-0 z-10 flex items-center bg-white px-[2rem] py-[2.2rem]">
		<button aria-label="Open menu">
			<HamburgerAlt class="h-[1.7rem] w-auto" />
		</button>
	</header>
{/if}
