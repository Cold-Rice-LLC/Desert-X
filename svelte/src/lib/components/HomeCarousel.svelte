<script>
	import { prefersReducedMotion } from 'svelte/motion';
	import { MediaQuery, SvelteSet } from 'svelte/reactivity';
	import AppLink from '$lib/components/AppLink.svelte';
	import Image from '$lib/components/Image.svelte';
	import { croppedSize } from '$lib/sanity/images';
	import { linkHref } from '$lib/sanity/links';

	/**
	 * The homepage: a row of images at the window's full height that drifts
	 * right to left and loops. The page doesn't scroll; a wheel or trackpad
	 * pushes the row instead, and a mouse drag pulls it, both easing out. A
	 * finger (swiping in either direction) holds the row and moves it with
	 * it, then lets go at the speed it was moving. It keeps drifting
	 * whichever way it was last pushed.
	 *
	 * The row is moved with a transform every frame, never scrolled, and is
	 * copied side by side so it can wrap without a seam: the second copy is
	 * the real one, the others inert. Each slide's caption sits bottom left,
	 * linking to where the slide goes, but not followed when the pointer
	 * dragged. Tabbing to one stops the row with its slide in the middle. The button bottom right pauses the drift, and with
	 * reduced motion there's none, and input moves the row without easing.
	 */
	let { slides } = $props();

	// Drift, in px/s, slower on phones, where it crosses the screen sooner,
	// and the time constant the row eases toward where it's been pushed
	// with, in s: about 6% of the way each frame at 60fps. 48rem is
	// Tailwind's md.
	const md = new MediaQuery('width >= 48rem');
	const speed = $derived(md.current ? 45 : 30);
	const ease = 0.27;
	// A wheel moves the row this many times its distance, and a drag this
	const wheelFactor = 0.6;
	const dragFactor = 2;
	// A pointer that travels further than this is dragging, not clicking
	const clickSlop = 8;
	// A finger lifted this long, in ms, after it last moved has stopped, and
	// doesn't fling the row
	const flingWindow = 100;

	// Enough copies to fill the window wherever the row has wrapped to,
	// remeasured once it's known
	let copies = $state(3);
	let paused = $state(false);
	let dragged = false;

	// The browser's lazy loading only looks again on scroll, not when a slide
	// moves into view, so slides within three windows' widths of it, and two
	// either side of those, are switched to eager by index, loading every
	// copy. They're decoded on the way in too: one decoded as it comes into
	// view can hold up that frame, or show blank for it.
	const near = new SvelteSet();
	const indexes = new WeakMap();
	const neighbours = 2;
	let observer;

	const nearby = (index) => (node) => {
		observer ??= new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					const nearIndex = indexes.get(entry.target);
					for (let step = -neighbours; step <= neighbours; step++) {
						near.add((nearIndex + step + slides.length) % slides.length);
					}
					entry.target.decode().catch(() => {});
				}
			},
			{ rootMargin: '0px 300%' }
		);
		indexes.set(node, index);
		observer.observe(node);
		return () => observer.unobserve(node);
	};

	// The image's width at the row's height, which is about the window's
	const sizes = (image) => {
		const size = croppedSize(image);
		return size ? `calc(100svh * ${(size.width / size.height).toFixed(3)})` : '100vw';
	};

	const carousel = (section) => {
		const track = section.firstElementChild;
		const real = track.children[1];

		// One copy's width, the row's position and where it's easing to, and
		// which way it drifts
		let width = 0;
		let current = 0;
		let target = 0;
		let direction = -1;
		let focused = false;
		let last;
		let frame;
		let pointer;

		// Unrounded, as the copies are laid out, so wrapping lands exactly
		const measure = () => {
			const next = real.getBoundingClientRect().width;
			if (!next) return;
			// Keep the same point of the row in view, and any push in flight
			const lead = target - current;
			current = width ? -next - ((-current - width) / width) * next : -next;
			target = current + lead;
			width = next;
			copies = 2 + Math.ceil(section.clientWidth / width);
		};

		// Push the row a distance, up to a window's width ahead of where it
		// is, and drift that way from then on
		const push = (distance) => {
			if (Math.abs(distance) < 0.5) return;
			direction = Math.sign(distance);
			const max = section.clientWidth;
			target = current + Math.max(-max, Math.min(max, target - current + distance));
		};

		const tick = (time) => {
			const dt = Math.min((time - (last ?? time)) / 1000, 0.1);
			last = time;
			const reduced = prefersReducedMotion.current;

			if (!paused && !focused && !pointer?.touch && !reduced) target += direction * speed * dt;
			current = reduced ? target : current + (target - current) * (1 - Math.exp(-dt / ease));

			// Wrap by whole copies to keep the real one starting in view. Not
			// while a slide has focus, which would swap it for a clone.
			if (width && !focused) {
				const shift = -Math.floor((current + 2 * width) / width) * width;
				current += shift;
				target += shift;
			}

			track.style.transform = `translate3d(${current}px, 0, 0)`;
			frame = requestAnimationFrame(tick);
		};

		const onwheel = (event) => {
			// Pinch-zooming a trackpad comes through as ctrl + wheel
			if (event.ctrlKey) return;
			event.preventDefault();
			const { deltaX, deltaY, deltaMode } = event;
			const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
			// Deltas in lines or pages, as some mice send
			push(-delta * [1, 16, section.clientHeight][deltaMode] * wheelFactor);
		};

		const onpointerdown = (event) => {
			if (event.button !== 0) return;
			pointer = {
				id: event.pointerId,
				touch: event.pointerType === 'touch',
				x: event.clientX,
				y: event.clientY,
				time: event.timeStamp,
				velocity: 0,
				travel: 0
			};
			dragged = false;
		};

		// Whichever axis moved most, so a phone's vertical swipe works too:
		// left or up moves the row on, right or down back. A finger moves the
		// row as far as it moves, keeping any push in flight, and its speed
		// is smoothed over the last few moves.
		const onpointermove = (event) => {
			if (event.pointerId !== pointer?.id) return;
			const dx = event.clientX - pointer.x;
			const dy = event.clientY - pointer.y;
			const distance = Math.abs(dx) > Math.abs(dy) ? dx : dy;
			const dt = (event.timeStamp - pointer.time) / 1000;
			pointer = { ...pointer, x: event.clientX, y: event.clientY, time: event.timeStamp };
			pointer.travel += Math.hypot(dx, dy);
			if (pointer.travel > clickSlop) dragged = true;
			if (!pointer.touch) return push(distance * dragFactor);
			current += distance;
			target += distance;
			if (distance) direction = Math.sign(distance);
			if (dt > 0) pointer.velocity = 0.7 * (distance / dt) + 0.3 * pointer.velocity;
		};

		// Easing out over the time constant from the finger's speed carries
		// on at that speed
		const onpointerup = (event) => {
			if (event.pointerId !== pointer?.id) return;
			if (pointer.touch && event.timeStamp - pointer.time < flingWindow) {
				push(pointer.velocity * ease);
			}
			pointer = undefined;
		};

		// Bring a slide tabbed to into the middle, and hold it there. Not one
		// focused by pressing it, which would stop the row on every drag.
		const onfocusin = (event) => {
			if (!event.target.matches(':focus-visible')) return;
			focused = true;
			const slide = event.target.closest('[data-slide]').getBoundingClientRect();
			const box = section.getBoundingClientRect();
			target = current + box.left + box.width / 2 - (slide.left + slide.width / 2);
		};

		const onfocusout = (event) => {
			if (!section.contains(event.relatedTarget)) focused = false;
		};

		const onvisibilitychange = () => {
			cancelAnimationFrame(frame);
			last = undefined;
			if (!document.hidden) frame = requestAnimationFrame(tick);
		};

		const resizeObserver = new ResizeObserver(measure);
		resizeObserver.observe(section);
		resizeObserver.observe(real);

		section.addEventListener('wheel', onwheel, { passive: false });
		section.addEventListener('pointerdown', onpointerdown);
		section.addEventListener('focusin', onfocusin);
		section.addEventListener('focusout', onfocusout);
		window.addEventListener('pointermove', onpointermove);
		window.addEventListener('pointerup', onpointerup);
		window.addEventListener('pointercancel', onpointerup);
		document.addEventListener('visibilitychange', onvisibilitychange);
		frame = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			observer?.disconnect();
			section.removeEventListener('wheel', onwheel);
			section.removeEventListener('pointerdown', onpointerdown);
			section.removeEventListener('focusin', onfocusin);
			section.removeEventListener('focusout', onfocusout);
			window.removeEventListener('pointermove', onpointermove);
			window.removeEventListener('pointerup', onpointerup);
			window.removeEventListener('pointercancel', onpointerup);
			document.removeEventListener('visibilitychange', onvisibilitychange);
		};
	};

	// A drag that ends over a link would otherwise follow it
	const onclickcapture = (event) => {
		if (!dragged) return;
		event.preventDefault();
		event.stopPropagation();
		dragged = false;
	};
</script>

{#snippet caption({ name, work })}
	{name}
	{#if work}<i>{work}</i>{/if}
{/snippet}

{#snippet picture(image, index)}
	<Image
		{image}
		sizes={sizes(image)}
		loading={near.has(index) ? 'eager' : 'lazy'}
		class="h-full w-auto max-w-none"
		{@attach nearby(index)}
	/>
{/snippet}

<!-- The browser's own image drag would cancel the pointer's. Links are
	 preloaded on press, not hover, or every slide drifting under a still
	 mouse would load its page. -->
<section
	class="relative flex-1 cursor-grab touch-none overflow-clip bg-grey-1 select-none active:cursor-grabbing"
	aria-roledescription="carousel"
	aria-label="Featured"
	data-sveltekit-preload-data="tap"
	{@attach carousel}
	{onclickcapture}
	ondragstart={(event) => event.preventDefault()}
>
	<div class="absolute inset-y-0 left-0 flex will-change-transform">
		{#each { length: copies }, copy (copy)}
			<div class="flex shrink-0" inert={copy !== 1}>
				{#each slides as slide, index (slide._key)}
					<div class="relative shrink-0" data-slide>
						{@render picture(slide.image, index)}
						{#if slide.caption && linkHref(slide)}
							<AppLink
								link={slide}
								class="absolute inset-x-edge bottom-edge w-fit text-base text-white link-underline"
							>
								{@render caption(slide.caption)}
							</AppLink>
						{:else if slide.caption}
							<p class="absolute inset-x-edge bottom-edge text-base text-white">
								{@render caption(slide.caption)}
							</p>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>

	{#if !prefersReducedMotion.current}
		<button
			class="absolute right-edge bottom-edge font-mono text-sm text-white uppercase"
			onclick={() => (paused = !paused)}
		>
			{paused ? 'Play' : 'Pause'}
		</button>
	{/if}
</section>
