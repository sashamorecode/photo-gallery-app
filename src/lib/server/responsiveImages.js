import { stat } from "node:fs/promises";
import { getImageMeta, uploadFilePath } from "./imageMeta.js";
import { VARIANT_WIDTHS, isUploadSrc, variantUrl } from "$lib/images.js";

/** @type {Map<string, Promise<boolean>>} */
const existsCache = new Map();

/** @param {string} path */
function fileExists(path) {
	const cached = existsCache.get(path);
	if (cached) return cached;
	const promise = stat(path)
		.then((/** @type {{ isFile: () => boolean }} */ info) => info.isFile())
		.catch(() => false);
	existsCache.set(path, promise);
	return promise;
}

/**
 * Augment an image descriptor with intrinsic dimensions and, for uploaded
 * images, a WebP `srcset` (with the original as the largest candidate).
 *
 * @template {{ src: string }} T
 * @param {T} image
 * @param {{ sizes?: string, widths?: number[] }} [options]
 * @returns {Promise<T & { width?: number, height?: number, srcset?: string, sizes?: string }>}
 */
export async function withResponsive(image, options = {}) {
	if (!image || typeof image.src !== "string") return image;
	const { sizes, widths = VARIANT_WIDTHS } = options;
	const meta = await getImageMeta(image.src);
	if (!meta) {
		return sizes ? { ...image, sizes } : { ...image };
	}

	/** @type {T & { width?: number, height?: number, srcset?: string, sizes?: string }} */
	const out = { ...image, width: meta.width, height: meta.height };
	if (sizes) out.sizes = sizes;

	if (isUploadSrc(image.src)) {
		const entries = [];
		for (const width of widths) {
			if (width >= meta.width) continue;
			const url = variantUrl(image.src, width);
			const path = uploadFilePath(url);
			if (path && (await fileExists(path))) {
				entries.push(`${url} ${width}w`);
			}
		}
		entries.push(`${image.src} ${meta.width}w`);
		if (entries.length > 1) out.srcset = entries.join(", ");
	}

	return out;
}

/**
 * @template {{ src: string }} T
 * @param {T[]} images
 * @param {{ sizes?: string, widths?: number[] }} [options]
 */
export function withResponsiveAll(images, options) {
	return Promise.all((images ?? []).map((image) => withResponsive(image, options)));
}
