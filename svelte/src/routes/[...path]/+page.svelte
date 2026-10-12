<script>
	let { data } = $props();
</script>

<!-- The title shows in the nav; this gives the page its heading for
     screen readers until modules render here -->
<h1 class="sr-only">{data.page.title}</h1>
