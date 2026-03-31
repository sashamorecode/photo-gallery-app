# photo-gallery-app

A SvelteKit-based photo gallery application for [jonasschledorn.com](https://jonasschledorn.com).

---

## 🚀 Deploying to a new server

A setup script is provided to provision a fresh Ubuntu server from scratch:

```sh
# 1. Copy the script to the server and make it executable
scp configServer.sh photoapp@your-server:~/
ssh photoapp@your-server

# 2. Set your secrets as environment variables, then run the script
export APP_PASSWORD="your-admin-password"
export MAIL_USER="your@mailuser.com"
export MAIL_PASS="your-mail-password"
export MAIL_API_KEY="your-mailersend-api-key"

bash ~/configServer.sh
```

The script will:
- Install nginx, certbot, nvm and Node.js
- Clone the repo and build the app
- Write the `.env` file
- Install and start the `photoapp` systemd service
- Configure nginx as a reverse proxy with HTTPS (Let's Encrypt)

> **Before running:** edit the `CONFIGURATION` block at the top of `configServer.sh` to set `DOMAIN`, `GIT_REPO`, and `NODE_VERSION`.

---

## ⚙️ Server configuration notes

### Upload size limits — two layers must match

Large image uploads are gated by **two independent limits** that must both be raised when you want to allow bigger files:

| Layer | Setting | Location |
|---|---|---|
| **nginx** | `client_max_body_size 100M;` | `/etc/nginx/sites-available/photoapp` (server block) |
| **SvelteKit node adapter** | `BODY_SIZE_LIMIT=104857600` (bytes) | `/etc/systemd/system/photoapp.service` → `Environment=` line |

If only nginx is updated you get a `500 Internal Server Error` with the message:  
`Content-length of X exceeds limit of 524288 bytes.` (SvelteKit's default is 512 KB).

After changing either file:
```sh
# nginx
sudo nginx -t && sudo systemctl reload nginx

# systemd service
sudo systemctl daemon-reload && sudo systemctl restart photoapp
```

Both values are kept in sync automatically when using `configServer.sh` (edit `MAX_UPLOAD_BYTES` and `MAX_UPLOAD_MB` at the top of the script).

---

## 🛠️ Development

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
