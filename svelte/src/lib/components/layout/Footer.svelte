<script>
	import AppLink from '$lib/components/AppLink.svelte';
	import Portable from '$lib/components/Portable.svelte';
	import Search from '$lib/components/icons/Search.svelte';

	/**
	 * Site footer, on every page but the homepage: search over a rule, then
	 * the footer's `groups`, each its links or text, untitled, and the
	 * trademark and copyright the site writes itself, over the `credits`.
	 * On phones the groups go two to a row, a rule under each row, the
	 * trademark under them all. From md up they're a row, each as wide as
	 * its content and the edge margin apart, with the trademark filling the
	 * rest of the row, or under them across the footer when that would
	 * leave it less than 36.5rem. Its lines sit against the right edge
	 * while none of them wraps, and fill its space once one does. `footer` is `{ groups, credits }`.
	 */
	let { footer } = $props();
</script>

<!-- Rich text links are underlined elsewhere, but not here, so they fade instead -->
<footer
	class="mt-auto px-edge pb-edge text-base md:flex md:flex-wrap md:items-start md:gap-x-edge [&_a]:no-underline [&_a]:link-fade"
>
	<!-- The rule is the search row's border, across the footer -->
	<a href="/search" aria-label="Search" class="block border-b-2 pb-[1.8rem] md:basis-full">
		<Search class="h-[2.4rem] w-auto" />
	</a>

	<!-- On phones each group's border joins its neighbour's into the rule
	     under their row, as the columns have no gap between them -->
	<div class="grid grid-cols-2 md:flex md:flex-wrap md:gap-x-edge">
		{#each footer.groups as group (group._key)}
			<div class="border-b-2 pt-[2rem] pb-[2.3rem] md:border-b-0 md:pb-0">
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

	<!-- One column as wide as its longest line, up to all its space, at the
	     right -->
	<div
		class="pt-[2rem] md:grid md:min-w-[36.5rem] md:flex-1 md:grid-cols-[minmax(0,max-content)] md:justify-end"
	>
		<p>
			<span aria-hidden="true">[logo]</span><span class="sr-only">DESERT X</span> is a ® registered
			trademark. © Desert Biennial {new Date().getFullYear()}.
		</p>
		{#if footer.credits}
			<Portable value={footer.credits} />
		{/if}
	</div>
</footer>
