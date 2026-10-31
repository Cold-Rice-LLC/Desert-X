<script>
	import { page } from '$app/state';
</script>

<main class="px-gutter pt-page-top text-md">
	<p>
		{page.status}. {page.status === 404 ? 'This page was not found' : 'Something went wrong'}
	</p>
	<a href="/" class="link-underline">Back to the homepage</a>
</main>
