<script>
	/**
	 * A paragraph in rich text. Its line breaks (Shift+Enter in the Studio)
	 * come through as newlines, which it keeps (see Portable).
	 */
	let { children } = $props();
</script>

<p class="whitespace-pre-line">{@render children()}</p>
