# Deployment guide — عروضي (Oroudi)

This app is a **static site with no build step** (plain HTML/CSS/JS). The deployable web app
lives entirely in the **`public/`** folder — that is the only thing published to the web. Everything
else in the repo (`supabase/*.sql`, `tests/`, the local-dev scripts, and these docs) stays private
and is never served.

It runs three ways:

1. **Local Windows install** — the existing `setup.bat` / Edge app-mode flow (see [`INSTALL.md`](INSTALL.md)); `server.ps1` serves `public/`.
2. **Hosted, local-only** — publish `public/`; without Supabase keys it stays per-browser.
3. **Hosted + cloud sync** — add Supabase public config to enable login and per-user workspaces.

**The Supabase keys are public and committed.** `public/supabase-config.js` ships the project URL +
anon key — both are safe to expose (Row-Level Security in `supabase/schema.sql` is what protects
data). No private credentials live in the repo (`.env` and password notes stay git-ignored).

Target platforms:

- **GitHub** → source repository (+ CI runs the test suite on every push/PR).
- **Cloudflare** (Workers + Assets, deployed with **Wrangler**) → static frontend hosting.
- **Supabase** → Postgres database + auth for the office workspace, plus a provisioned private
  `office-assets` bucket for future/storage-backed asset handling.

---

## 1. GitHub — source repository

```powershell
# from the project folder
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

What is already prepared:

- `.gitignore` keeps secrets (`.env`), local PDF artifacts, and tool state out of git.
- `.gitattributes` normalizes line endings (LF in the repo; Windows `.ps1`/`.bat`/`.vbs`/`.cmd`
  stay CRLF) so the repo stays clean cross-platform.
- `.github/workflows/ci.yml` runs `npm test` (the static test suite) on every push to `main` and
  on pull requests. No dependencies are installed — the tests use only Node built-ins.

---

## 2. Cloudflare — frontend hosting (Workers + Assets via Wrangler)

Cloudflare now serves static sites as **Workers with static Assets**, configured by
[`wrangler.toml`](wrangler.toml):

```toml
name = "oroudi"
account_id = "6a3ad43536ae7b07e902fc05734faf14"
compatibility_date = "2025-06-18"

[assets]
directory = "public"
not_found_handling = "single-page-application"
```

`directory = "public"` is what keeps the deploy clean — only the app ships, not the SQL/tests/docs.

### Auto-deploy from GitHub (recommended)

Every push to `main` automatically publishes `public/` to Cloudflare. This is wired by the
`deploy` job in [`.github/workflows/ci.yml`](.github/workflows/ci.yml), which runs **after** the
test job passes (a red build never ships) using `cloudflare/wrangler-action`.

One-time setup:

1. **Create a Cloudflare API token** — Cloudflare dashboard ▸ **My Profile ▸ API Tokens ▸ Create
   Token** ▸ use the **"Edit Cloudflare Workers"** template ▸ Continue to summary ▸ Create Token.
   Copy the token (shown once).
2. **Add it to GitHub** — repo ▸ **Settings ▸ Secrets and variables ▸ Actions ▸ New repository
   secret** ▸ name it exactly `CLOUDFLARE_API_TOKEN`, paste the token, save.
3. Push to `main` (or re-run the latest run under the repo's **Actions** tab). The `deploy` job
   uploads `public/` and the change is live within ~30s.

The account is pinned via `account_id` in [`wrangler.toml`](wrangler.toml), so the API token is the
only secret CI needs. After the first deploy, confirm the `workers.dev` route is enabled under the
Worker's **Settings → Domains & Routes**.

### Manual deploy with the Wrangler CLI (fallback)

Still available any time — uploads your local `public/` directly, no build step:

```powershell
# from the project folder
npx wrangler login      # one time — opens a browser to authorize
npx wrangler deploy     # publishes public/ to https://oroudi.<subdomain>.workers.dev
```

`public/_headers` applies security headers site-wide and long-caches `/assets/*` (fonts, logos).

### Custom domain

The Worker's **Domains & Routes** → add your domain and follow the DNS instructions.

---

## 3. Supabase — database + auth

The schema is in [`supabase/schema.sql`](supabase/schema.sql) and mirrors the front-end's data
shapes 1:1 (offices → members → projects, all JSONB), with Row-Level Security so each user only
sees their own office.

The app supports **self-serve signup with a private workspace per user**: anyone can create an
account from the login card, and each new account gets its own isolated office and projects (RLS
keeps them from seeing anyone else's). The currently verified hosted origin is
[`https://oroudi.wbstudio2025.workers.dev`](https://oroudi.wbstudio2025.workers.dev). Setup:

1. Create a Supabase project (note the project URL + anon key under **Project Settings → API**).
2. **SQL Editor** → paste and run [`supabase/schema.sql`](supabase/schema.sql).
   This creates the `offices`, `members`, `projects` tables, RLS policies, and a private
   `office-assets` storage bucket. The current frontend stores uploaded brand images in the
   office brand-profile JSON; the bucket is provisioned for a future/storage-backed asset path.
3. **SQL Editor** → paste and run [`supabase/self-serve-signup.sql`](supabase/self-serve-signup.sql).
   This installs a trigger so every new signup automatically gets its own office + owner membership
   (otherwise a brand-new user has no office and is locked out). _Run this instead of
   `shared-office-setup.sql`._
4. **Authentication → Sign In / Providers → Email:** enable the Email provider and **"Allow new
   users to sign up"**. To start, turn **"Confirm email" OFF** so signup logs the user straight in.
   (You can enable confirmation later — when you do, also set **Site URL** and **Redirect URLs**
   under **Authentication → URL Configuration**, for example
   `https://oroudi.wbstudio2025.workers.dev` for the hosted app and `http://127.0.0.1:8137` for
   local testing.)
5. Put the Project URL + anon key into `public/supabase-config.js` and commit them (both are public;
   RLS protects the data). Pushing to `main` deploys them automatically.

> **Single shared office instead?** If you'd rather have one office whose projects everyone shares
> (the older model), skip step 3 and instead add one user under **Authentication → Users**, then run
> [`supabase/shared-office-setup.sql`](supabase/shared-office-setup.sql) with that user's `user_id`.

### How sync behaves

When Supabase config is present, the hosted app shows the login card first. Users can either sign in
for cloud sync or choose **متابعة بدون مزامنة** to continue in browser-local mode on the same
Cloudflare site. Browser-local mode does not upload projects and is tied to that browser's storage.

When a user logs in, their office's cloud projects load from Supabase. If the cloud is empty on first
login, the current browser's local projects are uploaded once; after that **cloud data wins** and
localStorage is only a cache/fallback. Concurrent edits use last-save-wins.

---

## Verifying a deployment

- **Tests:** `npm test` (or `node tests/quotation-static.test.js`) — runs in CI on every push.
- **Local-only path:** open the deployed URL; the header should read "محلي فقط…" and editing/printing
  must work with no console errors.
- **Cloud path:** after Supabase is wired, the login overlay appears. Sign up / sign in to sync
  projects across browsers, or choose **متابعة بدون مزامنة** to verify browser-local use on the
  hosted app.

## Checklist

- [ ] `CLOUDFLARE_API_TOKEN` added as a GitHub Actions secret (one time).
- [ ] `git push` to `main` → CI runs tests, then auto-deploys to Cloudflare; `workers.dev` URL enabled.
- [ ] Supabase project created; `schema.sql` + `self-serve-signup.sql` run.
- [ ] Supabase URL + anon key committed in `public/supabase-config.js`.
- [ ] Custom domain attached (optional).
