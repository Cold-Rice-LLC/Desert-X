<script>
	import { PortableText } from '@portabletext/svelte';
	import PortableLink from '$lib/components/PortableLink.svelte';

	/**
	 * Rich text. Its links are underlined, or take `linkClass` instead, like
	 * link-hover for ones underlined only on hover.
	 */
	const { value, linkClass = 'link-underline' } = $props();

	const components = { marks: { link: PortableLink } };
</script>

<PortableText {value} {components} context={{ linkClass }} />
