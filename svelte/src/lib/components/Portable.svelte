<script>
	import { PortableText } from '@portabletext/svelte';
	import PortableLink from '$lib/components/PortableLink.svelte';
	import PortableSmall from '$lib/components/PortableSmall.svelte';

	/**
	 * Rich text. Its links are underlined, or take `linkClass` instead, like
	 * link-hover for ones underlined only on hover. Small paragraphs, like a
	 * closing "Generous support provided by…", are caption-sized.
	 */
	const { value, linkClass = 'link-underline' } = $props();

	const components = { block: { small: PortableSmall }, marks: { link: PortableLink } };
</script>

<PortableText {value} {components} context={{ linkClass }} />
