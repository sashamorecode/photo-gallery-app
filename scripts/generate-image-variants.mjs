// Generate WebP derivatives for uploaded images.
//
//   node scripts/generate-image-variants.mjs [--force] [--concurrency=4]
//
// Idempotent: existing derivatives are skipped unless --force is passed.
// Uploads already generate their own derivatives; this backfills images that
// predate that behaviour.

import { readdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import {
	VARIANT_SOURCE_EXTENSIONS,
	ensureImageVariants,
	isVariantFile,
} from "../src/lib/server/imageVariants.js";

const args = process.argv.slice(2);
const force = args.includes("--force");
const concurrencyArg = args.find((arg) => arg.startsWith("--concurrency="));
const concurrency = concurrencyArg
	? Math.max(1, Number.parseInt(concurrencyArg.split("=")[1], 10) || 1)
	: 4;

const uploadsRoot = resolve(
	process.env.UPLOADS_DIR ?? resolve(process.cwd(), "static", "uploads"),
);

/** @param {string} directory */
async function collectImages(directory) {
	/** @type {string[]} */
	const files = [];
	let entries;
	try {
		entries = await readdir(directory, { withFileTypes: true });
	} catch {
		return files;
	}
	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await collectImages(path)));
		} else if (entry.isFile()) {
			const ext = extname(entry.name).toLowerCase();
			if (VARIANT_SOURCE_EXTENSIONS.has(ext) && !isVariantFile(entry.name)) {
				files.push(path);
			}
		}
	}
	return files;
}

const images = await collectImages(uploadsRoot);
console.log(`Scanning ${images.length} source images under ${uploadsRoot}`);

let generated = 0;
let skipped = 0;
let failed = 0;
let index = 0;

async function worker() {
	while (index < images.length) {
		const path = images[index++];
		try {
			const results = await ensureImageVariants(path, { force });
			for (const result of results) {
				if (result.skipped) skipped++;
				else generated++;
			}
		} catch (error) {
			failed++;
			console.error(`FAILED ${path}: ${error.message}`);
		}
	}
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

console.log(
	`Done. generated=${generated} skipped=${skipped} failed=${failed} (force=${force})`,
);
