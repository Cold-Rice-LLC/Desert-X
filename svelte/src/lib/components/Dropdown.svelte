<script>
	import Caret from '$lib/components/icons/Caret.svelte';

	/**
	 * A native <details> dropdown: `summary` is its title row, with a caret
	 * that flips when open, and `children` what opens under it. It opens
	 * without JavaScript and find-in-page can open it. Dropdowns sharing a
	 * `name` close each other, so only one is open at a time. `open` binds.
	 * Titles are larger than the text on phones. The first title in a stack
	 * has no top padding, so it sits a line under a heading. `class` goes on the <details>, `summaryClass` on the row,
	 * and other attributes, like `id`, pass through to the <details>.
	 */
	let {
		name,
		open = $bindable(false),
		summary,
		children,
		class: className,
		summaryClass,
		...rest
	} = $props();
</script>

<details {...rest} {name} bind:open class={['group', className]}>
	<summary
		class={[
			// Safari's disclosure triangle, which list-none doesn't hide
			'flex cursor-pointer list-none items-center justify-between py-sm text-[2.6rem] group-first:pt-0 md:text-md [&::-webkit-details-marker]:hidden',
			summaryClass
		]}
	>
		{@render summary()}
		<Caret class="h-[1.8rem] w-auto group-open:rotate-180" />
	</summary>
	{@render children?.()}
</details>
