<script>
	import { PortableText } from '@portabletext/svelte';
	import PortableLink from '$lib/components/PortableLink.svelte';
	import PortableParagraph from '$lib/components/PortableParagraph.svelte';
	import PortableSmall from '$lib/components/PortableSmall.svelte';

	/**
	 * Rich text. Its links are underlined, or take `linkClass` instead, like
	 * link-hover for ones underlined only on hover. Small paragraphs, like a
	 * closing "Generous support provided by…", are caption-sized.
	 * Line breaks render as newlines the paragraphs keep, not the
	 * library's <br>, which it leaves out when rendering on the server.
	 */
	const { value, linkClass = 'link-underline' } = $props();

	const components = {
		block: { normal: PortableParagraph, small: PortableSmall },
		marks: { link: PortableLink },
		hardBreak: false
	};
</script>

<PortableText {value} {components} context={{ linkClass }} />
