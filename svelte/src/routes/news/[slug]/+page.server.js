import { error } from '@sveltejs/kit';
import { client } from '$lib/sanity/client';
import { formatLongDate } from '$lib/dates';
import { modulesFields } from '$lib/sanity/modules';

// A news article by slug. Press has no page of its own: it links out.
export async function load({ params }) {
	const { news, landingTitle } = await client.fetch(
		`{
			"news": *[_type == "news" && coalesce(kind, "news") == "news" && slug.current == $slug][0]{
				title,
				publishDate,
				modules[]{ ${modulesFields} }
			},
			"landingTitle": *[_id == "newsLanding"][0].title
		}`,
		{ slug: params.slug }
	);

	if (!news) error(404, 'Not found');

	return {
		news,
		navTitle: landingTitle || 'News',
		navHref: '/news',
		navDetail: formatLongDate(news.publishDate)
	};
}
