/** A YYYY-MM-DD date as the site shows it: "MM DD YYYY". */
export const formatDate = (date) => {
	if (!date) return '';
	const [year, month, day] = date.split('-');
	return `${month} ${day} ${year}`;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A YYYY-MM-DD date written out: "Oct 8, 2026". */
export const formatLongDate = (date) => {
	if (!date) return '';
	const [year, month, day] = date.split('-').map(Number);
	return `${MONTHS[month - 1]} ${day}, ${year}`;
};

/**
 * Two YYYY-MM-DD dates as a range: "Jan 16, 2026 – Feb 28, 2026", or with
 * `short`, "Jan 16 – Feb 28". Either date on its own if the other's
 * missing, and empty with neither.
 */
export const formatDateRange = (start, end, { short = false } = {}) =>
	[start, end]
		.filter(Boolean)
		.map((date) => (short ? formatLongDate(date).replace(/, \d{4}$/, '') : formatLongDate(date)))
		.join(' – ');
