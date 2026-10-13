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

	const frequencies = [
		{ value: 'once', label: 'One-time' },
		{ value: 'monthly', label: 'Monthly' }
	];
</script>

<div>
	<ModuleHeading heading={module.heading} />
	<div
		class={[
			'mx-gutter grid grid-cols-2 gap-[3rem] bg-grey-2 p-[3rem]',
			module.heading && 'mt-line'
		]}
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
				{#each frequencies as option, i (option.value)}
					{#if i}{' / '}{/if}
					<button
						class={[frequency === option.value && 'link-underline']}
						aria-pressed={frequency === option.value}
						onclick={() => (frequency = option.value)}
					>
						{option.label}
					</button>
				{/each}
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
