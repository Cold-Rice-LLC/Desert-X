<script>
	/**
	 * A paragraph in rich text run into the text around it, for Portable's
	 * `inline`, keeping its line breaks as PortableParagraph does.
	 */
	let { children } = $props();
</script>

<span class="whitespace-pre-line">{@render children()}</span>
