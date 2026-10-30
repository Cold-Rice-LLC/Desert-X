import { artworkEntries, collator, groupByArtist, searchEntries, sortEntries } from '$lib/art';
import { linkHref } from '$lib/sanity/links';
import { fuzzySearch } from '$lib/search';

// Where an edition, page or landing lives, as links to it resolve
const hrefOf = (document) => linkHref({ linkType: 'internal', internal: document });

/**
 * Search results for `?q=`, as groups of rows: artworks A–Z by artist,
 * each artist a group, then editions newest first, pages and landings
 * A–Z, and news newest first. Each row has its title, where it goes and
 * the words linking there; press goes off the site, to its article.
 * Titles and names only, forgiving typos (see fuzzySearch). No query, no
 * results. The count is of things found, so an artwork by two artists
 * counts once.
 */
export function load({ data, url }) {
	// Untrimmed, so the field keeps a space typed before the next word
	const query = url.searchParams.get('q') ?? '';
	const { index, ...rest } = data;
	if (!query.trim()) return { ...rest, query, groups: null, count: 0 };

	const entries = sortEntries(searchEntries(artworkEntries(index.artworks), query));
	const groups = groupByArtist(entries).map(({ name, items }) => ({
		name,
		items: items.map((artwork) => ({
			key: artwork._id,
			title: artwork.title,
			href: `/art/${artwork.slug}`,
			action: 'View artwork'
		}))
	}));

	const editions = fuzzySearch(
		index.editions,
		query,
		({ title, location, year }) => `${title} ${location} ${year}`
	)
		.toSorted((a, b) => b.year - a.year)
		.map((edition) => ({
			key: edition._id,
			title: edition.title,
			href: hrefOf(edition),
			action: 'View edition'
		}));

	// A page whose path a landing's route already takes (a page slugged
	// "visit") can't be reached, so only the landing is listed
	const landingHrefs = new Set(
		index.pages.filter(({ _type }) => _type !== 'page').map((landing) => hrefOf(landing))
	);
	const reachable = index.pages.filter(
		(page) => page._type !== 'page' || !landingHrefs.has(hrefOf(page))
	);
	const pages = fuzzySearch(reachable, query, ({ title }) => title)
		.toSorted((a, b) => collator.compare(a.title, b.title))
		.map((page) => ({ key: page._id, title: page.title, href: hrefOf(page), action: 'View page' }));

	const news = fuzzySearch(index.news, query, ({ title }) => title)
		.toSorted((a, b) => (b.publishDate ?? '').localeCompare(a.publishDate ?? ''))
		.map((item) => {
			const press = item.kind === 'press';
			return {
				key: item._id,
				title: item.title,
				href: press ? item.pressUrl : hrefOf(item),
				action: 'Read article',
				external: press
			};
		});

	for (const [name, rows] of [
		['Editions', editions],
		['Pages', pages],
		['News', news]
	]) {
		if (rows.length) groups.push({ name, items: rows });
	}

	const artworkCount = new Set(entries.map(({ artwork }) => artwork._id)).size;
	const count = artworkCount + editions.length + pages.length + news.length;

	return { ...rest, query, groups, count };
}
