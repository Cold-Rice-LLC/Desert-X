<script>
	import Search from '$lib/components/icons/Search.svelte';

	/**
	 * A search field over a grey rule, black while it has keyboard focus, with the
	 * magnifier in front. Submitting does nothing: `oninput` gets each
	 * change. The field is one line tall, which browsers otherwise stretch
	 * to the font's own line height, and gives way before the magnifier.
	 * An input clips its text to its padding box, and the font's descenders
	 * hang below a one-line box ("judy" lost the tails of its j and y), so
	 * padding gives them room and a matching negative margin keeps the
	 * layout one line tall.
	 * `label` names it for screen readers, and `class` goes on the <form>.
	 */
	let { value = '', label = 'Search', oninput, class: className } = $props();
</script>

<form
	role="search"
	class={[
		'flex items-center gap-[0.3em] border-b-2 border-grey-3 pb-xs text-grey-3 keyboard:has-[input:focus-visible]:border-black',
		className
	]}
	onsubmit={(event) => event.preventDefault()}
>
	<Search class="h-[0.71em] w-auto shrink-0" />
	<input
		type="search"
		name="q"
		placeholder="Enter keyword"
		aria-label={label}
		{value}
		{oninput}
		class="-my-[0.2em] box-content h-[1lh] min-w-0 flex-1 py-[0.2em] text-black outline-none placeholder:text-grey-3"
	/>
</form>
