#!/usr/bin/env bash
# =============================================================================
# configServer.sh — Server provisioning script for photo-gallery-app
#
# Run this as the app user (e.g. photoapp) with sudo privileges on a fresh
# Ubuntu server. It will:
#   1. Install system dependencies (nginx, certbot, nvm, node)
#   2. Clone / pull the git repo
#   3. Build the SvelteKit app
#   4. Write the .env file
#   5. Install and enable the systemd service
#   6. Configure nginx with the correct body-size limit
#   7. Obtain an SSL certificate via Certbot
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# ✏️  CONFIGURATION — edit these before running
# ---------------------------------------------------------------------------
APP_USER="photoapp"
APP_DIR="/home/${APP_USER}/photo-gallery-app"
DOMAIN="jonasschledorn.com"
GIT_REPO="https://github.com/sashamorecode/photo-gallery-app.git"
NODE_VERSION="22"

# Secrets — fill in real values or export them before running the script
APP_PASSWORD="${APP_PASSWORD:-CHANGE_ME}"
MAIL_USER="${MAIL_USER:-CHANGE_ME}"
MAIL_PASS="${MAIL_PASS:-CHANGE_ME}"
MAIL_API_KEY="${MAIL_API_KEY:-CHANGE_ME}"
UPLOADS_DIR="${UPLOADS_DIR:-${APP_DIR}/static/uploads}"

# Upload body size limit (must match between nginx and Node/SvelteKit)
MAX_UPLOAD_BYTES=104857600   # 100 MB in bytes
MAX_UPLOAD_MB=100            # used in the nginx config string

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
info()  { echo -e "\033[1;34m[INFO]\033[0m  $*"; }
ok()    { echo -e "\033[1;32m[OK]\033[0m    $*"; }
warn()  { echo -e "\033[1;33m[WARN]\033[0m  $*"; }

require_sudo() {
  if ! sudo -n true 2>/dev/null; then
    echo "This script needs sudo privileges. Please run as a user with sudo access."
    exit 1
  fi
}

# ---------------------------------------------------------------------------
# 1. System packages
# ---------------------------------------------------------------------------
install_system_deps() {
  info "Updating package lists and installing system dependencies..."
  sudo apt-get update -qq
  sudo apt-get install -y -qq curl git nginx certbot python3-certbot-nginx
  ok "System dependencies installed."
}

# ---------------------------------------------------------------------------
# 2. Node.js via nvm
# ---------------------------------------------------------------------------
install_node() {
  if command -v node &>/dev/null; then
    ok "Node $(node --version) already installed — skipping."
    return
  fi

  info "Installing nvm + Node ${NODE_VERSION}..."
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash

  # Load nvm into the current shell
  export NVM_DIR="$HOME/.nvm"
  # shellcheck source=/dev/null
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

  nvm install "${NODE_VERSION}"
  nvm use "${NODE_VERSION}"
  nvm alias default "${NODE_VERSION}"
  ok "Node $(node --version) installed."
}

# ---------------------------------------------------------------------------
# 3. Clone or update the repo
# ---------------------------------------------------------------------------
setup_repo() {
  if [ -d "${APP_DIR}/.git" ]; then
    info "Repo already exists — pulling latest changes..."
    git -C "${APP_DIR}" pull
  else
    info "Cloning repo into ${APP_DIR}..."
    git clone "${GIT_REPO}" "${APP_DIR}"
  fi
  ok "Repo ready at ${APP_DIR}."
}

# ---------------------------------------------------------------------------
# 4. Write .env
# ---------------------------------------------------------------------------
write_env() {
  info "Writing .env file..."
  cat > "${APP_DIR}/.env" <<EOF
PASSWORD=${APP_PASSWORD}
MAILUSER=${MAIL_USER}
MAILPASS=${MAIL_PASS}
MAIL_API_KEY=${MAIL_API_KEY}
UPLOADS_DIR=${UPLOADS_DIR}
EOF
  ok ".env written."
}

# ---------------------------------------------------------------------------
# 5. Install dependencies and build
# ---------------------------------------------------------------------------
build_app() {
  info "Installing npm dependencies..."
  (cd "${APP_DIR}" && npm ci --prefer-offline)

  info "Building SvelteKit app..."
  (cd "${APP_DIR}" && npm run build)

  info "Ensuring uploads directory exists..."
  mkdir -p "${UPLOADS_DIR}"
  ok "Build complete."
}

# ---------------------------------------------------------------------------
# 6. systemd service
# ---------------------------------------------------------------------------
install_service() {
  NODE_BIN="$(command -v node)"
  info "Installing systemd service (node binary: ${NODE_BIN})..."

  sudo tee /etc/systemd/system/photoapp.service > /dev/null <<EOF
[Unit]
Description=photoapp
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=${APP_DIR}/
ExecStart=${NODE_BIN} ${APP_DIR}/build/index.js
Environment=PORT=3000 HOSTNAME=${DOMAIN} NODE_ENV=production BODY_SIZE_LIMIT=${MAX_UPLOAD_BYTES} UPLOADS_DIR=${UPLOADS_DIR}
EnvironmentFile=${APP_DIR}/.env
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

  sudo systemctl daemon-reload
  sudo systemctl enable photoapp.service
  sudo systemctl restart photoapp.service
  ok "photoapp.service enabled and started."
}

# ---------------------------------------------------------------------------
# 7. nginx config
# ---------------------------------------------------------------------------
configure_nginx() {
  info "Writing nginx site config for ${DOMAIN}..."

  sudo tee /etc/nginx/sites-available/photoapp > /dev/null <<EOF
# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen [::]:443 ssl http2 ipv6only=on;
    listen 443 ssl http2;

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    server_name ${DOMAIN} www.${DOMAIN};

    # ⚠️  Must match BODY_SIZE_LIMIT in the systemd service (currently ${MAX_UPLOAD_MB}M)
    client_max_body_size ${MAX_UPLOAD_MB}M;

    # Compress proxied responses (SSR HTML) and static text assets.
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    location / {
        proxy_pass            http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout    90;
    }
}
EOF

  # Enable site
  sudo ln -sf /etc/nginx/sites-available/photoapp /etc/nginx/sites-enabled/photoapp

  sudo nginx -t
  sudo systemctl reload nginx
  ok "nginx configured and reloaded."
}

# ---------------------------------------------------------------------------
# 8. SSL certificate
# ---------------------------------------------------------------------------
obtain_ssl() {
  if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    ok "SSL certificate already exists — skipping Certbot."
    return
  fi

  info "Obtaining Let's Encrypt certificate for ${DOMAIN}..."
  sudo certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" --non-interactive --agree-tos \
    --email "webmaster@${DOMAIN}" --redirect
  ok "SSL certificate obtained."
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
  require_sudo
  install_system_deps
  install_node
  setup_repo
  write_env
  build_app
  install_service
  configure_nginx
  obtain_ssl

  echo ""
  echo "============================================================"
  ok "Setup complete! The app is running at https://${DOMAIN}"
  echo "============================================================"
  echo ""
  echo "Useful commands:"
  echo "  sudo systemctl status photoapp"
  echo "  sudo journalctl -u photoapp -f"
  echo "  sudo systemctl restart photoapp"
  echo "  sudo nginx -t && sudo systemctl reload nginx"
}

main "$@"
