<script>
	import BioModule from '$lib/components/modules/BioModule.svelte';
	import DonateModule from '$lib/components/modules/DonateModule.svelte';
	import DropdownsModule from '$lib/components/modules/DropdownsModule.svelte';
	import InterviewModule from '$lib/components/modules/InterviewModule.svelte';
	import MediaModule from '$lib/components/modules/MediaModule.svelte';
	import NewsModule from '$lib/components/modules/NewsModule.svelte';
	import NewsletterModule from '$lib/components/modules/NewsletterModule.svelte';
	import PeopleListModule from '$lib/components/modules/PeopleListModule.svelte';
	import ScheduleModule from '$lib/components/modules/ScheduleModule.svelte';
	import TextModule from '$lib/components/modules/TextModule.svelte';

	/**
	 * Renders a modules array in order, picking a component by type. Types
	 * without a component go to the `custom` snippet, given the module, so a
	 * page can slot its own sections in among them (the Visit page's maps),
	 * or are skipped. Modules sit an xl step apart, or two blank lines between
	 * consecutive text modules. `children` comes first, spaced like a module
	 * (a news article's title). `narrow` runs text-led modules from column 2
	 * to 11 of the 12-column grid from md up, as news does.
	 */
	let { modules, narrow = false, children, custom } = $props();

	const components = {
		textModule: TextModule,
		bioModule: BioModule,
		peopleListModule: PeopleListModule,
		dropdownsModule: DropdownsModule,
		donateModule: DonateModule,
		interviewModule: InterviewModule,
		mediaModule: MediaModule,
		newsModule: NewsModule,
		newsletterModule: NewsletterModule,
		scheduleModule: ScheduleModule
	};
</script>

<div class="modules pt-page-top pb-page-bottom text-md" class:narrow>
	{@render children?.()}
	{#each modules ?? [] as module (module._key)}
		{@const Module = components[module._type]}
		{#if Module}
			<Module {module} />
		{:else}
			{@render custom?.(module)}
		{/if}
	{/each}
</div>

<style>
	.modules {
		> :global(* + *) {
			margin-top: var(--spacing-xl);
		}

		> :global(.text-module + .text-module) {
			margin-top: calc(2 * var(--spacing-line));
		}

		/* Column 2 to 11 of the 12-column grid inside the screen edges, from
		   md up; phones keep the gutter */
		&.narrow {
			@media (width >= 48rem) {
				--spacing-module: calc(var(--spacing-edge) + (100% - 2 * var(--spacing-edge)) / 12);
			}
		}
	}
</style>
