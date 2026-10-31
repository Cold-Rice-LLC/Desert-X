<script>
	import ImageFrame from '$lib/components/ImageFrame.svelte';
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/**
	 * Optional centred heading over a list of bios. On phones each bio
	 * stacks: the 4:5 image across half the width, its text, then the bio
	 * text. From md up it's a 12-column row: the image, its text beside it,
	 * and the bio text across the right half.
	 */
	let { module } = $props();
</script>

<div class="space-y-line px-gutter">
	<ModuleHeading heading={module.heading} />

	{#if module.bios?.length}
		<ul class="space-y-md text-base md:space-y-base">
			{#each module.bios as bio (bio._key)}
				<li class="grid items-start gap-y-sm md:grid-cols-12">
					<ImageFrame
						image={bio.image}
						aspect={4 / 5}
						sizes="(width >= 768px) calc((100vw - 136px) / 4), calc((100vw - 40px) / 2)"
						class="w-1/2 md:col-span-3 md:w-auto"
					/>
					{#if bio.imageText}
						<p class="whitespace-pre-line md:col-span-3 md:pl-[6rem]">{bio.imageText}</p>
					{/if}
					{#if bio.text}
						<div class="space-y-line md:col-span-6">
							<Portable value={bio.text} />
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
