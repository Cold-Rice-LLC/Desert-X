<script>
	import { PortableText } from '@portabletext/svelte';
	import PortableHeading from '$lib/components/PortableHeading.svelte';
	import PortableInline from '$lib/components/PortableInline.svelte';
	import PortableLink from '$lib/components/PortableLink.svelte';
	import PortableParagraph from '$lib/components/PortableParagraph.svelte';
	import PortableSmall from '$lib/components/PortableSmall.svelte';

	/**
	 * Rich text. Its links are underlined, or take `linkClass` instead, like
	 * link-hover for ones underlined only on hover. Small paragraphs, like a
	 * closing "Generous support provided by…", are caption-sized. Headings
	 * are the text's size, with space above them (see PortableHeading).
	 * Line breaks render as newlines the paragraphs keep, not the
	 * library's <br>, which it leaves out when rendering on the server.
	 * With `inline`, its paragraphs and headings are spans, to run on inside
	 * one of the page's own.
	 */
	const { value, linkClass = 'link-underline', inline = false } = $props();

	const components = {
		block: inline
			? { normal: PortableInline, h3: PortableInline, small: PortableInline }
			: { normal: PortableParagraph, h3: PortableHeading, small: PortableSmall },
		marks: { link: PortableLink },
		hardBreak: false
	};
</script>

<PortableText {value} {components} context={{ linkClass }} />
