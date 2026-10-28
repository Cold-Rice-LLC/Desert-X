import { error } from '@sveltejs/kit';
import { goto } from '$app/navigation';

/**
 * A link to `url` with `changes` to its query: each key is set to its
 * value, or removed when the value is empty. The bare path when no query
 * is left.
 */
export const queryHref = (url, changes) => {
	const entries = [...url.searchParams].filter(([key]) => !(key in changes));
	for (const [key, value] of Object.entries(changes)) if (value) entries.push([key, value]);
	const query = new URLSearchParams(entries).toString();
	return query ? `?${query}` : url.pathname;
};

/**
 * Go to `url` with `changes` to its query (see queryHref) in place,
 * replacing the history entry and keeping the scroll and focus: for
 * typing in a search field, or opening a dropdown.
 */
export const replaceQuery = (url, changes) =>
	goto(queryHref(url, changes), { replaceState: true, keepFocus: true, noScroll: true });

/** The `?page=` number, 1 by default. Anything but a whole number from 1 up is a 404. */
export const pageParam = (url) => {
	const page = Number(url.searchParams.get('page') ?? 1);
	if (!Number.isInteger(page) || page < 1) error(404, 'Not found');
	return page;
};
