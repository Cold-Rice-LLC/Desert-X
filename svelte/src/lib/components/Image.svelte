<script>
	import { imageSources } from '$lib/sanity/images';

	/**
	 * A Sanity image queried with `imageFields` as an <img> with a srcset in
	 * the best format the browser takes, lazy by default. `sizes` is how wide
	 * it displays (default 100vw) so the browser can pick a file, and an
	 * `aspect` (width / height) crops every file to it around the hotspot.
	 *
	 * Lazy images start transparent and fade in once loaded; `loaded` is also
	 * set on error so a broken file doesn't stay blank. Pass `loading="eager"`
	 * for above-the-fold images so they paint immediately. Other attributes,
	 * like `class`, pass through to the <img>.
	 */
	let { image, aspect, sizes = '100vw', loading = 'lazy', class: className, ...rest } = $props();

	let sources = $derived(imageSources(image, aspect));
	let lazy = $derived(loading === 'lazy');

	let el = $state();
	let loaded = $state(false);

	// A cached image can finish before hydration attaches onload. `complete`
	// alone isn't enough, since a lazy image still waiting its turn also
	// reports complete, so require decoded pixels too.
	$effect(() => {
		if (el?.complete && el.naturalWidth > 0) loaded = true;
	});
</script>

<img
	{...rest}
	bind:this={el}
	src={sources.src}
	srcset={sources.srcset}
	{sizes}
	alt={image.alt ?? ''}
	width={sources.width}
	height={sources.height}
	{loading}
	class={[className, lazy && 'transition-opacity duration-300', lazy && !loaded && 'opacity-0']}
	onload={() => (loaded = true)}
	onerror={() => (loaded = true)}
/>
