<script>
	import ImageFrame from '$lib/components/ImageFrame.svelte';
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/**
	 * Optional centred heading over a list of bios. Each bio is a 12-column
	 * row: the 4:5 image, its text beside it, and the bio text across the
	 * right half.
	 */
	let { module } = $props();
</script>

<div class="space-y-line px-gutter">
	<ModuleHeading heading={module.heading} />

	{#if module.bios?.length}
		<ul class="space-y-base text-base">
			{#each module.bios as bio (bio._key)}
				<li class="grid grid-cols-12 items-start">
					<ImageFrame
						image={bio.image}
						aspect={4 / 5}
						sizes="calc((100vw - 136px) / 4)"
						class="col-span-3"
					/>
					{#if bio.imageText}
						<p class="col-span-3 pl-[6rem] whitespace-pre-line">{bio.imageText}</p>
					{/if}
					{#if bio.text}
						<div class="col-span-6 space-y-line">
							<Portable value={bio.text} />
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
