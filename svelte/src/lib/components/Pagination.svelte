<script>
	import { page as currentPage } from '$app/state';
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
					<a
						href={href(i + 1)}
						class={[i + 1 === page && 'link-underline']}
						aria-current={i + 1 === page ? 'page' : undefined}
					>
						{i + 1}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
