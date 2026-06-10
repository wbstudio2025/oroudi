# Dural Nafis Quotation Editor V1

Static Arabic RTL quotation editor for preparing a polished A4 engineering consulting proposal.

## Files

- `index.html` - app shell, editor panel, preview container, action buttons, backup controls.
- `styles.css` - self-hosted Cairo `@font-face`, premium RTL layout, A4 page styling, print CSS.
- `app.js` - `quotationData`, form/preview rendering, page-overflow warning, projects, Supabase
  shared sync, and the automatic file backup.
- `supabase-config.js` - public Supabase URL/anon-key config used by the hosted app.
- `assets/` - `LOGO.png`, `Footer.png`, `Signature.png`, `app-icon.ico`, and `fonts/` (Cairo woff2).
- Launcher: `server.ps1` (built-in-PowerShell local server), `launch.vbs` (opens the Edge app
  window), `setup.bat` / `setup.ps1` (one-time shortcut install). See `INSTALL.md`.

## Install & run (Windows)

See **`INSTALL.md`**. In short: copy the folder to a permanent location, double-click
`setup.bat`, then launch from the Desktop shortcut. It runs in a Microsoft Edge "app mode"
window, served from `http://127.0.0.1:8137` by a tiny PowerShell server — no Node, Python, admin
rights, or internet needed. Serving over localhost (not `file://`) keeps saved data under one
stable origin and enables the silent automatic backup.

For quick development you can also serve the folder any other way (e.g. `python -m http.server`)
and open it in a Chromium-based browser.

## Usage

Edit the fields in the left panel; the A4 preview updates immediately.

- `طباعة / حفظ PDF` opens the browser print dialog — choose "Save as PDF" to export.
- A red banner warns if a page's content exceeds one A4 sheet (instead of silently clipping it).
- `إعادة تعبئة البيانات الافتراضية` restores the default quotation data.
- Projects panel: save / duplicate / switch / delete quotations (stored in the browser).
- Backup: `تفعيل النسخ الاحتياطي التلقائي` writes all projects to a file you choose and keeps it
  updated automatically; `استعادة من ملف` restores from a backup. Falls back to manual
  download/upload if the browser blocks silent file writes.

## Shared online projects

The app can still run fully locally, but the hosted version can share one office project list through
Supabase:

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. In Supabase Auth, create one shared office email/password.
4. Copy that auth user's UUID, paste it into `supabase/shared-office-setup.sql`, then run it.
5. Fill `supabase-config.js` with the project URL and anon key from Supabase Project Settings > API.
6. Host the static folder on Cloudflare Pages or Netlify.

When a user logs in, cloud projects are loaded from Supabase. If the cloud has no projects yet, the
current browser's local projects are uploaded once. After that, cloud data wins and localStorage is
only a cache/fallback. Simultaneous edits use last-save-wins for this first shared-office version.

## Notes

- Plain HTML, CSS, and JavaScript. No framework or build step.
- Supabase is optional for shared online projects; without `supabase-config.js` values, the app stays
  local-only.
- Cairo is bundled locally, so the premium look works fully offline.
- The optional services annex can be shown or hidden from the editor.
- Print styles hide the editor and print each quotation page as a separate A4 page.
- Tests: `node tests/quotation-static.test.js`.
