# Performance handoff

Whoever picks this up: the render-blocking work is done, but two pages still load slowly. Home is fine on desktop and mediocre on mobile; Stories is bad. This file has the numbers, what changed, and what to do next.

## Next agent: start here

**State as of commit `010cf69` plus the uncommitted Phase 3 work described below.** Phase 1 (remove render-blocking CDN assets), Phase 2 (server-render the LCP preload) and Phase 3 (responsive WebP images, Stories CLS/LCP, upload caching, dead-weight cleanup) are done. The working tree is clean except for the intentionally untracked `vite.screenshot.config.ts` (plain-HTTP preview config, keep it).

**What is actually left.** Home, `/Stories`, story detail and `/News` are all in the 96–99 range on mobile now; the LCP element is a 30–80 KiB WebP instead of a 200–340 KiB JPEG. The remaining opportunities are small and mostly server-side: SSR HTML is still uncompressed in the lab (nginx gzip was added to `configServer.sh` but cannot be measured locally), `render-blocking-insight` flags the ~20 KiB of CSS SvelteKit injects, and the image pipeline could shave another ~100 ms with per-DPR variants. `/Stories` no longer needs work.

**What Phase 3 changed, in payoff order:**

| # | Task | Where | Result |
|---|---|---|---|
| 1 | `/Stories` CLS + LCP: intrinsic dimensions, lazy-load below the fold, `fetchpriority`, preload first | `src/routes/Stories/+page.svelte:17` | Perf 70 → 97, CLS 0.134 → 0, LCP 7.95 s → 2.55 s |
| 2 | Hero `<img>` attributes: `fetchpriority`, `decoding`, dimensions, responsive `srcset` | `src/routes/+page.svelte`, `src/routes/Stories/[story]/+page.svelte` | Home LCP 3.46 → 2.41 s |
| 3 | Responsive WebP variants (480/768/960/1440/1920) plus `srcset`/`sizes` | `src/lib/server/imageVariants.js`, `scripts/generate-image-variants.mjs`, page loaders | Home 415 → 171 KiB, Stories 1231 → 483 KiB |
| 4 | Cache `/uploads` immutably and stream it | `src/routes/uploads/[...file]/+server.ts` | `cache-insight` 0 → 1 |
| 5 | nginx gzip + HTTP/2 (config only, not lab-measurable) | `configServer.sh:175` | TTFB |
| 6 | Delete ~24 MB dead legacy images, drop `@tailwindcss/typography`, fix `mb:text-3xl`, stop copying uploads into the build | `static/`, `src/app.css`, `package.json`, `scripts/strip-build-uploads.mjs` | Build output 119 MB → 2.4 MB |

**Two things to run in production after this ships:**
- `npm run images:variants` once, to backfill WebP derivatives for images uploaded before this change. It is idempotent. The app falls back to originals when a derivative is missing, so skipping it is safe but gives up the byte savings.
- `sudo bash configServer.sh` (or just re-run the nginx step) so the new `gzip`/`http2` directives take effect.

Full descriptions and line references are in "Next steps, in order" below. Read "Constraints and traps" before touching `src/app.css` or the hero offset.

**Verify every change the same way Phase 3 was verified:** capture `/`, `/Stories`, a story detail and `/News` before and after, on a background preview tab, at 1280x800 and 390x844, then diff with sharp. Pixel diffs inside image regions are expected when the served image changes; element bounding boxes must be identical. Details in "Visual verification harness".

## Baseline numbers

Measured locally against a production build right after Phase 1, before the Phase 2 preload fix. Lighthouse 13.5, headless Chrome 154, default throttling, `--only-categories=performance`. Current state is in "What changed (Phase 2)".

| Page | Device | Perf | FCP | LCP | TBT | CLS | Notes |
|---|---|---|---|---|---|---|---|
| `/` | mobile | 90 | 1.5 s | **3.6 s** | 10 ms | 0 | LCP image has no `fetchpriority`; 243 KiB image savings available |
| `/` | desktop | 100 | 0.4 s | 0.7 s | 0 | 0 | |
| `/Stories` | mobile | **54** | 1.4 s | **8.0 s** | 0 | **0.559** | four eager images, no dimensions |
| `/News` | mobile | 96 | 1.2 s | 2.7 s | 0 | 0.029 | |

Home mobile transfers 1,048 KiB over 34 requests. The three hero images are the bulk: 506 KB, 306 KB, 141 KB.

Stories mobile transfers four covers at 341 KB, 334 KB, 294 KB, 203 KB, roughly 1.17 MB, all eager. No `width`/`height` on any of them, which is where the 0.559 CLS comes from. LCP is 8 s because the first cover is 341 KB and lands late.

The LCP audit (`lcp-discovery-insight`) scores 0 on both pages: `fetchpriority=high should be applied` is false. `image-delivery-insight` scores 0 on home with 243 KiB estimated savings.

## Reproduce the baseline

The tooling lives in `/tmp` and may be gone. Reinstall:

```sh
mkdir -p /tmp/lh && cd /tmp/lh && npm init -y && npm i lighthouse@13 @puppeteer/browsers
npx @puppeteer/browsers install chrome-headless-shell@stable --path /tmp/chrome
```

Build and serve a production bundle. The build needs two env vars that are not committed:

```sh
printf 'MAIL_API_KEY=dummy\nPASSWORD=dummy\n' > .env
npm run build
rm .env
PORT=4173 HOST=127.0.0.1 ORIGIN=http://127.0.0.1:4173 node build/index.js
```

Run it. Swap `--preset=desktop` for desktop, and the URL for other routes:

```sh
CHROME=/tmp/chrome/chrome-headless-shell/*/chrome-headless-shell-linux64/chrome-headless-shell
CHROME_PATH=$CHROME node /tmp/lh/node_modules/lighthouse/cli/index.js \
  http://127.0.0.1:4173/ --only-categories=performance \
  --output=json --output-path=/tmp/lh/home-mobile.json --chrome-flags="--no-sandbox" --quiet
```

These are lab numbers. They are good for comparing before and after on the same machine. They will not equal PageSpeed Insights, which mixes in field data.

### Measurement harness (used for Phase 2)

If they survive, the tooling lives at `/tmp/opencode/lh` (Lighthouse 13), `/tmp/opencode/chrome` (chrome-headless-shell 154), and `/tmp/opencode/measure.sh`. `measure.sh <label>` builds, serves on `:4179`, and writes `<label>-home-mobile.json` and `<label>-storydetail-mobile.json` to `/tmp/opencode/lh`. Recreate it if gone:

```sh
#!/usr/bin/env bash
LABEL=$1
CHROME=$(ls /tmp/opencode/chrome/chrome-headless-shell/*/chrome-headless-shell-linux64/chrome-headless-shell)
PORT=4179; ORIGIN="http://127.0.0.1:$PORT"
printf 'MAIL_API_KEY=dummy\nPASSWORD=dummy\n' > .env
npm run build > "/tmp/opencode/build-$LABEL.log" 2>&1; rm -f .env
pkill -f "node build/index.js" 2>/dev/null; sleep 1
PORT=$PORT HOST=127.0.0.1 ORIGIN=$ORIGIN node build/index.js > "/tmp/opencode/server-$LABEL.log" 2>&1 &
SRV=$!; trap 'kill $SRV 2>/dev/null' EXIT
for i in $(seq 1 60); do curl -sf "$ORIGIN/" >/dev/null 2>&1 && break; sleep 0.5; done
run() { CHROME_PATH=$CHROME node /tmp/opencode/lh/node_modules/lighthouse/cli/index.js \
  "$ORIGIN$1" --only-categories=performance --output=json --output-path="$2" \
  --chrome-flags="--no-sandbox" --quiet; }
run "/" "/tmp/opencode/lh/${LABEL}-home-mobile.json"
run "/Stories/Construction" "/tmp/opencode/lh/${LABEL}-storydetail-mobile.json"
```

To get a true before/after, `git stash push -- <files>`, run `measure.sh before`, `git stash pop`, run `measure.sh after`. Extract metrics by summing `transferSize` over `j.audits['network-requests'].details.items`.

Route note: the only story slug guaranteed in the local DB is `Stories/Construction`; `Stories/Suntem Acas%C4%83` also exists but needs URL-encoding.

## What already changed (Phase 1)

Seven source files. The goal was to clear the render-blocking resources from the original PageSpeed report.

- `src/app.html` removed the Tailwind Play CDN (124 KB blocking JS), the Google Fonts stylesheet, and the Font Awesome CSS. Umami analytics stays, it is already `defer`.
- `src/lib/Navbar.svelte` replaced the four Font Awesome icons with inline SVG and rewrote the mobile menu toggle. Added `aria-label` to the Instagram link.
- `src/routes/News/+page.svelte`, `src/routes/News/[newsEntry]/+page.svelte`, `src/routes/Stories/[story]/+page.svelte` replaced the `fa-arrow-left` icon and migrated the v3-only `bg-opacity-*` classes to v4 slash syntax (`bg-black/80`, `bg-stone-300/20`).
- `src/app.css` added `@source "../node_modules/flowbite-svelte/dist"` and a `@theme` block that pins the v3 palette.
- `src/routes/+page.svelte` changed the hero offset to `lg:translate-x-[-4rem]`.

Details on those last three are in Constraints, and they matter.

## What changed (Phase 2) — hero preload

`src/routes/+page.svelte` and `src/routes/Stories/[story]/+page.svelte` gated their `<link rel="preload">` behind a 500 ms client `setTimeout`, so the hint never ran during SSR. Both now emit a single server-rendered preload for the first (LCP) slide:

```svelte
<svelte:head>
	<link rel="preload" as="image" fetchpriority="high" href={images[0].src} />
</svelte:head>
```

The old window (`Math.abs(imageIdx - idx) < 3`) preloaded three slides, so the browser also fetched two off-screen images. The new code preloads only the visible slide. The preload href matches the SSR `<img>` exactly on both pages.

Measured locally against the same production build and Lighthouse setup as the baseline (`npm run build`, `node build/index.js`, mobile throttling):

| Page | Perf | LCP | Total KiB | Image reqs |
|---|---|---|---|---|
| `/` before | 91 | 3.5 s | 1048 | 3 |
| `/` after | 91 | 3.5 s | **415** | **1** |
| `/Stories/Construction` before | 84 | 4.4 s | 1199 | 3 |
| `/Stories/Construction` after | 84 | 4.4 s | **578** | **1** |

`lcp-discovery-insight` went from score 0 (`fetchpriority=high should be applied` = false) to score 1 on both pages.

The perf score and LCP did not move. The LCP image was already discoverable in the initial HTML, so the hint changes the audit but not the lab timeline. The win is roughly 620 KiB less transferred per load (the two off-screen slides that are no longer fetched). The remaining LCP cost is image bytes, which is step 4 below.

UI was verified unchanged: viewport captures of `/`, `/Stories/Construction` on desktop (1280x800) and mobile (390x844) before and after the change diff to 0 changed pixels above the noise floor (`maxDelta <= 1`).

## What changed (Phase 3) — responsive images and page fixes

Measured on the same machine and harness as the baseline (production build, Lighthouse 13, mobile throttling). "Baseline" is the pre-Phase-3 build; "after" is the Phase 3 build.

| Page | Perf | LCP | Total KiB | Img KiB |
|---|---|---|---|---|
| `/` baseline | 91 | 3.46 s | 415 | 300 |
| `/` after | **97** | **2.41 s** | **171** | **45** |
| `/Stories` baseline | 70 | 7.95 s | 1231 | 1147 |
| `/Stories` after | **97** | **2.55 s** | **483** | **394** |
| `/Stories/Construction` baseline | 84 | 4.35 s | 578 | 454 |
| `/Stories/Construction` after | **96** | **2.56 s** | **214** | **82** |
| `/News` baseline | 96 | 2.70 s | 245 | 167 |
| `/News` after | **99** | **2.10 s** | **111** | **30** |

`/Stories` CLS went 0.134 → 0. `cache-insight` is 1 on every page. `image-delivery-insight` is 1 on home and news; on `/Stories` and story detail it still reports ~150 ms of LCP savings because the browser picks the 768 px derivative for a 665 px slot (see below).

### Responsive image pipeline

`src/lib/server/imageVariants.js` writes WebP derivatives at widths 480/768/960/1440/1920 for every uploaded raster image, skipping widths at or above the original. `src/routes/Admin/upload/+server.ts` calls `ensureImageVariants` after each upload; `scripts/generate-image-variants.mjs` (`npm run images:variants`) backfills the rest. Derivatives are named `<stem>-<width>.webp` next to the original.

On the read side, `src/lib/server/responsiveImages.js` exposes `withResponsive`/`withResponsiveAll`. They read intrinsic dimensions via `sharp` (`src/lib/server/imageMeta.js`, cached per path), attach `width`/`height`, and build a `srcset` from whichever derivatives actually exist on disk, with the original as the largest candidate. The page `+page.server.js` loaders attach these attributes, and the components spread them onto the `<img>`. Flowbite's `Slide` spreads the `image` object it is given, so `srcset`/`sizes`/`fetchpriority`/`decoding` pass straight through the carousel with no wrapper.

Because `withResponsive` checks for the file, the app degrades to the original image when a derivative is missing — no broken images if the backfill has not run.

### Preload carries the srcset

Every preload that points at an image now also emits `imagesrcset` and `imagesizes`, so the browser preloads the same derivative the `<img>` will choose instead of the original:

```svelte
<link rel="preload" as="image" fetchpriority="high"
  href={image.src} imagesrcset={image.srcset} imagesizes={image.sizes} />
```

### `/uploads` caching and streaming

`src/routes/uploads/[...file]/+server.ts` now sends `public, max-age=31536000, immutable` (safe: file names are UUIDs) plus `Content-Length`, and streams the file with `Readable.toWeb(createReadStream(...))` instead of buffering it into memory.

There is a trap here worth remembering: SvelteKit copies the whole `static/` directory into `build/client`, and adapter-node serves files that exist there **before** the router runs. That meant `/uploads/*` was being served by the static handler with no cache headers, shadowing the route entirely. `scripts/strip-build-uploads.mjs` (run at the end of `npm run build`) deletes `build/client/uploads`, which both fixes the header and removes a redundant 147 MB from the build. `build/client` went from 119 MB to 2.4 MB.

### Stories page

`src/routes/Stories/+page.svelte` gives each cover `width`/`height`, a `srcset`, `loading="lazy"` for everything below the first, and `fetchpriority="high"` on the first. A server-rendered preload for the first cover carries the `srcset`. The `width`/`height` reserve the aspect ratio, which is what removed the CLS.

### Cleanup

Deleted 14 tracked, unreferenced legacy images from `static/` (~24 MB), dropped the unused `@tailwindcss/typography` plugin from `src/app.css` and `package.json`, and fixed `mb:text-3xl` → `md:text-3xl` in `src/routes/Contact/+page.svelte:20`. That last one is a deliberate, visible change at the `md` breakpoint; everything else is UI-neutral.

### UI verification

Viewport captures of `/`, `/Stories`, `/Stories/Construction` and `/News` at 1280x800 and 390x844. Element bounding boxes for `img/h1/h2/h3/button` are byte-identical before and after on `/Stories` (mobile), `/Stories/Construction` (mobile) and `/` (desktop). Pixel diffs are confined to image rectangles and are the expected result of re-encoding at quality 75; side-by-side inspection shows them as visually identical.

## Constraints and traps

**Do not delete the `@source` line in `src/app.css`.** Tailwind v4 does not scan `node_modules`, so Flowbite's own classes (`sr-only`, `rounded-full`, `bg-white/30`, the indicator dots) were only ever generated at runtime by the Play CDN. Remove the `@source` and the carousel controls and dots break.

**The `@theme` color block in `src/app.css` is deliberate.** v4 ships an oklch palette that differs from v3. Before this branch, the CDN was overriding compiled v4 colors with v3 values. Removing it shifted reds, for example `red-800` went from `#991b1b` to `#9f0712`. The `@theme` block pins every token the site uses back to v3. Delete it if you want the v4 colors, but expect a visible change.

**`lg:translate-x-[-4rem]` on `src/routes/+page.svelte:34` is not a typo.** The CDN applied the transform twice, once through v3 `transform` and once through v4 `translate`, for a net -64px. With the CDN gone, -4rem reproduces that exact position. Set it to `-2rem` if the old position was actually a bug.

**`font-amiko` and `font-cabin` do nothing.** No `@theme` font tokens define them, so those classes render the system stack. The Google Fonts link was removed because of this. If the designer wants Amiko and Cabin for real, add `--font-amiko` and `--font-cabin` to `@theme` and self-host the woff2 files with `font-display: swap`.

**Build and runtime env.** `npm run build` fails without `MAIL_API_KEY` and `PASSWORD` in `.env` (gitignored). At runtime `UPLOADS_DIR` defaults to `./static/uploads`, so run `node build/index.js` from the repo root or set it.

**The dev server uses a self-signed cert the browser preview rejects.** Use the untracked `vite.screenshot.config.ts` (plain HTTP on 5337) to view it:

```ts
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: { port: 5337, strictPort: true, host: '127.0.0.1' }
});
```

**Screenshot diffs need a background tab.** When the preview panel is visible, captures come back scaled and the diff is garbage. Call `preview_open` with `open=false` and capture there. Two same-state captures must diff to 0 before you trust a comparison.

**Expect sub-pixel text differences and ignore them.** With the CDN gone, links and buttons render grayscale anti-aliasing instead of LCD subpixel. It shows up as about 0.28% of pixels on glyph edges in the sidebar nav and icons. It is not a layout or color change. Verify with computed styles and bounding boxes before chasing it.

**Prod content is not in git.** `mydb.sqlite` and `static/` are gitignored. Pull production before judging any gallery page: `npm run sync` and `npm run sync:img`.

## Next steps, in order

1. ~~**Fix the hero preload (home and story detail).**~~ **Done (Phase 2).**
2. ~~**Give the LCP image `fetchpriority="high"`, `decoding="async"`, and dimensions.**~~ **Done (Phase 3).** Attributes ride through Flowbite's `Slide` via the `image` object spread.
3. ~~**Fix Stories CLS and LCP.**~~ **Done (Phase 3).** 70 → 97, CLS 0.134 → 0.
4. ~~**Serve smaller images.**~~ **Done (Phase 3).** Responsive WebP derivatives plus `srcset`/`sizes`. `npm run images:variants` backfills older uploads.
5. ~~**Add caching for `/uploads`.**~~ **Done (Phase 3).** Immutable `Cache-Control` and streaming; `cache-insight` 0 → 1.
6. **Compress SSR responses and enable HTTP/2.** nginx `gzip`/`http2` directives were added to `configServer.sh` but are not measurable in the local lab. Re-run the provisioning step to apply them on the server. This is the remaining `document-latency-insight` failure (`usesCompression`).
7. ~~**Clean up dead weight.**~~ **Done (Phase 3).** Deleted ~24 MB of legacy images, dropped `@tailwindcss/typography`, fixed the `mb:text-3xl` typo, and stopped copying `static/uploads` into `build/client` (119 MB → 2.4 MB).

**Remaining, smaller wins if someone wants to keep going:**

- **Per-DPR variants.** The browser picks the 768 px derivative for a ~665 px slot on `/Stories`, so `image-delivery-insight` still estimates ~150 ms of LCP savings there. Adding widths that land closer to common DPR targets (e.g. 704) would close it, at the cost of more derivative files.
- **Render-blocking CSS.** `render-blocking-insight` scores 0 on the ~20 KiB of CSS SvelteKit injects (`0.*.css`, `theme.*.css`, `Navbar.*.css`). Inlining critical CSS or deferring the Navbar stylesheet would recover ~300 ms of simulated render delay.
- **AVIF.** The derivatives are WebP. AVIF would cut another ~20–30% on the same pixels but needs a `<picture>` fallback and is slower to encode.

## Visual verification harness

Goal: prove a change is UI-neutral. Capture the same route before and after at a fixed viewport, then diff the PNGs.

1. Start the plain-HTTP dev server: `npm exec vite -- --config vite.screenshot.config.ts` (port 5337).
2. `preview_open` with `open=false` (a background tab; a visible preview panel returns scaled captures), `preview_resize` to a freeform viewport (`1280x800` desktop, `390x844` mobile), navigate, wait ~3 s for images, then `preview_snapshot` with `save=true, includeImage=false` and copy the returned `screenshotPath`.
3. Diff with sharp. The script used for Phase 2 (`/tmp/opencode/diff-preload.mjs`) reads `/tmp/opencode/shots/preload-before` and `.../after`, compares every PNG with `ensureAlpha().raw()`, and reports `diffPix`, percent, `maxDelta`, `avgDelta`, and the bounding box at a per-pixel threshold of 2.

Expected noise floor: `diffPix=0` (or a handful of pixels with `maxDelta <= 1`) is clean. The Phase 1 comparison showed ~0.28% of pixels changed on glyph edges (grayscale vs LCD subpixel AA) with the bounding box inside the sidebar nav; that is expected and not a layout or color change. `preview_open`/`preview_resize`/`preview_snapshot` are the tools available in this environment; `/tmp/opencode` holds the earlier scripts if it survived.

## Open decisions for the owner

- Keep the v3-pinned palette or move to v4 colors?
- Keep the hero at the pre-existing -64px offset, or correct it to -32px?
- Bring back Amiko/Cabin as real self-hosted fonts, or drop them?
