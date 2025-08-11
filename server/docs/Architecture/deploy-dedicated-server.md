## Dedicated Server CI/CD (Recommended)

This guide describes a production-safe deployment flow for a single dedicated server. It avoids “git pull + build on the server” and instead builds artifacts in CI, ships them to the server, and performs an atomic switch with PM2 for low/zero downtime.

Who should read: developers and DevOps who deploy this project to a dedicated Linux server.

---

### Overview

- Source of truth: this repository
- Build in CI (GitHub Actions)
- Upload built artifacts to the server via SSH/SCP
- Atomic release activation via a `current → releases/<sha>` symlink
- Process manager: PM2 (reload on new release)
- Optional: Nginx reverse proxy + static serving for the frontend build

---

### Directory layout on the server

```
/opt/bankimonline/
  ├── releases/                  # each release unpacks here under git SHA
  │    └── <sha>/
  │         ├── mainapp/build/   # frontend build output
  │         └── server/          # server folder (includes server-db.js, migrations, etc.)
  ├── shared/                    # persisted data not overwritten by deploys
  │    ├── .env                  # production env (DATABASE_URL, JWT_SECRET, etc.)
  │    ├── uploads/              # user uploads (persisted across releases)
  │    └── logs/                 # optional log dir
  └── current -> releases/<sha>  # symlink to the active release
```

Notes
- `.env` and `uploads/` live in `shared/`. The app reads env from there.
- `current` symlink flips atomically to the new release.

---

### One-time server setup

Run these once as a privileged user. Prefer deploying as a non-root user (e.g., `deploy`).

```bash
# 1) Create directories and a deploy user (example user: deploy)
sudo useradd -m -s /bin/bash deploy || true
sudo mkdir -p /opt/bankimonline/releases /opt/bankimonline/shared/uploads /opt/bankimonline/shared/logs
sudo chown -R deploy:deploy /opt/bankimonline

# 2) Install Node LTS and PM2 (as deploy user)
su - deploy
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
npm i -g pm2

# 3) Place production env
cat >/opt/bankimonline/shared/.env <<'ENV'
NODE_ENV=production
PORT=8003
# DATABASE_URL=postgresql://user:pass@host:5432/db
# CONTENT_DATABASE_URL=postgresql://user:pass@host:5432/db
# JWT_SECRET=...
# CORS_ALLOWED_ORIGINS=*
ENV

# 4) (Optional) Nginx reverse proxy for HTTPS + static SPA
sudo apt-get install -y nginx
# Configure a server block to serve SPA and proxy /api to 127.0.0.1:8003
```

Minimal Nginx example

```nginx
server {
    listen 80;
    server_name your.domain;

    root /opt/bankimonline/current/mainapp/build;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8003/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        try_files $uri /index.html;
    }
}
```

Reload Nginx: `sudo systemctl reload nginx`

---

### GitHub Actions: CI/CD workflow

Create `.github/workflows/deploy.yml` with:

```yaml
name: Deploy to Production (Dedicated Server)

on:
  push:
    branches: [main]
  workflow_dispatch: {}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build frontend
        run: |
          cd mainapp
          npm ci
          npm run build

      - name: Package release
        run: |
          tar -czf release.tgz mainapp/build server

      - name: Upload release to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          source: "release.tgz"
          target: "/opt/bankimonline/releases/${{ github.sha }}/"

      - name: Activate release
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            set -euo pipefail
            cd /opt/bankimonline/releases/${{ github.sha }}
            tar -xzf release.tgz

            # Ensure shared links exist
            ln -sfn /opt/bankimonline/shared/uploads /opt/bankimonline/releases/${{ github.sha }}/server/uploads

            # Flip symlink atomically
            ln -sfn /opt/bankimonline/releases/${{ github.sha }} /opt/bankimonline/current

            # Export env and reload/start API via PM2
            export $(grep -v '^#' /opt/bankimonline/shared/.env | xargs -d '\n')
            # First start uses start; subsequent deploys use reload
            pm2 describe bankimonline-api >/dev/null 2>&1 && \
              pm2 reload bankimonline-api || \
              pm2 start /opt/bankimonline/current/server/server-db.js --name bankimonline-api --time

            pm2 save

            # Optional health check
            curl -fsS http://127.0.0.1:${PORT:-8003}/api/health | jq '.' || true
```

Required GitHub Secrets
- `PROD_HOST`: server IP or hostname
- `PROD_USER`: SSH user (e.g., `deploy`)
- `PROD_SSH_KEY`: private key with access to the server (use a deploy key)

Notes
- Build happens in CI, not on the server.
- The PM2 process runs `server/server-db.js`. Adjust if your entry changes.
- If you need to run DB migrations, add a step (below) before PM2 reload.

---

### Database migrations (optional step)

If you commit SQL migrations under `server/migrations/`, you can apply them during the “Activate release” step. Example using `psql` and an env URL:

```bash
# inside the SSH action before pm2 reload
if command -v psql >/dev/null 2>&1; then
  export $(grep -v '^#' /opt/bankimonline/shared/.env | xargs -d '\n')
  # Run any new *.sql files; customize tracking as needed
  for f in /opt/bankimonline/current/server/migrations/*.sql; do
    [ -e "$f" ] || continue
    echo "Applying migration: $f"
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
  done
fi
```

Prefer an idempotent migration runner that records applied files (e.g., a table `schema_migrations`).

---

### Rollback procedure

1) List releases: `ls -1 /opt/bankimonline/releases`
2) Point `current` back to a known-good SHA:

```bash
sudo ln -sfn /opt/bankimonline/releases/<previous_sha> /opt/bankimonline/current
export $(grep -v '^#' /opt/bankimonline/shared/.env | xargs -d '\n')
pm2 reload bankimonline-api
```

Optionally keep the last N releases and clean old ones periodically.

---

### Health checks and verification

- API health: `GET http://<server>:8003/api/health` (or via Nginx domain)
- Frontend: open the domain, verify UI loads and key flows
- Logs: `pm2 logs bankimonline-api --lines 200`

---

### Security recommendations

- Use a non-root SSH user for deploy.
- Disable password SSH auth; use key-based auth.
- Keep `.env` only on the server, not in Git.
- Restrict Nginx to HTTPS with a valid TLS certificate (e.g., Let’s Encrypt).

---

### Developer workflow summary

- Develop and test locally.
- Merge to `main` via PR.
- CI builds, ships, and activates the new release automatically.
- No SSHing to run `git pull` or `npm build` on production.

---

### FAQ

- Do we need Vercel/Railway? No, not for production on a dedicated server. They remain useful for dev/staging or managed DBs.
- Can Express serve the SPA? Yes. In production we typically prefer Nginx for TLS and static performance; Express is still fine if preferred.
- Where are uploads stored? `/opt/bankimonline/shared/uploads` symlinked into `server/uploads` each release.

---

Last updated: 2025-08-10

