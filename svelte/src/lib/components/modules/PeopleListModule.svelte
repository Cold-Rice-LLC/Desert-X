<script>
	/**
	 * Two titled lists of people, typed as plain text with their own line
	 * breaks, stacked on phones, the right list's second text under its
	 * first. From md up the left list is across half the grid, and the right
	 * list's two texts split the other half.
	 */
	let { module } = $props();

	let left = $derived(module.leftList ?? {});
	let right = $derived(module.rightList ?? {});
</script>

<div class="grid gap-y-md px-gutter text-base md:grid-cols-12">
	<section class="space-y-line md:col-span-6">
		{#if left.title}
			<h2>{left.title}</h2>
		{/if}
		{#if left.text}
			<p class="whitespace-pre-line">{left.text}</p>
		{/if}
	</section>

	<section class="grid content-start gap-y-line md:col-span-6 md:grid-cols-2">
		{#if right.title}
			<h2 class="md:col-span-2">{right.title}</h2>
		{/if}
		{#each [right.text1, right.text2] as text, i (i)}
			{#if text}
				<p class={['whitespace-pre-line', i && 'md:col-start-2']}>{text}</p>
			{/if}
		{/each}
	</section>
</div>
