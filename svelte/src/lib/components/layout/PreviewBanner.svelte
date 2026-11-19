<script>
	import { page } from '$app/state';

	/**
	 * Says a page is a draft preview (see $lib/server/sanity), pinned to the
	 * bottom over everything, with a link back to the published page. That
	 * link reloads the page in full, as its drafts came from the server.
	 */
	let exitHref = $derived.by(() => {
		const url = new URL(page.url);
		url.searchParams.delete('preview');
		return url.pathname + url.search + url.hash;
	});
</script>

<aside
	class="fixed inset-x-0 bottom-0 z-40 flex justify-between gap-sm bg-black px-gutter py-xs text-sm text-white"
>
	<p>Preview: showing unpublished changes</p>
	<a href={exitHref} data-sveltekit-reload class="link-underline">Exit preview</a>
</aside>
