const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const publicRoot = path.join(root, "public"); // the deployable web app lives here
const app = fs.readFileSync(path.join(publicRoot, "app.js"), "utf8");
const css = fs.readFileSync(path.join(publicRoot, "styles.css"), "utf8");
const html = fs.readFileSync(path.join(publicRoot, "index.html"), "utf8");
const config = fs.existsSync(path.join(publicRoot, "supabase-config.js"))
  ? fs.readFileSync(path.join(publicRoot, "supabase-config.js"), "utf8")
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
  assert.match(config, /window\.OROUDI_SUPABASE_CONFIG/);
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

test("cloud login can be skipped so hosted users can continue without sync", () => {
  assert.match(html, /id="continueLocalBtn"/);
  assert.match(html, /id="cloudLoginBtn"/);
  assert.match(html, /متابعة بدون مزامنة/);
  assert.match(app, /const LOCAL_MODE_STORAGE_KEY = "oroudiLocalMode"/);
  assert.match(app, /const cloudLoginBtn = document\.querySelector\("#cloudLoginBtn"\)/);
  assert.match(app, /function continueWithoutSync\(\)/);
  assert.match(app, /localStorage\.setItem\(LOCAL_MODE_STORAGE_KEY, "1"\)/);
  assert.match(app, /function isLocalModePreferred\(\)/);
  assert.match(app, /if \(isLocalModePreferred\(\)\) \{\s*\n\s*setSyncStatus\("local", "محلي فقط - بدون مزامنة"\);/);
  assert.match(app, /function showCloudLogin\(\)/);
  assert.match(app, /cloudLoginBtn\.addEventListener\("click", showCloudLogin\)/);
  assert.match(app, /continueLocalBtn\.addEventListener\("click", continueWithoutSync\)/);
});

test("returning from no-sync mode keeps cloud auth session handling wired", () => {
  assert.match(app, /authListenerBound:\s*false/);
  assert.match(app, /function bindAuthStateListener\(\)/);
  assert.match(app, /if \(cloudState\.authListenerBound \|\| !cloudState\.client\)/);
  assert.match(app, /cloudState\.authListenerBound = true/);
  assert.match(app, /bindAuthStateListener\(\);\s*\n\s*if \(isLocalModePreferred\(\)\)/);
  assert.match(app, /async function showCloudLogin\(\)/);
  assert.match(app, /await initializeCloudSession\(\)/);
});

test("successful cloud workspace load refreshes header auth controls after ready", () => {
  assert.match(app, /cloudState\.ready = true;[\s\S]*renderApp\(\);[\s\S]*showLoginOverlay\(false\);[\s\S]*setSyncStatus\("ready", "متصل - مشاريع المكتب مشتركة"\);/);
});

test("hidden header action buttons stay hidden despite button display styles", () => {
  assert.match(css, /(?:^|\n)\[hidden\]\s*{[\s\S]*display:\s*none\s*!important/);
  assert.match(html, /id="cloudLoginBtn" class="secondary-btn" type="button" hidden/);
  assert.match(html, /id="logoutBtn" class="secondary-btn" type="button" hidden/);
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
  const logoSize = fs.statSync(path.join(publicRoot, "assets", "LOGO.png")).size;
  const footerSize = fs.statSync(path.join(publicRoot, "assets", "Footer.png")).size;
  const signatureSize = fs.statSync(path.join(publicRoot, "assets", "Signature.png")).size;

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
  // Pages are assembled as builders then numbered sequentially, so the footer "n/total"
  // stays correct as optional and custom pages are added or removed.
  assert.match(app, /const totalPages = builders\.length \+ 1;/);
  assert.match(app, /pages\.push\(build\(index \+ 2, totalPages\)\)/);
  assert.match(app, /if \(quotationData\.showDeliverables\) \{\s*\n\s*builders\.push/);
  assert.match(app, /if \(quotationData\.showOptionalAnnex\) \{\s*\n\s*builders\.push/);
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
  assert.match(app, /const clientTitleOptions\s*=\s*\["السيد", "السيدة", "السادة"\]/);
  assert.match(app, /\["clientTitle", "اللقب", "clientTitle"\]/);
  assert.match(app, /function getClientDisplayName/);
  assert.match(app, /getClientDisplayName\(quotationData\)/);
  assert.match(app, /class="field client-name-row"/);
  assert.match(app, /السيد/);
  assert.match(app, /السيدة/);
  assert.match(app, /السادة/);
  assert.match(css, /\.client-name-row\s*{/);
});

test("responsible person fields render at the end and drive the PDF contact button", () => {
  assert.match(app, /responsibleTitle:\s*"المهندس"/);
  assert.match(app, /responsibleName:\s*""/);
  assert.match(app, /responsiblePhone:\s*""/);
  assert.match(app, /const responsibleTitleOptions\s*=\s*\["المهندس", "المهندسة", "السيد", "السيدة"\]/);
  assert.match(app, /function getResponsibleDisplayName/);
  assert.match(app, /function getResponsibleContactUrl/);
  assert.match(app, /responsible: "المسؤول عن تجهيز العرض"/);
  assert.match(app, /class="field responsible-name-row"/);
  assert.match(app, /id="responsiblePhone"/);
  assert.match(app, /class="acceptance-contact-btn"/);
  assert.match(app, /لقبول العرض أو بحال أي إستفسار/);
  assert.match(app, /أنقر هنا للتواصل مع/);
  assert.match(css, /\.responsible-name-row\s*{/);
  assert.match(css, /\.acceptance-contact-btn\s*{/);
});

test("input panel sections are a numbered, collapsible accordion with editable titles", () => {
  // Every section is wrapped by sectionShell with a sequential number and a collapse toggle.
  assert.match(app, /function sectionShell\(id, number, bodyHtml, opts/);
  assert.match(app, /class="form-group accordion-section/);
  assert.match(app, /data-section-toggle=/);
  assert.match(app, /class="section-num">\$\{number\}/);
  assert.match(app, /sections\s*\n?\s*\.map\(\(section, index\) => sectionShell\(section\.id, index \+ 1/);

  // Sections still collapse/expand, but the fast-start section opens by default.
  assert.match(app, /const expandedSections = new Set\(\[DEFAULT_OPEN_SECTION_ID\]\);/);
  assert.match(app, /class="section-body"\$\{open \? "" : " hidden"\}/);
  assert.match(app, /function renderApp\(\)\s*{\s*[\s\S]*?resetExpandedSections\(\);/);
  assert.match(app, /function toggleSection\(id\)/);

  // Titles are persisted per-quotation in sectionTitles.
  assert.match(app, /sectionTitles:\s*\{\}/);
  assert.match(app, /data-section-title=/);
  assert.match(app, /quotationData\.sectionTitles\[sectionId\] = input\.value/);

  // Accordion styling hooks exist.
  assert.match(css, /\.accordion-section\s*{/);
  assert.match(css, /\.section-num\s*{/);
  assert.match(css, /\.section-title-input\s*{/);
});

test("fast first quote section opens by default with the essential fields", () => {
  assert.match(app, /const DEFAULT_OPEN_SECTION_ID = "start"/);
  assert.match(app, /title: "ابدأ العرض"/);
  assert.match(app, /اختر الخدمة، اكتب العميل والسعر، ثم اطبع أو احفظ PDF/);
  assert.match(app, /function resetExpandedSections\(\)\s*{[\s\S]*expandedSections\.add\(DEFAULT_OPEN_SECTION_ID\)/);
  assert.match(app, /id: "start"[\s\S]*\["serviceCategory", "فئة الخدمة", "category"\][\s\S]*\["permitType", "نوع الخدمة", "permit"\][\s\S]*\["projectType", "نوع المشروع", "select"\][\s\S]*\["clientTitle", "اللقب", "clientTitle"\][\s\S]*\["city", "المدينة"\][\s\S]*\["district", "الحي"\][\s\S]*\["quotationNumber", "رقم العرض"\][\s\S]*\["mainPriceNumber", "قيمة العرض", "money"\]/);
});

test("follow-up editor sections separate contact/date from land/deed details", () => {
  assert.match(app, /id: "contact"[\s\S]*title: "بيانات التواصل والتاريخ"[\s\S]*\["clientPhone", "رقم الجوال"\][\s\S]*\["clientEmail", "البريد الإلكتروني", "email"\][\s\S]*\["date", "التاريخ", "date"\][\s\S]*\["validityPeriod", "مدة صلاحية العرض", "unit:أيام"\][\s\S]*\["bilingual", "إظهار العناوين بالإنجليزية", "checkbox"\]/);
  assert.match(app, /id: "land"[\s\S]*title: "تفاصيل الأرض والصك"[\s\S]*\["plotNumber", "رقم القطعة"\][\s\S]*\["landArea", "مساحة الأرض", "unit:م²"\][\s\S]*\["planNumber", "رقم المخطط"\][\s\S]*\["deedNumber", "رقم الصك"\][\s\S]*\["deedDate", "تاريخ الصك", "date"\]/);
});

test("mobile users edit before previewing", () => {
  assert.match(css, /@media \(max-width: 900px\)\s*{[\s\S]*grid-template-areas:\s*"editor"[\s\S]*"preview"[\s\S]*"projects"/);
});

test("section titles are edited via an edit button and sync to the PDF page titles", () => {
  // Titles read as text with a separate ✎ edit button (not edit-on-click of the text).
  assert.match(app, /class="section-title-text"/);
  assert.match(app, /data-section-edit=/);
  assert.match(app, /let editingSectionTitle = null;/);
  assert.match(app, /function beginSectionTitleEdit\(id\)/);
  assert.match(app, /const sectionEdit = event\.target\.closest\("\[data-section-edit\]"\);/);
  assert.match(css, /\.section-edit\s*{/);
  assert.match(css, /\.section-title-text\s*{/);

  // One shared default-title map feeds both the editor and the document.
  assert.match(app, /const SECTION_DEFAULT_TITLES = \{/);

  // The four sections that are their own PDF page take their heading from the section title,
  // so renaming the section renames the page in the quotation.
  assert.match(app, /pageShell\(getSectionTitle\("scope"\)/);
  assert.match(app, /getSectionTitle\("deliverables"\)/);
  assert.match(app, /getSectionTitle\("financial"\)/);
  assert.match(app, /getSectionTitle\("optional"\)/);

  // Typing a title re-renders the document (live PDF sync) without re-rendering the editor.
  assert.match(app, /renderPreview\(\);\s*\n\s*saveActiveProject\(\);/);
});

test("users can add custom sections that print as their own page in the quotation", () => {
  // Data model + CRUD.
  assert.match(app, /customSections:\s*\[\]/);
  assert.match(app, /function addCustomSection\(\)/);
  assert.match(app, /function removeCustomSection\(id\)/);
  assert.match(app, /function addCustomItem\(id\)/);
  assert.match(app, /function removeCustomItem\(id, index\)/);
  assert.match(app, /id = `custom:\$\{createProjectId\(\)\}`/);

  // Editor: removable accordion sections + an add-section button.
  assert.match(app, /removable: section\.removable/);
  assert.match(app, /class="add-section-btn" data-add-section/);
  assert.match(app, /const sectionRemove = event\.target\.closest\("\[data-section-remove\]"\);/);

  // Custom titles live on the section object (custom-aware getter and setter).
  assert.match(app, /sectionId\.startsWith\("custom:"\)/);
  assert.match(app, /id\.startsWith\("custom:"\)/);

  // Printed as its own page, inserted before the financial page, numbered with the rest.
  assert.match(app, /function renderCustomSection\(section, pageNumber, totalPages\)/);
  assert.match(app, /builders\.push\(\(n, t\) => renderCustomSection\(section, n, t\)\)/);
  assert.match(app, /customSectionHasContent/);
  assert.match(app, /class="custom-section-list"/);
  assert.match(css, /\.add-section-btn\s*{/);
  assert.match(css, /\.custom-section-list\s*{/);
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
  assert.match(app, /readLocalStorageValue\(PROJECTS_STORAGE_KEY, "\[\]"\)/);
  assert.match(app, /writeLocalStorageValue\(PROJECTS_STORAGE_KEY/);
  assert.match(app, /function renderProjectsPanel\(\)/);
  assert.match(app, /data-project-id="\$\{escapeHtml\(project\.id\)\}"/);
  assert.match(app, /function saveActiveProject\(\)/);
  assert.match(app, /function createNewProject\(\)/);
  assert.match(app, /function duplicateActiveProject\(\)/);
  assert.match(app, /function deleteProject\(projectId\)/);
});

test("saved-project storage failures do not break the editor shell", () => {
  assert.match(app, /function readLocalStorageValue\(key, fallback = ""\)/);
  assert.match(app, /function writeLocalStorageValue\(key, value\)/);
  assert.match(app, /activeProjectId = readLocalStorageValue\(ACTIVE_PROJECT_STORAGE_KEY\)/);
  assert.match(app, /writeLocalStorageValue\(PROJECTS_STORAGE_KEY, JSON\.stringify\(savedProjects\)\)/);
  assert.match(app, /writeLocalStorageValue\(ACTIVE_PROJECT_STORAGE_KEY, activeProjectId\)/);
});

test("project cards include per-project status and delete controls without a global delete button", () => {
  assert.doesNotMatch(html, /id="deleteProjectBtn"/);
  assert.doesNotMatch(app, /deleteProjectBtn/);
  assert.match(app, /const projectStatusOptions\s*=/);
  assert.match(app, /تم الإرسال/);
  assert.match(app, /تم القبول/);
  assert.match(app, /تم الرفض/);
  assert.match(app, /data-project-status="\$\{escapeHtml\(project\.id\)\}:\$\{escapeHtml\(status\.value\)\}"/);
  assert.match(app, /data-project-delete="\$\{escapeHtml\(project\.id\)\}"/);
  assert.match(app, /function setProjectStatus\(projectId, status\)/);
  assert.match(app, /function deleteProject\(projectId\)/);
  assert.match(css, /\.project-card\s*{/);
  assert.match(css, /\.project-card-actions\s*{/);
  assert.match(css, /\.project-status-btn\.is-active\s*{/);
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
  assert.match(app, /\["permitType", "نوع الخدمة", "permit"\]/);
  assert.match(app, /function getPermitTitle\(\)/);
  assert.match(app, /<h2>\$\{escapeHtml\(getPermitTitle\(\)\)\}<\/h2>/);
  assert.doesNotMatch(app, /<h2>عرض خدمات التصميم وإصدار رخصة بناء<\/h2>/);
});

test("services are organized into a filterable category catalog", () => {
  // permitTypeOptions is now derived from a categorized catalog.
  assert.match(app, /const serviceCatalog\s*=/);
  assert.match(app, /const permitTypeOptions\s*=\s*serviceCatalog\.flatMap/);
  // Categories span beyond building permits (the whole point of the change).
  [
    "رخص البناء",
    "التصاميم والدراسات",
    "أعمال المساحة",
    "الإشراف الهندسي",
    "شهادات وخدمات أخرى"
  ].forEach((category) => assert.ok(app.includes(category), category));
  // Representative non-building services exist.
  ["إصدار قرار مساحي", "الإشراف الهندسي على التنفيذ"].forEach((service) =>
    assert.ok(app.includes(service), service)
  );
  // serviceCategory is part of the quotation state and is a filter field above the service.
  assert.match(app, /serviceCategory:\s*"رخص البناء"/);
  assert.match(app, /\["serviceCategory", "فئة الخدمة", "category"\]/);
  // Selecting a service loads its tailored defaults.
  assert.match(app, /function applyServiceTemplate\(/);
  // نوع المشروع options adapt to the category (surveying lists land/plot types).
  assert.match(app, /function getProjectTypeOptions\(/);
  assert.match(app, /const projectTypesByCategory\s*=/);
  ["أرض سكنية", "قطعة ضمن مخطط"].forEach((landType) =>
    assert.ok(app.includes(landType), landType)
  );
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

test("preview auto-fits to the panel width instead of manual zoom controls", () => {
  // the manual fit/100/75 buttons were replaced by automatic width-fitting
  assert.doesNotMatch(html, /data-preview-zoom/);
  assert.doesNotMatch(app, /function setPreviewZoom/);
  assert.match(app, /function applyPreviewZoom\(\)/);
  assert.match(app, /const availableWidth = shell\.clientWidth - 16/);
  assert.match(app, /preview\.style\.setProperty\("--preview-zoom", String\(scale\)\)/);
  assert.match(app, /window\.addEventListener\("resize", applyPreviewZoom\)/);
  // the fit is still applied through the --preview-zoom variable and reset for print
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

test("pages auto-fit to one A4 sheet so toggling the annex never adds a stray page", () => {
  assert.match(app, /function fitPages\(\)/);
  assert.match(app, /content\.style\.zoom = String\(Math\.max\(0\.5/);
  assert.match(app, /available = rect\.width \* a4Ratio - paddingPx/);
  // fitPages runs in renderPreview before the overflow check.
  assert.match(app, /fitPages\(\);\s*\n\s*flagPageOverflow\(\);/);
});

test("the date picker has month and year navigation with a calendar affordance", () => {
  assert.match(app, /data-calendar-nav="-12"/);
  assert.match(app, /data-calendar-nav="12"/);
  assert.match(app, /data-calendar-nav="-1"/);
  assert.match(app, /class="calendar-nav-group"/);
  assert.match(app, /class="date-input-icon"/);
  assert.match(css, /\.calendar-nav-group\s*{/);
  assert.match(css, /\.date-input-icon\s*{/);
});

test("financial page sub-headings for terms and payments match their section titles", () => {
  assert.match(app, /<h3 class="scope-heading">\$\{escapeHtml\(getSectionTitle\("terms"\)\)\}<\/h3>/);
  assert.match(app, /<h3 class="scope-heading">\$\{escapeHtml\(getSectionTitle\("payments"\)\)\}<\/h3>/);
  // the old hardcoded payments heading is gone
  assert.doesNotMatch(app, /جدول الدفعات \+ الضريبة 15%/);
});

test("projects panel has no backup UI or file-backup leftovers", () => {
  assert.doesNotMatch(html, /backupStatus|enableBackupBtn|backupNowBtn|restoreBackupBtn|النسخ الاحتياطي|نسخ احتياطي|استعادة من ملف/);
  assert.doesNotMatch(css, /\.backup-block|\.backup-status/);
  assert.doesNotMatch(app, /BACKUP_|backupFileHandle|backupState|scheduleBackup|buildBackupPayload|downloadBackup|restoreBackup|initializeBackup/);
  assert.doesNotMatch(app, /showSaveFilePicker|showOpenFilePicker|indexedDB\.open/);
  assert.doesNotMatch(app, /function persistProjects\(\)[\s\S]*scheduleBackup\(\);/);
});

test("premium Cairo font is bundled and self-hosted for offline use", () => {
  assert.match(css, /@font-face\s*{[\s\S]*font-family:\s*"Cairo"/);
  assert.match(css, /url\("assets\/fonts\/cairo-arabic\.woff2"\)/);
  assert.match(css, /url\("assets\/fonts\/cairo-latin\.woff2"\)/);
  assert.match(css, /font-weight:\s*400 900/);
  // body still prefers Cairo, with safe fallbacks
  assert.match(css, /font-family:\s*"Cairo",\s*"Tajawal"/);

  ["cairo-arabic.woff2", "cairo-latin-ext.woff2", "cairo-latin.woff2"].forEach((file) => {
    const fontPath = path.join(publicRoot, "assets", "fonts", file);
    assert.ok(fs.existsSync(fontPath), `missing ${file}`);
    const header = fs.readFileSync(fontPath).subarray(0, 4).toString("latin1");
    assert.equal(header, "wOF2", `${file} is not a valid woff2`);
  });
});

test("Windows install scaffolding launches an Edge app window from a local server", () => {
  ["server.ps1", "launch.vbs", "setup.bat", "setup.ps1", "INSTALL.md"].forEach((file) => {
    assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
  });
  assert.ok(fs.existsSync(path.join(publicRoot, "assets", "app-icon.ico")), "missing app-icon.ico");
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

const tafqit = require(path.join(publicRoot, "tafqit.js"));

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
  assert.match(app, /const BRAND_PROFILE_STORAGE_KEY = "oroudiBrandProfile"/);
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

test("login is product-branded as عروضي by wbstudio with the brand logo", () => {
  assert.ok(fs.existsSync(path.join(publicRoot, "assets", "oroudi-logo.svg")), "missing oroudi-logo.svg");
  assert.ok(fs.existsSync(path.join(publicRoot, "assets", "oroudi-icon.svg")), "missing oroudi-icon.svg");
  // product brand block on the login card uses the oroudi logo (with عروضي wordmark) + tagline
  assert.match(html, /class="app-brand"/);
  assert.match(html, /class="app-brand-logo" src="assets\/oroudi-logo\.svg[^"]*" alt="عروضي"/);
  assert.match(html, /by wbstudio/);
  // favicon uses the icon-only mark
  assert.match(html, /rel="icon" type="image\/svg\+xml" href="assets\/oroudi-icon\.svg/);
  // login no longer shows the office LOGO.png as its mark
  assert.doesNotMatch(html, /<img src="assets\/LOGO\.png" alt="">/);
});

test("first-visit animated walkthrough explains the app and can be replayed", () => {
  assert.match(html, /id="introOverlay"/);
  assert.match(html, /data-intro-slide/);
  assert.match(html, /id="introReplayBtn"/);
  assert.match(app, /const INTRO_SEEN_KEY = "oroudiIntroSeen"/);
  assert.match(app, /function maybeShowIntro\(\)/);
  assert.match(app, /function showIntro\(\)/);
  // shown during boot, gated by the seen flag
  assert.match(app, /maybeShowIntro\(\)/);
});

test("first-visit walkthrough defers the login card until the intro closes", () => {
  assert.match(app, /let loginOverlayPendingAfterIntro = false/);
  assert.match(app, /function isIntroOverlayVisible\(\)/);
  assert.match(app, /const shouldDeferLogin = show && isIntroOverlayVisible\(\)/);
  assert.match(app, /loginOverlay\.hidden = !show \|\| shouldDeferLogin/);
  assert.match(app, /if \(loginOverlayPendingAfterIntro\) \{[\s\S]*showLoginOverlay\(true\);/);
});

test("projects panel has a live search with result count", () => {
  assert.match(html, /id="projectSearch"/);
  assert.match(html, /id="projectsCount"/);
  assert.match(app, /function projectMatchesSearch\(project, query\)/);
  assert.match(app, /projectSearchQuery = projectSearchInput\.value/);
  assert.match(app, /لا توجد نتائج مطابقة لبحثك/);
  assert.match(css, /\.projects-search\s*{/);
});

test("the printed document uses a neutral, print-safe palette with no brand colors or fills", () => {
  // the document scopes a grey-only palette so nothing depends on a brand color
  assert.match(css, /\.preview\s*{[\s\S]*--gold:\s*#8a8f98/);
  assert.match(css, /\.preview\s*{[\s\S]*--navy:\s*#3f3f44/);
  // the yellowish cover wash and gold accent bars are gone
  assert.doesNotMatch(css, /\.cover\s*{[^}]*linear-gradient/);
  assert.doesNotMatch(css, /\.page-title::before\s*{[\s\S]*?background:\s*var\(--gold\)/);
  assert.doesNotMatch(css, /\.price-card\s*{[^}]*linear-gradient/);
  // colored background fills replaced by transparent/bordered styling
  assert.match(css, /\.footer-strip\s*{[^}]*background:\s*transparent/);
  assert.match(css, /\.note\s*{[^}]*background:\s*transparent/);
  // the now-pointless document color picker is removed from settings
  assert.doesNotMatch(html, /id="settingsPrimaryColor"/);
  assert.doesNotMatch(app, /function applyBrandColors/);
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

/* --- Deployment base: GitHub + Cloudflare (Workers/Wrangler) + Supabase --- */

test("deployment scaffolding is present for GitHub, Cloudflare, and Supabase", () => {
  const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
  const exists = (rel) => fs.existsSync(path.join(root, rel));

  // package.json wires the test script CI relies on, with no build/runtime deps.
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.scripts.test, "node tests/quotation-static.test.js");
  assert.ok(!pkg.dependencies, "the static app must not gain runtime dependencies");

  // GitHub Actions runs the same suite on push/PR.
  assert.ok(exists(".github/workflows/ci.yml"), "missing CI workflow");
  assert.match(read(".github/workflows/ci.yml"), /npm test/);

  // Line endings + ignores keep the repo clean and Linux/Cloudflare-buildable.
  assert.match(read(".gitattributes"), /eol=crlf/);
  assert.match(read(".gitignore"), /^\.env$/m);

  // Cloudflare static-asset headers: security site-wide, hard cache for self-hosted assets.
  const headers = fs.readFileSync(path.join(publicRoot, "_headers"), "utf8");
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /\/assets\/\*/);
  assert.match(headers, /immutable/);

  // Supabase apply order is documented and the SQL it points to exists.
  assert.ok(exists("supabase/schema.sql"), "missing supabase/schema.sql");
  assert.ok(exists("supabase/shared-office-setup.sql"), "missing shared-office-setup.sql");
  const deploy = read("DEPLOYMENT.md");
  ["GitHub", "Cloudflare", "Wrangler", "Supabase", "schema.sql"].forEach((token) =>
    assert.ok(deploy.includes(token), `DEPLOYMENT.md should mention ${token}`)
  );

  // Public Supabase config ships the real (public, RLS-protected) keys so the
  // hosted site has cloud auth/sync. These values are safe to commit and ship.
  assert.match(config, /SUPABASE_URL:\s*"https:\/\/[^"]+\.supabase\.co"/);
  assert.match(config, /SUPABASE_ANON_KEY:\s*"ey[A-Za-z0-9._-]+"/);
});
