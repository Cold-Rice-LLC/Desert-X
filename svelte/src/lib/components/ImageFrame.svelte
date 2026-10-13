<script>
	import Image from '$lib/components/Image.svelte';

	/**
	 * A grey frame the image covers, cropped to fit, so there's something in
	 * its place while it loads. With an `aspect` (width / height) the frame
	 * takes that ratio and the image files are cropped to it; otherwise
	 * `class` sizes it. Without an image the grey frame holds its place.
	 * `sizes` and `loading` pass to Image.
	 */
	let { image, aspect, sizes, loading, class: className } = $props();
</script>

<figure class={['overflow-hidden bg-grey-1', className]} style:aspect-ratio={aspect}>
	{#if image?.asset}
		<Image {image} {aspect} {sizes} {loading} class="size-full object-cover" />
	{/if}
</figure>
