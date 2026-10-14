<script>
	import HomeCarousel from '$lib/components/HomeCarousel.svelte';

	let { data } = $props();
</script>

<HomeCarousel slides={data.slides} />
