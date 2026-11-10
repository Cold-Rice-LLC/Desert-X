<script>
	import AppLink from '$lib/components/AppLink.svelte';
	import { linkHref } from '$lib/sanity/links';

	/**
	 * Link annotation in rich text, rendered through AppLink, with Portable's
	 * `linkClass`.
	 */
	let { portableText, children } = $props();

	let link = $derived(portableText.value);
</script>

{#if linkHref(link)}
	<AppLink {link} class={portableText.global.context.linkClass}>{@render children()}</AppLink>
{:else}
	{@render children()}
{/if}
