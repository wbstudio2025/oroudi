# عروضي (Oroudi)

Static Arabic RTL quotation editor for preparing polished A4 engineering-consulting proposals for
Saudi engineering offices. Plain HTML/CSS/JS — **no framework, no build step**.

## Structure

The deployable web app lives in **`public/`** (the only folder published to the web):

- `public/index.html` — app shell, editor panel, preview container, action buttons, projects panel.
- `public/styles.css` — self-hosted Cairo `@font-face`, premium RTL layout, A4 page + print CSS.
- `public/app.js` — `quotationData`, form/preview rendering, page-overflow warning, projects,
  Supabase auth + cloud sync, office brand settings, and the first-visit walkthrough.
- `public/tafqit.js` — Arabic number-to-words for the totals.
- `public/supabase-config.js` — public Supabase URL/anon-key config. The URL and anon key are
  browser-public values and may be committed; Supabase Row-Level Security protects the data.
- `public/_headers` — security headers site-wide + long cache for `/assets/*`.
- `public/assets/` — `oroudi-logo.svg`, `oroudi-icon.svg`, `LOGO.png`, `Footer.png`,
  `Signature.png`, `app-icon.ico`, and `fonts/` (Cairo woff2).

Everything else stays at the repo root and is **not** served:

- `supabase/*.sql` — database schema + signup/office setup.
- `tests/` — static test suite (`node tests/quotation-static.test.js`).
- `server.ps1`, `launch.vbs`, `setup.bat`, `setup.ps1`, `INSTALL.md` — local Windows run/install.
- `wrangler.toml`, `package.json`, `DEPLOYMENT.md`, `.github/`, `.env.example`.

## Run locally (Windows)

See **[`INSTALL.md`](INSTALL.md)**. In short: double-click `setup.bat`, then launch from the Desktop
shortcut. It runs in a Microsoft Edge "app mode" window served from `http://127.0.0.1:8137` by a tiny
built-in-PowerShell server (`server.ps1`, which serves `public/`) — no Node, Python, or admin rights
needed. Core editing/printing works locally; online login and cloud sync require internet and a
configured Supabase project. For development you can also serve `public/` any other way (e.g.
`npm run serve`).

## Usage

Edit the fields in the left panel; the A4 preview updates immediately.

- `طباعة / حفظ PDF` opens the browser print dialog — choose "Save as PDF" to export.
- A red banner warns if a page's content exceeds one A4 sheet (instead of silently clipping it).
- `إعادة تعبئة البيانات الافتراضية` restores the default quotation data.
- Projects panel: save / duplicate / switch / delete quotations.

## Online accounts & sync

The app can run local-only in the browser. With `public/supabase-config.js` filled in, the hosted
Cloudflare app shows cloud login by default, but users can choose **متابعة بدون مزامنة** to keep
working in that browser without signing in. In that mode, data stays browser-local until the user
signs in for sync.

With Supabase login, the app supports **self-serve signup with a private workspace per user** —
anyone can create an account from the login card and gets their own isolated office and projects
(Row-Level Security keeps them separate). When a user logs in, cloud projects load from Supabase; an
empty cloud is seeded once from the browser's local projects, after which cloud data wins and
localStorage is only a cache. Concurrent edits use last-save-wins.

## Deployment

Static site, no build step. See **[`DEPLOYMENT.md`](DEPLOYMENT.md)** for the full guide:

- **GitHub** — source repository; `.github/workflows/ci.yml` runs the test suite on push/PR.
- **Cloudflare** (Workers + Assets via **Wrangler**) — `npx wrangler login` then
  `npx wrangler deploy` publishes `public/`.
- **Supabase** — database + auth, with a provisioned private asset bucket; run `supabase/schema.sql` then
  `supabase/self-serve-signup.sql`, and supply the URL + anon key via `public/supabase-config.js`.

No private credentials are committed. The Supabase URL and anon key in `public/supabase-config.js`
are public browser configuration; service-role keys, passwords, and local notes must stay out of git.

## Notes

- Plain HTML, CSS, and JavaScript. No framework or build step.
- Cairo is bundled locally, so the premium look works fully offline.
- Print styles hide the editor and print each quotation page as a separate A4 page.
- Tests: `node tests/quotation-static.test.js`.
