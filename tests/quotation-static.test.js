const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const config = fs.existsSync(path.join(root, "supabase-config.js"))
  ? fs.readFileSync(path.join(root, "supabase-config.js"), "utf8")
  : "";

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

test("printed pages use the structured office footer on every non-final page shell", () => {
  assert.match(app, /class="doc-footer"/);
  assert.match(app, /function renderFooterStrip\(\)/);
  assert.match(app, /class="footer-strip"/);
  assert.match(app, /isLast \? "" : renderFooter\(pageNumber, totalPages\)/);
});

test("Supabase client and public config load before the app entrypoint", () => {
  const supabaseConfigIndex = html.indexOf('src="supabase-config.js');
  const supabaseCdnIndex = html.indexOf("@supabase/supabase-js");
  const appIndex = html.indexOf('src="app.js');

  assert.ok(supabaseConfigIndex > -1, "supabase-config.js is not loaded");
  assert.ok(supabaseCdnIndex > -1, "Supabase CDN client is not loaded");
  assert.ok(supabaseConfigIndex < appIndex, "config must load before app.js");
  assert.ok(supabaseCdnIndex < appIndex, "Supabase client must load before app.js");
  assert.match(config, /window\.OROUDY_SUPABASE_CONFIG/);
  assert.match(config, /SUPABASE_URL/);
  assert.match(config, /SUPABASE_ANON_KEY/);
});

test("cloud persistence adapter maps projects and prefers cloud data over local cache", () => {
  assert.match(app, /function projectToSupabaseRow\(project, officeId\)/);
  assert.match(app, /function projectFromSupabaseRow\(row\)/);
  assert.match(app, /function shouldUploadLocalProjects\(cloudProjects, localProjects\)/);
  assert.match(app, /return cloudProjects\.length === 0 && localProjects\.length > 0/);
  assert.match(app, /function applyCloudProjects\(cloudProjects\)/);
});

test("shared office login syncs brand profile and projects through Supabase", () => {
  assert.match(html, /id="loginOverlay"/);
  assert.match(html, /id="loginForm"/);
  assert.match(html, /id="syncStatus"/);
  assert.match(app, /const cloudState\s*=/);
  assert.match(app, /function createSupabaseClient\(\)/);
  assert.match(app, /auth\.signInWithPassword/);
  assert.match(app, /auth\.signOut/);
  assert.match(app, /function initializeCloudSession\(\)/);
  assert.match(app, /function loadCloudWorkspace\(\)/);
  assert.match(app, /function scheduleCloudProjectSync\(\)/);
  assert.match(app, /function persistBrandProfile\(\)[\s\S]*scheduleCloudBrandSync\(\);/);
  assert.match(app, /function persistProjects\(\)[\s\S]*scheduleCloudProjectSync\(\);/);
});

test("scope cards choose semantic icons by item name", () => {
  assert.match(app, /const scopeIconMap\s*=/);
  [
    "رفع مساحي",
    "إصدار قرار مساحي",
    "دراسة تربة",
    "التصميم المعماري",
    "التصميم الإنشائي",
    "التصميم الكهربائي",
    "التصميم الميكانيكي",
    "منظور خارجي واحد",
    "إصدار رخصة بناء"
  ].forEach((scopeName) => assert.ok(app.includes(`"${scopeName}"`), scopeName));
});

test("scope groups render as simple described lists without rounded cards", () => {
  assert.match(css, /\.scope-heading[\s\S]*justify-content:\s*center/);
  assert.match(app, /const scopeDescriptionMap\s*=/);
  assert.match(app, /class="scope-list"/);
  assert.match(app, /class="scope-item"/);
  assert.match(app, /class="scope-description"/);
  assert.doesNotMatch(app, /class="scope-card"/);
  assert.match(css, /\.scope-list\s*{[\s\S]*list-style:\s*none/);
  assert.match(css, /\.scope-item\s*{[\s\S]*border:\s*0/);
  assert.match(css, /\.scope-item\s*{[\s\S]*background:\s*transparent/);
  assert.doesNotMatch(css, /\.scope-card\s*{/);
  assert.match(css, /\.mini-icon\s*{[\s\S]*background:\s*transparent/);
});

test("print mode preserves the same A4 page geometry as preview", () => {
  assert.match(css, /\.page[\s\S]*width:\s*210mm[\s\S]*height:\s*297mm/);
  assert.match(css, /\.page-content[\s\S]*min-height:\s*calc\(297mm - 38mm\)/);
  assert.match(css, /@media print[\s\S]*\.page[\s\S]*height:\s*297mm[\s\S]*padding:\s*19mm 18mm/);
  assert.match(css, /@media print[\s\S]*\.page:last-child[\s\S]*margin-bottom:\s*-8mm/);
});

test("print image assets stay lightweight for fast PDF generation", () => {
  const logoSize = fs.statSync(path.join(root, "assets", "LOGO.png")).size;
  const footerSize = fs.statSync(path.join(root, "assets", "Footer.png")).size;
  const signatureSize = fs.statSync(path.join(root, "assets", "Signature.png")).size;

  assert.ok(logoSize <= 70000, `LOGO.png is ${logoSize} bytes`);
  // Footer now carries a QR code (added with the address correction), so it is larger than
  // before but still well within "lightweight" for a once-per-page embedded image.
  assert.ok(footerSize <= 80000, `Footer.png is ${footerSize} bytes`);
  assert.ok(signatureSize <= 30000, `Signature.png is ${signatureSize} bytes`);
});

test("financial terms render as a simple list instead of rounded cards", () => {
  assert.match(css, /\.terms-list\s*{[\s\S]*list-style:\s*none/);
  assert.match(css, /\.terms-list li::before\s*{[\s\S]*content:\s*""/);
  assert.match(css, /\.terms-list li\s*{[\s\S]*border:\s*0/);
  assert.doesNotMatch(css, /\.terms-list li\s*{[^}]*border-radius:\s*8px/);
});

test("deliverables render as a simple checklist without rounded cards", () => {
  assert.match(app, /class="deliverables-list"/);
  assert.match(app, /<li class="deliverable"><span class="check">✓<\/span><div><span>\$\{escapeHtml\(item\.name\)\}<\/span>/);
  assert.doesNotMatch(app, /class="deliverables-grid"/);
  assert.match(css, /\.deliverables-list\s*{[\s\S]*list-style:\s*none/);
  assert.match(css, /\.deliverable\s*{[^}]*border:\s*0/);
  assert.match(css, /\.deliverable\s*{[^}]*background:\s*transparent/);
  assert.doesNotMatch(css, /\.deliverable\s*{[^}]*border-radius:\s*8px/);
});

test("payment percentages are editable from the editor form", () => {
  assert.match(app, /paymentScheduleInputs/);
  assert.match(app, /data-payment-index="\$\{index\}"/);
  assert.match(app, /const paymentIndex = input\.dataset\.paymentIndex/);
  assert.match(app, /quotationData\.paymentSchedule\[Number\(paymentIndex\)\]\.percent = input\.value/);
  assert.match(app, /function formatPercent\(percent\)/);
  assert.match(app, /بعد إصدار شهادة اعتماد التصاميم/);
  assert.match(app, /payment\.label === "بعد تسليم المخططات الهندسية" \? "بعد إصدار شهادة اعتماد التصاميم" : payment\.label/);
});

test("final page includes a Saudi-appropriate closing note and signature image", () => {
  assert.match(app, /signaturePath:\s*"assets\/Signature\.png"/);
  assert.match(app, /closingText:\s*"نأمل أن ينال عرضنا هذا استحسانكم/);
  assert.match(app, /function renderClosingBlock\(\)/);
  assert.match(app, /class="closing-signature"/);
  assert.match(app, /quotationData\.showOptionalAnnex \? "" : renderClosingBlock\(\)/);
  assert.match(app, /\$\{renderClosingBlock\(\)\}/);
});

test("page numbering appears only centered under the footer as current over total", () => {
  assert.match(app, /function renderFooter\(pageNumber, totalPages\)/);
  assert.match(app, /class="page-number">\$\{pageNumber\}\/\$\{totalPages\}<\/span>/);
  assert.doesNotMatch(app, /class="doc-meta">[^`]*صفحة/);
  assert.match(app, /const totalPages = quotationData\.showOptionalAnnex \? 6 : 5/);
  assert.match(app, /renderCover\(totalPages\)/);
  assert.match(css, /\.page-number\s*{[\s\S]*justify-self:\s*center/);
});

test("quotation date uses a popup Gregorian calendar with faded Hijri dates", () => {
  assert.match(app, /dateIso:\s*"2026-05-17"/);
  assert.match(app, /hijriDate:/);
  assert.match(app, /\["date",\s*"التاريخ",\s*"date"\]/);
  assert.match(app, /function formatHijriDate\(isoDate\)/);
  assert.match(app, /function renderDatePicker\(field\)/);
  assert.match(app, /data-date-choice="\$\{isoDate\}"/);
  assert.match(app, /class="hijri-day"/);
  assert.match(app, /class="inline-hijri-date"/);
  assert.match(app, /class="date-hijri"/);
  assert.match(app, /dateFieldConfig\[field\]\.apply\(dateChoice\.dataset\.dateChoice\)/);
  assert.match(css, /\.date-picker\s*{/);
  assert.match(css, /\.hijri-day\s*{[\s\S]*opacity:\s*0\.48/);
});

test("client name has a السيد السيدة title dropdown used in output", () => {
  assert.match(app, /clientTitle:\s*"السيد"/);
  assert.match(app, /const clientTitleOptions\s*=\s*\["السيد", "السيدة"\]/);
  assert.match(app, /\["clientTitle", "اللقب", "clientTitle"\]/);
  assert.match(app, /function getClientDisplayName/);
  assert.match(app, /getClientDisplayName\(quotationData\)/);
  assert.match(app, /class="field client-name-row"/);
  assert.match(app, /السيد/);
  assert.match(app, /السيدة/);
  assert.match(css, /\.client-name-row\s*{/);
});

test("optional service money fields show contextual Riyal units", () => {
  assert.match(app, /function getOptionalServicePriceUnit/);
  assert.match(app, /function getOptionalServiceDisplayPrice/);
  assert.match(app, /ريال لكل منظور/);
  assert.match(app, /ريال للدقيقة الواحدة/);
  assert.match(app, /getOptionalServicePriceUnit\(service\)/);
  assert.match(app, /getOptionalServiceDisplayPrice\(service\)/);
});

test("desktop workspace uses inputs right, preview center, projects left", () => {
  assert.match(html, /class="projects-panel"/);
  assert.match(html, /id="projectsList"/);
  assert.match(css, /\.workspace\s*{[\s\S]*grid-template-areas:\s*"projects preview editor"/);
  assert.match(css, /\.editor-panel\s*{[\s\S]*grid-area:\s*editor/);
  assert.match(css, /\.preview-shell\s*{[\s\S]*grid-area:\s*preview/);
  assert.match(css, /\.projects-panel\s*{[\s\S]*grid-area:\s*projects/);
  assert.match(css, /\.workspace\s*{[\s\S]*direction:\s*ltr/);
  assert.match(css, /\.workspace\s*>\s*\*\s*{[\s\S]*direction:\s*rtl/);
});

test("saved projects persist locally and can be switched from the projects panel", () => {
  assert.match(app, /const PROJECTS_STORAGE_KEY\s*=/);
  assert.match(app, /localStorage\.getItem\(PROJECTS_STORAGE_KEY\)/);
  assert.match(app, /localStorage\.setItem\(PROJECTS_STORAGE_KEY/);
  assert.match(app, /function renderProjectsPanel\(\)/);
  assert.match(app, /data-project-id="\$\{escapeHtml\(project\.id\)\}"/);
  assert.match(app, /function saveActiveProject\(\)/);
  assert.match(app, /function createNewProject\(\)/);
  assert.match(app, /function duplicateActiveProject\(\)/);
  assert.match(app, /function deleteActiveProject\(\)/);
});

test("cover title is driven by a permit type dropdown", () => {
  assert.match(app, /permitType:\s*"إصدار رخصة بناء"/);
  assert.match(app, /const permitTypeOptions\s*=/);
  [
    "إصدار رخصة بناء",
    "إصدار رخصة تسوير",
    "إضافة وتعديل مكونات بناء",
    "إصدار رخصة ترميم بناء",
    "إصدار رخصة هدم بناء",
    "تجديد رخصة بناء",
    "تصحيح بيانات رخصة بناء"
  ].forEach((permitName) => assert.ok(app.includes(permitName), permitName));
  assert.match(app, /\["permitType", "نوع الرخصة", "permit"\]/);
  assert.match(app, /function getPermitTitle\(\)/);
  assert.match(app, /<h2>\$\{escapeHtml\(getPermitTitle\(\)\)\}<\/h2>/);
  assert.doesNotMatch(app, /<h2>عرض خدمات التصميم وإصدار رخصة بناء<\/h2>/);
});

test("project tools include save status without JSON import export controls", () => {
  assert.match(html, /id="saveStatus"/);
  assert.match(app, /function renderSaveStatus\(\)/);
  assert.match(css, /\.save-status\s*{/);
  assert.doesNotMatch(html, /تصدير JSON|استيراد JSON|id="exportProjectsBtn"|id="importProjectsInput"/);
  assert.doesNotMatch(app, /function exportProjects\(\)|function importProjectsFromFile|exportProjectsBtn|importProjectsInput/);
});

test("print and sharing helpers generate filenames and WhatsApp links", () => {
  assert.match(html, /id="shareWhatsappBtn"/);
  assert.match(app, /function getPdfFileName\(\)/);
  assert.match(app, /function preparePrintTitle\(\)/);
  assert.match(app, /document\.title = getPdfFileName\(\)\.replace\("\.pdf", ""\)/);
  assert.match(app, /function buildWhatsAppShareText\(\)/);
  assert.match(app, /function getWhatsAppShareUrl\(\)/);
  assert.match(app, /https:\/\/wa\.me\/\?text=/);
  assert.match(app, /shareWhatsappBtn\.addEventListener\("click", shareViaWhatsApp\)/);
});

test("preview toolbar exposes fit 100 and 75 zoom controls", () => {
  assert.match(html, /data-preview-zoom="fit"/);
  assert.match(html, /data-preview-zoom="100"/);
  assert.match(html, /data-preview-zoom="75"/);
  assert.match(app, /let previewZoom = "fit"/);
  assert.match(app, /function setPreviewZoom\(zoomMode\)/);
  assert.match(app, /function applyPreviewZoom\(\)/);
  assert.match(css, /\.zoom-controls\s*{/);
  assert.match(css, /\.preview\s*{[\s\S]*zoom:\s*var\(--preview-zoom, 1\)/);
  assert.match(css, /@media print[\s\S]*\.preview\s*{[\s\S]*zoom:\s*1 !important/);
});

test("pages grow instead of clipping, with an overflow warning", () => {
  // the silent clip (fixed height + overflow:hidden) must be gone
  assert.doesNotMatch(css, /\.page\s*{[^}]*overflow:\s*hidden/);
  assert.match(css, /\.page\s*{[\s\S]*min-height:\s*297mm/);
  assert.match(css, /\.page\.is-overflowing/);
  assert.match(css, /\.overflow-warning\s*{/);
  assert.match(html, /id="overflowWarning"/);
  assert.match(app, /function flagPageOverflow\(\)/);
  assert.match(app, /const a4Ratio = 297 \/ 210/);
  assert.match(app, /classList\.toggle\("is-overflowing"/);
  assert.match(app, /flagPageOverflow\(\);\s*\n}/); // called at end of renderPreview
});

test("all projects are backed up to a file with automatic and manual paths", () => {
  assert.match(html, /id="backupStatus"/);
  assert.match(html, /id="enableBackupBtn"/);
  assert.match(html, /id="backupNowBtn"/);
  assert.match(html, /id="restoreBackupBtn"/);
  assert.match(css, /\.backup-block\s*{/);
  // primary path: File System Access API, persisted via IndexedDB
  assert.match(app, /window\.showSaveFilePicker/);
  assert.match(app, /window\.showOpenFilePicker/);
  assert.match(app, /indexedDB\.open\(BACKUP_DB_NAME/);
  assert.match(app, /function scheduleBackup\(\)/);
  assert.match(app, /function buildBackupPayload\(\)/);
  // auto-backup is wired into the single persistence choke-point
  assert.match(app, /function persistProjects\(\)[\s\S]*scheduleBackup\(\);/);
  // graceful manual fallback when the API is unavailable
  assert.match(app, /function downloadBackup\(\)/);
  assert.match(app, /function restoreBackup\(\)/);
  assert.match(app, /const supportsFsAccess = typeof window\.showSaveFilePicker === "function"/);
});

test("premium Cairo font is bundled and self-hosted for offline use", () => {
  assert.match(css, /@font-face\s*{[\s\S]*font-family:\s*"Cairo"/);
  assert.match(css, /url\("assets\/fonts\/cairo-arabic\.woff2"\)/);
  assert.match(css, /url\("assets\/fonts\/cairo-latin\.woff2"\)/);
  assert.match(css, /font-weight:\s*400 900/);
  // body still prefers Cairo, with safe fallbacks
  assert.match(css, /font-family:\s*"Cairo",\s*"Tajawal"/);

  ["cairo-arabic.woff2", "cairo-latin-ext.woff2", "cairo-latin.woff2"].forEach((file) => {
    const fontPath = path.join(root, "assets", "fonts", file);
    assert.ok(fs.existsSync(fontPath), `missing ${file}`);
    const header = fs.readFileSync(fontPath).subarray(0, 4).toString("latin1");
    assert.equal(header, "wOF2", `${file} is not a valid woff2`);
  });
});

test("Windows install scaffolding launches an Edge app window from a local server", () => {
  ["server.ps1", "launch.vbs", "setup.bat", "setup.ps1", "INSTALL.md"].forEach((file) => {
    assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
  });
  assert.ok(fs.existsSync(path.join(root, "assets", "app-icon.ico")), "missing app-icon.ico");
  assert.match(html, /rel="icon"/);

  const server = fs.readFileSync(path.join(root, "server.ps1"), "utf8");
  assert.match(server, /TcpListener/); // runtime-free, no Node/Python needed
  assert.match(server, /Loopback/); // binds to localhost only

  const vbs = fs.readFileSync(path.join(root, "launch.vbs"), "utf8");
  assert.match(vbs, /port = "8137"/);
  assert.match(vbs, /"http:\/\/127\.0\.0\.1:" & port/); // localhost origin
  assert.match(vbs, /--app=" & baseUrl/); // Edge app mode
  assert.match(vbs, /msedge\.exe/);
});

test("scope of work is an editable checklist (toggle + add + remove) in the editor", () => {
  // data model: scope items are { name, enabled } objects, enabled by default
  assert.match(app, /name:\s*"رفع مساحي",\s*enabled:\s*true/);
  // editor renders a checkbox + remove button per item and an add row per group
  assert.match(app, /data-scope-group="\$\{groupIndex\}"\s+data-scope-item="\$\{itemIndex\}"/);
  assert.match(app, /data-scope-remove=/);
  assert.match(app, /data-scope-add-input="\$\{groupIndex\}"/);
  assert.match(app, /data-scope-add="\$\{groupIndex\}"/);
  assert.match(app, /function addScopeItem\(/);
  assert.match(app, /function removeScopeItem\(/);
  // toggling a checkbox updates enabled; preview renders only enabled items
  assert.match(app, /\.items\[Number\(input\.dataset\.scopeItem\)\]\.enabled = input\.checked/);
  assert.match(app, /group\.items\.filter\(\(item\) => item\.enabled !== false\)/);
  // legacy string items migrate to { name, enabled, description }
  assert.match(app, /typeof item === "string" \? true : item\.enabled !== false/);
  assert.match(app, /scopeDescriptionMap\[name\] \|\| ""/);
  // Enter in an add field must not reload the page
  assert.match(app, /editorForm\.addEventListener\("submit"/);
  assert.match(css, /\.scope-check-row\s*{/);
  assert.match(css, /\.scope-add\s*{/);
});

test("area and validity inputs auto-append fixed unit suffixes", () => {
  assert.match(app, /\["landArea", "مساحة الأرض", "unit:م²"\]/);
  assert.match(app, /\["validityPeriod", "مدة صلاحية العرض", "unit:أيام"\]/);
  assert.match(app, /if \(type\.startsWith\("unit:"\)\)/);
  assert.match(app, /quotationData\[key\] = sanitized \? `\$\{sanitized\} \$\{input\.dataset\.unit\}` : ""/);
});

test("deed date opens the same calendar as the quotation date", () => {
  assert.match(app, /\["deedDate", "تاريخ الصك", "date"\]/);
  assert.match(app, /function setDeedDate\(isoDate\)/);
  assert.match(app, /const dateFieldConfig = \{/);
  assert.match(app, /deed: \{ isoKey: "deedDateIso"/);
  assert.match(app, /function dateFieldFor\(key\)/);
  assert.match(app, /data-date-field="\$\{field\}"/);
});

test("notes preserve line breaks in the printed document", () => {
  assert.match(css, /\.note\s*{[\s\S]*white-space:\s*pre-wrap/);
});

test("default data is faded placeholders, not real client info", () => {
  assert.match(app, /clientName: "",/);
  assert.match(app, /deedNumber: "",/);
  assert.match(app, /mainPriceNumber: "",/);
  assert.match(app, /function ph\(value, placeholder\)/);
  assert.match(app, /class="doc-placeholder"/);
  assert.match(css, /\.doc-placeholder\s*{/);
  assert.doesNotMatch(app, /clientName: "طاهره/); // no real client baked into defaults
});

test("last page drops the footer and ends with the signature", () => {
  assert.match(app, /function pageShell\(title, body, pageNumber, totalPages, isLast = false\)/);
  assert.match(app, /\$\{isLast \? "" : renderFooter\(pageNumber, totalPages\)\}/);
  assert.match(app, /!quotationData\.showOptionalAnnex/); // financial is last only when annex hidden
  assert.match(css, /\.page\.is-last-page \.closing-block\s*{[\s\S]*margin-top:\s*auto/);
});

/* --- Productization (عروضي): brandable office identity + market features --- */

const tafqit = require(path.join(root, "tafqit.js"));

test("tafqit converts figures into formal Arabic words", () => {
  assert.equal(tafqit.tafqitInteger(1), "واحد");
  assert.equal(tafqit.tafqitInteger(11), "أحد عشر");
  assert.equal(tafqit.tafqitInteger(25), "خمسة وعشرون");
  assert.equal(tafqit.tafqitInteger(100), "مائة");
  assert.equal(tafqit.tafqitInteger(200), "مائتان");
  assert.equal(tafqit.tafqitInteger(345), "ثلاثمائة وخمسة وأربعون");
  assert.equal(tafqit.tafqitInteger(1000), "ألف");
  assert.equal(tafqit.tafqitInteger(2000), "ألفان");
  assert.equal(tafqit.tafqitInteger(3000), "ثلاثة آلاف");
  assert.equal(tafqit.tafqitInteger(75500), "خمسة وسبعون ألف وخمسمائة");
  assert.equal(tafqit.tafqitInteger(1000000), "مليون");
  assert.equal(tafqit.tafqitInteger(2500000), "مليونان وخمسمائة ألف");
  assert.equal(tafqit.tafqitRiyals(86250), "ستة وثمانون ألف ومائتان وخمسون ريال سعودي فقط لا غير");
  assert.equal(tafqit.tafqitRiyals(10.5), "عشرة ريال سعودي وخمسون هللة فقط لا غير");
  assert.equal(tafqit.tafqitRiyals(0), "");
});

test("written amount is auto-derived from the figure with manual override", () => {
  assert.match(html, /tafqit\.js\?v=/);
  assert.match(app, /mainPriceWrittenManual: false/);
  assert.match(app, /quotationData\.mainPriceWritten = tafqitRiyals\(parseMoneyAmount\(quotationData\.mainPriceNumber\)\)/);
  assert.match(app, /quotationData\.mainPriceWrittenManual = input\.value\.trim\(\) !== ""/);
});

test("office identity lives in a persisted brand profile, not in each quotation", () => {
  assert.match(app, /const BRAND_PROFILE_STORAGE_KEY = "oroudyBrandProfile"/);
  assert.match(app, /const defaultBrandProfile = {/);
  assert.match(app, /function loadBrandProfile\(\)/);
  assert.match(app, /function persistBrandProfile\(\)/);
  assert.match(app, /brandProfile\.companyName/);
  assert.match(app, /getLogoSrc\(\)/);
  assert.match(app, /getSignatureSrc\(\)/);
  // saved projects shed their legacy embedded identity
  assert.match(app, /\["companyName", "logoPath", "footerImagePath", "signaturePath", "closingText"\]\.forEach/);
});

test("office settings dialog edits name, images, footer fields and defaults", () => {
  assert.match(html, /id="settingsDialog"/);
  assert.match(html, /id="officeSettingsBtn"/);
  assert.match(html, /id="settingsCompanyName"/);
  assert.match(html, /data-settings-image="logo"/);
  assert.match(html, /data-settings-image="signature"/);
  assert.match(html, /data-settings-image="qr"/);
  assert.match(html, /id="settingsVat"/);
  assert.match(html, /id="settingsCr"/);
  assert.match(html, /id="settingsAccreditation"/);
  assert.match(app, /function openOfficeSettings\(\)/);
  assert.match(app, /function saveOfficeSettings\(\)/);
  assert.match(app, /function readImageAsDataUrl\(/); // uploads downscaled for localStorage
  assert.match(app, /settingsSaveDefaultsBtn/);
  assert.match(app, /brandProfile\.defaults \? { \.\.\.base, \.\.\.cloneData\(brandProfile\.defaults\) } : base/);
});

test("structured footer strip renders Saudi registration fields and optional QR", () => {
  assert.match(app, /function renderFooterStrip\(\)/);
  assert.match(app, /الرقم الضريبي: /);
  assert.match(app, /س\.ت: /);
  assert.match(app, /اعتماد الهيئة السعودية للمهندسين/);
  assert.match(app, /class="footer-qr"/);
  assert.match(css, /\.footer-strip\s*{/);
  assert.match(css, /\.footer-qr\s*{/);
});

test("financial page shows VAT-inclusive grand total and explicit valid-until date", () => {
  assert.match(app, /function getGrandTotal\(\)/);
  assert.match(app, /subtotal \* 1\.15/);
  assert.match(app, /class="grand-total-row"/);
  assert.match(app, /الإجمالي شامل ضريبة القيمة المضافة 15%/);
  assert.match(app, /function getValidUntilText\(\)/);
  assert.match(app, /حتى تاريخ /);
  assert.match(css, /\.grand-total-row\s*{/);
});

test("bilingual toggle adds English subtitles to document titles", () => {
  assert.match(app, /bilingual: false/);
  assert.match(app, /const pageTitleTranslations = {/);
  assert.match(app, /"Scope of Work"/);
  assert.match(app, /class="page-title-en"/);
  assert.match(app, /Official Price Quotation/);
  assert.match(app, /\["bilingual", "إظهار العناوين بالإنجليزية", "checkbox"\]/);
  assert.match(css, /\.page-title-en\s*{/);
});

test("deliverables and optional services are editable lists like scope", () => {
  assert.match(app, /function addDeliverable\(\)/);
  assert.match(app, /function removeDeliverable\(index\)/);
  assert.match(app, /function addOptionalService\(\)/);
  assert.match(app, /function removeOptionalService\(index\)/);
  assert.match(app, /data-deliverable-item/);
  assert.match(app, /data-deliverable-add-input/);
  assert.match(app, /data-service-add-name/);
  assert.match(app, /data-service-remove/);
  // legacy string deliverables migrate to { name, enabled }
  assert.match(app, /migratedData\.deliverables = migratedData\.deliverables\.map/);
});

test("the shell is branded as عروضي with the office name driven by the profile", () => {
  assert.match(html, /<title>عروضي — محرر عروض الأسعار<\/title>/);
  assert.match(html, /id="brandOfficeName"/);
  assert.match(html, /id="brandLogo"/);
  assert.match(app, /function renderShellBrand\(\)/);
});

test("backups carry the brand profile so a full office restore works", () => {
  assert.match(app, /app: "oroudy-quotation-editor"/);
  assert.match(app, /brandProfile,\s*\n\s*projects: savedProjects/);
  assert.match(app, /parsed\.brandProfile/);
});

test("projects panel has a live search with result count", () => {
  assert.match(html, /id="projectSearch"/);
  assert.match(html, /id="projectsCount"/);
  assert.match(app, /function projectMatchesSearch\(project, query\)/);
  assert.match(app, /projectSearchQuery = projectSearchInput\.value/);
  assert.match(app, /لا توجد نتائج مطابقة لبحثك/);
  assert.match(css, /\.projects-search\s*{/);
});

test("brand colors are office-configurable and scoped to the document", () => {
  assert.match(app, /colors:\s*{\s*\n\s*primary: "#303640",\s*\n\s*accent: "#dfb86d"/);
  assert.match(app, /function applyBrandColors\(\)/);
  assert.match(app, /preview\.style\.setProperty\("--gold", colors\.accent\)/);
  assert.match(app, /preview\.style\.setProperty\("--navy", colors\.primary\)/);
  assert.match(app, /function tintColor\(/);
  assert.match(html, /id="settingsPrimaryColor"/);
  assert.match(html, /id="settingsAccentColor"/);
  assert.match(html, /id="settingsResetColorsBtn"/);
  assert.match(css, /color-mix\(in srgb, var\(--gold\) 14%, transparent\)/);
});

test("payment phases are fully editable: percent, label, add, remove", () => {
  assert.match(app, /data-payment-label="\$\{index\}"/);
  assert.match(app, /data-payment-remove="\$\{index\}"/);
  assert.match(app, /data-payment-add/);
  assert.match(app, /function addPaymentPhase\(\)/);
  assert.match(app, /function removePaymentPhase\(index\)/);
  assert.match(app, /quotationData\.paymentSchedule\[Number\(input\.dataset\.paymentLabel\)\]\.label = input\.value/);
  assert.match(css, /\.payment-edit-row\s*{/);
});

test("financial terms and the annex note are editable", () => {
  assert.match(app, /data-term-index="\$\{index\}"/);
  assert.match(app, /data-term-remove="\$\{index\}"/);
  assert.match(app, /function addFinancialTerm\(\)/);
  assert.match(app, /function removeFinancialTerm\(index\)/);
  assert.match(app, /quotationData\.financialTerms\[Number\(input\.dataset\.termIndex\)\] = input\.value/);
  assert.match(app, /id="optionalAnnexNote" data-key="optionalAnnexNote"/);
  assert.match(css, /\.term-edit-row\s*{/);
});
