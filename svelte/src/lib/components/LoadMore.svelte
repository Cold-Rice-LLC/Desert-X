<script>
	import { goto } from '$app/navigation';
	import { page as currentPage } from '$app/state';
	import { queryHref } from '$lib/url';

	/**
	 * "Load More" under a list while there's more of it (`page` of
	 * `pageCount` batches shown): a link to the next `?page=`, which shows
	 * that many batches. It loads in place, keeping the scroll and replacing
	 * the history entry, so Back leaves the page and a refresh keeps what's
	 * loaded, then focuses the first new item's link: the list is the
	 * element just before this one. A plain link without JavaScript, or
	 * opened in a new tab. `class` goes on the <p>.
	 */
	let { page, pageCount, class: className } = $props();

	let el = $state();
	let href = $derived(queryHref(currentPage.url, { page: page + 1 }));

	async function loadMore(event) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		const list = el.previousElementSibling;
		const shown = list.children.length;
		await goto(href, { replaceState: true, noScroll: true, keepFocus: true });
		list.children[shown]?.querySelector('a')?.focus();
	}
</script>

{#if page < pageCount}
	<p bind:this={el} class={['px-gutter', className]}>
		Load <a {href} class="link-underline" onclick={loadMore}>More</a>
	</p>
{/if}
