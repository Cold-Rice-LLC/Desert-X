<script>
	import { page as currentPage } from '$app/state';

	/**
	 * Page-number links that keep the rest of the URL's query, with the
	 * current page underlined. Hidden when there's only one page. `class`
	 * goes on the <nav>.
	 */
	let { page, pageCount, class: className } = $props();

	const href = (number) => {
		const entries = [...currentPage.url.searchParams].filter(([key]) => key !== 'page');
		if (number > 1) entries.push(['page', number]);
		const query = new URLSearchParams(entries).toString();
		return query ? `?${query}` : currentPage.url.pathname;
	};
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
