<script>
	import Modules from '$lib/components/modules/Modules.svelte';

	let { data } = $props();
</script>

<!-- The title shows in the nav; this gives the page its heading for
     screen readers -->
<h1 class="sr-only">{data.page.title}</h1>

<Modules modules={data.page.modules} />
