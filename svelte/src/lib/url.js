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
