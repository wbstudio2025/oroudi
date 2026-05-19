const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

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

test("printed pages use the branded footer asset on every page shell", () => {
  assert.match(app, /footerImagePath:\s*"assets\/Footer\.png"/);
  assert.match(app, /class="brand-footer"/);
  assert.match(app, /quotationData\.footerImagePath/);
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
  assert.ok(footerSize <= 70000, `Footer.png is ${footerSize} bytes`);
  assert.ok(signatureSize <= 30000, `Signature.png is ${signatureSize} bytes`);
});

test("financial terms render as a simple list instead of rounded cards", () => {
  assert.match(css, /\.terms-list\s*{[\s\S]*list-style:\s*none/);
  assert.match(css, /\.terms-list li::before\s*{[\s\S]*content:\s*""/);
  assert.match(css, /\.terms-list li\s*{[\s\S]*border:\s*0/);
  assert.doesNotMatch(css, /\.terms-list li\s*{[\s\S]*border-radius:\s*8px/);
});

test("deliverables render as a simple checklist without rounded cards", () => {
  assert.match(app, /class="deliverables-list"/);
  assert.match(app, /<li class="deliverable"><span class="check">✓<\/span><span>\$\{escapeHtml\(item\)\}<\/span><\/li>/);
  assert.doesNotMatch(app, /class="deliverables-grid"/);
  assert.match(css, /\.deliverables-list\s*{[\s\S]*list-style:\s*none/);
  assert.match(css, /\.deliverable\s*{[\s\S]*border:\s*0/);
  assert.match(css, /\.deliverable\s*{[\s\S]*background:\s*transparent/);
  assert.doesNotMatch(css, /\.deliverable\s*{[\s\S]*border-radius:\s*8px/);
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
  assert.match(app, /function renderDatePicker\(\)/);
  assert.match(app, /data-date-choice="\$\{isoDate\}"/);
  assert.match(app, /class="hijri-day"/);
  assert.match(app, /class="inline-hijri-date"/);
  assert.match(app, /class="date-hijri"/);
  assert.match(app, /setQuotationDate\(dateChoice\.dataset\.dateChoice\)/);
  assert.match(css, /\.date-picker\s*{/);
  assert.match(css, /\.hijri-day\s*{[\s\S]*opacity:\s*0\.48/);
});

test("client name has a السيد السيدة title dropdown used in output", () => {
  assert.match(app, /clientTitle:\s*"السيدة"/);
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

test("desktop workspace uses projects right preview center and inputs left", () => {
  assert.match(html, /class="projects-panel"/);
  assert.match(html, /id="projectsList"/);
  assert.match(css, /\.workspace\s*{[\s\S]*grid-template-areas:\s*"editor preview projects"/);
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
