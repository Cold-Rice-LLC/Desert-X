<script>
	import ImageFrame from '$lib/components/ImageFrame.svelte';
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';

	/**
	 * A grey card: an image, and the visitor's choice of one-time or monthly
	 * and an amount (a preset, or their own). Donate opens the Blackbaud form
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
	<button
		class={[frequency === value && 'link-underline']}
		aria-pressed={frequency === value}
		onclick={() => (frequency = value)}
	>
		{label}
	</button>
{/snippet}

<div>
	<ModuleHeading heading={module.heading} />
	<div
		class={['mx-gutter grid grid-cols-2 gap-base bg-grey-2 p-base', module.heading && 'mt-line']}
	>
		<ImageFrame image={module.image} aspect={4 / 3} sizes="calc((100vw - 22.6rem) / 2)" />

		<div class="flex flex-col items-start font-mono">
			{#if module.title}
				<p class="uppercase">{module.title}</p>
			{/if}
			{#if module.text}
				<p class="mt-line whitespace-pre-line">{module.text}</p>
			{/if}

			<div role="group" aria-label="How often" class="mt-line uppercase">
				{@render frequencyButton('once', 'One-time')}
				/
				{@render frequencyButton('monthly', 'Monthly')}
			</div>

			<div role="group" aria-label="Amount" class="mt-line flex flex-wrap gap-x-[0.6em]">
				{#each module.amounts ?? [] as preset (preset)}
					<button
						class={[selected === preset && 'link-underline']}
						aria-pressed={selected === preset}
						onclick={() => (selected = preset)}
					>
						${preset}
					</button>
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
					<button onclick={() => (selected = 'custom')}>Custom amount</button>
				{/if}
			</div>

			<a {href} data-sveltekit-reload class="mt-auto pt-line uppercase link-underline">Donate</a>
		</div>
	</div>
</div>
