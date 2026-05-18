const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

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
