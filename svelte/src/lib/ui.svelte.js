// UI state shared across the layout's components
export const ui = $state({
	menuOpen: false,
	// What the nav shows in place of the page's title while set: an
	// edition, opened in Other Editions or on the Visit page, as it scrolls
	// under the nav (see showUnderNav)
	nav: null
});

/**
 * While one of `sections`, `{ element, nav }` pairs, passes under the nav,
 * the nav shows its `nav` in place of the page's title (see ui.nav): an
 * edition opened in Other Editions, or each edition on the Visit page.
 * Each one holds the nav until the next reaches it, so the gap between
 * them doesn't flicker back to the page's title; the last lets go once
 * it's passed.
 * Call it in an effect; it returns the cleanup, which hands the nav back.
 */
export const showUnderNav = (sections) => {
	// The nav's own height, which on phones is a line taller than
	// --spacing-nav where it's stacked (see TopBar)
	const header = document.querySelector('header');
	let current = null;

	const update = () => {
		const line = header.offsetHeight;
		const index = sections.findLastIndex(
			({ element }) => element.getBoundingClientRect().top <= line
		);
		const last = index === sections.length - 1;
		const under =
			index >= 0 && (!last || sections[index].element.getBoundingClientRect().bottom > line)
				? sections[index]
				: null;
		if (under === current) return;
		current = under;
		ui.nav = under?.nav ?? null;
	};

	update();
	addEventListener('scroll', update, { passive: true });
	addEventListener('resize', update);
	return () => {
		removeEventListener('scroll', update);
		removeEventListener('resize', update);
		if (current) ui.nav = null;
	};
};
