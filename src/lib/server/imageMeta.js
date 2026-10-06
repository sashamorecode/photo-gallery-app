import sharp from "sharp";
import { stat } from "node:fs/promises";
import { resolve } from "node:path";

const UPLOADS_PREFIX = "/uploads/";
const UPLOADS_ROOT = resolve(
	process.env.UPLOADS_DIR ?? resolve(process.cwd(), "static", "uploads"),
);
const STATIC_ROOT = resolve(process.cwd(), "static");
const BUILD_STATIC_ROOT = resolve(process.cwd(), "build", "client");

/** @type {Map<string, Promise<{width:number,height:number}|null>>} */
const cache = new Map();

/**
 * Absolute filesystem path for an uploaded asset URL, or null when the URL is
 * not an upload (remote, data URI, or relative static asset).
 * @param {string} src
 * @returns {string|null}
 */
export function uploadFilePath(src) {
	if (typeof src !== "string" || !src.startsWith(UPLOADS_PREFIX)) return null;
	const clean = src.split("?")[0].split("#")[0];
	return resolve(UPLOADS_ROOT, clean.slice(UPLOADS_PREFIX.length));
}

/**
 * Candidate absolute paths for any served image URL.
 * @param {string} src
 * @returns {string[]}
 */
function candidatePaths(src) {
	if (typeof src !== "string" || !src) return [];
	const clean = src.split("?")[0].split("#")[0];
	if (/^https?:/i.test(clean)) return [];
	if (clean.startsWith(UPLOADS_PREFIX)) {
		return [resolve(UPLOADS_ROOT, clean.slice(UPLOADS_PREFIX.length))];
	}
	if (!clean.startsWith("/")) return [];
	const rel = clean.slice(1);
	return [resolve(STATIC_ROOT, rel), resolve(BUILD_STATIC_ROOT, rel)];
}

/**
 * Read intrinsic dimensions for a served image, cached per path.
 * @param {string} src
 * @returns {Promise<{width:number,height:number}|null>}
 */
export function getImageMeta(src) {
	const paths = candidatePaths(src);
	if (paths.length === 0) return Promise.resolve(null);

	const key = paths[0];
	const cached = cache.get(key);
	if (cached) return cached;

	const promise = (async () => {
		for (const candidate of paths) {
			try {
				const info = await stat(candidate);
				if (!info.isFile()) continue;
				const meta = await sharp(candidate).metadata();
				if (meta.width && meta.height) {
					return { width: meta.width, height: meta.height };
				}
			} catch {
				// try next candidate
			}
		}
		return null;
	})();

	cache.set(key, promise);
	return promise;
}
