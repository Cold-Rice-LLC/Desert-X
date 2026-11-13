<script>
	let { class: className } = $props();
</script>

<!-- The outer strokes run to the box's edges, so it lets them overflow:
     clipped to the box, which the browser rounds to whole pixels, they'd
     lose a sliver and look thinner than the middle one -->
<svg
	class={['overflow-visible', className]}
	aria-hidden="true"
	viewBox="0 0 26 19.5"
	fill="none"
	stroke="currentColor"
	stroke-width="2.5"
	xmlns="http://www.w3.org/2000/svg"
>
	<line y1="1.25" x2="26" y2="1.25" />
	<line y1="9.75" x2="26" y2="9.75" />
	<line y1="18.25" x2="26" y2="18.25" />
</svg>
