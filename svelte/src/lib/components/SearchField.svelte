<script>
	import Search from '$lib/components/icons/Search.svelte';

	/**
	 * A search field over a grey rule, with the magnifier in front. Submitting
	 * does nothing: `oninput` gets each change. `label` names it for screen
	 * readers, and `class` goes on the <form>.
	 */
	let { value = '', label = 'Search', oninput, class: className } = $props();
</script>

<form
	role="search"
	class={['flex items-center gap-[0.25em] border-b-2 border-grey-3 pb-1 text-grey-3', className]}
	onsubmit={(event) => event.preventDefault()}
>
	<Search class="h-[0.65em] w-auto" />
	<input
		type="search"
		name="q"
		placeholder="Search"
		aria-label={label}
		{value}
		{oninput}
		class="flex-1 text-black outline-none placeholder:text-grey-3"
	/>
</form>
