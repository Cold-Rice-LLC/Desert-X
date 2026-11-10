<script>
	/**
	 * A full-screen carousel's left and right halves as Previous and Next
	 * buttons, under resize cursors pointing their way, e.g. "Previous
	 * slide" for `noun` slide. For the keyboard, each shows its label while
	 * it has focus, as its focus ring. `onprevious` and `onnext` move it.
	 */
	let { noun, onprevious, onnext } = $props();
</script>

{#snippet half(label, place, edge, onclick)}
	<button
		type="button"
		aria-label="{label} {noun}"
		class={['group absolute inset-y-0 z-10 w-1/2 outline-none', place]}
		{onclick}
	>
		<span
			class={[
				'absolute top-1/2 -translate-y-1/2 bg-white p-xs text-base text-black uppercase opacity-0 group-focus-visible:opacity-100',
				edge
			]}
		>
			{label}
		</span>
	</button>
{/snippet}

{@render half('Previous', 'left-0 cursor-w-resize', 'left-edge', onprevious)}
{@render half('Next', 'right-0 cursor-e-resize', 'right-edge', onnext)}
