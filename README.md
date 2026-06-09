# Dural Nafis Quotation Editor V1

Static Arabic RTL quotation editor for preparing a polished A4 engineering consulting proposal.

## Files

- `index.html` - app shell, editor panel, preview container, action buttons, backup controls.
- `styles.css` - self-hosted Cairo `@font-face`, premium RTL layout, A4 page styling, print CSS.
- `app.js` - `quotationData`, form/preview rendering, page-overflow warning, projects, and the
  automatic file backup.
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

## Notes

- Plain HTML, CSS, and JavaScript. No backend, database, framework, or build step.
- Cairo is bundled locally, so the premium look works fully offline.
- The optional services annex can be shown or hidden from the editor.
- Print styles hide the editor and print each quotation page as a separate A4 page.
- Tests: `node tests/quotation-static.test.js`.
