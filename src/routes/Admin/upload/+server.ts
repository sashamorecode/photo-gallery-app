import { json } from "@sveltejs/kit";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, parse, resolve } from "node:path";
import sharp from "sharp";

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const JPEG_QUALITY = 90;

function getDateFolder() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function sanitizeBaseFileName(fileName: string) {
    const parsed = parse(basename(fileName));
    const stem = parsed.name
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    return stem || "image";
}

function getOutputFormatFromMime(mimeType: string) {
    if (mimeType === "image/png") {
        return "png" as const;
    }
    if (mimeType === "image/webp") {
        return "webp" as const;
    }
    return "jpeg" as const;
}

export async function POST({ request }) {
    const data = await request.formData();
    const image = data.get("image");

    if (!image || typeof image === "string") {
        return json({ success: false, error: "No image provided" }, { status: 400 });
    }

    if (!image.type.startsWith("image/")) {
        return json({ success: false, error: "File must be an image" }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());

    const dateFolder = getDateFolder();
    const uploadsDirectory = resolve("static/uploads", dateFolder);
    await mkdir(uploadsDirectory, { recursive: true });

    const outputFormat = getOutputFormatFromMime(image.type);
    const outputExtension = outputFormat === "jpeg" ? "jpg" : outputFormat;
    const originalFileBaseName = sanitizeBaseFileName(image.name || "image");
    const fileName = `${randomUUID()}-${originalFileBaseName}.${outputExtension}`;
    const outputPath = resolve(uploadsDirectory, fileName);

    const resized = sharp(imageBuffer).rotate().resize({
        width: MAX_WIDTH,
        height: MAX_HEIGHT,
        fit: "inside",
        withoutEnlargement: true,
    });

    let processedImage: Buffer;
    if (outputFormat === "png") {
        processedImage = await resized
            .png({ compressionLevel: 9, adaptiveFiltering: true })
            .toBuffer();
    } else if (outputFormat === "webp") {
        processedImage = await resized.webp({ quality: JPEG_QUALITY }).toBuffer();
    } else {
        processedImage = await resized
            .jpeg({
                quality: JPEG_QUALITY,
                mozjpeg: true,
                chromaSubsampling: "4:4:4",
            })
            .toBuffer();
    }

    await writeFile(outputPath, new Uint8Array(processedImage));

    return json({
        success: true,
        path: `/uploads/${dateFolder}/${fileName}`,
    });
}
