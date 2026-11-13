<script>
	import AppLink from '$lib/components/AppLink.svelte';
	import Portable from '$lib/components/Portable.svelte';
	import Search from '$lib/components/icons/Search.svelte';

	/**
	 * Site footer, on every page but the homepage: search over a rule, then
	 * the footer's `groups`, each a title over its links or text, and the
	 * trademark and copyright the site writes itself, over the `credits`.
	 * On phones the groups go two to a row, a rule under each row, the
	 * trademark under them all. From md up they're a row, each as wide as
	 * its content and the edge margin apart, with the trademark, at most
	 * 36.5rem wide, against the right edge; either wraps under the other
	 * when they don't fit. `footer` is `{ groups, credits }`.
	 */
	let { footer } = $props();
</script>

<!-- Rich text links are underlined elsewhere, but not here, so they fade instead -->
<footer
	class="mt-auto px-edge pb-edge text-base md:flex md:flex-wrap md:items-start md:justify-between md:gap-x-edge [&_a]:no-underline [&_a]:link-fade"
>
	<!-- The rule is the search row's border, across the footer -->
	<a href="/search" aria-label="Search" class="block border-b-2 pb-[1.8rem] md:basis-full">
		<Search class="h-[2.4rem] w-auto" />
	</a>

	<!-- On phones each group's border joins its neighbour's into the rule
	     under their row, as the columns have no gap between them -->
	<div class="grid grid-cols-2 md:flex md:flex-wrap md:gap-x-edge">
		{#each footer.groups as group (group._key)}
			<div class="space-y-line border-b-2 pt-[2rem] pb-[2.3rem] md:border-b-0 md:pb-0">
				<h2>{group.title}</h2>
				{#if group.kind === 'text'}
					<Portable value={group.text} />
				{:else if group.links?.length}
					<ul>
						{#each group.links as link (link._key)}
							<li><AppLink {link}>{link.label}</AppLink></li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	</div>

	<div class="max-w-[36.5rem] pt-[2rem]">
		<p>
			<span aria-hidden="true">[logo]</span><span class="sr-only">DESERT X</span> is a ® registered
			trademark. © Desert Biennial {new Date().getFullYear()}.
		</p>
		{#if footer.credits}
			<Portable value={footer.credits} />
		{/if}
	</div>
</footer>
