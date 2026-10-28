import { artworkListFields } from '$lib/art';
import { today } from '$lib/dates';
import { client } from '$lib/sanity/client';
import { loadLanding } from '$lib/sanity/landing';
import { richTextFields } from '$lib/sanity/links';
import { modulesFields } from '$lib/sanity/modules';
import { newsLandingFields, newsTileFields } from '$lib/sanity/news';

/**
 * The Visit landing and its modules, then every edition that's on today
 * (between its start and end dates, inclusive, by UTC), soonest first,
 * with its Visit Info and what its map needs, then the three newest news.
 */
export async function load() {
	const [landing, results] = await Promise.all([
		loadLanding('visitLanding', 'Visit', `modules[]{ ${modulesFields} }`),
		client.fetch(
			`{
				"editions": *[_type == "edition" && startDate <= $today && endDate >= $today]
					| order(startDate asc){
						_id,
						"slug": slug.current,
						startDate,
						endDate,
						"location": location->title,
						mapText[]{ ${richTextFields} },
						visitModules[]{ ${modulesFields} },
						"artworks": *[_type == "artwork" && edition._ref == ^._id && defined(slug.current)]{
							${artworkListFields},
							site,
							coordinates
						}
					},
				"news": {
					"items": *[_type == "news"] | order(publishDate desc) [0...3]{ ${newsTileFields} },
					${newsLandingFields}
				}
			}`,
			{ today: today() }
		)
	]);

	return { ...landing, ...results };
}
