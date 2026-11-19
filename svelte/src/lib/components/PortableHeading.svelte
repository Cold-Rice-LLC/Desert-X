<script>
	/**
	 * A heading in rich text, an h3 under its module's h2. It's the text's
	 * own size and font, set apart by two lines' space above it, which
	 * collapses with the line's space the block before it leaves. One that
	 * opens its text has none. It keeps its line breaks as
	 * PortableParagraph does.
	 */
	let { children } = $props();
</script>

<h3 class="whitespace-pre-line not-first:mt-[2lh]">{@render children()}</h3>
