<script>
	import HomeCarousel from '$lib/components/HomeCarousel.svelte';

	let { data } = $props();
</script>

<h1 class="sr-only">DESERT X</h1>

<HomeCarousel slides={data.slides} />
