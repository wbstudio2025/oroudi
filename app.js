const quotationData = {
  companyName: "شركة الدر النفيس للاستشارات الهندسية",
  logoPath: "assets/LOGO.png",
  footerImagePath: "assets/Footer.png",
  signaturePath: "assets/Signature.png",
  closingText: "نأمل أن ينال عرضنا هذا استحسانكم، ونتطلع إلى خدمتكم بما يحقق تطلعاتكم.",
  quotationNumber: "",
  dateIso: "2026-05-17",
  date: "17 مايو 2026",
  hijriDate: "",
  validityPeriod: "10 أيام",
  clientTitle: "السيدة",
  clientName: "",
  permitType: "إصدار رخصة بناء",
  projectType: "فيلا سكنية",
  city: "",
  district: "",
  planNumber: "",
  plotNumber: "",
  landArea: "",
  deedNumber: "",
  deedDate: "",
  deedDateIso: "",
  deedGregorian: "",
  mainPriceNumber: "",
  mainPriceWritten: "",
  notes: "يشمل العرض منظوراً خارجياً واحداً فقط للواجهة الرئيسية. أي مناظير إضافية أو خدمات تصميم داخلي يتم تسعيرها ضمن الخدمات الاختيارية.",
  showOptionalAnnex: true,
  scopeGroups: [
    {
      number: "01",
      title: "الأعمال الأولية",
      items: [
        { name: "رفع مساحي", enabled: true },
        { name: "إصدار قرار مساحي", enabled: true },
        { name: "دراسة تربة", enabled: true }
      ]
    },
    {
      number: "02",
      title: "التصميم والمخططات الهندسية",
      items: [
        { name: "التصميم المعماري", enabled: true },
        { name: "التصميم الإنشائي", enabled: true },
        { name: "التصميم الكهربائي", enabled: true },
        { name: "التصميم الميكانيكي", enabled: true }
      ]
    },
    {
      number: "03",
      title: "التصور والرخصة",
      items: [
        { name: "منظور خارجي واحد", enabled: true },
        { name: "إصدار رخصة بناء", enabled: true }
      ]
    }
  ],
  deliverables: [
    "مخططات معمارية للرخصة",
    "مخططات إنشائية",
    "مخططات كهربائية",
    "مخططات ميكانيكية",
    "منظور خارجي واحد للواجهة الرئيسية",
    "ملفات PDF للاعتماد",
    "متابعة إصدار رخصة البناء"
  ],
  financialTerms: [
    "القيمة لا تشمل ضريبة القيمة المضافة",
    "القيمة لا تشمل الرسوم الحكومية",
    "يتم إصدار عقد رسمي عند اعتماد العرض"
  ],
  paymentSchedule: [
    { percent: "50", label: "عند توقيع العقد" },
    { percent: "30", label: "بعد اعتماد التصميم المعماري" },
    { percent: "20", label: "بعد إصدار شهادة اعتماد التصاميم" }
  ],
  optionalAnnexNote: "هذه الخدمات اختيارية ولا تؤثر على قيمة العرض الأساسي، ويتم إضافتها فقط عند طلب العميل.",
  optionalServices: [
    {
      name: "منظور خارجي إضافي",
      description: "زاوية إضافية للواجهة أو الحديقة",
      price: "1,000 ريال"
    },
    {
      name: "منظور ليلي",
      description: "إظهار الإضاءة الخارجية ليلاً",
      price: "1,000 ريال"
    },
    {
      name: "منظور داخلي",
      description: "صالة، مجلس، مطبخ، أو غرفة نوم",
      price: "يبدأ من 1,500 ريال"
    },
    {
      name: "تصميم داخلي",
      description: "تصميم داخلي متكامل للفراغات المختارة",
      price: "حسب النطاق"
    },
    {
      name: "فيديو معماري قصير",
      description: "عرض سينمائي للمشروع",
      price: "يبدأ من 3,500 ريال"
    },
    {
      name: "تصميم لاندسكيب",
      description: "مداخل، جلسات خارجية، مزروعات ومسارات",
      price: "حسب المساحة"
    },
    {
      name: "متابعة أثناء التنفيذ",
      description: "زيارات أو استشارات فنية",
      price: "حسب الاتفاق"
    }
  ]
};

const editorForm = document.querySelector("#editorForm");
const preview = document.querySelector("#preview");
const pageCount = document.querySelector("#pageCount");
const overflowWarning = document.querySelector("#overflowWarning");
const printBtn = document.querySelector("#printBtn");
const shareWhatsappBtn = document.querySelector("#shareWhatsappBtn");
const resetBtn = document.querySelector("#resetBtn");
const projectsList = document.querySelector("#projectsList");
const saveStatus = document.querySelector("#saveStatus");
const newProjectBtn = document.querySelector("#newProjectBtn");
const saveProjectBtn = document.querySelector("#saveProjectBtn");
const duplicateProjectBtn = document.querySelector("#duplicateProjectBtn");
const deleteProjectBtn = document.querySelector("#deleteProjectBtn");
const backupStatusEl = document.querySelector("#backupStatus");
const enableBackupBtn = document.querySelector("#enableBackupBtn");
const backupNowBtn = document.querySelector("#backupNowBtn");
const restoreBackupBtn = document.querySelector("#restoreBackupBtn");
const zoomButtons = document.querySelectorAll("[data-preview-zoom]");

const PROJECTS_STORAGE_KEY = "duralNafisQuotationProjects";
const ACTIVE_PROJECT_STORAGE_KEY = "duralNafisActiveQuotationProject";
const ORIGINAL_DOCUMENT_TITLE = document.title;

const projectTypeOptions = [
  "فيلا سكنية",
  "دوبلكس",
  "عمارة سكنية",
  "مبنى سكني تجاري",
  "ملحق سكني",
  "استراحة",
  "شاليه",
  "مزرعة",
  "مستودع",
  "معرض تجاري",
  "مكتب إداري",
  "مطعم أو مقهى",
  "مدرسة أو حضانة",
  "مسجد",
  "مرفق صحي",
  "محطة وقود",
  "مصنع أو ورشة"
];

const permitTypeOptions = [
  {
    value: "إصدار رخصة بناء",
    title: "عرض خدمات التصميم وإصدار رخصة بناء"
  },
  {
    value: "إصدار رخصة تسوير",
    title: "عرض خدمات التصميم وإصدار رخصة تسوير"
  },
  {
    value: "إضافة وتعديل مكونات بناء",
    title: "عرض خدمات إضافة وتعديل مكونات بناء"
  },
  {
    value: "إصدار رخصة ترميم بناء",
    title: "عرض خدمات إصدار رخصة ترميم بناء"
  },
  {
    value: "إصدار رخصة هدم بناء",
    title: "عرض خدمات إصدار رخصة هدم بناء"
  },
  {
    value: "تجديد رخصة بناء",
    title: "عرض خدمات تجديد رخصة بناء"
  },
  {
    value: "تصحيح بيانات رخصة بناء",
    title: "عرض خدمات تصحيح بيانات رخصة بناء"
  }
];

const clientTitleOptions = ["السيد", "السيدة"];

const fields = [
  {
    title: "بيانات العميل والعرض",
    items: [
      ["clientTitle", "اللقب", "clientTitle"],
      ["clientName", "اسم العميل"],
      ["quotationNumber", "رقم العرض"],
      ["date", "التاريخ", "date"],
      ["validityPeriod", "مدة صلاحية العرض", "unit:أيام"]
    ]
  },
  {
    title: "بيانات المشروع",
    items: [
      ["permitType", "نوع الرخصة", "permit"],
      ["projectType", "نوع المشروع", "select"],
      ["city", "المدينة"],
      ["district", "الحي"],
      ["plotNumber", "رقم القطعة"],
      ["landArea", "مساحة الأرض", "unit:م²"],
      ["planNumber", "رقم المخطط"],
      ["deedNumber", "رقم الصك"],
      ["deedDate", "تاريخ الصك", "date"]
    ]
  },
  {
    title: "العرض المالي والملاحظات",
    items: [
      ["mainPriceNumber", "قيمة العرض", "money"],
      ["mainPriceWritten", "قيمة العرض كتابة"],
      ["notes", "ملاحظات", "textarea"],
      ["showOptionalAnnex", "إظهار ملحق الخدمات الاختيارية", "checkbox"]
    ]
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Renders a value, or a faded placeholder hint when it is empty, so the default/blank
// document reads clearly as a template to fill in rather than showing real-looking data.
function ph(value, placeholder) {
  const text = String(value == null ? "" : value).trim();
  return text ? escapeHtml(text) : `<span class="doc-placeholder">${escapeHtml(placeholder)}</span>`;
}

const gregorianDateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric"
});
const gregorianMonthFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  month: "long",
  year: "numeric"
});
const hijriDateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric"
});
const hijriDayFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", {
  day: "numeric",
  month: "short"
});
const weekdayLabels = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function dateFromIso(isoDate) {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isoFromDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftMonth(isoDate, offset) {
  const date = dateFromIso(isoDate);
  return isoFromDate(new Date(date.getFullYear(), date.getMonth() + offset, 1));
}

function formatGregorianDate(isoDate) {
  return gregorianDateFormatter.format(dateFromIso(isoDate));
}

function formatHijriDate(isoDate) {
  return hijriDateFormatter.format(dateFromIso(isoDate));
}

function formatHijriDay(isoDate) {
  return hijriDayFormatter.format(dateFromIso(isoDate));
}

function setQuotationDate(isoDate) {
  quotationData.dateIso = isoDate;
  quotationData.date = formatGregorianDate(isoDate);
  quotationData.hijriDate = formatHijriDate(isoDate);
}

// The deed date is a Saudi (Hijri) date, so the Hijri form is shown primary and the
// Gregorian faded — the mirror of the quotation date.
function setDeedDate(isoDate) {
  quotationData.deedDateIso = isoDate;
  quotationData.deedDate = formatHijriDate(isoDate);
  quotationData.deedGregorian = formatGregorianDate(isoDate);
}

// Both date fields share the same calendar; this config drives which values each reads/writes.
const dateFieldConfig = {
  quotation: { isoKey: "dateIso", primaryKey: "date", secondaryKey: "hijriDate", apply: setQuotationDate },
  deed: { isoKey: "deedDateIso", primaryKey: "deedDate", secondaryKey: "deedGregorian", apply: setDeedDate }
};

function dateFieldFor(key) {
  return key === "deedDate" ? "deed" : "quotation";
}

setQuotationDate(quotationData.dateIso);
const initialSnapshot = JSON.stringify(quotationData);
const datePickerMonths = {
  quotation: quotationData.dateIso,
  deed: quotationData.deedDateIso || quotationData.dateIso
};
let savedProjects = [];
let activeProjectId = "";
let previewZoom = "fit";

function formatPercent(percent) {
  const value = String(percent).trim();
  return value.endsWith("%") ? value : `${value}%`;
}

function parseMoneyAmount(value) {
  const normalizedValue = String(value).replace(/[^\d.]/g, "");
  return Number(normalizedValue) || 0;
}

function formatMoneyAmount(amount) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  }).format(amount);
}

function sanitizeMoneyInput(value) {
  const normalizedDigits = String(value)
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
  const cleanedValue = normalizedDigits.replace(/[^\d.]/g, "");
  const parts = cleanedValue.split(".");

  return parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : cleanedValue;
}

function getMoneyInputValue(value) {
  return sanitizeMoneyInput(value);
}

// For fields with a fixed unit suffix (e.g. area م², validity أيام): the user types only the
// number; the suffix is appended automatically and shown beside the input.
function getUnitInputValue(value) {
  return sanitizeMoneyInput(String(value));
}

function formatRiyalAmount(value) {
  const amount = parseMoneyAmount(value);

  return amount ? `${formatMoneyAmount(amount)} ريال` : "";
}

function getOptionalServicePriceUnit(service) {
  if (service.name.includes("فيديو")) {
    return "ريال للدقيقة الواحدة";
  }

  if (service.name.includes("منظور")) {
    return "ريال لكل منظور";
  }

  return "ريال";
}

function getOptionalServiceDisplayPrice(service) {
  const unit = getOptionalServicePriceUnit(service);
  const price = String(service.price || "");

  if (unit === "ريال") {
    return price;
  }

  return price.includes("ريال") ? price.replace("ريال", unit) : `${price} ${unit}`;
}

function getPaymentAmount(percent) {
  const subtotal = parseMoneyAmount(quotationData.mainPriceNumber) * (parseMoneyAmount(percent) / 100);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  return {
    subtotal,
    vat,
    total
  };
}

function getPermitTitle() {
  const selectedPermit = permitTypeOptions.find((permit) => permit.value === quotationData.permitType);
  return selectedPermit ? selectedPermit.title : permitTypeOptions[0].title;
}

function getClientDisplayName(data = quotationData) {
  return [data.clientTitle, data.clientName].filter(Boolean).join(" ");
}

function getSafeFilePart(value, fallback) {
  const safeValue = String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return safeValue || fallback;
}

function getPdfFileName() {
  const clientPart = getSafeFilePart(getClientDisplayName(quotationData), "عميل");
  const quotationPart = getSafeFilePart(quotationData.quotationNumber, quotationData.dateIso || "عرض");
  return `عرض-${clientPart}-${quotationPart}.pdf`;
}

function restorePrintTitle() {
  document.title = ORIGINAL_DOCUMENT_TITLE;
}

function preparePrintTitle() {
  document.title = getPdfFileName().replace(".pdf", "");
  printBtn.setAttribute("title", `اسم ملف PDF المقترح: ${getPdfFileName()}`);
}

function buildWhatsAppShareText() {
  return [
    `${getPermitTitle()}`,
    `العميل: ${getClientDisplayName(quotationData)}`,
    `نوع المشروع: ${quotationData.projectType}`,
    `الموقع: ${quotationData.district}، ${quotationData.city}`,
    `رقم العرض: ${quotationData.quotationNumber}`,
    `قيمة العرض: ${formatRiyalAmount(quotationData.mainPriceNumber)}`,
    "يمكن حفظ العرض كملف PDF من محرر العروض وإرساله هنا."
  ].join("\n");
}

function getWhatsAppShareUrl() {
  return `https://wa.me/?text=${encodeURIComponent(buildWhatsAppShareText())}`;
}

function shareViaWhatsApp() {
  window.open(getWhatsAppShareUrl(), "_blank", "noopener");
}

function formatSaveTimestamp(isoDate) {
  if (!isoDate) {
    return "لم يتم الحفظ بعد";
  }

  const formattedDate = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(isoDate));

  return `تم الحفظ ${formattedDate}`;
}

function renderSaveStatus() {
  if (!saveStatus) {
    return;
  }

  const project = getActiveProject();
  saveStatus.textContent = formatSaveTimestamp(project?.updatedAt);
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function createProjectId() {
  return `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getProjectName(data = quotationData) {
  const client = String(getClientDisplayName(data) || "").trim();
  const projectType = String(data.projectType || "").trim();
  const district = String(data.district || "").trim();

  return [client, projectType, district].filter(Boolean).join(" - ") || "مشروع بدون اسم";
}

function formatProjectUpdatedAt(isoDate) {
  if (!isoDate) {
    return "";
  }

  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(isoDate));
}

function readSavedProjects() {
  try {
    const parsedProjects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || "[]");
    return Array.isArray(parsedProjects) ? parsedProjects.filter((project) => project && project.id && project.data) : [];
  } catch (error) {
    return [];
  }
}

function persistProjects() {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(savedProjects));
  localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, activeProjectId);
  scheduleBackup();
}

function getActiveProject() {
  return savedProjects.find((project) => project.id === activeProjectId);
}

function migrateProjectData(data) {
  const migratedData = cloneData(data);

  if (!migratedData.clientTitle) {
    migratedData.clientTitle = "السيدة";
  }

  if (Array.isArray(migratedData.paymentSchedule)) {
    migratedData.paymentSchedule = migratedData.paymentSchedule.map((payment) => ({
      ...payment,
      label: payment.label === "بعد تسليم المخططات الهندسية" ? "بعد إصدار شهادة اعتماد التصاميم" : payment.label
    }));
  }

  // Scope items used to be plain strings; they are now { name, enabled } so they can be
  // toggled and extended from the editor. Convert any legacy string items, defaulting to enabled.
  if (Array.isArray(migratedData.scopeGroups)) {
    migratedData.scopeGroups = migratedData.scopeGroups.map((group) => ({
      ...group,
      items: Array.isArray(group.items)
        ? group.items.map((item) =>
            typeof item === "string"
              ? { name: item, enabled: true }
              : { name: item.name, enabled: item.enabled !== false }
          )
        : []
    }));
  }

  return migratedData;
}

function applyProjectData(data) {
  const nextData = {
    ...JSON.parse(initialSnapshot),
    ...migrateProjectData(data)
  };

  Object.keys(quotationData).forEach((key) => delete quotationData[key]);
  Object.assign(quotationData, nextData);
  setQuotationDate(quotationData.dateIso);
  datePickerMonths.quotation = quotationData.dateIso;
  datePickerMonths.deed = quotationData.deedDateIso || quotationData.dateIso;
}

function createProject(data = JSON.parse(initialSnapshot), name = getProjectName(data)) {
  const now = new Date().toISOString();

  return {
    id: createProjectId(),
    name,
    updatedAt: now,
    data: migrateProjectData(data)
  };
}

function initializeProjects() {
  savedProjects = readSavedProjects();
  activeProjectId = localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY) || "";

  if (!savedProjects.length) {
    const firstProject = createProject(quotationData, getProjectName(quotationData));
    savedProjects = [firstProject];
    activeProjectId = firstProject.id;
    persistProjects();
    return;
  }

  if (!getActiveProject()) {
    activeProjectId = savedProjects[0].id;
  }

  applyProjectData(getActiveProject().data);
  persistProjects();
}

function saveActiveProject() {
  const project = getActiveProject();

  if (!project) {
    return;
  }

  project.name = getProjectName();
  project.updatedAt = new Date().toISOString();
  project.data = cloneData(quotationData);
  persistProjects();
  renderProjectsPanel();
}

function createNewProject() {
  saveActiveProject();

  const nextProject = createProject(JSON.parse(initialSnapshot), "مشروع جديد");
  savedProjects.unshift(nextProject);
  activeProjectId = nextProject.id;
  applyProjectData(nextProject.data);
  persistProjects();
  renderApp();
}

function duplicateActiveProject() {
  const project = getActiveProject();

  if (!project) {
    return;
  }

  saveActiveProject();

  const copy = createProject(project.data, `${project.name} - نسخة`);
  savedProjects.unshift(copy);
  activeProjectId = copy.id;
  applyProjectData(copy.data);
  persistProjects();
  renderApp();
}

function deleteActiveProject() {
  const project = getActiveProject();

  if (!project || !window.confirm("هل تريد حذف المشروع الحالي؟")) {
    return;
  }

  savedProjects = savedProjects.filter((savedProject) => savedProject.id !== project.id);

  if (!savedProjects.length) {
    const replacementProject = createProject(JSON.parse(initialSnapshot), "مشروع جديد");
    savedProjects = [replacementProject];
  }

  activeProjectId = savedProjects[0].id;
  applyProjectData(savedProjects[0].data);
  persistProjects();
  renderApp();
}

function switchProject(projectId) {
  if (!projectId || projectId === activeProjectId) {
    return;
  }

  saveActiveProject();
  activeProjectId = projectId;
  const project = getActiveProject();

  if (!project) {
    return;
  }

  applyProjectData(project.data);
  persistProjects();
  renderApp();
}

const scopeIconMap = {
  "رفع مساحي": `
    <path d="M4 19l4-14 4 14 4-14 4 14"/>
    <path d="M8 5h8"/>
    <path d="M6 14h12"/>
  `,
  "إصدار قرار مساحي": `
    <path d="M7 3h7l4 4v14H7z"/>
    <path d="M14 3v5h5"/>
    <path d="M9 13h6"/>
    <path d="M9 17h4"/>
  `,
  "دراسة تربة": `
    <path d="M4 7c4-3 12-3 16 0"/>
    <path d="M4 12c4-3 12-3 16 0"/>
    <path d="M4 17c4-3 12-3 16 0"/>
    <path d="M8 20h8"/>
  `,
  "التصميم المعماري": `
    <path d="M4 20h16"/>
    <path d="M6 20V9l6-5 6 5v11"/>
    <path d="M10 20v-6h4v6"/>
  `,
  "التصميم الإنشائي": `
    <path d="M5 20h14"/>
    <path d="M7 20V6h10v14"/>
    <path d="M7 10h10"/>
    <path d="M7 14h10"/>
    <path d="M10 6v14"/>
    <path d="M14 6v14"/>
  `,
  "التصميم الكهربائي": `
    <path d="M13 2L5 14h6l-1 8 9-13h-6z"/>
  `,
  "التصميم الميكانيكي": `
    <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/>
    <path d="M12 2v4"/>
    <path d="M12 18v4"/>
    <path d="M4.9 4.9l2.8 2.8"/>
    <path d="M16.3 16.3l2.8 2.8"/>
    <path d="M2 12h4"/>
    <path d="M18 12h4"/>
    <path d="M4.9 19.1l2.8-2.8"/>
    <path d="M16.3 7.7l2.8-2.8"/>
  `,
  "منظور خارجي واحد": `
    <path d="M4 14l8-8 8 8"/>
    <path d="M6 12v8h12v-8"/>
    <path d="M9 20v-5h6v5"/>
    <path d="M4 6h4"/>
    <path d="M16 6h4"/>
  `,
  "إصدار رخصة بناء": `
    <path d="M7 3h7l4 4v14H7z"/>
    <path d="M14 3v5h5"/>
    <path d="M9 15l2 2 4-5"/>
  `
};

const scopeDescriptionMap = {
  "رفع مساحي": "تحديد مناسيب وحدود الموقع بدقة.",
  "إصدار قرار مساحي": "تجهيز متطلبات القرار عبر الجهات المختصة.",
  "دراسة تربة": "تقييم خواص التربة كأساس للتصميم.",
  "التصميم المعماري": "توزيع الفراغات والواجهات حسب احتياج المشروع.",
  "التصميم الإنشائي": "حساب النظام الإنشائي والعناصر الحاملة.",
  "التصميم الكهربائي": "تخطيط الأحمال ومسارات التمديدات الكهربائية.",
  "التصميم الميكانيكي": "تنسيق التكييف والصرف والتغذية.",
  "منظور خارجي واحد": "إظهار الواجهة الرئيسية بصورة واقعية.",
  "إصدار رخصة بناء": "متابعة رفع الطلب حتى إصدار الرخصة."
};

const defaultScopeIcon = `
  <circle cx="12" cy="12" r="9"/>
  <path d="M8.5 12l2.5 2.5 4.5-5"/>
`;

function buildIcon(item) {
  const icon = scopeIconMap[item] || defaultScopeIcon;

  return `
    <span class="mini-icon">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        ${icon}
      </svg>
    </span>
  `;
}

function renderDatePicker(field) {
  const config = dateFieldConfig[field];
  const monthDate = dateFromIso(datePickerMonths[field] || quotationData.dateIso);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const selectedIso = quotationData[config.isoKey];
  const emptyDays = Array.from({ length: firstDay.getDay() }, () => `<span class="calendar-blank"></span>`).join("");
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const isoDate = isoFromDate(new Date(year, month, day));
    const selectedClass = isoDate === selectedIso ? " is-selected" : "";

    return `
      <button class="calendar-day${selectedClass}" type="button" data-date-choice="${isoDate}" data-date-field="${field}">
        <span class="gregorian-day">${day}</span>
        <small class="hijri-day">${escapeHtml(formatHijriDay(isoDate))}</small>
      </button>
    `;
  }).join("");

  return `
    <div class="date-picker" data-date-picker="${field}" hidden>
      <div class="calendar-header">
        <button type="button" data-calendar-nav="-1" data-date-field="${field}" aria-label="الشهر السابق">‹</button>
        <strong>${escapeHtml(gregorianMonthFormatter.format(monthDate))}</strong>
        <button type="button" data-calendar-nav="1" data-date-field="${field}" aria-label="الشهر التالي">›</button>
      </div>
      <div class="calendar-weekdays">
        ${weekdayLabels.map((day) => `<span>${day}</span>`).join("")}
      </div>
      <div class="calendar-grid">${emptyDays}${days}</div>
    </div>
  `;
}

function renderEditor() {
  const groups = fields
    .map((group) => {
      const inputs = group.items
        .map(([key, label, type = "text"]) => {
          if (type === "textarea") {
            return `
              <div class="field">
                <label for="${key}">${label}</label>
                <textarea id="${key}" data-key="${key}" placeholder="${escapeHtml(label)}">${escapeHtml(quotationData[key])}</textarea>
              </div>
            `;
          }

          if (type === "checkbox") {
            return `
              <div class="field toggle-field">
                <label for="${key}">${label}</label>
                <input id="${key}" data-key="${key}" type="checkbox" ${quotationData[key] ? "checked" : ""}>
              </div>
            `;
          }

          if (type === "date") {
            const field = dateFieldFor(key);
            const config = dateFieldConfig[field];
            return `
              <div class="field date-field">
                <label for="${key}">${label}</label>
                <div class="date-input-row">
                  <input id="${key}" class="date-input" data-date-input data-date-field="${field}" type="text" value="${escapeHtml(quotationData[config.primaryKey] || "")}" placeholder="${escapeHtml(label)}" readonly aria-haspopup="dialog" aria-expanded="false">
                  <span class="inline-hijri-date">${escapeHtml(quotationData[config.secondaryKey] || "")}</span>
                </div>
                ${renderDatePicker(field)}
              </div>
            `;
          }

          if (type === "select") {
            const options = projectTypeOptions
              .map((option) => `<option value="${escapeHtml(option)}" ${option === quotationData[key] ? "selected" : ""}>${escapeHtml(option)}</option>`)
              .join("");

            return `
              <div class="field">
                <label for="${key}">${label}</label>
                <select id="${key}" data-key="${key}">
                  ${options}
                </select>
              </div>
            `;
          }

          if (type === "permit") {
            const options = permitTypeOptions
              .map((permit) => `<option value="${escapeHtml(permit.value)}" ${permit.value === quotationData[key] ? "selected" : ""}>${escapeHtml(permit.value)}</option>`)
              .join("");

            return `
              <div class="field">
                <label for="${key}">${label}</label>
                <select id="${key}" data-key="${key}">
                  ${options}
                </select>
              </div>
            `;
          }

          if (type === "clientTitle") {
            const options = clientTitleOptions
              .map((option) => `<option value="${escapeHtml(option)}" ${option === quotationData[key] ? "selected" : ""}>${escapeHtml(option)}</option>`)
              .join("");

            return `
              <div class="field client-name-row">
                <div>
                  <label for="${key}">${label}</label>
                  <select id="${key}" data-key="${key}">
                    ${options}
                  </select>
                </div>
                <div>
                  <label for="clientName">اسم العميل</label>
                  <input id="clientName" data-key="clientName" type="text" placeholder="اسم العميل" value="${escapeHtml(quotationData.clientName)}">
                </div>
              </div>
            `;
          }

          if (key === "clientName") {
            return "";
          }

          if (type === "money") {
            return `
              <div class="field">
                <label for="${key}">${label}</label>
                <div class="money-input-row">
                  <input id="${key}" data-key="${key}" data-money-key="${key}" type="text" inputmode="decimal" placeholder="0" value="${escapeHtml(getMoneyInputValue(quotationData[key]))}">
                  <span>ريال</span>
                </div>
              </div>
            `;
          }

          if (type.startsWith("unit:")) {
            const unit = type.slice(5);
            return `
              <div class="field">
                <label for="${key}">${label}</label>
                <div class="money-input-row">
                  <input id="${key}" data-key="${key}" data-unit="${escapeHtml(unit)}" type="text" inputmode="decimal" placeholder="${escapeHtml(label)}" value="${escapeHtml(getUnitInputValue(quotationData[key]))}">
                  <span>${escapeHtml(unit)}</span>
                </div>
              </div>
            `;
          }

          return `
            <div class="field">
              <label for="${key}">${label}</label>
              <input id="${key}" data-key="${key}" type="text" placeholder="${escapeHtml(label)}" value="${escapeHtml(quotationData[key])}">
            </div>
          `;
        })
        .join("");

      return `
        <section class="form-group">
          <h3>${group.title}</h3>
          ${inputs}
        </section>
      `;
    })
    .join("");

  const optionalServiceInputs = quotationData.optionalServices
    .map((service, index) => {
      const servicePriceValue = getMoneyInputValue(service.price);
      const serviceInput = servicePriceValue
        ? `
          <div class="money-input-row">
            <input id="service-${index}" data-service-index="${index}" data-money-service-index="${index}" type="text" inputmode="decimal" value="${escapeHtml(servicePriceValue)}">
            <span>${escapeHtml(getOptionalServicePriceUnit(service))}</span>
          </div>
        `
        : `<input id="service-${index}" data-service-index="${index}" type="text" value="${escapeHtml(service.price)}">`;

      return `
        <div class="field">
          <label for="service-${index}">${escapeHtml(service.name)}</label>
          ${serviceInput}
        </div>
      `;
    })
    .join("");

  const paymentScheduleInputs = quotationData.paymentSchedule
    .map((payment, index) => `
      <div class="field payment-field">
        <label for="payment-percent-${index}">${escapeHtml(payment.label)}</label>
        <input id="payment-percent-${index}" data-payment-index="${index}" type="text" inputmode="decimal" value="${escapeHtml(payment.percent)}">
      </div>
    `)
    .join("");

  const scopeGroupsInputs = quotationData.scopeGroups
    .map((group, groupIndex) => {
      const itemsMarkup = group.items
        .map((item, itemIndex) => `
          <div class="scope-check-row">
            <label class="scope-check">
              <input type="checkbox" data-scope-group="${groupIndex}" data-scope-item="${itemIndex}" ${item.enabled !== false ? "checked" : ""}>
              <span>${escapeHtml(item.name)}</span>
            </label>
            <button type="button" class="scope-remove" data-scope-remove="${groupIndex}:${itemIndex}" aria-label="إزالة ${escapeHtml(item.name)}" title="إزالة البند">×</button>
          </div>
        `)
        .join("");

      return `
        <div class="scope-editor-group">
          <h4>${escapeHtml(group.number)} · ${escapeHtml(group.title)}</h4>
          ${itemsMarkup}
          <div class="scope-add-row">
            <input type="text" data-scope-add-input="${groupIndex}" placeholder="إضافة بند جديد…" aria-label="إضافة بند إلى ${escapeHtml(group.title)}">
            <button type="button" class="scope-add" data-scope-add="${groupIndex}">إضافة</button>
          </div>
        </div>
      `;
    })
    .join("");

  editorForm.innerHTML = `
    ${groups}
    <section class="form-group scope-editor">
      <h3>نطاق الأعمال</h3>
      <p class="scope-hint">البنود المحددة تظهر في العرض. أزِل التحديد لإخفاء بند دون حذفه، أو أضِف بنوداً جديدة.</p>
      ${scopeGroupsInputs}
    </section>
    <section class="form-group">
      <h3>نسب جدول الدفعات والضريبة</h3>
      ${paymentScheduleInputs}
    </section>
    <section class="form-group">
      <h3>أسعار الخدمات الاختيارية</h3>
      ${optionalServiceInputs}
    </section>
  `;
}

function renderProjectsPanel() {
  if (!projectsList) {
    return;
  }

  const projects = savedProjects
    .map((project) => {
      const activeClass = project.id === activeProjectId ? " is-active" : "";
      const projectData = project.data || {};
      const projectMeta = [
        projectData.city,
        projectData.district,
        formatProjectUpdatedAt(project.updatedAt)
      ].filter(Boolean).join(" • ");

      return `
        <button class="project-item${activeClass}" type="button" data-project-id="${escapeHtml(project.id)}">
          <strong>${escapeHtml(project.name)}</strong>
          <span>${escapeHtml(projectMeta)}</span>
        </button>
      `;
    })
    .join("");

  projectsList.innerHTML = projects || `<p class="empty-projects">لا توجد مشاريع محفوظة بعد.</p>`;
  renderSaveStatus();
}

function getProjectRows() {
  return [
    ["اسم العميل", quotationData.clientName ? getClientDisplayName(quotationData) : ""],
    ["نوع المشروع", quotationData.projectType],
    ["المدينة", quotationData.city],
    ["الحي", quotationData.district],
    ["رقم المخطط", quotationData.planNumber],
    ["رقم القطعة", quotationData.plotNumber],
    ["مساحة الأرض", quotationData.landArea],
    ["رقم الصك", quotationData.deedNumber],
    ["تاريخ الصك", quotationData.deedDate]
  ];
}

function renderFooter(pageNumber, totalPages) {
  return `
    <footer class="doc-footer">
      <img class="brand-footer" src="${escapeHtml(quotationData.footerImagePath)}" alt="بيانات التواصل الخاصة بشركة الدر النفيس">
      <span class="page-number">${pageNumber}/${totalPages}</span>
    </footer>
  `;
}

function renderClosingBlock() {
  return `
    <section class="closing-block">
      <p>${escapeHtml(quotationData.closingText)}</p>
      <p class="closing-regards">وتفضلوا بقبول فائق الاحترام والتقدير</p>
      <img class="closing-signature" src="${escapeHtml(quotationData.signaturePath)}" alt="توقيع وختم شركة الدر النفيس للاستشارات الهندسية">
    </section>
  `;
}

function renderDatePair() {
  return `
    <span class="date-pair">
      <span>${escapeHtml(quotationData.date)}</span>
      <span class="date-hijri">${escapeHtml(quotationData.hijriDate)}</span>
    </span>
  `;
}

function pageShell(title, body, pageNumber, totalPages, isLast = false) {
  return `
    <article class="page${isLast ? " is-last-page" : ""}">
      <div class="page-content">
        <header class="doc-header">
          <div>
            <div class="doc-company">${escapeHtml(quotationData.companyName)}</div>
            <div class="doc-meta">عرض رقم ${escapeHtml(quotationData.quotationNumber)} · ${renderDatePair()}</div>
          </div>
          <img class="doc-logo" src="${escapeHtml(quotationData.logoPath)}" alt="">
        </header>
        <h2 class="page-title">${title}</h2>
        ${body}
        ${isLast ? "" : renderFooter(pageNumber, totalPages)}
      </div>
    </article>
  `;
}

function renderCover(totalPages) {
  return `
    <article class="page cover">
      <div class="page-content">
        <div class="cover-top">
          <img class="cover-logo" src="${escapeHtml(quotationData.logoPath)}" alt="">
          <div class="cover-badge">عرض سعر رسمي</div>
        </div>
        <section class="cover-title">
          <p class="kicker">${escapeHtml(quotationData.companyName)}</p>
          <h2>${escapeHtml(getPermitTitle())}</h2>
          <p>${escapeHtml(quotationData.projectType)} — ${ph(quotationData.city, "المدينة")}</p>
        </section>
        <section class="cover-grid">
          <div class="info-card"><span>العميل</span><strong>${ph(quotationData.clientName ? getClientDisplayName(quotationData) : "", "اسم العميل")}</strong></div>
          <div class="info-card"><span>موقع المشروع</span><strong>${ph(quotationData.district, "الحي")}، ${ph(quotationData.city, "المدينة")}</strong></div>
          <div class="info-card"><span>مساحة الأرض</span><strong>${ph(quotationData.landArea, "مساحة الأرض")}</strong></div>
          <div class="info-card"><span>رقم العرض</span><strong>${ph(quotationData.quotationNumber, "رقم العرض")}</strong></div>
          <div class="info-card"><span>التاريخ</span><strong>${escapeHtml(quotationData.date)}</strong><em class="date-hijri">${escapeHtml(quotationData.hijriDate)}</em></div>
          <div class="info-card"><span>مدة الصلاحية</span><strong>${escapeHtml(quotationData.validityPeriod)}</strong></div>
        </section>
        ${renderFooter(1, totalPages)}
      </div>
    </article>
  `;
}

function renderSummary(totalPages) {
  const rows = getProjectRows()
    .map(([label, value]) => `<tr><th>${label}</th><td>${ph(value, label)}</td></tr>`)
    .join("");

  return pageShell(
    "ملخص المشروع",
    `
      <p class="intro">
        بناءً على بيانات الأرض المقدمة، تقدم ${escapeHtml(quotationData.companyName)} عرضها لتصميم وإصدار رخصة بناء
        ل${escapeHtml(quotationData.projectType)} في حي ${ph(quotationData.district, "الحي")} بمدينة ${ph(quotationData.city, "المدينة")}،
        من خلال باقة متكاملة تشمل الدراسات الأولية، التصميم المعماري، المخططات الهندسية، المنظور الخارجي،
        وإجراءات إصدار رخصة البناء.
      </p>
      <table class="data-table"><tbody>${rows}</tbody></table>
    `,
    2,
    totalPages
  );
}

function renderScope(totalPages) {
  const body = quotationData.scopeGroups
    .map((group) => {
      const items = group.items.filter((item) => item.enabled !== false);

      if (!items.length) {
        return "";
      }

      return `
        <section class="scope-section">
          <div class="scope-heading"><span>${escapeHtml(group.number)}</span>${escapeHtml(group.title)}</div>
          <ul class="scope-list">
            ${items.map((item) => `
              <li class="scope-item">
                ${buildIcon(item.name)}
                <div>
                  <strong>${escapeHtml(item.name)}</strong>
                  <small class="scope-description">${escapeHtml(scopeDescriptionMap[item.name] || "")}</small>
                </div>
              </li>
            `).join("")}
          </ul>
        </section>
      `;
    })
    .join("");

  return pageShell("نطاق الأعمال", body, 3, totalPages);
}

function renderDeliverables(totalPages) {
  return pageShell(
    "المخرجات المتوقعة",
    `
      <ul class="deliverables-list">
        ${quotationData.deliverables.map((item) => `<li class="deliverable"><span class="check">✓</span><span>${escapeHtml(item)}</span></li>`).join("")}
      </ul>
      <div class="note">${escapeHtml(quotationData.notes)}</div>
    `,
    4,
    totalPages
  );
}

function renderFinancial(totalPages) {
  const terms = [
    ...quotationData.financialTerms,
    `العرض صالح لمدة ${quotationData.validityPeriod}`
  ];
  const closingBlock = quotationData.showOptionalAnnex ? "" : renderClosingBlock();

  return pageShell(
    "العرض المالي",
    `
      <div class="price-card">
        <span>القيمة الأساسية للعرض</span>
        <strong>${ph(formatRiyalAmount(quotationData.mainPriceNumber), "قيمة العرض")}</strong>
        <em>${ph(quotationData.mainPriceWritten, "القيمة كتابةً")}</em>
      </div>
      <ul class="terms-list">
        ${terms.map((term) => `<li>${escapeHtml(term)}</li>`).join("")}
      </ul>
      <h3 class="scope-heading"><span>٪</span>جدول الدفعات + الضريبة 15%</h3>
      <div class="payment-grid">
        ${quotationData.paymentSchedule.map((payment) => {
          const amount = getPaymentAmount(payment.percent);

          return `
            <div class="payment-step">
              <strong>${formatPercent(escapeHtml(payment.percent))}</strong>
              <span>${escapeHtml(payment.label)}</span>
              <small>${formatMoneyAmount(amount.subtotal)} + ضريبة 15%</small>
              <em>${formatMoneyAmount(amount.total)} ريال</em>
            </div>
          `;
        }).join("")}
      </div>
      ${closingBlock}
    `,
    5,
    totalPages,
    !quotationData.showOptionalAnnex
  );
}

function renderOptionalAnnex(totalPages) {
  const rows = quotationData.optionalServices
    .map((service) => `
      <tr>
        <td>${escapeHtml(service.name)}</td>
        <td>${escapeHtml(service.description)}</td>
        <td>${escapeHtml(getOptionalServiceDisplayPrice(service))}</td>
      </tr>
    `)
    .join("");

  return pageShell(
    "ملحق الخدمات الاختيارية",
    `
      <table class="services-table">
        <thead>
          <tr>
            <th>الخدمة</th>
            <th>الوصف</th>
            <th>السعر</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="note">
        ${escapeHtml(quotationData.optionalAnnexNote)}
      </div>
      ${renderClosingBlock()}
    `,
    6,
    totalPages,
    true
  );
}

function renderPreview() {
  const totalPages = quotationData.showOptionalAnnex ? 6 : 5;
  const pages = [
    renderCover(totalPages),
    renderSummary(totalPages),
    renderScope(totalPages),
    renderDeliverables(totalPages),
    renderFinancial(totalPages)
  ];

  if (quotationData.showOptionalAnnex) {
    pages.push(renderOptionalAnnex(totalPages));
  }

  preview.innerHTML = pages.join("");
  pageCount.textContent = `${pages.length} صفحات`;
  applyPreviewZoom();
  flagPageOverflow();
}

// A non-overflowing page keeps the A4 aspect ratio (297/210). Any page taller than
// that has content spilling past one sheet, so we mark it and warn instead of letting
// the old `overflow: hidden` silently clip it out of the printed PDF. The ratio test is
// independent of the current preview zoom.
function flagPageOverflow() {
  if (!overflowWarning) {
    return;
  }

  const a4Ratio = 297 / 210;
  const pages = Array.from(preview.querySelectorAll(".page"));
  const overflowing = [];

  pages.forEach((page, index) => {
    const rect = page.getBoundingClientRect();
    const isOverflowing = rect.width > 0 && rect.height / rect.width > a4Ratio * 1.03;
    page.classList.toggle("is-overflowing", isOverflowing);

    if (isOverflowing) {
      overflowing.push(index + 1);
    }
  });

  if (overflowing.length) {
    overflowWarning.textContent = `⚠ المحتوى يتجاوز مقاس الصفحة (${overflowing.join("، ")}) وقد يمتد لورقة إضافية عند الطباعة. يُنصح باختصار النص.`;
    overflowWarning.hidden = false;
  } else {
    overflowWarning.hidden = true;
  }
}

function renderZoomControls() {
  zoomButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.previewZoom === previewZoom);
  });
}

function applyPreviewZoom() {
  const page = preview.querySelector(".page");
  const shell = preview.closest(".preview-shell");

  if (!page || !shell) {
    return;
  }

  let scale = previewZoom === "75" ? 0.75 : 1;

  if (previewZoom === "fit") {
    preview.style.setProperty("--preview-zoom", "1");
    const pageWidth = page.getBoundingClientRect().width;
    const availableWidth = shell.clientWidth - 16;
    scale = Math.min(1, Math.max(0.42, availableWidth / pageWidth));
  }

  preview.style.setProperty("--preview-zoom", String(scale));
  renderZoomControls();
}

function setPreviewZoom(zoomMode) {
  previewZoom = zoomMode;
  applyPreviewZoom();
}

function renderApp() {
  renderEditor();
  renderPreview();
  renderProjectsPanel();
}

function showDatePicker(field) {
  hideDatePicker();

  const picker = document.querySelector(`[data-date-picker="${field}"]`);
  const input = document.querySelector(`[data-date-input][data-date-field="${field}"]`);

  if (!picker || !input) {
    return;
  }

  picker.hidden = false;
  input.setAttribute("aria-expanded", "true");
}

function hideDatePicker() {
  document.querySelectorAll("[data-date-picker]").forEach((picker) => {
    picker.hidden = true;
  });
  document.querySelectorAll("[data-date-input]").forEach((input) => {
    input.setAttribute("aria-expanded", "false");
  });
}

function updateEditorValue(event) {
  const input = event.target;
  const key = input.dataset.key;
  const serviceIndex = input.dataset.serviceIndex;
  const paymentIndex = input.dataset.paymentIndex;

  if (input.dataset.scopeGroup !== undefined && input.dataset.scopeItem !== undefined) {
    quotationData.scopeGroups[Number(input.dataset.scopeGroup)].items[Number(input.dataset.scopeItem)].enabled = input.checked;
    renderPreview();
    saveActiveProject();
    return;
  }

  if (input.dataset.unit !== undefined && key) {
    const sanitized = sanitizeMoneyInput(input.value);
    if (input.value !== sanitized) {
      input.value = sanitized;
    }
    quotationData[key] = sanitized ? `${sanitized} ${input.dataset.unit}` : "";
    renderPreview();
    saveActiveProject();
    return;
  }

  if (input.dataset.moneyKey !== undefined || input.dataset.moneyServiceIndex !== undefined) {
    const sanitizedValue = sanitizeMoneyInput(input.value);
    if (input.value !== sanitizedValue) {
      input.value = sanitizedValue;
    }
  }

  if (key) {
    quotationData[key] = input.dataset.moneyKey !== undefined ? formatRiyalAmount(input.value) : input.type === "checkbox" ? input.checked : input.value;
  }

  if (serviceIndex !== undefined) {
    quotationData.optionalServices[Number(serviceIndex)].price = input.dataset.moneyServiceIndex !== undefined ? formatRiyalAmount(input.value) : input.value;
  }

  if (paymentIndex !== undefined) {
    quotationData.paymentSchedule[Number(paymentIndex)].percent = input.value;
  }

  renderPreview();
  saveActiveProject();
}

function addScopeItem(groupIndex) {
  const input = editorForm.querySelector(`[data-scope-add-input="${groupIndex}"]`);
  const name = input ? input.value.trim() : "";

  if (!name) {
    return;
  }

  quotationData.scopeGroups[groupIndex].items.push({ name, enabled: true });
  renderEditor();
  renderPreview();
  saveActiveProject();

  const nextInput = editorForm.querySelector(`[data-scope-add-input="${groupIndex}"]`);
  if (nextInput) {
    nextInput.focus();
  }
}

function removeScopeItem(groupIndex, itemIndex) {
  const group = quotationData.scopeGroups[groupIndex];

  if (!group || !group.items[itemIndex]) {
    return;
  }

  group.items.splice(itemIndex, 1);
  renderEditor();
  renderPreview();
  saveActiveProject();
}

// A lone text input submits the form on Enter, which would reload the page; block that.
editorForm.addEventListener("submit", (event) => event.preventDefault());

editorForm.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.matches("[data-scope-add-input]")) {
    event.preventDefault();
    addScopeItem(Number(event.target.dataset.scopeAddInput));
  }
});

editorForm.addEventListener("input", updateEditorValue);

projectsList.addEventListener("click", (event) => {
  const projectButton = event.target.closest("[data-project-id]");

  if (projectButton) {
    switchProject(projectButton.dataset.projectId);
  }
});

editorForm.addEventListener("click", (event) => {
  const scopeAdd = event.target.closest("[data-scope-add]");
  const scopeRemove = event.target.closest("[data-scope-remove]");
  const dateInput = event.target.closest("[data-date-input]");
  const calendarNav = event.target.closest("[data-calendar-nav]");
  const dateChoice = event.target.closest("[data-date-choice]");

  if (scopeAdd) {
    addScopeItem(Number(scopeAdd.dataset.scopeAdd));
    return;
  }

  if (scopeRemove) {
    const [groupIndex, itemIndex] = scopeRemove.dataset.scopeRemove.split(":").map(Number);
    removeScopeItem(groupIndex, itemIndex);
    return;
  }

  if (dateInput) {
    showDatePicker(dateInput.dataset.dateField);
    return;
  }

  if (calendarNav) {
    const field = calendarNav.dataset.dateField;
    datePickerMonths[field] = shiftMonth(datePickerMonths[field] || quotationData.dateIso, Number(calendarNav.dataset.calendarNav));
    renderEditor();
    showDatePicker(field);
    return;
  }

  if (dateChoice) {
    const field = dateChoice.dataset.dateField;
    dateFieldConfig[field].apply(dateChoice.dataset.dateChoice);
    datePickerMonths[field] = quotationData[dateFieldConfig[field].isoKey];
    renderEditor();
    renderPreview();
    saveActiveProject();
  }
});

editorForm.addEventListener("focusin", (event) => {
  if (event.target.matches("[data-date-input]")) {
    showDatePicker(event.target.dataset.dateField);
  }
});

editorForm.addEventListener("change", (event) => {
  if (event.target.matches("select") || event.target.type === "checkbox") {
    updateEditorValue(event);
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".date-field")) {
    hideDatePicker();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideDatePicker();
  }
});

printBtn.addEventListener("click", () => {
  preparePrintTitle();
  window.print();
});

window.addEventListener("afterprint", restorePrintTitle);

shareWhatsappBtn.addEventListener("click", shareViaWhatsApp);

resetBtn.addEventListener("click", () => {
  const defaults = JSON.parse(initialSnapshot);
  Object.keys(quotationData).forEach((key) => delete quotationData[key]);
  Object.assign(quotationData, defaults);
  datePickerMonths.quotation = quotationData.dateIso;
  datePickerMonths.deed = quotationData.deedDateIso || quotationData.dateIso;
  renderApp();
  saveActiveProject();
});

newProjectBtn.addEventListener("click", createNewProject);
saveProjectBtn.addEventListener("click", saveActiveProject);
duplicateProjectBtn.addEventListener("click", duplicateActiveProject);
deleteProjectBtn.addEventListener("click", deleteActiveProject);
zoomButtons.forEach((button) => {
  button.addEventListener("click", () => setPreviewZoom(button.dataset.previewZoom));
});
window.addEventListener("resize", () => {
  if (previewZoom === "fit") {
    applyPreviewZoom();
  }
});
window.addEventListener("load", flagPageOverflow);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(flagPageOverflow);
}

/* ----------------------------------------------------------------------------
   Automatic backup of all saved projects to a real file.
   Primary path: File System Access API — the secretary picks a backup file once
   (ideally inside a OneDrive/Documents folder for an offsite copy); afterwards the
   full project list is written to it silently on every change. The file handle is
   kept in IndexedDB so it survives relaunches. If the API is unavailable or blocked
   (e.g. some file:// setups), everything degrades to manual download/upload.
---------------------------------------------------------------------------- */

const BACKUP_DB_NAME = "duralNafisBackup";
const BACKUP_STORE = "kv";
const BACKUP_HANDLE_KEY = "backupFileHandle";
const BACKUP_FILE_SUGGESTED = "dural-nafis-quotations-backup.json";
const supportsFsAccess = typeof window.showSaveFilePicker === "function";

let backupFileHandle = null;
let backupState = "off"; // off | active | paused | unsupported
let lastBackupAt = "";
let backupTimer = 0;

function openBackupDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(BACKUP_DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(BACKUP_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet(key, value) {
  const db = await openBackupDb();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(BACKUP_STORE, "readwrite");
      tx.objectStore(BACKUP_STORE).put(value, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

async function idbGet(key) {
  const db = await openBackupDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(BACKUP_STORE, "readonly");
      const req = tx.objectStore(BACKUP_STORE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

function buildBackupPayload() {
  return JSON.stringify(
    {
      app: "dural-nafis-quotation-editor",
      version: 1,
      exportedAt: new Date().toISOString(),
      activeProjectId,
      projects: savedProjects
    },
    null,
    2
  );
}

function formatBackupTime(isoDate) {
  if (!isoDate) {
    return "";
  }

  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(isoDate));
}

function renderBackupStatus() {
  if (!backupStatusEl) {
    return;
  }

  const messages = {
    off: "النسخ الاحتياطي التلقائي غير مُفعّل",
    active: lastBackupAt ? `النسخ الاحتياطي مفعّل ✓ — آخر نسخة ${formatBackupTime(lastBackupAt)}` : "النسخ الاحتياطي مفعّل ✓",
    paused: "النسخ الاحتياطي متوقف — اضغط للاستئناف",
    unsupported: "النسخ التلقائي غير متاح في هذا المتصفح — استخدم النسخ اليدوي"
  };

  backupStatusEl.textContent = messages[backupState] || messages.off;
  backupStatusEl.dataset.state = backupState;

  if (enableBackupBtn) {
    enableBackupBtn.hidden = backupState === "unsupported";
    enableBackupBtn.textContent =
      backupState === "active"
        ? "تغيير ملف النسخ الاحتياطي"
        : backupState === "paused"
          ? "استئناف النسخ الاحتياطي"
          : "تفعيل النسخ الاحتياطي التلقائي";
  }
}

async function verifyHandlePermission(handle, withRequest) {
  if (!handle || !handle.queryPermission) {
    return false;
  }

  const options = { mode: "readwrite" };

  if ((await handle.queryPermission(options)) === "granted") {
    return true;
  }

  return withRequest && (await handle.requestPermission(options)) === "granted";
}

async function writeBackupToHandle() {
  const writable = await backupFileHandle.createWritable();
  await writable.write(buildBackupPayload());
  await writable.close();
  lastBackupAt = new Date().toISOString();
}

function scheduleBackup() {
  if (backupState !== "active" || !supportsFsAccess || !backupFileHandle) {
    return;
  }

  clearTimeout(backupTimer);
  backupTimer = setTimeout(async () => {
    try {
      if (!(await verifyHandlePermission(backupFileHandle, false))) {
        backupState = "paused";
        renderBackupStatus();
        return;
      }

      await writeBackupToHandle();
      renderBackupStatus();
    } catch (error) {
      backupState = "paused";
      renderBackupStatus();
    }
  }, 1500);
}

function downloadBackup() {
  const blob = new Blob([buildBackupPayload()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = BACKUP_FILE_SUGGESTED;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  lastBackupAt = new Date().toISOString();
}

async function enableAutoBackup() {
  if (!supportsFsAccess) {
    downloadBackup();
    return;
  }

  try {
    backupFileHandle = await window.showSaveFilePicker({
      suggestedName: BACKUP_FILE_SUGGESTED,
      types: [{ description: "JSON", accept: { "application/json": [".json"] } }]
    });
    await idbSet(BACKUP_HANDLE_KEY, backupFileHandle);
    await writeBackupToHandle();
    backupState = "active";
    renderBackupStatus();
  } catch (error) {
    if (error && error.name !== "AbortError") {
      backupState = "unsupported";
      renderBackupStatus();
    }
  }
}

async function backupNow() {
  if (!supportsFsAccess) {
    downloadBackup();
    renderBackupStatus();
    return;
  }

  if (!backupFileHandle) {
    await enableAutoBackup();
    return;
  }

  try {
    if (!(await verifyHandlePermission(backupFileHandle, true))) {
      backupState = "paused";
      renderBackupStatus();
      return;
    }

    await writeBackupToHandle();
    backupState = "active";
    renderBackupStatus();
  } catch (error) {
    backupState = "paused";
    renderBackupStatus();
  }
}

function applyRestoredPayload(text) {
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch (error) {
    window.alert("تعذّر قراءة ملف النسخة الاحتياطية.");
    return;
  }

  const projects = Array.isArray(parsed) ? parsed : parsed && parsed.projects;
  const validProjects = Array.isArray(projects)
    ? projects.filter((project) => project && project.id && project.data)
    : [];

  if (!validProjects.length) {
    window.alert("الملف لا يحتوي على مشاريع صالحة.");
    return;
  }

  if (!window.confirm(`سيتم استبدال المشاريع الحالية بـ ${validProjects.length} مشروعًا من النسخة الاحتياطية. هل تريد المتابعة؟`)) {
    return;
  }

  savedProjects = validProjects;
  activeProjectId =
    parsed && parsed.activeProjectId && validProjects.some((project) => project.id === parsed.activeProjectId)
      ? parsed.activeProjectId
      : validProjects[0].id;
  applyProjectData(getActiveProject().data);
  persistProjects();
  renderApp();
}

async function restoreBackup() {
  if (supportsFsAccess && typeof window.showOpenFilePicker === "function") {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: "JSON", accept: { "application/json": [".json"] } }]
      });
      const file = await handle.getFile();
      applyRestoredPayload(await file.text());
    } catch (error) {
      if (error && error.name !== "AbortError") {
        window.alert("تعذّرت استعادة النسخة الاحتياطية.");
      }
    }
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json,.json";
  input.addEventListener("change", () => {
    const file = input.files && input.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => applyRestoredPayload(String(reader.result));
    reader.readAsText(file);
  });
  input.click();
}

async function initializeBackup() {
  if (!supportsFsAccess) {
    backupState = "unsupported";
    renderBackupStatus();
    return;
  }

  try {
    const handle = await idbGet(BACKUP_HANDLE_KEY);

    if (handle) {
      backupFileHandle = handle;
      backupState = (await verifyHandlePermission(handle, false)) ? "active" : "paused";
    }
  } catch (error) {
    backupState = "off";
  }

  renderBackupStatus();
}

if (enableBackupBtn) {
  enableBackupBtn.addEventListener("click", () => {
    if (backupState === "paused") {
      backupNow();
    } else {
      enableAutoBackup();
    }
  });
}

if (backupNowBtn) {
  backupNowBtn.addEventListener("click", backupNow);
}

if (restoreBackupBtn) {
  restoreBackupBtn.addEventListener("click", restoreBackup);
}

// Best-effort immediate flush of the latest changes when the window is hidden or closed,
// bypassing the debounce (which would not fire in time on an actual close).
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "hidden" || backupState !== "active" || !backupFileHandle) {
    return;
  }

  clearTimeout(backupTimer);
  verifyHandlePermission(backupFileHandle, false)
    .then((granted) => (granted ? writeBackupToHandle() : null))
    .then(renderBackupStatus)
    .catch(() => {});
});

initializeProjects();
renderApp();
initializeBackup();
