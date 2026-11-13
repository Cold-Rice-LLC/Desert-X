<script>
	/** A small paragraph in rich text, at the caption size, keeping its line breaks as PortableParagraph does. */
	let { children } = $props();
</script>

<p class="text-base whitespace-pre-line">{@render children()}</p>
