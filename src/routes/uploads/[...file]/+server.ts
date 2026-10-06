import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { Readable } from "node:stream";

const UPLOADS_ROOT = resolve(process.env.UPLOADS_DIR ?? resolve(process.cwd(), "static", "uploads"));

const MIME_BY_EXT: Record<string, string> = {
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".webp": "image/webp",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	".avif": "image/avif"
};

function resolveUploadPath(routePath: string): string | null {
	let safePath = "";
	try {
		safePath = decodeURIComponent(routePath || "").replace(/^\/+/, "");
	} catch {
		return null;
	}

	if (!safePath) return null;

	const absolutePath = resolve(UPLOADS_ROOT, safePath);
	if (!absolutePath.startsWith(`${UPLOADS_ROOT}${sep}`)) {
		return null;
	}

	return absolutePath;
}

function buildHeaders(filePath: string, size: number) {
	const contentType = MIME_BY_EXT[extname(filePath).toLowerCase()] ?? "application/octet-stream";
	return {
		"Content-Type": contentType,
		"Content-Length": String(size),
		// Uploads are content-addressed (UUID file names), so they never change.
		"Cache-Control": "public, max-age=31536000, immutable"
	};
}

async function serveUploadedFile(pathParam: string, method: "GET" | "HEAD") {
	const filePath = resolveUploadPath(pathParam);
	if (!filePath) {
		return new Response("Not Found", { status: 404 });
	}

	let info;
	try {
		info = await stat(filePath);
	} catch {
		return new Response("Not Found", { status: 404 });
	}
	if (!info.isFile()) {
		return new Response("Not Found", { status: 404 });
	}

	if (method === "HEAD") {
		return new Response(null, {
			status: 200,
			headers: buildHeaders(filePath, info.size)
		});
	}

	const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
	return new Response(stream, {
		status: 200,
		headers: buildHeaders(filePath, info.size)
	});
}

export async function GET({ params }) {
	return serveUploadedFile(params.file, "GET");
}

export async function HEAD({ params }) {
	return serveUploadedFile(params.file, "HEAD");
}
