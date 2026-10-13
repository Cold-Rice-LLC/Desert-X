/** A YYYY-MM-DD date as the site shows it: "MM DD YYYY". */
export const formatDate = (date) => {
	if (!date) return '';
	const [year, month, day] = date.split('-');
	return `${month} ${day} ${year}`;
};
