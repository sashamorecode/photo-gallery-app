import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { extname, resolve, sep } from "node:path";

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

function buildHeaders(filePath: string) {
	const contentType = MIME_BY_EXT[extname(filePath).toLowerCase()] ?? "application/octet-stream";
	return {
		"Content-Type": contentType,
		"Cache-Control": "no-cache, no-store, must-revalidate"
	};
}

async function serveUploadedFile(pathParam: string, method: "GET" | "HEAD") {
	const filePath = resolveUploadPath(pathParam);
	if (!filePath) {
		return new Response("Not Found", { status: 404 });
	}

	try {
		await access(filePath, constants.R_OK);
	} catch {
		return new Response("Not Found", { status: 404 });
	}

	if (method === "HEAD") {
		return new Response(null, {
			status: 200,
			headers: buildHeaders(filePath)
		});
	}

	const data = await readFile(filePath);
	return new Response(data, {
		status: 200,
		headers: buildHeaders(filePath)
	});
}

export async function GET({ params }) {
	return serveUploadedFile(params.file, "GET");
}

export async function HEAD({ params }) {
	return serveUploadedFile(params.file, "HEAD");
}
