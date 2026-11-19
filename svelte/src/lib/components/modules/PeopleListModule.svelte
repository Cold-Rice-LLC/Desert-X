<script>
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/**
	 * An optional centred heading and intro text across the top, a blank
	 * line apart and at the text modules' size, over two titled lists of
	 * people in the smaller base size, typed as plain text with their own
	 * line breaks. The lists stack on phones, half as far apart as the
	 * header is from them (its margin making up the rest), the right list's
	 * second text under its first. From md up the left list is across half
	 * the grid, and the right list's two texts split the other half. The
	 * left list and the right's first text each keep a gap clear on their
	 * right, so long lines don't run into the column after; every column
	 * still starts on its grid line. Under a heading, the lists' titles are
	 * h3s.
	 */
	let { module } = $props();

	let left = $derived(module.leftList ?? {});
	let right = $derived(module.rightList ?? {});
	let titleTag = $derived(module.heading ? 'h3' : 'h2');
</script>

<div class="grid gap-y-base px-gutter md:grid-cols-12 md:gap-y-md">
	{#if module.heading || module.intro}
		<header class="mb-base space-y-line md:col-span-12 md:mb-0">
			<ModuleHeading heading={module.heading} />
			{#if module.intro}
				<Portable value={module.intro} />
			{/if}
		</header>
	{/if}

	<section class="space-y-line text-base md:col-span-6 md:pr-base">
		{#if left.title}
			<svelte:element this={titleTag}>{left.title}</svelte:element>
		{/if}
		{#if left.text}
			<p class="whitespace-pre-line">{left.text}</p>
		{/if}
	</section>

	<section class="grid content-start gap-y-line text-base md:col-span-6 md:grid-cols-2">
		{#if right.title}
			<svelte:element this={titleTag} class="md:col-span-2">{right.title}</svelte:element>
		{/if}
		{#each [right.text1, right.text2] as text, i (i)}
			{#if text}
				<p class={['whitespace-pre-line', i ? 'md:col-start-2' : 'md:pr-base']}>{text}</p>
			{/if}
		{/each}
	</section>
</div>
