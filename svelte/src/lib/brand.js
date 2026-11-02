/**
 * "Desert X" and "DesertX" in running text, but not in addresses, handles
 * or hashtags: desertx.org, @_desertx, #DesertX, facebook.com/DesertX.
 */
const NAME = /(?<![\w#@./-])desert([ \u00a0]?)x(?![\w@/-]|\.[a-z])/gi;

/** Text with the name as DESERT X, as the site always writes it. */
export const brandText = (text) => text.replace(NAME, (_, space) => `DESERT${space || ' '}X`);

// Keys whose values are ids, slugs or addresses, never shown as text
const RAW_KEY = /^_|url$|href|slug|current|email|filename/i;

/**
 * Sanity data with brandText applied to every string in it, so whatever
 * editors type, the site writes DESERT X.
 */
export const brand = (value, key = '') => {
	if (typeof value === 'string') return RAW_KEY.test(key) ? value : brandText(value);
	if (Array.isArray(value)) return value.map((item) => brand(item));
	if (value && typeof value === 'object') {
		return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, brand(v, k)]));
	}
	return value;
};
