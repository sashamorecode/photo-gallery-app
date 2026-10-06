// Uploaded files are served at runtime by `/uploads/[...file]` from
// UPLOADS_DIR, never from `build/client`. SvelteKit still copies the whole
// `static/` directory into the build output, so remove the redundant copy to
// keep builds small and to prevent adapter-node's static handler from shadowing
// the `/uploads` route (which would drop our cache headers).

import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const clientDir = resolve(process.cwd(), "build", "client");
const uploadsDir = resolve(clientDir, "uploads");

await rm(uploadsDir, { recursive: true, force: true });
console.log(`Removed build copy of uploads: ${uploadsDir}`);
