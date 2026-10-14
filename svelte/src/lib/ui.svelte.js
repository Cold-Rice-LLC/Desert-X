// UI state shared across the layout's components
export const ui = $state({
	menuOpen: false,
	// What the nav shows in place of the page's title while set: an open
	// edition in Other Editions as it scrolls under the nav
	nav: null
});
