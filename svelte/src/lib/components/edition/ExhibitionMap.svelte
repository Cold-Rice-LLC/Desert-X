<script>
	import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
	import { mount, tick, unmount } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { artworkCredit } from '$lib/art';
	import LogoMark from '$lib/components/icons/LogoMark.svelte';
	import ImageFrame from '$lib/components/ImageFrame.svelte';
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/**
	 * A heading ("Exhibition Map" unless overridden) over a Mapbox map of an
	 * edition's artworks with coordinates, each marked with the logo's X,
	 * then `text` and, given `href`, a "View Edition" link. Choosing
	 * an X turns it black and opens a card with the artist, title (up to two
	 * lines), thumbnail and a See Details link, across the bottom on phones
	 * and in the top right from md up, which scrolls if it's taller than the
	 * map. The close button, Escape or a
	 * click on the map closes it. The map is recoloured to the site's greys,
	 * without labels, under a grid that moves with it. Mapbox only loads
	 * once the map nears the viewport, which also keeps it off the server.
	 * From lg up the map is locked, framed on every X and refit as it
	 * resizes. Below lg it pans and zooms, and choosing an X flies the map
	 * to it: on phones with a finger and a pinch, from md up with two
	 * fingers or Ctrl and the wheel, so scrolling past it still scrolls. Left out with no located
	 * artworks. `class` passes to its section.
	 */
	let { artworks, text, href, heading = 'Exhibition Map', class: className } = $props();

	// Tailwind's lg: rem in a media query is the browser's 16px, not the root's
	const locked = new MediaQuery('width >= 64rem');
	const wide = new MediaQuery('width >= 48rem');

	const style = 'mapbox://styles/mapbox/light-v11';

	let located = $derived(
		artworks
			.filter((artwork) => Number.isFinite(artwork.coordinates?.lat))
			.map((artwork) => ({
				artwork,
				lngLat: [artwork.coordinates.lng, artwork.coordinates.lat],
				artists: artworkCredit(artwork)
			}))
	);

	let frameEl = $state();
	let mapEl = $state();
	let cardEl = $state();

	let map = $state.raw();
	let markers = [];
	let selectedId = $state(null);
	let selected = $derived(located.find((pin) => pin.artwork._id === selectedId));

	// Markers aren't Svelte's, so their state is set here. The chosen id is
	// read first, so the effect reruns on it even before markers exist
	$effect(() => {
		const chosen = selectedId;
		for (const { id, element } of markers) {
			element.setAttribute('aria-pressed', String(id === chosen));
		}
	});

	async function select(id) {
		selectedId = id;
		const pin = located.find((p) => p.artwork._id === id);
		if (pin && map && !locked.current) {
			// Keeps the chosen X clear of the card, measured once it's shown:
			// beside it from md up, above it on phones
			await tick();
			const gap = 40;
			const padding = { top: gap, bottom: gap, left: gap, right: gap };
			if (wide.current) padding.right += cardEl?.offsetWidth ?? 0;
			else padding.bottom += cardEl?.offsetHeight ?? 0;
			map.flyTo({ center: pin.lngLat, zoom: Math.max(map.getZoom(), 13), padding });
		}
	}

	function bounds(pins) {
		const lngs = pins.map((pin) => pin.lngLat[0]);
		const lats = pins.map((pin) => pin.lngLat[1]);
		return [
			[Math.min(...lngs), Math.min(...lats)],
			[Math.max(...lngs), Math.max(...lats)]
		];
	}

	// Lines every `step` degrees around the artworks, as GeoJSON. Coarser
	// steps take over as the map zooms out, so the grid stays about as dense
	function grid(step) {
		const [[west, south], [east, north]] = bounds(located);
		const pad = 1;
		const snap = (value, round) => round(value / step) * step;
		const [x0, x1] = [snap(west - pad, Math.floor), snap(east + pad, Math.ceil)];
		const [y0, y1] = [snap(south - pad, Math.floor), snap(north + pad, Math.ceil)];
		const lines = [];
		for (let x = x0; x <= x1 + step / 2; x += step)
			lines.push([
				[x, y0],
				[x, y1]
			]);
		for (let y = y0; y <= y1 + step / 2; y += step)
			lines.push([
				[x0, y],
				[x1, y]
			]);
		return {
			type: 'Feature',
			properties: {},
			geometry: { type: 'MultiLineString', coordinates: lines }
		};
	}

	// The light style in the site's greys: flat ground; roads, paths, water
	// and the grid in a darker grey; black buildings; and no labels. Mapbox
	// paint can't read CSS variables, so the tokens are resolved here
	function restyle(instance) {
		const token = (name) => getComputedStyle(frameEl).getPropertyValue(name).trim();
		const ground = token('--color-grey-2');
		const dark = token('--color-grey-3');
		const black = token('--color-black');

		for (const { id, type } of instance.getStyle().layers) {
			const hide = () => instance.setLayoutProperty(id, 'visibility', 'none');
			const paint = (property, value) => instance.setPaintProperty(id, property, value);

			if (type === 'symbol' || type === 'hillshade' || /case|shadow/.test(id)) hide();
			else if (type === 'background') paint('background-color', ground);
			else if (type === 'fill-extrusion') paint('fill-extrusion-color', black);
			else if (type === 'fill' && id.startsWith('building')) paint('fill-color', black);
			else if (type === 'fill') paint('fill-color', id.startsWith('water') ? dark : ground);
			else if (type === 'line') paint('line-color', dark);
		}

		for (const [step, minzoom, maxzoom] of [
			[0.25, 0, 9],
			[0.05, 9, 12],
			[0.01, 12, 24]
		]) {
			instance.addLayer({
				id: `grid-${step}`,
				type: 'line',
				source: { type: 'geojson', data: grid(step) },
				minzoom,
				maxzoom,
				paint: { 'line-color': dark, 'line-width': 0.5 }
			});
		}
	}

	// Every X in view: the opening view, and the locked map's at any size
	const view = () =>
		located.length > 1
			? { bounds: bounds(located), fitBoundsOptions: { padding: 80, maxZoom: 13 } }
			: { center: located[0].lngLat, zoom: 13 };

	function frame(instance) {
		const { bounds, fitBoundsOptions, ...camera } = view();
		if (bounds) instance.fitBounds(bounds, { ...fitBoundsOptions, animate: false });
		else instance.jumpTo(camera);
	}

	// The gestures that move the map, off from lg up
	const handlers = [
		'dragPan',
		'scrollZoom',
		'boxZoom',
		'doubleClickZoom',
		'keyboard',
		'touchZoomRotate'
	];

	// Cooperative gestures go off first: disabling a handler with them on
	// detaches its "use two fingers" hint, and enabling it never puts it back
	$effect(() => {
		if (!map) return;
		const lock = locked.current;
		map.setCooperativeGestures(!lock && wide.current);
		for (const handler of handlers) map[handler][lock ? 'disable' : 'enable']();
		if (lock) frame(map);
		else map.touchZoomRotate.disableRotation();
	});

	function createMap(mapboxgl) {
		mapboxgl.accessToken = PUBLIC_MAPBOX_TOKEN;

		const instance = new mapboxgl.Map({
			container: mapEl,
			style,
			...view(),
			cooperativeGestures: true,
			dragRotate: false,
			pitchWithRotate: false,
			touchPitch: false,
			attributionControl: false
		});
		instance.touchZoomRotate.disableRotation();
		instance.on('resize', () => locked.current && frame(instance));
		instance.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

		// Before the first render, so the light style never flashes
		instance.on('style.load', () => restyle(instance));

		markers = located.map((pin) => {
			const element = document.createElement('button');
			element.type = 'button';
			element.className = 'map-marker';
			element.setAttribute(
				'aria-label',
				[pin.artists, pin.artwork.title].filter(Boolean).join(', ')
			);
			element.setAttribute('aria-pressed', 'false');
			const icon = mount(LogoMark, { target: element, props: { class: 'size-full' } });
			element.addEventListener('click', () => select(pin.artwork._id));
			const marker = new mapboxgl.Marker({ element }).setLngLat(pin.lngLat).addTo(instance);
			// Mapbox calls every marker an image, hiding that it's a button
			element.removeAttribute('role');
			return { id: pin.artwork._id, element, icon, marker };
		});

		// Clicks on the map itself close the card; markers sit inside the map,
		// so theirs reach here too and are left to the marker
		instance.on('click', (event) => {
			if (!event.originalEvent.target.closest('.map-marker')) selectedId = null;
		});

		return instance;
	}

	$effect(() => {
		if (!located.length) return;
		let cancelled = false;

		const observer = new IntersectionObserver(
			async ([entry]) => {
				if (!entry.isIntersecting) return;
				observer.disconnect();

				const [{ default: mapboxgl }] = await Promise.all([
					import('mapbox-gl'),
					import('mapbox-gl/dist/mapbox-gl.css')
				]);
				if (!cancelled) map = createMap(mapboxgl);
			},
			{ rootMargin: '400px' }
		);
		observer.observe(frameEl);

		return () => {
			cancelled = true;
			observer.disconnect();
			for (const { icon, marker } of markers) {
				unmount(icon);
				marker.remove();
			}
			markers = [];
			map?.remove();
		};
	});
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && (selectedId = null)} />

{#if located.length}
	<section class={className}>
		<ModuleHeading {heading} />

		<div class="mt-line px-gutter">
			<div bind:this={frameEl} class="relative h-[60vh] overflow-hidden bg-grey-2 md:h-[80vh]">
				<!-- Mapbox's own CSS makes this position: relative, so it fills by size instead -->
				<div bind:this={mapEl} class="size-full"></div>

				{#if selected}
					<section
						bind:this={cardEl}
						aria-label="Installation"
						class="absolute inset-x-sm bottom-sm z-10 max-h-[calc(100%-2*var(--spacing-sm))] space-y-line overflow-y-auto overscroll-contain bg-white p-sm font-mono [scrollbar-width:none] md:inset-x-auto md:top-base md:right-base md:bottom-auto md:max-h-[calc(100%-2*var(--spacing-base))] md:w-[40rem] md:p-base"
					>
						<div class="flex items-start justify-between gap-base">
							<p>
								{selected.artists}
								<cite class="-my-[0.1em] line-clamp-2 py-[0.1em]">{selected.artwork.title}</cite>
							</p>
							<button
								type="button"
								aria-label="Close"
								class="link-fade"
								onclick={() => (selectedId = null)}
							>
								X
							</button>
						</div>
						<!-- Keyed so a new artwork's image fades in on the grey frame, not
						     over the last one's -->
						{#key selected.artwork._id}
							{#if selected.artwork.thumbnail?.asset}
								<ImageFrame
									image={selected.artwork.thumbnail}
									aspect={4 / 3}
									sizes="400px"
									loading="eager"
								/>
							{/if}
						{/key}
						<p>See <a href="/art/{selected.artwork.slug}" class="link-underline">Details</a></p>
					</section>
				{/if}
			</div>

			{#if text}
				<div class="mt-base">
					<Portable value={text} />
				</div>
			{/if}
			{#if href}
				<p class="mt-base">View <a {href} class="link-underline">Edition</a></p>
			{/if}
		</div>
	</section>
{/if}

<style>
	/* Mapbox's grab cursor, for a map that can't be dragged from lg up.
	   Scoped to outrank Mapbox's CSS, which loads after this */
	div :global(.mapboxgl-canvas-container.mapboxgl-interactive) {
		@media (width >= 64rem) {
			cursor: default;
		}
	}

	/* The markers, built here for Mapbox outside Svelte's scope. Not
	   utilities: Mapbox's CSS, unlayered, would outrank them. */
	:global(.map-marker) {
		width: 3rem;
		color: var(--color-white);
		cursor: pointer;

		&:global([aria-pressed='true']) {
			z-index: 1;
			color: var(--color-black);
		}
	}
</style>
