import sharp from "sharp";
import { access, constants } from "node:fs";
import { dirname, parse, resolve } from "node:path";
import { VARIANT_WIDTHS } from "../images.js";

export const WEBP_QUALITY = 75;

/** Extensions we can safely transcode to WebP. */
export const VARIANT_SOURCE_EXTENSIONS = new Set([
	".jpg",
	".jpeg",
	".png",
	".webp",
	".avif",
	".tif",
	".tiff",
]);

/**
 * `photo.jpg` + 960 -> `photo-960.webp`
 * @param {string} fileName
 * @param {number} width
 */
export function variantFileName(fileName, width) {
	const parsed = parse(fileName);
	return `${parsed.name}-${width}.webp`;
}

/**
 * True for files that are themselves generated derivatives.
 * @param {string} fileName
 */
export function isVariantFile(fileName) {
	return /-\d+\.webp$/i.test(fileName);
}

/**
 * Generate the WebP derivatives for one uploaded image. Missing variants are
 * written; existing ones are left alone unless `force` is set.
 *
 * @param {string} originalPath absolute path to the source image
 * @param {{ force?: boolean }} [options]
 * @returns {Promise<{ width: number, path: string, skipped: boolean }[]>}
 */
export async function ensureImageVariants(originalPath, options = {}) {
	const { force = false } = options;
	const meta = await sharp(originalPath).metadata();
	if (!meta.width || !meta.height) return [];

	const directory = dirname(originalPath);
	const fileName = parse(originalPath).base;
	const results = [];

	for (const width of VARIANT_WIDTHS) {
		if (width >= meta.width) continue;
		const outputPath = resolve(directory, variantFileName(fileName, width));

		if (!force && (await exists(outputPath))) {
			results.push({ width, path: outputPath, skipped: true });
			continue;
		}

		await sharp(originalPath)
			.resize({ width, withoutEnlargement: true })
			.webp({ quality: WEBP_QUALITY })
			.toFile(outputPath);
		results.push({ width, path: outputPath, skipped: false });
	}

	return results;
}

/** @param {string} path */
function exists(path) {
	return new Promise((resolveExists) => {
		access(path, constants.F_OK, (error) => resolveExists(!error));
	});
}
