# Session Log - 2026-05-18

## Project

Dural Nafis Quotation Editor V1

## Completed Work

- Opened and served the static HTML app locally through `http://127.0.0.1:8080/index.html`.
- Converted the project type field from free text to a dropdown with Saudi-relevant project types.
- Updated the payment schedule to 3 phases: 50%, 30%, 20%.
- Added VAT-inclusive payment amount calculations under each payment phase.
- Made money inputs accept numbers only while displaying Riyal labels automatically.
- Initialized Git and created the first repository commit.
- Reworked the app into a three-column desktop workspace:
  - Inputs on the left.
  - A4 preview in the middle.
  - Saved projects on the right.
- Added saved projects with local browser persistence and project switching.
- Added a permit type dropdown and made the cover title depend on the selected permit.
- Shortened the header title to "محرر عروض".
- Increased the header logo from 58px to 72px.
- Added save status, suggested PDF filename, preview zoom controls, and WhatsApp share message support.
- Removed JSON export/import controls and logic after user feedback.
- Added `.gitignore` entry for generated `test-artifacts/`.

## Verification Performed

- Static regression suite was run repeatedly:
  - Command: `node tests/quotation-static.test.js`
  - Latest observed result: all tests passed.
- Browser checks confirmed:
  - Header logo renders at 72px by 72px.
  - JSON export/import buttons are absent.
  - No browser console errors in the checked flows.
- PDF checks confirmed:
  - Generated print PDF had 6 pages.
  - Each page was A4-sized, about 209.89mm x 297.01mm.

## Git State At Log Time

Committed history:

- `2a0ed47 Build quotation editor updates`
- `d43acf4 Add project workspace and permit selection`

Current uncommitted changes:

- `.gitignore`
- `app.js`
- `index.html`
- `styles.css`
- `tests/quotation-static.test.js`
- `SESSION_LOG.md`

## Notes

- WhatsApp sharing opens a prepared `wa.me` message. A browser page cannot attach the locally printed PDF automatically, so the PDF should be attached manually in WhatsApp after saving.
- The app should be opened through the local server URL for the freshest assets:
  `http://127.0.0.1:8080/index.html`

# Session Log - 2026-06-09

## Project

Dural Nafis Quotation Editor V1 — hardening + making it installable for a secretary's Windows laptop.

## Completed Work

- **Stability:** removed the silent A4 overflow clip (`.page` was fixed `height:297mm; overflow:hidden`).
  Pages now use `min-height` and grow instead of clipping; `flagPageOverflow()` flags any page taller
  than the A4 ratio and shows a red toolbar warning (`#overflowWarning`).
- **Automatic backup:** all projects are written to a file the user picks via the File System Access
  API (handle persisted in IndexedDB), debounced on every change + flushed on window hide. Manual
  "نسخ احتياطي الآن" / "استعادة من ملف" with download/upload fallback when the API is unavailable.
- **Bundled font:** self-hosted Cairo (variable, 3 woff2 subsets in `assets/fonts/`) via `@font-face`,
  so the premium look works offline instead of falling back to Tahoma.
- **Installable launcher (no runtime needed):** `server.ps1` (built-in-PowerShell TcpListener static
  server on `127.0.0.1:8137`, idle self-shutdown), `launch.vbs` (starts server hidden + opens Edge
  `--app`), `setup.bat`/`setup.ps1` (Desktop + Start Menu shortcuts), `assets/app-icon.ico` + favicon.
  Localhost (not file://) gives a stable origin and the secure context the silent backup requires.
- Updated `README.md`, added `INSTALL.md`, raised the footer asset size test threshold.
- **Editable scope of work:** `scopeGroups[].items` changed from strings to `{ name, enabled }`.
  The editor now shows each scope item as a checkbox (all enabled by default) with a remove (×)
  button and a per-group "add item" field; the preview renders only enabled items. Legacy string
  items are migrated. Also added a form `submit` guard so Enter in a field no longer reloads.
- **Five field/print corrections:** (1) area/validity inputs auto-append fixed unit suffixes
  (`م²` / `أيام`) via a `unit:` field type — user types the number only; (2) the deed date now
  opens the same calendar as the quotation date (picker generalized via `dateFieldConfig`; the deed
  shows Hijri primary + Gregorian faded, stored in new `deedDateIso`/`deedGregorian`); (3) notes
  keep their line breaks in the PDF (`.note { white-space: pre-wrap }`); (4) default data is now
  empty → renders faded `.doc-placeholder` hints (via `ph()`) and grey input placeholders instead
  of a real past client's name/deed; (5) the last page drops the footer and ends with the
  signature (`pageShell(..., isLast)`), and the annex-off layout is correct (financial becomes the
  clean last page). All verified live; 29 tests pass.

## Verification Performed

- `node tests/quotation-static.test.js` — 23 tests pass (added overflow / backup / Cairo / install
  coverage; updated the print-geometry and footer-size assertions intentionally).
- Browser checks (preview MCP over localhost): default data renders 6 A4 pages with no false overflow
  warning; injected long content correctly triggers the warning; Cairo loads; backup payload, IndexedDB
  round-trip, and restore validation all verified; no console errors.
- `server.ps1` verified with HTTP probes: correct status codes, 404 handling, byte-perfect binary
  serving (woff2 / PNG sizes match disk). Edge located at the expected path; shortcut creation verified.

## Notes

- `assets/Footer.png` changed on disk during the session (66,282 → 75,421 bytes) — an intentional
  update synced via OneDrive: it now carries a QR code and a corrected address (مركز العـواد / office
  402). Not reverted.
- Outstanding (owner deferred): which Saudi-market fields to add (VAT number الرقم الضريبي + VAT-inclusive
  grand total, bank IBAN, engineering accreditation, auto "valid until") and the values for them.
  Footer already shows CR / address / contacts, so those are excluded.
- The browser screenshot tool hung all session (renderer issue, not the app); verification used eval +
  accessibility snapshot + tests instead.

# Session Log - 2026-06-10

## Project

عروضي (Oroudi) — productizing the quotation editor as a Saudi SaaS for architecture/engineering
offices. Owner decisions: hosted web app (SaaS), quotations-only fully-brandable MVP, cross-device
sync required (Supabase planned), Arabic UI with optionally bilingual documents, product name
**عروضي / Oroudi** (oroudi.com / oroudi.sa to be registered).

## Completed Work (Phases 1–2 of the productization plan, front-end only)

- **Brand profile extraction:** company identity (name, logo, signature/stamp, footer, closing
  text) moved out of `quotationData` into a persisted `brandProfile`
  (localStorage `oroudiBrandProfile`); saved projects shed legacy embedded identity on migration.
  Dural Nafis is now just the seed profile.
- **Office settings dialog (إعدادات المكتب):** edit office name, upload logo/stamp/footer
  image/QR (downscaled to data URLs), closing text, Saudi registration fields (CR, VAT,
  هيئة المهندسين accreditation, address, phone, email, website), choose footer mode, and capture
  the current quotation's lists as the office's defaults for new projects
  (`brandProfile.defaults`).
- **Structured footer strip:** alternative to the designed Footer.png — a print-ready strip built
  from the registration/contact fields with optional QR image (auto-generated QR deferred).
- **Auto-tafqit:** new `tafqit.js` (Node-testable) converts figures to formal Arabic words;
  `mainPriceWritten` follows the figure automatically, typing takes manual control
  (`mainPriceWrittenManual`), clearing returns to automatic.
- **Financial page:** VAT-inclusive grand total (figures + words, 15%) inside the price card and
  an explicit valid-until date (Gregorian + Hijri) computed from offer date + validity days.
- **Bilingual documents:** per-quotation toggle adds English subtitles to all page titles and the
  cover badge (UI stays Arabic).
- **Editable lists:** deliverables became `{ name, enabled }` checklists with add/remove
  (migration from legacy strings); optional services gained add/remove.
- **Shell rebrand:** title/header now عروضي; office name + logo in the header come from the brand
  profile. Backups now carry the brand profile (`app: "oroudi-quotation-editor"`, version 2) and
  restores apply it.

## Verification Performed

- `node tests/quotation-static.test.js` — 39 tests pass (10 new productization tests incl.
  behavioral tafqit assertions; 3 legacy assertions updated intentionally).
- Browser (preview MCP, eval probes — screenshot tool still hangs):
  - Tafqit: 75,500 → "خمسة وسبعون ألف وخمسمائة ريال سعودي فقط لا غير"; grand total 86,825 with
    words; manual-override semantics verified.
  - Second office created through the real settings dialog: rendered document carried the new
    name/closing/strip (CR/VAT/accreditation) with **zero** Dural Nafis traces (no name, no
    LOGO/Footer/Signature.png), last page footer-free, all page ratios 1.419 (A4).
  - Deliverable/service add/remove live-update the document; annex toggle 6↔5 pages; no
    console errors.

## Outstanding

- Push: repo still has no git remote configured (gh CLI not installed).
- Phase 3 (Supabase accounts/sync) needs the owner to create a Supabase project (keys).
- Phase 4: landing page, billing gateway choice (Moyasar vs Tap), pricing, domain registration.
- Auto-generated QR (vCard) for the footer strip deferred — offices can upload an existing QR.
- Dural Nafis's own VAT/IBAN/accreditation values still pending from the owner (now enterable
  via إعدادات المكتب without code).
