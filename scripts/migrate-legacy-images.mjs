import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, parse, resolve } from "node:path";

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const JPEG_QUALITY = 90;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const dbArg = args.find((arg) => arg.startsWith("--db="));
const dbPath = dbArg ? dbArg.split("=")[1] : "./mydb.sqlite";

const projectRoot = process.cwd();
const staticDir = resolve(projectRoot, "static");
const uploadsDir = resolve(staticDir, "uploads");

const imageColumns = [
    { table: "homepage_images", idColumn: "id", imageColumn: "src" },
    { table: "stories", idColumn: "id", imageColumn: "coverImage" },
    { table: "story_images", idColumn: "id", imageColumn: "src" },
    { table: "news", idColumn: "id", imageColumn: "coverImage" },
    { table: "news_images", idColumn: "id", imageColumn: "src" },
    { table: "prints", idColumn: "id", imageColumn: "src" },
];

function normalizeDbImageValue(value) {
    if (typeof value !== "string") {
        return "";
    }
    return value.trim();
}

function isHttpUrl(value) {
    return value.startsWith("http://") || value.startsWith("https://");
}

function isAlreadyMigrated(value) {
    return value.startsWith("/uploads/");
}

function getDateFolder() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function sanitizeBaseFileName(fileName) {
    const parsed = parse(basename(fileName));
    const stem = parsed.name
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    return stem || "image";
}

function getOutputFormatFromFileName(fileName) {
    const ext = parse(fileName).ext.toLowerCase();
    if (ext === ".png") {
        return "png";
    }
    if (ext === ".webp") {
        return "webp";
    }
    return "jpeg";
}

function getOriginalFileNameFromValue(value) {
    if (isHttpUrl(value)) {
        try {
            const url = new URL(value);
            return decodeURIComponent(basename(url.pathname)) || "image.jpg";
        } catch {
            return "image.jpg";
        }
    }

    const withoutQuery = value.split("?")[0].split("#")[0];
    return basename(withoutQuery) || "image.jpg";
}

async function pathExists(path) {
    try {
        await access(path, fsConstants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function buildCandidatePaths(rawPath) {
    const withoutQuery = rawPath.split("?")[0].split("#")[0];
    const trimmedLeadingSlash = withoutQuery.startsWith("/")
        ? withoutQuery.slice(1)
        : withoutQuery;

    return [
        resolve(staticDir, trimmedLeadingSlash),
        resolve(projectRoot, trimmedLeadingSlash),
        resolve(projectRoot, withoutQuery),
    ];
}

async function loadSourceImageBuffer(imagePathOrUrl) {
    if (isHttpUrl(imagePathOrUrl)) {
        const response = await fetch(imagePathOrUrl);
        if (!response.ok) {
            throw new Error(
                `failed HTTP fetch (${response.status} ${response.statusText})`,
            );
        }
        return Buffer.from(await response.arrayBuffer());
    }

    const candidates = buildCandidatePaths(imagePathOrUrl);
    for (const candidate of candidates) {
        if (await pathExists(candidate)) {
            return readFile(candidate);
        }
    }

    throw new Error("source file not found locally");
}

async function compressAndStoreImage(buffer, originalFileName, persistToDisk) {
    const sharp = (await import("sharp")).default;

    const outputFormat = getOutputFormatFromFileName(originalFileName);
    const outputExtension = outputFormat === "jpeg" ? "jpg" : outputFormat;
    const resized = sharp(buffer).rotate().resize({
        width: MAX_WIDTH,
        height: MAX_HEIGHT,
        fit: "inside",
        withoutEnlargement: true,
    });

    let processed;
    if (outputFormat === "png") {
        processed = await resized
            .png({ compressionLevel: 9, adaptiveFiltering: true })
            .toBuffer();
    } else if (outputFormat === "webp") {
        processed = await resized.webp({ quality: JPEG_QUALITY }).toBuffer();
    } else {
        processed = await resized
            .jpeg({
                quality: JPEG_QUALITY,
                mozjpeg: true,
                chromaSubsampling: "4:4:4",
            })
            .toBuffer();
    }

    const dateFolder = getDateFolder();
    const uploadsDirectory = resolve(uploadsDir, dateFolder);
    const safeOriginalFileName = sanitizeBaseFileName(originalFileName);
    const fileName = `${randomUUID()}-${safeOriginalFileName}.${outputExtension}`;
    const filePath = resolve(uploadsDirectory, fileName);

    if (persistToDisk) {
        await mkdir(uploadsDirectory, { recursive: true });
        await writeFile(filePath, new Uint8Array(processed));
    }

    return `/uploads/${dateFolder}/${fileName}`;
}

async function migrate() {
    const db = new Database(dbPath);
    let migratedCount = 0;
    const statements = new Map();

    for (const { table, idColumn, imageColumn } of imageColumns) {
        const key = `${table}.${imageColumn}`;
        statements.set(
            key,
            db.prepare(
                `UPDATE ${table} SET ${imageColumn} = ? WHERE ${idColumn} = ?`,
            ),
        );
    }

    await mkdir(uploadsDir, { recursive: true });

    console.log(`Using database: ${dbPath}`);
    console.log(`Static directory: ${staticDir}`);
    console.log(`Uploads directory: ${uploadsDir}`);
    if (dryRun) {
        console.log("Running in DRY RUN mode (no DB updates)");
    }

    for (const { table, idColumn, imageColumn } of imageColumns) {
        const rows = db
            .prepare(
                `SELECT ${idColumn} AS id, ${imageColumn} AS image FROM ${table}`,
            )
            .all();

        for (const row of rows) {
            const originalValue = normalizeDbImageValue(row.image);

            if (!originalValue || isAlreadyMigrated(originalValue)) {
                continue;
            }

            try {
                const sourceBuffer = await loadSourceImageBuffer(originalValue);
                const originalFileName = getOriginalFileNameFromValue(originalValue);
                const newPath = await compressAndStoreImage(
                    sourceBuffer,
                    originalFileName,
                    !dryRun,
                );

                if (!dryRun) {
                    const key = `${table}.${imageColumn}`;
                    statements.get(key).run(newPath, row.id);
                }

                migratedCount += 1;

                console.log(
                    `[OK] ${table}.${imageColumn}#${row.id}: ${originalValue} -> ${newPath}`,
                );
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : String(error);
                console.error(
                    `[SKIP] ${table}.${imageColumn}#${row.id}: ${originalValue} (${message})`,
                );
            }
        }
    }

    db.close();

    console.log(`\nMigrated images: ${migratedCount}`);
    if (dryRun) {
        console.log("Dry run complete. No DB changes were written.");
    }
}

migrate().catch((error) => {
    console.error(error);
    process.exit(1);
});
