<script>
	/**
	 * A bulleted list in rich text, its bullets hanging outside so each
	 * item's lines align. Items keep their line breaks, as
	 * PortableParagraph does.
	 */
	let { children } = $props();
</script>

<ul class="list-disc pl-[1em] whitespace-pre-line">{@render children?.()}</ul>
