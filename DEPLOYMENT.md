# Deployment guide — عروضي (Oroudi)

This app is a **static site with no build step** (plain HTML/CSS/JS). The deployable web app
lives entirely in the **`public/`** folder — that is the only thing published to the web. Everything
else in the repo (`supabase/*.sql`, `tests/`, the local-dev scripts, and these docs) stays private
and is never served.

It runs three ways:

1. **Local Windows install** — the existing `setup.bat` / Edge app-mode flow (see [`INSTALL.md`](INSTALL.md)); `server.ps1` serves `public/`.
2. **Hosted, local-only** — publish `public/`; without Supabase keys it stays per-browser.
3. **Hosted + shared office** — add Supabase credentials to enable login, cloud sync, and storage.

**No credentials are committed.** The committed `public/supabase-config.js` is empty; the real
(public, anon) keys live only in your local copy of that file and are uploaded at deploy time.

Target platforms:

- **GitHub** → source repository (+ CI runs the test suite on every push/PR).
- **Cloudflare** (Workers + Assets, deployed with **Wrangler**) → static frontend hosting.
- **Supabase** → Postgres database + auth + storage for the office workspace.

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
compatibility_date = "2025-06-18"

[assets]
directory = "public"
not_found_handling = "single-page-application"
```

`directory = "public"` is what keeps the deploy clean — only the app ships, not the SQL/tests/docs.

### Deploy with the Wrangler CLI (recommended)

This uploads your **local** files directly, so your local `public/supabase-config.js` (with the
real anon keys) ships as-is — no build step, no Hello-World template trap.

```powershell
# from the project folder
npx wrangler login      # one time — opens a browser to authorize
npx wrangler deploy     # publishes public/ to https://oroudi.<subdomain>.workers.dev
```

After the first deploy, enable the public URL under the Worker's **Settings → Domains & Routes**
(`workers.dev` route) if it is not already on. Re-run `npx wrangler deploy` to publish updates.

`public/_headers` applies security headers site-wide and long-caches `/assets/*` (fonts, logos).

### Alternative: GitHub → Cloudflare auto-build

If you prefer auto-deploy on every push, connect the repo in the dashboard and set a build command
that injects the keys from environment variables (so they stay out of git). The app reads
`window.OROUDI_SUPABASE_CONFIG` from `public/supabase-config.js`:

```
Build command:
node -e "require('fs').writeFileSync('public/supabase-config.js','window.OROUDI_SUPABASE_CONFIG={SUPABASE_URL:'+JSON.stringify(process.env.SUPABASE_URL||'')+',SUPABASE_ANON_KEY:'+JSON.stringify(process.env.SUPABASE_ANON_KEY||'')+'};')"
```

Add `SUPABASE_URL` / `SUPABASE_ANON_KEY` under the project's **Environment variables**.

Until keys are present, the hosted site works **local-only** (the header shows
"محلي فقط - أضف إعدادات Supabase للنشر") — no errors.

### Custom domain

The Worker's **Domains & Routes** → add your domain and follow the DNS instructions.

---

## 3. Supabase — database + auth + storage

The schema is in [`supabase/schema.sql`](supabase/schema.sql) and mirrors the front-end's data
shapes 1:1 (offices → members → projects, all JSONB), with Row-Level Security so each user only
sees their own office.

The app supports **self-serve signup with a private workspace per user**: anyone can create an
account from the login card, and each new account gets its own isolated office and projects (RLS
keeps them from seeing anyone else's). Setup:

1. Create a Supabase project (note the project URL + anon key under **Project Settings → API**).
2. **SQL Editor** → paste and run [`supabase/schema.sql`](supabase/schema.sql).
   This creates the `offices`, `members`, `projects` tables, RLS policies, and the private
   `office-assets` storage bucket (logos, stamps, footer art, QR images).
3. **SQL Editor** → paste and run [`supabase/self-serve-signup.sql`](supabase/self-serve-signup.sql).
   This installs a trigger so every new signup automatically gets its own office + owner membership
   (otherwise a brand-new user has no office and is locked out). _Run this instead of
   `shared-office-setup.sql`._
4. **Authentication → Sign In / Providers → Email:** enable the Email provider and **"Allow new
   users to sign up"**. To start, turn **"Confirm email" OFF** so signup logs the user straight in.
   (You can enable confirmation later — when you do, also set **Site URL** and **Redirect URLs**
   under **Authentication → URL Configuration**, e.g. your deployed `workers.dev` origin and
   `http://127.0.0.1:8137` for local testing.)
5. Put the Project URL + anon key into your local `public/supabase-config.js` (kept out of git;
   uploaded by `wrangler deploy`), or use the build-injection path above.

> **Single shared office instead?** If you'd rather have one office whose projects everyone shares
> (the older model), skip step 3 and instead add one user under **Authentication → Users**, then run
> [`supabase/shared-office-setup.sql`](supabase/shared-office-setup.sql) with that user's `user_id`.

### How sync behaves

When a user logs in, their office's cloud projects load from Supabase. If the cloud is empty on
first login, the current browser's local projects are uploaded once; after that **cloud data wins**
and localStorage is only a cache/fallback. Concurrent edits use last-save-wins.

---

## Verifying a deployment

- **Tests:** `npm test` (or `node tests/quotation-static.test.js`) — runs in CI on every push.
- **Local-only path:** open the deployed URL; the header should read "محلي فقط…" and editing/printing
  must work with no console errors.
- **Shared path:** after Supabase is wired, the login overlay appears; sign up / sign in, then saved
  projects sync across browsers.

## Checklist

- [ ] `git push` to GitHub; CI green.
- [ ] `npx wrangler login` then `npx wrangler deploy` (serves `public/`); `workers.dev` URL enabled.
- [ ] Supabase project created; `schema.sql` + `self-serve-signup.sql` run.
- [ ] Supabase URL + anon key in local `public/supabase-config.js` (or env injection).
- [ ] Custom domain attached (optional).
