<script>
	import ImageFrame from '$lib/components/ImageFrame.svelte';
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/**
	 * Optional centred heading over a list of bios. On phones they're a row,
	 * as the news row is, a profile and a fifth of the next across, that
	 * scrolls sideways without a scrollbar: each the 4:5 image with its text
	 * and then the bio text under it, the page scrolling down past the row
	 * however long the longest runs. From md up each bio is a 12-column
	 * row: the image, its text beside it, and the bio text across the right
	 * half.
	 */
	let { module } = $props();
</script>

<div class="space-y-line">
	<ModuleHeading heading={module.heading} />

	{#if module.bios?.length}
		<!-- Room below on phones for the last line's descenders, which the row
		     would otherwise clip, given back so the spacing stays the same -->
		<ul
			class="-mb-xs scroll-row flex gap-base px-gutter pb-xs text-base md:mb-0 md:block md:space-y-base md:pb-0"
		>
			{#each module.bios as bio (bio._key)}
				<li
					class="grid w-5/6 shrink-0 content-start items-start gap-y-sm md:w-auto md:grid-cols-12"
				>
					<ImageFrame
						image={bio.image}
						aspect={4 / 5}
						sizes="(width >= 768px) calc((100vw - 156px) / 4), calc((100vw - 50px) * 5 / 6)"
						class="md:col-span-3"
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
