<script>
	import Choice from '$lib/components/Choice.svelte';
	import ImageFrame from '$lib/components/ImageFrame.svelte';
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';

	/**
	 * A grey card: an image, and the visitor's choice of one-time or monthly
	 * and an amount (a preset, or their own), side by side from md up. On
	 * phones it's one column, the title over the image. Donate opens the Blackbaud form
	 * at /donate/checkout with that choice filled in, through the URL
	 * parameters Blackbaud's loader passes on: onetimeamt, or rgamt for a
	 * recurring gift. It's a full page load, so the loader runs.
	 */
	let { module } = $props();

	let frequency = $state('once');
	let selected = $state(null);
	let custom = $state('');

	let amount = $derived(selected === 'custom' ? Number(custom) || null : selected);
	let href = $derived.by(() => {
		if (!amount) return '/donate/checkout';
		const parameter = frequency === 'monthly' ? 'rgamt' : 'onetimeamt';
		return `/donate/checkout?${parameter}=${amount}`;
	});
</script>

{#snippet frequencyButton(value, label)}
	<Choice current={frequency === value} onclick={() => (frequency = value)}>{label}</Choice>
{/snippet}

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
			sizes="(width >= 768px) calc((100vw - 226px) / 2), calc(100vw - 90px)"
		/>

		<!-- Its contents join the card's column on phones, so the title can lead -->
		<div class="contents md:flex md:flex-col md:items-start">
			{#if module.title}
				<p class="-order-1 uppercase">{module.title}</p>
			{/if}
			{#if module.text}
				<p class="whitespace-pre-line md:mt-line">{module.text}</p>
			{/if}

			<div role="group" aria-label="How often" class="uppercase md:mt-line">
				{@render frequencyButton('once', 'One-time')}
				/
				{@render frequencyButton('monthly', 'Monthly')}
			</div>

			<div role="group" aria-label="Amount" class="flex flex-wrap gap-x-[0.6em] md:mt-line">
				{#each module.amounts ?? [] as preset (preset)}
					<Choice current={selected === preset} onclick={() => (selected = preset)}>
						${preset}
					</Choice>
				{/each}
				{#if selected === 'custom'}
					<label class="link-underline">
						$<input
							bind:value={custom}
							inputmode="numeric"
							placeholder="Amount"
							aria-label="Custom amount in dollars"
							class="w-[7ch] outline-none"
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
