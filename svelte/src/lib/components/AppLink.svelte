<script>
	import { linkHref, isExternalLink } from '$lib/sanity/links';

	/**
	 * Anchor for a Sanity link value. External URLs open in a new tab.
	 */
	let { link, children, ...rest } = $props();

	let external = $derived(isExternalLink(link));
</script>

<a
	{...rest}
	href={linkHref(link)}
	target={external ? '_blank' : undefined}
	rel={external ? 'noopener noreferrer' : undefined}
>
	{@render children()}
</a>
