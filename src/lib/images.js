// Shared image helpers. Safe to import from both server and client code.

export const UPLOADS_PREFIX = "/uploads/";

/** Widths generated as WebP derivatives of every uploaded image. */
export const VARIANT_WIDTHS = [480, 768, 960, 1440, 1920];

/** @param {string} src */
export function isUploadSrc(src) {
	return typeof src === "string" && src.startsWith(UPLOADS_PREFIX);
}

/**
 * Derivative URL for an upload: `/uploads/x/name.jpg` -> `/uploads/x/name-960.webp`.
 * @param {string} src
 * @param {number} width
 */
export function variantUrl(src, width) {
	const match = /^(.*)\.([a-zA-Z0-9]+)$/.exec(src);
	if (!match) return src;
	return `${match[1]}-${width}.webp`;
}
