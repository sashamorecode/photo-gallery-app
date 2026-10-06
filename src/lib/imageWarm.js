// Client-side image warming helpers. Safe to import on the server: every
// entry point no-ops (or short-circuits) when `window` is unavailable.

/** @type {Map<string, Promise<void>>} */
const warmCache = new Map();

/**
 * Preload and decode a single image descriptor ({ src, srcset, sizes }) into
 * the browser cache. Resolves once the decoded bitmap is available. Repeated
 * calls for the same `src` return the memoized promise (free).
 *
 * @param {{ src?: string, srcset?: string, sizes?: string }} image
 * @returns {Promise<void>}
 */
export function warmImage(image) {
	if (typeof window === "undefined") return Promise.resolve();
	if (!image || typeof image.src !== "string" || image.src === "") {
		return Promise.resolve();
	}

	const src = image.src;
	const existing = warmCache.get(src);
	if (existing) return existing;

	/** @type {Promise<void>} */
	const promise = new Promise((resolve) => {
		const img = new Image();
		let settled = false;

		const settle = () => {
			if (settled) return;
			settled = true;
			resolve();
		};

		const done = () => {
			if (typeof img.decode === "function") {
				img.decode().then(settle, settle);
			} else {
				settle();
			}
		};

		// `srcset`/`sizes` before `src`, and low priority so warming never
		// competes with the LCP image.
		img.decoding = "async";
		img.fetchPriority = "low";
		if (image.srcset) img.srcset = image.srcset;
		if (image.sizes) img.sizes = image.sizes;

		img.addEventListener("load", done, { once: true });
		img.addEventListener("error", settle, { once: true });
		img.src = src;

		// Cached (or synchronously complete) images may never fire "load".
		if (img.complete) done();
	});

	warmCache.set(src, promise);
	return promise;
}

/**
 * Like `warmImage` but never waits longer than `ms`, so a slow or broken image
 * cannot hang a navigation/click.
 *
 * @param {{ src?: string, srcset?: string, sizes?: string }} image
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function warmWithTimeout(image, ms = 1000) {
	return Promise.race([
		warmImage(image),
		new Promise((resolve) => setTimeout(resolve, ms)),
	]);
}

/**
 * Run `callback` when the browser is idle (or after a short fallback delay) so
 * warming never competes with the LCP image. Returns a cancel function.
 *
 * @param {() => void} callback
 * @returns {() => void}
 */
export function deferIdle(callback) {
	if (typeof window === "undefined") {
		callback();
		return () => {};
	}
	if (typeof window.requestIdleCallback === "function") {
		const id = window.requestIdleCallback(callback, { timeout: 1000 });
		return () => window.cancelIdleCallback(id);
	}
	const id = setTimeout(callback, 300);
	return () => clearTimeout(id);
}

/**
 * True when the user has requested reduced data usage (Save-Data). Used to skip
 * speculative warming.
 *
 * @returns {boolean}
 */
export function isSaveData() {
	if (typeof window === "undefined") return false;
	const connection = /** @type {any} */ (navigator).connection;
	return Boolean(connection?.saveData);
}
