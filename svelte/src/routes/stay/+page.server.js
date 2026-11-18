import { imageFields } from '$lib/sanity/images';
import { loadLanding } from '$lib/sanity/landing';
import { modulesFields } from '$lib/sanity/modules';

/**
 * The Stay landing: its own modules, then each hotel as a Media module, its
 * photo (Photo on Stay, or else its first image) and caption (or else its
 * name) linking to its page. Hotels go in the order the landing lists them,
 * then any it doesn't, oldest first, so a new one shows before it's placed.
 */
export async function load() {
	const { landing, ...rest } = await loadLanding(
		'stayLanding',
		'Stay',
		`
			modules[]{ ${modulesFields} },
			"order": hotels[]._ref,
			"hotels": *[_type == "hotel" && defined(slug.current)] | order(_createdAt asc){
				_id,
				_type,
				// Its name stands in as a paragraph of rich text
				"caption": coalesce(caption, [{
					"_key": "name",
					"_type": "block",
					"style": "normal",
					"markDefs": [],
					"children": [{ "_key": "name", "_type": "span", "marks": [], "text": title }]
				}]),
				"slug": slug.current,
				"image": select(defined(stayImage.asset) => stayImage, images[0]){ ${imageFields} }
			}
		`
	);

	const order = landing?.order ?? [];
	const rank = ({ _id }) => (order.includes(_id) ? order.indexOf(_id) : order.length);
	const hotels = (landing?.hotels ?? []).toSorted((a, b) => rank(a) - rank(b));

	const modules = [
		...(landing?.modules ?? []),
		...hotels.map(({ _id, _type, caption, slug, image }) => ({
			_key: _id,
			_type: 'mediaModule',
			mediaType: 'image',
			image,
			caption,
			link: { linkType: 'internal', internal: { _id, _type, slug } }
		}))
	];

	return { ...rest, modules };
}
