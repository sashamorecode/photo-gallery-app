# Performance handoff

Whoever picks this up: the render-blocking work is done, but two pages still load slowly. Home is fine on desktop and mediocre on mobile; Stories is bad. This file has the numbers, what changed, and what to do next.

## Baseline numbers

Measured locally against a production build of the current branch. Lighthouse 13.5, headless Chrome 154, default throttling, `--only-categories=performance`.

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

1. ~~**Fix the hero preload (home and story detail).**~~ **Done (Phase 2).** Server-rendered `fetchpriority="high"` preload for the first slide on both pages. `lcp-discovery-insight` 0 → 1 and ~620 KiB less transferred, but LCP unchanged. See "What changed (Phase 2)".
2. **Give the LCP image `fetchpriority="high"`, `decoding="async"`, and dimensions.** Flowbite's `Slide` does not forward attributes, so a custom slide snippet or a wrapper is the likely route. The hero lives in `src/routes/+page.svelte:35`.
3. **Fix Stories CLS and LCP.** Add `width`/`height` or an aspect-ratio box to the covers in `src/routes/Stories/+page.svelte:21-25`, lazy-load everything below the first, and preload the first. That page alone is worth 30+ points.
4. **Serve smaller images.** Uploaded images are capped at 1920x1080 and re-encoded, but served at full size (`src/routes/Admin/upload/+server.ts`). Generate WebP/AVIF and responsive widths, then use `srcset`/`<picture>`. The audit estimates 243 KiB savings on home alone.
5. **Add caching for `/uploads`.** `src/routes/uploads/[...file]/+server.ts:39` sends `no-cache, no-store, must-revalidate` and reads the whole file into memory. Filenames are content-addressed UUIDs, so `public, max-age=31536000, immutable` is safe.
6. **Compress SSR responses and enable HTTP/2.** adapter-node precompresses static assets, but SSR HTML goes out uncompressed and nginx has no `gzip`/`brotli` and no `http2` (`configServer.sh:167-198`).
7. **Clean up dead weight.** Around 21 MB of unreferenced legacy images still ship in `build/client`, including `HomePageImage.jpg` at 13.8 MB. Also `@tailwindcss/typography` is loaded but unused, and there is a `mb:text-3xl` typo in `src/routes/Contact/+page.svelte:20`.

## Visual verification harness

The scripts I used are in `/tmp/opencode` and may be wiped. The approach is simple enough to redo: capture the same routes before and after at a fixed viewport on a background tab, then diff PNGs byte-for-byte with sharp, reporting changed pixel count, max channel delta, and a bounding box. Full-page diffs of 0.3% with a bounding box inside the sidebar nav are the expected noise floor.

## Open decisions for the owner

- Keep the v3-pinned palette or move to v4 colors?
- Keep the hero at the pre-existing -64px offset, or correct it to -32px?
- Bring back Amiko/Cabin as real self-hosted fonts, or drop them?
