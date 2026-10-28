<script>
	import { isExternalLink, linkHref, newTabAttributes } from '$lib/sanity/links';

	/**
	 * Anchor for a Sanity link value. External URLs open in a new tab.
	 */
	let { link, children, ...rest } = $props();

	let external = $derived(isExternalLink(link));
</script>

<a {...rest} {...external && newTabAttributes} href={linkHref(link)}>
	{@render children()}
</a>
