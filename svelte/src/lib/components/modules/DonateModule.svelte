<script>
	import Choice from '$lib/components/Choice.svelte';
	import ImageFrame from '$lib/components/ImageFrame.svelte';
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';

	/**
	 * A grey card: an image, and the visitor's choice of amount (a preset,
	 * or their own), side by side from md up. On phones it's one column,
	 * the title over the image. Donate opens the Blackbaud form at
	 * /donate/checkout with that one-time amount filled in, through the
	 * onetimeamt parameter Blackbaud's loader passes on. It's a full page
	 * load, so the loader runs.
	 *
	 * One-time only: pledges are on the form's own Pledge tab, which no URL
	 * parameter can open (plgamt fills the amount but leaves the form on
	 * One-time), so offering Pledge here would land visitors on the wrong tab.
	 */
	let { module } = $props();

	let selected = $state(null);
	let custom = $state('');

	let amount = $derived(selected === 'custom' ? Number(custom) || null : selected);
	let href = $derived(amount ? `/donate/checkout?onetimeamt=${amount}` : '/donate/checkout');
</script>

<div>
	<ModuleHeading heading={module.heading} />
	<div
		class={[
			'mx-gutter grid gap-y-line bg-grey-2 p-base font-mono md:grid-cols-2 md:gap-base',
			module.heading && 'mt-line'
		]}
	>
		<ImageFrame
			image={module.image}
			aspect={4 / 3}
			sizes="(width >= 768px) calc((100vw - 246px) / 2), calc(100vw - 100px)"
		/>

		<!-- Its contents join the card's column on phones, so the title can lead -->
		<div class="contents md:flex md:flex-col md:items-start">
			{#if module.title}
				<p class="-order-1 uppercase">{module.title}</p>
			{/if}
			{#if module.text}
				<p class="whitespace-pre-line md:mt-line">{module.text}</p>
			{/if}

			<div role="group" aria-label="Amount" class="flex flex-wrap gap-x-[0.6em] md:mt-line">
				{#each module.amounts ?? [] as preset (preset)}
					<Choice current={selected === preset} onclick={() => (selected = preset)}>
						${preset}
					</Choice>
				{/each}
				{#if selected === 'custom'}
					<!-- Focused as it replaces the button pressed, which would
					     otherwise drop focus to the page -->
					<label class="link-underline">
						$<input
							{@attach (input) => input.focus()}
							bind:value={custom}
							inputmode="numeric"
							placeholder="Amount"
							aria-label="Custom amount in dollars"
							class="w-[7ch]"
						/>
					</label>
				{:else}
					<button class="link-fade" onclick={() => (selected = 'custom')}>Custom amount</button>
				{/if}
			</div>

			<a {href} data-sveltekit-reload class="w-fit uppercase link-underline md:mt-auto md:pt-line"
				>Donate</a
			>
		</div>
	</div>
</div>
