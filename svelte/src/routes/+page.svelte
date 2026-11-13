<script>
	import HomeCarousel from '$lib/components/HomeCarousel.svelte';

	let { data } = $props();
</script>

<h1 class="sr-only">DESERT X</h1>

<!-- The footer's links, which the homepage otherwise doesn't have -->
<HomeCarousel slides={data.slides} quickLinks={data.quickLinks} />
