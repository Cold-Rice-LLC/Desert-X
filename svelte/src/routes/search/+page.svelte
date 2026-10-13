<script>
	import Portable from '$lib/components/Portable.svelte';
	import Search from '$lib/components/icons/Search.svelte';

	let { data } = $props();
</script>

<!-- UI only for now: submitting does nothing until search is built -->
<main class="px-gutter pt-[9rem] text-md">
	{#if data.landing?.intro}
		<Portable value={data.landing.intro} />
	{/if}

	<form
		role="search"
		class="mt-[7rem] flex items-center gap-[0.25em] border-b-2 border-grey-3 pb-[1rem] text-grey-3"
		onsubmit={(event) => event.preventDefault()}
	>
		<Search class="h-[0.65em] w-auto" />
		<input
			type="search"
			name="q"
			placeholder="Search"
			aria-label="Search"
			class="flex-1 text-black outline-none placeholder:text-grey-3"
		/>
	</form>
</main>
