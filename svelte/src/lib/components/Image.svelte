<script>
	import { imageSources } from '$lib/sanity/images';

	/**
	 * A Sanity image queried with `imageFields` as an <img> with a srcset in
	 * the best format the browser takes, lazy by default. `sizes` is how wide
	 * it displays (default 100vw) so the browser can pick a file, and an
	 * `aspect` (width / height) crops every file to it around the hotspot.
	 *
	 * Images start transparent and fade in once loaded; `loaded` is also set
	 * on error so a broken file doesn't stay blank. Pass `loading="eager"` for
	 * above-the-fold images so they load straight away. Bind `loaded` to fade
	 * something else in with it. Other attributes, like `class`, pass
	 * through to the <img>.
	 */
	let {
		image,
		aspect,
		sizes = '100vw',
		loading = 'lazy',
		loaded = $bindable(false),
		class: className,
		...rest
	} = $props();

	let sources = $derived(imageSources(image, aspect));

	let el = $state();

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
	class={className}
	class:loaded
	onload={() => (loaded = true)}
	onerror={() => (loaded = true)}
/>

<style>
	/* The same fade as Tailwind's transition-opacity duration-300, as the
	   menu and news tiles use */
	img {
		transition: opacity 300ms var(--default-transition-timing-function);

		&:not(.loaded) {
			opacity: 0;
		}
	}
</style>
