<script>
	import Modules from '$lib/components/modules/Modules.svelte';

	let { data } = $props();
</script>

<h1 class="sr-only">{data.navTitle}</h1>

<Modules modules={data.modules} />
