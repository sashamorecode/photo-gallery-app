# Deployment handoff: performance phases 1 to 4

Hand this to the agent that deploys. Read it fully before touching the server. The goal is to ship the performance work to production without disturbing the production database or uploads.

## Objective

Deploy four performance phases to `jonasschledorn.com`:

- Phase 1 `7034600`: removed the Tailwind Play CDN, Google Fonts, and Font Awesome from the critical path.
- Phase 2 `010cf69`: server-rendered the hero preload with `fetchpriority`.
- Phase 3 `dea03a7`: responsive WebP variants, image dimensions, lazy loading, immutable upload caching, dead static images removed, and gzip + HTTP/2 added to the server config.
- Phase 4 (currently uncommitted): decoded neighbour lookahead on the carousels, destination-image warming on hover, and small fixes.

## Current repository state (verify this first)

```
origin  https://github.com/sashamorecode/photo-gallery-app.git
branch  main, ahead of origin/main by 4 commits (7034600, 010cf69, 80b31fd, dea03a7)
```

Phase 4 is uncommitted in the working tree:

```
 M src/lib/NewsEntry.svelte
 M src/lib/images.js
 M src/routes/+page.svelte
 M src/routes/Stories/+page.svelte
 M src/routes/Stories/[story]/+page.svelte
?? src/lib/imageWarm.js      (new, must be committed)
?? vite.screenshot.config.ts (local screenshot harness, DO NOT commit)
```

The production server is authoritative for data. `mydb.sqlite` and `static/` are gitignored. Never push your local database or uploads to the server. The `sync` and `sync:img` scripts pull FROM the server, not to it.

## Access and topology

- SSH: `photoapp@jonasschledorn.com` (needs sudo).
- App directory: `/home/photoapp/photo-gallery-app`.
- Runtime: `@sveltejs/adapter-node` running `build/index.js` under systemd unit `photoapp.service`, listening on `127.0.0.1:3000`, `NODE_ENV=production`.
- Reverse proxy: nginx site `/etc/nginx/sites-available/photoapp`, TLS via Let's Encrypt. Do not break the cert.
- Node: version 22 via nvm. Secrets live in `/home/photoapp/photo-gallery-app/.env` (`PASSWORD`, `MAILUSER`, `MAILPASS`, `MAIL_API_KEY`, `UPLOADS_DIR`). The build reads `MAIL_API_KEY` and `PASSWORD` at compile time, so `.env` must exist before `npm run build`.

`configServer.sh` is the full provisioning script. Do NOT run it wholesale on an existing server: it rewrites `.env` and the systemd unit, and it defaults the secrets to `CHANGE_ME`. Apply only the targeted steps below.

## Step 0: commit and push Phase 4

On the dev machine:

```sh
git add src/lib/NewsEntry.svelte src/lib/images.js src/routes/+page.svelte \
        src/routes/Stories/+page.svelte src/routes/Stories/[story]/+page.svelte \
        src/lib/imageWarm.js
git status                       # confirm vite.screenshot.config.ts is NOT staged
git commit -m "perf: carousel lookahead, destination warming, small fixes (phase 4)"
git push origin main
```

Confirm `git log --oneline origin/main..HEAD` is now empty.

## Step 1: preflight on the server

```sh
ssh photoapp@jonasschledorn.com
cd /home/photoapp/photo-gallery-app

# Record the current commit for rollback.
git rev-parse HEAD | tee /tmp/deploy-prev-commit.txt

# The pull must be a fast-forward. If this shows local edits to tracked files,
# stop and investigate (stash them); do not clobber.
git status --short
git stash list

# Back up the database before any code change.
cp mydb.sqlite "mydb.sqlite.bak-$(date +%Y-%m-%d-%H%M)"

# Confirm secrets exist for the build.
test -f .env && grep -c 'MAIL_API_KEY\|PASSWORD' .env

# Confirm the running service is healthy before you change anything.
sudo systemctl status photoapp --no-pager
```

## Step 2: pull the code

```sh
git pull --ff-only origin main
git log --oneline -5
```

## Step 3: install dependencies and build

```sh
npm ci --prefer-offline
npm run build
```

`npm run build` runs `vite build` then `scripts/strip-build-uploads.mjs`, which removes uploads from `build/client` because they are served from `static/uploads`. The running service keeps serving the old build until you restart it in Step 6.

## Step 4: generate image variants (new, required)

Phase 3 added a WebP variant pipeline, and Phase 4 added a `704` px rung. Existing uploads need backfilling, otherwise the new rung never appears in `srcset`.

```sh
npm run images:variants
```

Expect a line like `generated=338 skipped=1013 failed=0`. The script is idempotent, walks `static/uploads` (or `$UPLOADS_DIR`), and skips files that already have a derivative. If it fails with permission errors, the upload directories were written by the root-owned service; rerun with `sudo -u root` or fix ownership, then rerun. New uploads generate their own variants at upload time going forward.

## Step 5: apply the nginx gzip + HTTP/2 config

The live nginx config may already gzip static assets, but it predates this change: it has no HTTP/2 and no `gzip_proxied any`, so the proxied SSR HTML is not compressed. Edit `/etc/nginx/sites-available/photoapp` so the TLS server block contains:

```nginx
listen [::]:443 ssl http2 ipv6only=on;
listen 443 ssl http2;

gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;
```

Version caution: this server runs nginx 1.18, where `listen ... ssl http2` is correct. Do NOT switch to the `http2 on;` directive, which requires nginx 1.25.1 or newer.

```sh
sudo cp /etc/nginx/sites-available/photoapp /etc/nginx/sites-available/photoapp.bak-$(date +%s)
sudo nginx -t && sudo systemctl reload nginx
```

## Step 6: restart the app

```sh
sudo systemctl restart photoapp.service
sudo systemctl status photoapp --no-pager
sudo journalctl -u photoapp -n 50 --no-pager
```

## Step 7: verify

```sh
# HTTP/2 and gzip on the HTML response
curl -sI --http2 https://jonasschledorn.com/ | grep -i 'HTTP/\|content-encoding\|vary'

# Pages return 200
for p in / /Stories /News /Bio /Contact; do
  printf '%s ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' "https://jonasschledorn.com$p";
done

# A derivative is served as WebP
curl -sI https://jonasschledorn.com/uploads/2026-04-11/a232c3fe-941c-49cd-822d-d0c92f9fd2b4-a461b181-6e8f-41ab-8116-b239c5a3594f-1-2-704.webp \
  | grep -i 'HTTP/\|content-type\|cache-control'
```

Then, manually:

1. Load the homepage and press Next several times. The photo should swap with no black frame.
2. Hover a Stories card, then click it. The project should open with its first image already resolved.
3. Run PageSpeed Insights on `https://jonasschledorn.com/` and on `/Stories` for the record. Field data (CrUX) lags by weeks; do not block on it.

Working lab targets from local runs: home 97, Stories 97, story detail 96, News 99, all with CLS 0.

## Rollback

Prefer rolling back code only; the database is unchanged by these phases.

```sh
cd /home/photoapp/photo-gallery-app
git reset --hard "$(cat /tmp/deploy-prev-commit.txt)"
npm ci --prefer-offline && npm run build
sudo systemctl restart photoapp.service
sudo systemctl status photoapp --no-pager
```

If nginx is the problem, restore the copy made in Step 5 and `sudo nginx -t && sudo systemctl reload nginx`. If the database is ever in doubt, restore the timestamped backup from Step 1.

## Gotchas

- Never commit `vite.screenshot.config.ts`. It is a local HTTP dev harness.
- Never run `npm run sync` or `npm run sync:img` expecting to push; they pull production data down.
- Do not run `configServer.sh` on the live server. It would overwrite `.env` with `CHANGE_ME` values and reinstall the unit.
- `git pull` must fast-forward. If the server has local edits to tracked files, stop and resolve them first.
- `npm ci` is required, not just `npm run build`, because Phase 3 changed `package.json`.
- The image variant backfill (Step 4) is easy to forget and silently degrades image bytes. Do it after every deploy that changes the variant pipeline.
- The service unit sets `Environment=HOSTNAME=...`, but adapter-node reads `HOST`. Harmless today (defaults to `0.0.0.0`), just do not rely on `HOSTNAME`.
- Keep the Let's Encrypt cert intact. `nginx -t` before every reload.

## One-shot command block

For a confident operator on the server, after Step 0 is pushed and the Step 5 nginx config edit is applied:

```sh
set -euo pipefail
cd /home/photoapp/photo-gallery-app
git rev-parse HEAD | tee /tmp/deploy-prev-commit.txt
cp mydb.sqlite "mydb.sqlite.bak-$(date +%Y-%m-%d-%H%M)"
git pull --ff-only origin main
npm ci --prefer-offline
npm run build
npm run images:variants
sudo nginx -t && sudo systemctl reload nginx
sudo systemctl restart photoapp.service
sleep 2
curl -sI --http2 https://jonasschledorn.com/ | grep -i 'HTTP/\|content-encoding'
sudo systemctl status photoapp --no-pager
```
