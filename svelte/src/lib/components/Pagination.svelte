<script>
	import { page as currentPage } from '$app/state';
	import Choice from '$lib/components/Choice.svelte';
	import { queryHref } from '$lib/url';

	/**
	 * Page-number links that keep the rest of the URL's query, with the
	 * current page underlined. Hidden when there's only one page. `class`
	 * goes on the <nav>.
	 */
	let { page, pageCount, class: className } = $props();

	const href = (number) => queryHref(currentPage.url, { page: number > 1 ? number : null });
</script>

{#if pageCount > 1}
	<nav aria-label="Pagination" class={['px-gutter', className]}>
		<ul class="flex gap-x-[0.45em]">
			{#each { length: pageCount }, i (i)}
				<li>
					<Choice href={href(i + 1)} current={i + 1 === page}>{i + 1}</Choice>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
