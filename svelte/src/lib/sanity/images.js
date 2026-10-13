import { urlFor } from '$lib/sanity/client';

/**
 * GROQ projection for an image field rendered by Image: the image itself
 * (asset, crop, hotspot), plus the media library's alt text and the
 * original's dimensions.
 */
export const imageFields = `
	...,
	"alt": asset->altText,
	"width": asset->metadata.dimensions.width,
	"height": asset->metadata.dimensions.height
`;

// Widths offered in every srcset. Sanity's CDN resizes on request, so these
// cost nothing until a browser asks for one.
const imageWidths = [400, 800, 1200, 1600, 2000, 2600, 3200];

/** An image's size after its Studio crop, or null if it wasn't queried. */
const croppedSize = ({ width, height, crop }) => {
	if (!width || !height) return null;
	return {
		width: Math.round(width * (1 - (crop?.left ?? 0) - (crop?.right ?? 0))),
		height: Math.round(height * (1 - (crop?.top ?? 0) - (crop?.bottom ?? 0)))
	};
};

/**
 * The src, srcset and intrinsic size for an image queried with
 * `imageFields`. With an `aspect` (width / height), every file is cropped
 * to it around the hotspot. Widths at or above the original are left out,
 * and the original's width stands in for them, so nothing is upscaled.
 */
export const imageSources = (image, aspect) => {
	const size = croppedSize(image);
	const ratio = aspect ?? (size ? size.width / size.height : null);

	const url = (width) => {
		const builder = urlFor(image).width(width).auto('format');
		return ratio ? builder.height(Math.round(width / ratio)).url() : builder.url();
	};

	const maxWidth = size?.width ?? imageWidths.at(-1);
	const widths = [...imageWidths.filter((width) => width < maxWidth), maxWidth];

	return {
		src: url(widths[Math.min(2, widths.length - 1)]),
		srcset: widths.map((width) => `${url(width)} ${width}w`).join(', '),
		width: maxWidth,
		height: ratio ? Math.round(maxWidth / ratio) : undefined
	};
};
