<script>
	import Modules from '$lib/components/modules/Modules.svelte';

	let { data } = $props();
</script>

<Modules modules={data.news.modules} narrow>
	<h1 class="px-module text-center text-balance">{data.news.title}</h1>
</Modules>
