<script>
	import Image from '$lib/components/Image.svelte';
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import Portable from '$lib/components/Portable.svelte';
	import { newTabAttributes } from '$lib/sanity/links';

	/**
	 * An edition's sponsors under a Sponsors heading: each group a grey panel
	 * of logos, stacked on phones and from md up two side by side unless one
	 * is full width, then up to four lists of names, a line each and linked
	 * where set, stacked on phones and a quarter of the grid each from md
	 * up. Logos fit one box per width, so wordmarks and marks
	 * come out about the same size, and any white background multiplies away
	 * into the grey. They spread wider in a full-width group, and a logo's
	 * link opens in a new tab. Left out when there's nothing to show. Group
	 * and list titles are a level under the heading (`headingLevel`, h2 by
	 * default).
	 */
	let { groups = [], lists = [], headingLevel = 2 } = $props();

	let shownGroups = $derived(groups.filter((group) => group.logos?.length));
	let shownLists = $derived(lists.filter((list) => list.title || list.text?.length));
</script>

{#if shownGroups.length || shownLists.length}
	<section>
		<ModuleHeading heading="Sponsors" level={headingLevel} />

		<div class="mt-line space-y-md px-gutter text-base">
			{#if shownGroups.length}
				<div class="grid gap-x-base gap-y-md md:grid-cols-2">
					{#each shownGroups as group (group._key)}
						<div class={['flex flex-col gap-line', group.fullWidth && 'md:col-span-2']}>
							{#if group.title}
								<svelte:element this={`h${headingLevel + 1}`}>{group.title}</svelte:element>
							{/if}
							<ul
								class={[
									'flex min-h-[20rem] grow flex-wrap content-center items-center justify-center gap-y-base bg-grey-1 p-md',
									group.fullWidth ? 'gap-x-2xl' : 'gap-x-lg'
								]}
							>
								{#each group.logos as logo (logo._key)}
									<li>
										<svelte:element
											this={logo.url ? 'a' : 'span'}
											href={logo.url}
											{...logo.url && newTabAttributes}
											class="block"
										>
											<Image
												image={{ ...logo.image, alt: logo.name }}
												sizes={group.fullWidth ? '300px' : '200px'}
												class={[
													'w-auto mix-blend-multiply',
													group.fullWidth
														? 'max-h-[12rem] max-w-[30rem]'
														: 'max-h-[8rem] max-w-[20rem]'
												]}
											/>
											{#if logo.url}<span class="sr-only">(opens in new tab)</span>{/if}
										</svelte:element>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			{/if}

			{#if shownLists.length}
				<div class="grid gap-x-base gap-y-md md:grid-cols-12">
					{#each shownLists as list (list._key)}
						<div class="md:col-span-3">
							{#if list.title}
								<svelte:element this={`h${headingLevel + 1}`} class="mb-line"
									>{list.title}</svelte:element
								>
							{/if}
							{#if list.text?.length}
								<Portable value={list.text} />
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>
{/if}
