<script>
	/**
	 * Two titled lists of people, typed as plain text with their own line
	 * breaks: the left list across half the grid, the right list's two texts
	 * splitting the other half.
	 */
	let { module } = $props();

	let left = $derived(module.leftList ?? {});
	let right = $derived(module.rightList ?? {});
</script>

<div class="grid grid-cols-12 px-gutter text-base">
	<section class="col-span-6 space-y-[1lh]">
		{#if left.title}
			<h2>{left.title}</h2>
		{/if}
		{#if left.text}
			<p class="whitespace-pre-line">{left.text}</p>
		{/if}
	</section>

	<section class="col-span-6 grid grid-cols-2 content-start gap-y-[1lh]">
		{#if right.title}
			<h2 class="col-span-2">{right.title}</h2>
		{/if}
		{#each [right.text1, right.text2] as text, i (i)}
			{#if text}
				<p class={['whitespace-pre-line', i && 'col-start-2']}>{text}</p>
			{/if}
		{/each}
	</section>
</div>
