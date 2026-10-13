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
