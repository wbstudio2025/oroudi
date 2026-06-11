# Deployment guide — عروضي (Oroudy)

This app is a **static site with no build step** (plain HTML/CSS/JS). It runs three ways:

1. **Local Windows install** — the existing `setup.bat` / Edge app-mode flow (see [`INSTALL.md`](INSTALL.md)).
2. **Hosted, local-only** — deploy the static files; without Supabase keys it stays per-browser.
3. **Hosted + shared office** — add Supabase credentials to enable login, cloud sync, and storage.

The base for all three is already in this repo. The steps below set up the cloud platforms when
you are ready. **No credentials are committed** — fill them in at the marked steps.

Target platforms:

- **GitHub** → source repository (+ CI runs the test suite on every push/PR).
- **Cloudflare Pages** → static frontend hosting (auto-deploys from GitHub).
- **Supabase** → Postgres database + auth + storage for the shared office workspace.

---

## 1. GitHub — source repository

The repo is ready to push. There is no remote yet.

```powershell
# from the project folder
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

What is already prepared:

- `.gitignore` keeps secrets (`.env`), local PDF artifacts, and tool state out of git.
- `.gitattributes` normalizes line endings (LF in the repo; Windows `.ps1`/`.bat`/`.vbs`/`.cmd`
  stay CRLF) so the repo builds cleanly on Linux/Cloudflare.
- `.github/workflows/ci.yml` runs `npm test` (the static test suite) on every push to `main` and
  on pull requests. No dependencies are installed — the tests use only Node built-ins.

> The local-install files (`server.ps1`, `launch.vbs`, `setup.bat`, `setup.ps1`) are also served by
> Cloudflare as plain text. That is harmless (the repo is the source of truth), and it keeps a
> single folder usable both locally and on the web.

---

## 2. Cloudflare Pages — frontend hosting

Because there is **no build step**, Cloudflare just uploads the repo root as-is.

### Create the project

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Pick the GitHub repo from step 1.
3. Build settings:
   - **Framework preset:** `None`
   - **Build command:** _(leave empty)_
   - **Build output directory:** `/`  (the repo root)
   - **Root directory:** `/`
4. Deploy. Every push to `main` redeploys automatically; pull requests get preview URLs.

`_headers` (already in the repo) applies security headers site-wide and long-caches `/assets/*`
(fonts, logo, footer, icons).

### Supabase config on Cloudflare

Choose **one** of these — the app reads `window.OROUDY_SUPABASE_CONFIG` from `supabase-config.js`:

- **Simple (recommended to start):** edit `supabase-config.js`, paste the Project URL + anon key,
  commit, and push. Both values are public/anon and safe to commit.
- **Build-time injection (no keys in git):** keep `supabase-config.js` empty in git, set a build
  command that writes it from environment variables, and add `SUPABASE_URL` / `SUPABASE_ANON_KEY`
  in **Pages → Settings → Environment variables**:

  ```
  Build command:
  node -e "require('fs').writeFileSync('supabase-config.js','window.OROUDY_SUPABASE_CONFIG={SUPABASE_URL:'+JSON.stringify(process.env.SUPABASE_URL||'')+',SUPABASE_ANON_KEY:'+JSON.stringify(process.env.SUPABASE_ANON_KEY||'')+'};')"
  ```

Until either is done, the hosted site works **local-only** (the header shows
"محلي فقط - أضف إعدادات Supabase للنشر") — no errors.

### Custom domain

Pages → **Custom domains** → add your domain and follow the DNS instructions.

---

## 3. Supabase — database + auth + storage

The schema is in [`supabase/schema.sql`](supabase/schema.sql) and mirrors the front-end's data
shapes 1:1 (offices → members → projects, all JSONB), with Row-Level Security so each user only
sees their own office.

1. Create a Supabase project (note the project URL + anon key under **Project Settings → API**).
2. **SQL Editor** → paste and run [`supabase/schema.sql`](supabase/schema.sql).
   This creates the `offices`, `members`, `projects` tables, RLS policies, and the private
   `office-assets` storage bucket (logos, stamps, footer art, QR images).
3. **Authentication → Users** → add the shared office login (email + password). Copy its `user_id`.
4. Edit [`supabase/shared-office-setup.sql`](supabase/shared-office-setup.sql): replace the
   placeholder `00000000-...` UUID with that `user_id`, then run it in the SQL Editor. This creates
   the office row and links the user as its owner.
5. Put the Project URL + anon key into the frontend (see *Supabase config on Cloudflare* above).

### How sync behaves

When a user logs in, cloud projects load from Supabase. If the cloud is empty on first login, the
current browser's local projects are uploaded once; after that **cloud data wins** and localStorage
is only a cache/fallback. Concurrent edits use last-save-wins for this first shared-office version.

---

## Verifying a deployment

- **Tests:** `npm test` (or `node tests/quotation-static.test.js`) — runs in CI on every push.
- **Local-only path:** open the deployed URL; the header should read "محلي فقط…" and editing/printing
  must work with no console errors.
- **Shared path:** after Supabase is wired, the login overlay appears; sign in with the shared
  office account; saved projects sync across browsers.

## Checklist

- [ ] `git push` to GitHub; CI green.
- [ ] Cloudflare Pages project connected (Framework: None, no build command, output `/`).
- [ ] Supabase project created; `schema.sql` + `shared-office-setup.sql` run.
- [ ] Supabase URL + anon key supplied to the frontend (commit or env injection).
- [ ] Custom domain attached (optional).
