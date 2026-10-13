<script>
	import ImageFrame from '$lib/components/ImageFrame.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/**
	 * Optional centred heading over a list of bios. Each bio is a 12-column
	 * row: the 4:5 image, its text beside it, and the bio text across the
	 * right half.
	 */
	let { module } = $props();
</script>

<div class="bios-module space-y-[1lh] px-gutter">
	{#if module.heading}
		<h2 class="text-center uppercase">{module.heading}</h2>
	{/if}

	{#if module.bios?.length > 0}
		<ul class="space-y-[2.5rem] text-base">
			{#each module.bios ?? [] as bio (bio._key)}
				<li class="grid grid-cols-12 items-start">
					<ImageFrame
						image={bio.image}
						aspect={4 / 5}
						sizes="calc((100vw - 13.6rem) / 4)"
						class="col-span-3"
					/>
					{#if bio.imageText}
						<div class="col-span-3 pl-24">
							<p class="whitespace-pre-line">{bio.imageText}</p>
						</div>
					{/if}
					{#if bio.text}
						<div class="col-span-6 space-y-[1lh]">
							<Portable value={bio.text} />
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
