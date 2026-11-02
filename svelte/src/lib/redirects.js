// Old site (desertx.org on Kirby) paths to where they live now. Artworks
// were under their edition by artist name, and again under /dx/archive by
// title; news was under /learn/news.
const PATHS = new Map([
	['/dx/desert-x-17/armando-lerma', '/art/la-fiesta-en-el-desierto'],
	['/dx/desert-x-17/claudia-comte', '/art/curves-and-zig-zags'],
	['/dx/desert-x-17/gabriel-kuri', '/art/donation-box'],
	['/dx/desert-x-17/glenn-kaino', '/art/hollow-earth'],
	['/dx/desert-x-17/jeffrey-gibson', '/art/alive'],
	['/dx/desert-x-17/jennifer-bolande', '/art/visible-distance-second-sight'],
	['/dx/desert-x-17/juliao-sarmento', '/art/cometa'],
	['/dx/desert-x-17/lita-albuquerque', '/art/hearth'],
	['/dx/desert-x-17/norma-jeane', '/art/shybot'],
	['/dx/desert-x-17/phillip-k-smith-iii', '/art/the-circle-of-land-and-sky'],
	['/dx/desert-x-17/richard-prince', '/art/third-place'],
	['/dx/desert-x-17/rob-pruitt', '/art/rob-pruitt-s-flea-market'],
	['/dx/desert-x-17/sherin-guirguis', '/art/one-i-call'],
	['/dx/desert-x-17/tavares-strachan', '/art/i-am'],
	['/dx/desert-x-17/will-boone', '/art/monument'],
	['/dx/desert-x-19/armando-lerma', '/art/visit-us-in-the-shape-of-clouds'],
	['/dx/desert-x-19/cara-romero', '/art/jackrabbit-cottontail-spirits-of-the-desert'],
	['/dx/desert-x-19/cecilia-bengolea', '/art/mosquito-net'],
	['/dx/desert-x-19/cinthia-marcelle', '/art/wormhole'],
	['/dx/desert-x-19/encyclopedia', '/art/encyclopedia-desert-edition-coachella-valley'],
	['/dx/desert-x-19/eric-n-mack', '/art/halter'],
	['/dx/desert-x-19/gary-simmons', '/art/recapturing-memories-of-the-black-ark'],
	[
		'/dx/desert-x-19/iman-issa',
		'/art/surrogates-a-film-about-things-to-be-used-in-order-of-appearance-by-self-or-others-for-touching'
	],
	['/dx/desert-x-19/ivan-argote', '/art/a-point-of-view'],
	['/dx/desert-x-19/john-gerrard', '/art/western-flag'],
	['/dx/desert-x-19/julian-hoeber', '/art/going-nowhere-pavilion-01'],
	['/dx/desert-x-19/kathleen-ryan', '/art/ghost-palm'],
	['/dx/desert-x-19/mary-kelly', '/art/peace-is-the-only-shelter'],
	['/dx/desert-x-19/nancy-baker-cahill', '/art/revolutions-margin-of-error'],
	['/dx/desert-x-19/pia-camil', '/art/lover-s-rainbow'],
	['/dx/desert-x-19/postcommodity', '/art/it-exists-in-many-forms'],
	['/dx/desert-x-19/shybot', '/art/shybot-2019'],
	['/dx/desert-x-19/sterling-ruby', '/art/specter'],
	['/dx/desert-x-19/steve-badgett-chris-taylor', '/art/terminal-lake-exploration-platform'],
	['/dx/desert-x-19/superflex', '/art/dive-in'],
	['/dx/desert-x-21/alicja-kwade', '/art/parapivot-sempiternal-clouds'],
	['/dx/desert-x-21/christopher-myers', '/art/the-art-of-taming-horses'],
	['/dx/desert-x-21/eduardo-sarabia', '/art/the-passenger'],
	['/dx/desert-x-21/felipe-baeza', '/art/finding-home-in-my-own-flesh'],
	['/dx/desert-x-21/ghada-amer', '/art/women-s-qualities'],
	['/dx/desert-x-21/judy-chicago', '/art/living-smoke'],
	['/dx/desert-x-21/kim-stringfellow', '/art/jackrabbit-homestead'],
	['/dx/desert-x-21/nicholas-galanin', '/art/never-forget'],
	['/dx/desert-x-21/oscar-murillo', '/art/frequencies'],
	['/dx/desert-x-21/serge-attukwei-clottey', '/art/the-wishing-well'],
	['/dx/desert-x-21/vivian-suter', '/art/tamanrasset'],
	['/dx/desert-x-21/xaviera-simmons', '/art/because-you-know-ultimately-we-will-band-a-militia'],
	['/dx/desert-x-21/zahrah-alghamdi', '/art/what-lies-behind-the-walls'],
	['/dx/desert-x-alula-2020/el-seed', '/art/mirage-2020'],
	['/dx/desert-x-alula-2020/gisela-colon', '/art/the-future-is-now'],
	[
		'/dx/desert-x-alula-2020/lita-albuquerque',
		'/art/najma-she-placed-one-thousand-suns-over-the-transparent-overlays-of-space'
	],
	['/dx/desert-x-alula-2020/manal-aldowayan', '/art/now-you-see-me-now-you-don-t'],
	['/dx/desert-x-alula-2020/mohammed-ahmed-ibrahim', '/art/falling-stones-garden'],
	['/dx/desert-x-alula-2020/muhannad-shono', '/art/the-lost-path'],
	['/dx/desert-x-alula-2020/nadim-karam', '/art/on-parade'],
	['/dx/desert-x-alula-2020/nasser-alsalem', '/art/amma-qabl'],
	['/dx/desert-x-alula-2020/rashed-alshashai', '/art/a-concise-passage'],
	['/dx/desert-x-alula-2020/rayyane-tabet', '/art/steel-rings'],
	['/dx/desert-x-alula-2020/sherin-guirguis', '/art/kholkhal-aliaa'],
	['/dx/desert-x-alula-2020/superflex', '/art/one-two-three-swing'],
	['/dx/desert-x-alula-2020/wael-shawky', '/art/dictums-manqia-ii'],
	['/dx/desert-x-alula-2020/zahrah-alghamdi', '/art/glimpses-of-the-past'],
	['/dx/desert-x-alula-2022/abdullah-alothman', '/art/geography-of-hope'],
	['/dx/desert-x-alula-2022/alicja-kwade', '/art/in-blur'],
	['/dx/desert-x-alula-2022/ayman-zedani', '/art/the-valley-of-the-desert-keepers'],
	['/dx/desert-x-alula-2022/claudia-comte', '/art/dark-suns-bright-waves'],
	['/dx/desert-x-alula-2022/dana-awartani', '/art/where-the-dwellers-lay'],
	['/dx/desert-x-alula-2022/jim-denevan', '/art/angle-of-repose'],
	['/dx/desert-x-alula-2022/khalil-rabah', '/art/grounding'],
	['/dx/desert-x-alula-2022/monika-sosnowska', '/art/silent-witnesses-of-the-past'],
	['/dx/desert-x-alula-2022/serge-attukwei-clottey', '/art/gold-falls'],
	[
		'/dx/desert-x-alula-2022/shadia-alem',
		'/art/i-have-seen-thousands-of-stars-and-one-fell-in-alula'
	],
	['/dx/desert-x-alula-2022/shaikha-almazrou', '/art/measuring-the-physicality-of-void'],
	[
		'/dx/desert-x-alula-2022/shezad-dawood',
		'/art/coral-alchemy-i-dipsastrea-speciosa-coral-alchemy-ii-porites-columnaris'
	],
	['/dx/desert-x-alula-2022/stephanie-deumer', '/art/under-the-same-sun'],
	['/dx/desert-x-alula-2022/sultan-bin-fahad', '/art/desert-kite'],
	['/dx/desert-x-alula-2022/zeinab-alhashemi', '/art/camoulflage-2-0'],
	['/dx/dx-23/gerald-clarke', '/art/immersion'],
	['/dx/dx-23/hector-zamora', '/art/chimera'],
	['/dx/dx-23/hylozoic-desires', '/art/namak-nazar'],
	['/dx/dx-23/lauren-bon', '/art/the-smallest-sea-with-the-largest-heart'],
	['/dx/dx-23/marina-tabassum', '/art/khudi-bari'],
	['/dx/dx-23/mario-garcia-torres', '/art/searching-for-the-sky-while-maintaining-equilibrium'],
	['/dx/dx-23/matt-johnson', '/art/sleeping-figure'],
	['/dx/dx-23/paloma-contreras-lomas', '/art/amar-a-dios-en-tierra-de-indios-es-oficio-maternal'],
	['/dx/dx-23/rana-begum', '/art/no-1225-chainlink'],
	['/dx/dx-23/torkwase-dyson', '/art/liquid-a-place'],
	['/dx/dx-23/tschabalala-self', '/art/pioneer'],
	['/dx/dx-23/tyre-nichols', '/art/originals'],
	['/dx/dx-25-coachella-valley/agnes-denes', '/art/the-living-pyramid'],
	['/dx/dx-25-coachella-valley/alison-saar', '/art/soul-service-station'],
	[
		'/dx/dx-25-coachella-valley/cannupa-hanska-luger',
		'/art/g-h-o-s-t-ride-generative-habitation-operating-system-technology'
	],
	['/dx/dx-25-coachella-valley/jose-davila', '/art/the-act-of-being-together'],
	['/dx/dx-25-coachella-valley/kapwani-kiwanga', '/art/plotting-rest'],
	['/dx/dx-25-coachella-valley/kimsooja', '/art/to-breathe-coachella-valley'],
	['/dx/dx-25-coachella-valley/muhannad-shono', '/art/what-remains'],
	['/dx/dx-25-coachella-valley/raphael-hefti', '/art/five-things-you-can-t-wear-on-tv'],
	['/dx/dx-25-coachella-valley/ronald-rael', '/art/adobe-oasis'],
	['/dx/dx-25-coachella-valley/sanford-biggers', '/art/unsui-mirror'],
	['/dx/dx-25-coachella-valley/sarah-meyohas', '/art/truth-arrives-in-slanted-beams'],
	['/dx/dx-26-alula/agnes-denes', '/art/the-living-pyramid-2026'],
	['/dx/dx-26-alula/bahraini-danish', '/art/bloom'],
	['/dx/dx-26-alula/basmah-felemban', '/art/murmur-of-pebbles'],
	['/dx/dx-26-alula/hector-zamora', '/art/tar-hypar'],
	['/dx/dx-26-alula/ibrahim-el-salahi', '/art/haraza-tree'],
	['/dx/dx-26-alula/maria-magdalena-campos-pons', '/art/imole-red'],
	['/dx/dx-26-alula/mohammad-alfaraj', '/art/what-was-the-question-again'],
	[
		'/dx/dx-26-alula/mohammed-alsaleem',
		'/art/the-thorn-alshuruf-unit-the-triangles-flower-bud-and-al-ahilla'
	],
	['/dx/dx-26-alula/sara-abdu', '/art/a-kingdom-where-no-one-dies-contours-of-resonance'],
	['/dx/dx-26-alula/tarek-atoui', '/art/the-water-song'],
	['/dx/dx-26-alula/vibha-galhotra', '/art/future-fables'],
	['/dx/dx24-alula/aseel-al-yaquob', '/art/weird-life-an-ode-to-desert-varnish'],
	[
		'/dx/dx24-alula/ayman-yossri-daydban',
		'/art/a-rock-garden-in-the-shape-of-a-full-sized-soccer-field'
	],
	['/dx/dx24-alula/bosco-sodi', '/art/when-i-saw-my-reflection'],
	['/dx/dx24-alula/caline-aoun', '/art/the-desert-has-no-surface'],
	['/dx/dx24-alula/faisal-samra', '/art/the-dot'],
	['/dx/dx24-alula/filwa-nazer', '/art/preserving-shadows'],
	['/dx/dx24-alula/giuseppe-penone', '/art/metamorphosis-the-logic-of-the-vegetal'],
	[
		'/dx/dx24-alula/ibrahim-mahama',
		'/art/dung-bara-the-rider-does-not-know-the-ground-is-hot-hanging-garden-a-full-gourd-does-not-rattle'
	],
	['/dx/dx24-alula/kader-attia', '/art/whistleblower'],
	['/dx/dx24-alula/karola-braga', '/art/sfumato'],
	['/dx/dx24-alula/kimsooja', '/art/to-breathe-alula'],
	['/dx/dx24-alula/monira-al-qadiri', '/art/w-a-b-a-r'],
	['/dx/dx24-alula/rana-haddad-pascal-hachem-reveries', '/art/reveries'],
	['/dx/dx24-alula/rand-abdul-jabbar', '/art/where-myths-are-born-of-mud-and-desire'],
	[
		'/dx/dx24-alula/sara-alissa-nojoud-alsudairi',
		'/art/invisible-possibilities-when-the-earth-began-to-look-at-itself'
	],
	['/dx/desert-x-17/doug-aitken', '/art/mirage'],
	['/dx/desert-x-21/desert-x-app', '/app'],
	['/dx/archive', '/art'],
	['/dx/archive/glimpses-of-the-past', '/art/glimpses-of-the-past'],
	['/dx/archive/amma-qabl', '/art/amma-qabl'],
	['/dx/archive/a-concise-passage', '/art/a-concise-passage'],
	['/dx/archive/the-future-is-now', '/art/the-future-is-now'],
	['/dx/archive/kholkhal-aliaa', '/art/kholkhal-aliaa'],
	['/dx/archive/falling-stones-garden', '/art/falling-stones-garden'],
	['/dx/archive/on-parade', '/art/on-parade'],
	['/dx/archive/dictums-manqia-ii', '/art/dictums-manqia-ii'],
	['/dx/archive/the-lost-path', '/art/the-lost-path'],
	['/dx/archive/one-two-three-swing', '/art/one-two-three-swing'],
	['/dx/archive/steel-rings', '/art/steel-rings'],
	['/dx/archive/a-point-of-view', '/art/a-point-of-view'],
	['/dx/archive/terminal-lake-exploration-platform', '/art/terminal-lake-exploration-platform'],
	['/dx/archive/revolutions-margin-of-error', '/art/revolutions-margin-of-error'],
	['/dx/archive/mosquito-net', '/art/mosquito-net'],
	['/dx/archive/peace-is-the-only-shelter', '/art/peace-is-the-only-shelter'],
	['/dx/archive/visit-us-in-the-shape-of-clouds', '/art/visit-us-in-the-shape-of-clouds'],
	['/dx/archive/halter', '/art/halter'],
	['/dx/archive/wormhole', '/art/wormhole'],
	['/dx/archive/it-exists-in-many-forms', '/art/it-exists-in-many-forms'],
	[
		'/dx/archive/jackrabbit-cottontail-spirits-of-the-desert',
		'/art/jackrabbit-cottontail-spirits-of-the-desert'
	],
	['/dx/archive/specter', '/art/specter'],
	['/dx/archive/ghost-palm', '/art/ghost-palm'],
	[
		'/dx/archive/recapturing-memories-of-the-black-ark',
		'/art/recapturing-memories-of-the-black-ark'
	],
	['/dx/archive/dive-in', '/art/dive-in'],
	['/dx/archive/mirage', '/art/mirage'],
	['/dx/archive/hearth', '/art/hearth'],
	['/dx/archive/monument', '/art/monument'],
	['/dx/archive/visible-distance-second-sight', '/art/visible-distance-second-sight'],
	['/dx/archive/curves-and-zig-zags', '/art/curves-and-zig-zags'],
	['/dx/archive/la-fiesta-en-el-desierto', '/art/la-fiesta-en-el-desierto'],
	['/dx/archive/alive', '/art/alive'],
	['/dx/archive/shybot', '/art/shybot'],
	['/dx/archive/one-i-call', '/art/one-i-call'],
	['/dx/archive/donation-box', '/art/donation-box'],
	['/dx/archive/hollow-earth', '/art/hollow-earth'],
	['/dx/archive/third-place', '/art/third-place'],
	['/dx/archive/cometa', '/art/cometa'],
	['/dx/archive/i-am', '/art/i-am'],
	['/dx/archive/the-circle-of-land-and-sky', '/art/the-circle-of-land-and-sky'],
	['/dx/archive/what-lies-behind-the-walls', '/art/what-lies-behind-the-walls'],
	['/dx/archive/finding-home-in-my-own-flesh', '/art/finding-home-in-my-own-flesh'],
	['/dx/archive/the-wishing-well', '/art/the-wishing-well'],
	['/dx/archive/never-forget', '/art/never-forget'],
	['/dx/archive/parapivot-sempiternal-clouds', '/art/parapivot-sempiternal-clouds'],
	['/dx/archive/frequencies', '/art/frequencies'],
	['/dx/archive/the-art-of-taming-horses', '/art/the-art-of-taming-horses'],
	['/dx/archive/the-passenger', '/art/the-passenger'],
	[
		'/dx/archive/because-you-know-ultimately-we-will-band-a-militia',
		'/art/because-you-know-ultimately-we-will-band-a-militia'
	],
	['/dx/archive/jackrabbit-homestead', '/art/jackrabbit-homestead'],
	['/dx/archive/tamanrasset', '/art/tamanrasset'],
	[
		'/dx/archive/najma',
		'/art/najma-she-placed-one-thousand-suns-over-the-transparent-overlays-of-space'
	],
	['/dx/archive/now-you-see-me-now-you-dont', '/art/now-you-see-me-now-you-don-t'],
	['/dx/archive/mirage-el-seed', '/art/mirage-2020'],
	['/dx/archive/lovers-rainbow', '/art/lover-s-rainbow'],
	['/dx/archive/western-flag-spindletop-texas-2014', '/art/western-flag'],
	[
		'/dx/archive/going-nowhere-pavilion-01-executed-variant-dhs-1-q1-cj-dc',
		'/art/going-nowhere-pavilion-01'
	],
	[
		'/dx/archive/surrogates-a-film-about-things-to-be-used-in-order-of-appearance-by-self-or-others-for-touching-upon-larger-insidious-or-differe',
		'/art/surrogates-a-film-about-things-to-be-used-in-order-of-appearance-by-self-or-others-for-touching'
	],
	['/dx/archive/rob-pruitts-flea-market', '/art/rob-pruitt-s-flea-market'],
	['/dx/archive/womens-qualities', '/art/women-s-qualities'],
	['/dx/archive/rana-begum', '/art/no-1225-chainlink'],
	['/dx/archive/lauren-bon-and-metabolic-studio', '/art/the-smallest-sea-with-the-largest-heart'],
	['/dx/archive/gerald-clarke', '/art/immersion'],
	['/dx/archive/marina-tabassum', '/art/khudi-bari'],
	['/dx/archive/hector-zamora', '/art/chimera'],
	['/dx/archive/hylozoic-desires', '/art/namak-nazar'],
	['/dx/archive/mario-garcia-torres', '/art/searching-for-the-sky-while-maintaining-equilibrium'],
	['/dx/archive/matt-johnson', '/art/sleeping-figure'],
	['/dx/archive/paloma-contreras-lomas', '/art/amar-a-dios-en-tierra-de-indios-es-oficio-maternal'],
	['/dx/archive/torkwase-dyson', '/art/liquid-a-place'],
	['/dx/archive/tschabalala-self', '/art/pioneer'],
	['/dx/archive/tyre-nichols', '/art/originals'],
	['/learn/news', '/news'],
	['/learn/news/desert-x-2021-artists-announced', '/news/desert-x-2021-artists-announced'],
	['/learn/news/desert-x-2021-dates-to-be-announced-soon', '/editions/california-2021'],
	['/learn/news/desert-x-2021-is-now-closed', '/news/desert-x-2021-is-now-closed'],
	['/learn/news/desert-x-2021-opens-march-12', '/editions/california-2021'],
	['/learn/news/desert-x-2021-the-film', '/news/desert-x-2021-the-film'],
	[
		'/learn/news/desert-x-2021-the-film-nominated-for-los-angeles-emmy-award',
		'/editions/california-2021'
	],
	[
		'/learn/news/desert-x-2021-the-film-official-selection',
		'/news/desert-x-2021-the-film-official-selection'
	],
	['/learn/news/desert-x-2023-announced', '/news/desert-x-2023-announced'],
	['/learn/news/desert-x-2023-artists-announced', '/news/desert-x-2023-artists-announced'],
	['/learn/news/desert-x-2025-artist-announced', '/news/desert-x-2025-artist-announced'],
	[
		'/learn/news/desert-x-2025-the-living-pyramid-by-agnes-denes-is-now-open',
		'/news/desert-x-2025-the-living-pyramid-by-agnes-denes-is-now-open'
	],
	['/learn/news/desert-x-2026-alula', '/news/desert-x-2026-alula'],
	[
		'/learn/news/desert-x-2026-alula-artist-announced',
		'/news/desert-x-2026-alula-artist-announced'
	],
	['/learn/news/desert-x-2027-announcement', '/news/desert-x-2027-announcement'],
	['/learn/news/desert-x-alula-2024', '/news/desert-x-alula-2024'],
	['/learn/news/desert-x-at-untitled-art', '/news/desert-x-at-untitled-art'],
	['/learn/news/desert-x-media-alert-for-dsusd', '/news/desert-x-media-alert-for-dsusd'],
	['/learn/news/dxu2024', '/news/dxu2024'],
	[
		'/learn/news/kaitlin-garcia-maestas-co-curator-announcement',
		'/news/kaitlin-garcia-maestas-co-curator-announcement'
	],
	[
		'/learn/news/second-edition-of-desert-x-alula-will-open-in-february-2022',
		'/news/second-edition-of-desert-x-alula-will-open-in-february-2022'
	],
	[
		'/learn/news/the-third-edition-of-desert-x-in-the-coachella-valley-will-be-curated-by-cesar-garcia-alvarez-and-neville-wakefield',
		'/news/the-third-edition-of-desert-x-in-the-coachella-valley-will-be-curated-by-cesar-garcia-alvarez-and-neville-wakefield'
	]
]);

// Old edition folders under /dx/ to their edition pages
const EDITIONS = new Map([
	['desert-x-17', '/editions/california-2017'],
	['desert-x-19', '/editions/california-2019'],
	['desert-x-alula-2020', '/editions/alula-2020'],
	['desert-x-21', '/editions/california-2021'],
	['desert-x-alula-2022', '/editions/alula-2022'],
	['dx-23', '/editions/california-2023'],
	['dx24-alula', '/editions/alula-2024'],
	['dx-25-coachella-valley', '/editions/california-2025'],
	['dx-26-alula', '/editions/alula-2026'],
	['dx-27-coachella-valley', '/editions/california-2027']
]);

/**
 * Where an old-site path lives now, or null if it isn't an old path (or
 * has no new home, like /learn and /shop for now, which 404). The Spanish
 * copy under /es goes to the English page. Artworks and news go to their
 * own pages; anything else under an edition, such as its sponsors, to the
 * edition; and the old About, Visit and Support sections to the page that
 * replaces them.
 */
export const redirectFor = (pathname) => {
	const spanish = /^\/es(\/|$)/.test(pathname);
	const path = pathname.replace(/^\/es(?=\/|$)/, '').replace(/\/+$/, '') || '/';
	const exact = PATHS.get(path);
	if (exact) return exact;

	const [, section, folder] = path.split('/');
	if (section === 'dx') {
		if (!folder) return '/art';
		if (folder === 'archive') return '/art';
		if (EDITIONS.has(folder)) return EDITIONS.get(folder);
	}
	if (section === 'about' && folder) return '/about';
	if (section === 'visit' && folder) return '/visit';
	if (section === 'support') return '/donate';
	return spanish ? path : null;
};
