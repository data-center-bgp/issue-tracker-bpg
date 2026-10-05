# Deploying Issue Tracker to the VPS

The app is a static Vite build. Nginx serves the `dist/` folder directly at
**https://monitoring-issue.barokahperkasagroup.com** with a Let's Encrypt
certificate. There is no Node process to run or restart: Node is only needed
to build.

```
browser ──HTTPS──▶ Nginx (443) ──▶ /opt/issue-tracker-bpg/dist (static files)
   │
   └──HTTPS──▶ Supabase (login and data, called from the browser)
```

Commands below assume Ubuntu/Debian and a normal user with `sudo`.

## 0. DNS (once)

In the company's DNS manager, add an **A record**:
`monitoring-issue` → the VPS's public IP. Check it has taken effect before
step 5, since Let's Encrypt needs it:

```bash
nslookup monitoring-issue.barokahperkasagroup.com
```

## 1. Check the VPS

```bash
node -v    # needs v20.19+ or v22.12+ (Vite 7), only used for the build
nginx -v
free -h    # the build needs roughly 1 GB of free RAM (swap counts)
```

- **Node too old:** install Node 22 LTS, or use [nvm](https://github.com/nvm-sh/nvm)
  (`nvm install 22`) if other apps on the VPS depend on the system Node.
- **Build killed with no clear error:** it ran out of memory. Add swap and retry:
  ```bash
  sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
  sudo mkswap /swapfile && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```

## 2. Get the code

The GitHub repo is public, so no key is needed:

```bash
sudo git clone https://github.com/data-center-bgp/issue-tracker-bpg.git /opt/issue-tracker-bpg
sudo chown -R "$USER": /opt/issue-tracker-bpg
cd /opt/issue-tracker-bpg
```

## 3. Environment

Create `/opt/issue-tracker-bpg/.env` with the values from the `.env` on your PC:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

`VITE_SUPABASE_SCHEMA` is optional and defaults to `issue_tracker_bpg` (the old
Supabase project). Set it to `issue_tracker` only when pointing at the
self-hosted Supabase.

```bash
chmod 600 .env
```

Do **not** copy a service-role key. The app doesn't use it and it bypasses all
access rules.

`VITE_*` values are built into the JavaScript, so after changing `.env` you
must rebuild (step 4).

## 4. Build

```bash
npm ci
npm run build
```

This produces `dist/`, which Nginx serves.

## 5. Nginx

```bash
sudo cp deploy/nginx/monitoring-issue.conf /etc/nginx/sites-available/monitoring-issue.conf
sudo ln -s /etc/nginx/sites-available/monitoring-issue.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

If this Nginx uses `/etc/nginx/conf.d/` instead of `sites-available`, copy the
file to `/etc/nginx/conf.d/monitoring-issue.conf` and skip the `ln` line.
`http://monitoring-issue.barokahperkasagroup.com` should now show the login
page.

The config assumes the code is in `/opt/issue-tracker-bpg`. If you cloned it
elsewhere, change `root` in the file first.

## 6. HTTPS

```bash
sudo apt-get install -y certbot python3-certbot-nginx   # if certbot isn't installed yet
sudo certbot --nginx -d monitoring-issue.barokahperkasagroup.com
```

When asked, choose to **redirect** HTTP to HTTPS. Certbot renews the
certificate automatically.

## 7. Check it

- Open https://monitoring-issue.barokahperkasagroup.com and log in. The
  sidebar should list the business units.
- Refresh on a deep link such as `/dashboard`. It should reload the page, not
  show a 404.

Supabase needs no changes: the app only uses email/password login, which
doesn't depend on the site's address.

## Updating

After new commits are pushed to `main`:

```bash
cd /opt/issue-tracker-bpg && ./deploy/update.sh
```

This pulls and rebuilds; nothing needs restarting. The site can briefly 404
while the build runs, so run it outside working hours.

## Troubleshooting

| Symptom | Look at |
| --- | --- |
| 403 Forbidden | Nginx's user can't read `dist/`. `namei -l /opt/issue-tracker-bpg/dist/index.html` shows which folder blocks it; every folder in the path needs `r-x` for others |
| Default Nginx page or 404 on `/` | `root` in the Nginx file doesn't match where the code is, or `dist/` doesn't exist yet (step 4) |
| 404 when refreshing `/dashboard` | The `try_files ... /index.html` line is missing from the Nginx file |
| Blank page, console says "Missing Supabase environment variables" | `.env` was missing or incomplete when `npm run build` ran; fix it and rebuild |
| Login works but pages show errors | The Supabase URL/key in `.env`, or `VITE_SUPABASE_SCHEMA` not matching the project; rebuild after changing them |
| Anything else from Nginx | `sudo tail -n 50 /var/log/nginx/error.log` |
