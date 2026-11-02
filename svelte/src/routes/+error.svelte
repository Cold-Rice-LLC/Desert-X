<script>
	import { page } from '$app/state';
</script>

<div class="px-gutter pt-page-top text-md">
	<h1>
		{page.status}. {page.status === 404 ? 'This page was not found' : 'Something went wrong'}
	</h1>
	<a href="/" class="link-underline">Back to the homepage</a>
</div>
