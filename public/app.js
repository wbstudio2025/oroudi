const BRAND_PROFILE_STORAGE_KEY = "oroudiBrandProfile";

/* The brand profile is the office's identity and templates: everything that belongs to
   the office rather than to a single quotation. The app ships with the Dural Nafis
   profile as the seed; any office can replace all of it from إعدادات المكتب without
   touching code. Persisted separately from projects so a logo or footer change applies
   to every quotation at once. */
const defaultBrandProfile = {
  version: 1,
  companyName: "شركة الدر النفيس للاستشارات الهندسية",
  logoPath: "assets/LOGO.png",
  logoDataUrl: "",
  signaturePath: "assets/Signature.png",
  signatureDataUrl: "",
  closingText: "نأمل أن ينال عرضنا هذا استحسانكم، ونتطلع إلى خدمتكم بما يحقق تطلعاتكم.",
  // The footer is always the structured strip rendered from these fields — no
  // designed artwork needed; an office is print-ready straight from the settings.
  footerFields: {
    crNumber: "",
    vatNumber: "",
    accreditation: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    qrDataUrl: ""
  },
  // Optional overrides of the new-quotation template (scope, deliverables, payment plan…)
  // captured via "حفظ القوائم الحالية كافتراضية للمكتب" in the settings dialog.
  defaults: null
};

function loadBrandProfile() {
  try {
    const parsed = JSON.parse(localStorage.getItem(BRAND_PROFILE_STORAGE_KEY) || "null");

    if (!parsed || typeof parsed !== "object") {
      return cloneData(defaultBrandProfile);
    }

    const profile = {
      ...cloneData(defaultBrandProfile),
      ...parsed,
      footerFields: { ...cloneData(defaultBrandProfile.footerFields), ...(parsed.footerFields || {}) }
    };

    // The image-footer mode was removed; the structured strip is the only footer now.
    delete profile.footerMode;
    delete profile.footerImagePath;
    delete profile.footerImageDataUrl;

    return profile;
  } catch (error) {
    return cloneData(defaultBrandProfile);
  }
}

function persistBrandProfileLocal() {
  localStorage.setItem(BRAND_PROFILE_STORAGE_KEY, JSON.stringify(brandProfile));
}

function persistBrandProfile() {
  persistBrandProfileLocal();
  scheduleCloudBrandSync();
}

function getLogoSrc() {
  return brandProfile.logoDataUrl || brandProfile.logoPath;
}

function getSignatureSrc() {
  return brandProfile.signatureDataUrl || brandProfile.signaturePath;
}

let brandProfile = loadBrandProfile();

const quotationData = {
  quotationNumber: "",
  dateIso: "2026-05-17",
  date: "17 مايو 2026",
  hijriDate: "",
  validityPeriod: "10 أيام",
  clientTitle: "السيد",
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  responsibleTitle: "المهندس",
  responsibleName: "",
  responsiblePhone: "",
  serviceCategory: "رخص البناء",
  permitType: "إصدار رخصة بناء",
  serviceIsCustom: false,
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
  mainPriceWrittenManual: false,
  bilingual: false,
  notes: "",
  showOptionalAnnex: true,
  showDeliverables: true,
  // Editor-only: per-section title overrides (id → custom title) for the input panel.
  sectionTitles: {},
  // User-added sections that print as their own page in the quotation:
  // [{ id: "custom:…", title, items: ["line", …] }].
  customSections: [],
  scopeGroups: [
    {
      number: "01",
      title: "الأعمال الأولية",
      items: [
        { name: "رفع مساحي", enabled: true, description: "تحديد مناسيب وحدود الموقع بدقة." },
        { name: "إصدار قرار مساحي", enabled: true, description: "تجهيز متطلبات القرار عبر الجهات المختصة." },
        { name: "دراسة تربة", enabled: true, description: "تقييم خواص التربة كأساس للتصميم." }
      ]
    },
    {
      number: "02",
      title: "التصميم والمخططات الهندسية",
      items: [
        { name: "التصميم المعماري", enabled: true, description: "توزيع الفراغات والواجهات حسب احتياج المشروع." },
        { name: "التصميم الإنشائي", enabled: true, description: "حساب النظام الإنشائي والعناصر الحاملة." },
        { name: "التصميم الكهربائي", enabled: true, description: "تخطيط الأحمال ومسارات التمديدات الكهربائية." },
        { name: "التصميم الميكانيكي", enabled: true, description: "تنسيق التكييف والصرف والتغذية." }
      ]
    },
    {
      number: "03",
      title: "التصور والرخصة",
      items: [
        { name: "منظور خارجي واحد", enabled: true, description: "إظهار الواجهة الرئيسية بصورة واقعية." },
        { name: "إصدار رخصة بناء", enabled: true, description: "متابعة رفع الطلب حتى إصدار الرخصة." }
      ]
    }
  ],
  deliverables: [
    { name: "مخططات معمارية للرخصة", enabled: true },
    { name: "مخططات إنشائية", enabled: true },
    { name: "مخططات كهربائية", enabled: true },
    { name: "مخططات ميكانيكية", enabled: true },
    { name: "منظور خارجي واحد للواجهة الرئيسية", enabled: true },
    { name: "ملفات PDF للاعتماد", enabled: true },
    { name: "متابعة إصدار رخصة البناء", enabled: true }
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
const projectsList = document.querySelector("#projectsList");
const saveStatus = document.querySelector("#saveStatus");
const newProjectBtn = document.querySelector("#newProjectBtn");
const saveProjectBtn = document.querySelector("#saveProjectBtn");
const duplicateProjectBtn = document.querySelector("#duplicateProjectBtn");
const loginOverlay = document.querySelector("#loginOverlay");
const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const resetPasswordConfirm = document.querySelector("#resetPasswordConfirm");
const loginStatus = document.querySelector("#loginStatus");
const loginSubmitBtn = document.querySelector("#loginSubmitBtn");
const loginHeading = document.querySelector("#loginHeading");
const loginIntro = document.querySelector("#loginIntro");
const forgotPasswordBtn = document.querySelector("#forgotPasswordBtn");
const authModeToggle = document.querySelector("#authModeToggle");
const authSwitchPrompt = document.querySelector("#authSwitchPrompt");
const authSwitch = document.querySelector("#authSwitch");
const continueLocalBtn = document.querySelector("#continueLocalBtn");
const signupOfficeName = document.querySelector("#signupOfficeName");
const officeNameLabel = document.querySelector("#officeNameLabel");
const resetPasswordConfirmLabel = document.querySelector("#resetPasswordConfirmLabel");
const syncStatus = document.querySelector("#syncStatus");
const cloudLoginBtn = document.querySelector("#cloudLoginBtn");
const logoutBtn = document.querySelector("#logoutBtn");

let authMode = "signin";

const PROJECTS_STORAGE_KEY = "duralNafisQuotationProjects";
const ACTIVE_PROJECT_STORAGE_KEY = "duralNafisActiveQuotationProject";
const LOCAL_MODE_STORAGE_KEY = "oroudiLocalMode";
const ORIGINAL_DOCUMENT_TITLE = document.title;
const CLOUD_SYNC_DEBOUNCE_MS = 900;

const cloudState = {
  client: null,
  configured: false,
  ready: false,
  officeId: "",
  syncing: false,
  projectTimer: 0,
  brandTimer: 0,
  pendingDeleteIds: new Set(),
  applyingCloud: false,
  authListenerBound: false
};

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

// نوع المشروع adapts to the chosen service category: building services list building types
// (the default above), while surveying lists land / plot types. Any category can override here;
// unlisted categories fall back to the building list.
const projectTypesByCategory = {
  "أعمال المساحة": [
    "أرض سكنية",
    "أرض تجارية",
    "أرض زراعية",
    "قطعة ضمن مخطط",
    "أرض فضاء",
    "مزرعة",
    "استراحة",
    "مجمع أراضٍ"
  ]
};

function getProjectTypeOptions(category) {
  return projectTypesByCategory[category] || projectTypeOptions;
}

// Built-in curated catalog of Saudi engineering-office services, grouped by category so the
// editor can show a short, filtered list (فئة الخدمة → نوع الخدمة) instead of one long dropdown.
// Each service carries its own cover title plus a tailored scope of work and deliverables that
// load automatically when the service is selected (still editable, with the reset buttons).
// scopeGroups/deliverables === null means "use the office's default lists" (getDefaultQuotationData) —
// the canonical building permit keeps honoring each office's saved defaults for backward compatibility.
const serviceCatalog = [
  {
    category: "رخص البناء",
    services: [
      {
        value: "إصدار رخصة بناء",
        title: "عرض خدمات التصميم وإصدار رخصة بناء",
        scopeGroups: null,
        deliverables: null
      },
      {
        value: "إصدار رخصة تسوير",
        title: "عرض خدمات التصميم وإصدار رخصة تسوير",
        scopeGroups: [
          {
            number: "01",
            title: "الأعمال الأولية",
            items: [
              { name: "رفع مساحي", enabled: true, description: "تحديد حدود الأرض ومناسيبها." },
              { name: "إصدار قرار مساحي", enabled: true, description: "تجهيز متطلبات القرار عبر الجهات المختصة." }
            ]
          },
          {
            number: "02",
            title: "تصميم السور والرخصة",
            items: [
              { name: "تصميم السور والبوابات", enabled: true, description: "تصميم الواجهات والمداخل للسور." },
              { name: "المخطط الإنشائي للسور", enabled: true, description: "حساب الأساسات والعناصر الحاملة للسور." },
              { name: "إصدار رخصة التسوير", enabled: true, description: "متابعة رفع الطلب حتى إصدار الرخصة." }
            ]
          }
        ],
        deliverables: [
          { name: "مخطط السور المعتمد", enabled: true },
          { name: "مخطط إنشائي للسور", enabled: true },
          { name: "ملفات PDF للاعتماد", enabled: true },
          { name: "متابعة إصدار رخصة التسوير", enabled: true }
        ]
      },
      {
        value: "إضافة وتعديل مكونات بناء",
        title: "عرض خدمات إضافة وتعديل مكونات بناء",
        scopeGroups: [
          {
            number: "01",
            title: "الرفع والتقييم",
            items: [
              { name: "رفع مساحي للوضع القائم", enabled: true, description: "توثيق المبنى القائم قبل التعديل." },
              { name: "تقييم المكونات الحالية", enabled: true, description: "تحديد ما يُضاف أو يُعدّل." }
            ]
          },
          {
            number: "02",
            title: "التصميم والرخصة",
            items: [
              { name: "التصميم المعماري للإضافة والتعديل", enabled: true, description: "تصميم الفراغات الجديدة أو المعدّلة." },
              { name: "التصميم الإنشائي للإضافة", enabled: true, description: "ربط الإضافة بالنظام الإنشائي القائم." },
              { name: "إصدار رخصة الإضافة والتعديل", enabled: true, description: "متابعة الطلب حتى الاعتماد." }
            ]
          }
        ],
        deliverables: [
          { name: "مخططات الإضافة والتعديل", enabled: true },
          { name: "مخطط إنشائي للإضافة", enabled: true },
          { name: "ملفات PDF للاعتماد", enabled: true },
          { name: "متابعة إصدار الرخصة", enabled: true }
        ]
      },
      {
        value: "إصدار رخصة ترميم بناء",
        title: "عرض خدمات إصدار رخصة ترميم بناء",
        scopeGroups: [
          {
            number: "01",
            title: "المعاينة والتقييم",
            items: [
              { name: "معاينة المبنى القائم", enabled: true, description: "حصر الأعمال المطلوبة للترميم." },
              { name: "تقرير الحالة الإنشائية", enabled: true, description: "تقييم سلامة العناصر القائمة." }
            ]
          },
          {
            number: "02",
            title: "مخططات الترميم والرخصة",
            items: [
              { name: "إعداد مخططات الترميم", enabled: true, description: "توثيق أعمال المعالجة والتطوير." },
              { name: "إصدار رخصة الترميم", enabled: true, description: "متابعة الطلب حتى الاعتماد." }
            ]
          }
        ],
        deliverables: [
          { name: "تقرير حالة المبنى", enabled: true },
          { name: "مخططات الترميم", enabled: true },
          { name: "ملفات PDF للاعتماد", enabled: true },
          { name: "متابعة إصدار رخصة الترميم", enabled: true }
        ]
      },
      {
        value: "إصدار رخصة هدم بناء",
        title: "عرض خدمات إصدار رخصة هدم بناء",
        scopeGroups: [
          {
            number: "01",
            title: "الرفع والمعاينة",
            items: [
              { name: "رفع مساحي للموقع", enabled: true, description: "توثيق الموقع والمبنى المراد هدمه." },
              { name: "معاينة المبنى", enabled: true, description: "تقييم الوضع تمهيداً للهدم." }
            ]
          },
          {
            number: "02",
            title: "مخطط الهدم والإشراف",
            items: [
              { name: "إعداد مخطط الهدم واشتراطات السلامة", enabled: true, description: "تحديد آلية الهدم ومتطلبات السلامة." },
              { name: "تعهد الإشراف على الهدم", enabled: true, description: "إصدار التعهد المطلوب للرخصة." },
              { name: "إصدار رخصة الهدم", enabled: true, description: "متابعة الطلب حتى الاعتماد." }
            ]
          }
        ],
        deliverables: [
          { name: "مخطط الهدم", enabled: true },
          { name: "تعهد الإشراف على الهدم", enabled: true },
          { name: "ملفات PDF للاعتماد", enabled: true },
          { name: "متابعة إصدار رخصة الهدم", enabled: true }
        ]
      },
      {
        value: "تجديد رخصة بناء",
        title: "عرض خدمات تجديد رخصة بناء",
        scopeGroups: [
          {
            number: "01",
            title: "المراجعة والتجديد",
            items: [
              { name: "مراجعة الرخصة المنتهية", enabled: true, description: "حصر متطلبات التجديد." },
              { name: "تحديث بيانات الطلب", enabled: true, description: "تجهيز المستندات اللازمة." },
              { name: "متابعة إصدار الرخصة المجددة", enabled: true, description: "المتابعة حتى الاعتماد." }
            ]
          }
        ],
        deliverables: [
          { name: "تحديث ملف الرخصة", enabled: true },
          { name: "ملفات PDF للاعتماد", enabled: true },
          { name: "متابعة تجديد الرخصة", enabled: true }
        ]
      },
      {
        value: "تصحيح بيانات رخصة بناء",
        title: "عرض خدمات تصحيح بيانات رخصة بناء",
        scopeGroups: [
          {
            number: "01",
            title: "المراجعة والتصحيح",
            items: [
              { name: "مراجعة بيانات الرخصة الحالية", enabled: true, description: "حصر البنود المطلوب تصحيحها." },
              { name: "تقديم طلب التصحيح", enabled: true, description: "تجهيز ورفع طلب التصحيح." },
              { name: "متابعة اعتماد التصحيح", enabled: true, description: "المتابعة حتى الاعتماد." }
            ]
          }
        ],
        deliverables: [
          { name: "ملف التصحيح المعتمد", enabled: true },
          { name: "ملفات PDF للاعتماد", enabled: true },
          { name: "متابعة اعتماد التصحيح", enabled: true }
        ]
      }
    ]
  },
  {
    category: "التصاميم والدراسات",
    services: [
      {
        value: "التصميم المعماري والإنشائي",
        title: "عرض خدمات التصميم المعماري والإنشائي",
        scopeGroups: [
          {
            number: "01",
            title: "التصميم المعماري",
            items: [
              { name: "المخططات المعمارية", enabled: true, description: "توزيع الفراغات والواجهات حسب احتياج المشروع." },
              { name: "منظور خارجي واحد", enabled: true, description: "إظهار الواجهة الرئيسية بصورة واقعية." }
            ]
          },
          {
            number: "02",
            title: "التصميم الإنشائي",
            items: [
              { name: "حساب النظام الإنشائي", enabled: true, description: "تحديد النظام والعناصر الحاملة." },
              { name: "مخططات العناصر الإنشائية", enabled: true, description: "تفاصيل الأساسات والأعمدة والأسقف." }
            ]
          }
        ],
        deliverables: [
          { name: "مخططات معمارية", enabled: true },
          { name: "مخططات إنشائية", enabled: true },
          { name: "منظور خارجي واحد", enabled: true },
          { name: "ملفات PDF للتسليم", enabled: true }
        ]
      },
      {
        value: "التصميم الكهروميكانيكي",
        title: "عرض خدمات التصميم الكهروميكانيكي",
        scopeGroups: [
          {
            number: "01",
            title: "التصميم الكهربائي",
            items: [
              { name: "تخطيط الأحمال الكهربائية", enabled: true, description: "حساب الأحمال وتوزيع اللوحات." },
              { name: "مسارات التمديدات الكهربائية", enabled: true, description: "تخطيط مسارات الإنارة والقوى." }
            ]
          },
          {
            number: "02",
            title: "التصميم الميكانيكي",
            items: [
              { name: "تصميم التكييف والتهوية", enabled: true, description: "تحديد الأحمال الحرارية والأنظمة." },
              { name: "تصميم السباكة والصرف", enabled: true, description: "تنسيق التغذية والصرف." }
            ]
          }
        ],
        deliverables: [
          { name: "مخططات كهربائية", enabled: true },
          { name: "مخططات ميكانيكية", enabled: true },
          { name: "جداول الأحمال", enabled: true },
          { name: "ملفات PDF للتسليم", enabled: true }
        ]
      },
      {
        value: "دراسة التربة والفحص الجيوتقني",
        title: "عرض خدمات دراسة التربة",
        scopeGroups: [
          {
            number: "01",
            title: "الأعمال الميدانية",
            items: [
              { name: "حفر الجسات", enabled: true, description: "تنفيذ الجسات حسب مساحة الموقع." },
              { name: "أخذ العينات", enabled: true, description: "جمع عينات التربة للتحليل." }
            ]
          },
          {
            number: "02",
            title: "التحاليل والتقرير",
            items: [
              { name: "التحاليل المخبرية", enabled: true, description: "فحص خواص التربة في المختبر." },
              { name: "إعداد التقرير الجيوتقني والتوصيات", enabled: true, description: "توصيات التأسيس وقدرة التحمل." }
            ]
          }
        ],
        deliverables: [
          { name: "تقرير دراسة التربة", enabled: true },
          { name: "توصيات التأسيس", enabled: true },
          { name: "ملفات PDF للتسليم", enabled: true }
        ]
      },
      {
        value: "التصميم الداخلي",
        title: "عرض خدمات التصميم الداخلي",
        scopeGroups: [
          {
            number: "01",
            title: "التصور والتخطيط",
            items: [
              { name: "دراسة الفراغات الداخلية", enabled: true, description: "توزيع الأثاث والحركة." },
              { name: "اللوحات المزاجية والخامات", enabled: true, description: "اختيار الطابع واللون والخامات." }
            ]
          },
          {
            number: "02",
            title: "التصميم التنفيذي",
            items: [
              { name: "مخططات التشطيبات", enabled: true, description: "تفاصيل الأرضيات والأسقف والجدران." },
              { name: "منظورات داخلية", enabled: true, description: "إظهار الفراغات بصورة واقعية." }
            ]
          }
        ],
        deliverables: [
          { name: "مخططات التصميم الداخلي", enabled: true },
          { name: "منظورات داخلية", enabled: true },
          { name: "جداول التشطيبات", enabled: true },
          { name: "ملفات PDF للتسليم", enabled: true }
        ]
      }
    ]
  },
  {
    category: "أعمال المساحة",
    services: [
      {
        value: "إصدار قرار مساحي",
        title: "عرض خدمات إصدار قرار مساحي",
        scopeGroups: [
          {
            number: "01",
            title: "الرفع المساحي",
            items: [
              { name: "رفع مساحي للموقع", enabled: true, description: "تحديد حدود الأرض بدقة." },
              { name: "تحديد الإحداثيات والحدود", enabled: true, description: "ربط الموقع بالشبكة المساحية." }
            ]
          },
          {
            number: "02",
            title: "إصدار القرار",
            items: [
              { name: "تجهيز متطلبات القرار", enabled: true, description: "إعداد المستندات المساحية." },
              { name: "متابعة إصدار القرار", enabled: true, description: "المتابعة عبر الجهات المختصة." }
            ]
          }
        ],
        deliverables: [
          { name: "المخطط المساحي", enabled: true },
          { name: "القرار المساحي المعتمد", enabled: true },
          { name: "ملفات PDF للتسليم", enabled: true }
        ]
      },
      {
        value: "الرفع المساحي",
        title: "عرض خدمات الرفع المساحي",
        scopeGroups: [
          {
            number: "01",
            title: "الأعمال الميدانية",
            items: [
              { name: "الرفع المساحي بالأجهزة", enabled: true, description: "رفع الموقع بأجهزة المساحة." },
              { name: "تحديد المناسيب والحدود", enabled: true, description: "توثيق المناسيب وحدود الأرض." }
            ]
          },
          {
            number: "02",
            title: "المخرجات المساحية",
            items: [
              { name: "إعداد المخطط المساحي", enabled: true, description: "رسم المخطط من بيانات الرفع." },
              { name: "حساب المساحات", enabled: true, description: "احتساب المساحات والإحداثيات." }
            ]
          }
        ],
        deliverables: [
          { name: "مخطط الرفع المساحي", enabled: true },
          { name: "جدول الإحداثيات والمساحات", enabled: true },
          { name: "ملفات PDF و CAD للتسليم", enabled: true }
        ]
      },
      {
        value: "إفراز ودمج الأراضي",
        title: "عرض خدمات إفراز ودمج الأراضي",
        scopeGroups: [
          {
            number: "01",
            title: "الدراسة المساحية",
            items: [
              { name: "رفع مساحي للأرض", enabled: true, description: "توثيق الوضع القائم للأرض." },
              { name: "دراسة حدود الصكوك", enabled: true, description: "مطابقة الحدود مع الصكوك." }
            ]
          },
          {
            number: "02",
            title: "الإفراز أو الدمج",
            items: [
              { name: "إعداد مخطط الإفراز أو الدمج", enabled: true, description: "تقسيم أو دمج القطع حسب الطلب." },
              { name: "متابعة الاعتماد", enabled: true, description: "المتابعة عبر الجهات المختصة." }
            ]
          }
        ],
        deliverables: [
          { name: "مخطط الإفراز أو الدمج", enabled: true },
          { name: "ملفات PDF للتسليم", enabled: true },
          { name: "متابعة الاعتماد", enabled: true }
        ]
      },
      {
        value: "أعمال مساحة عامة",
        title: "عرض خدمات أعمال المساحة",
        scopeGroups: [
          {
            number: "01",
            title: "الخدمات المساحية",
            items: [
              { name: "رفع مساحي", enabled: true, description: "رفع الموقع وتوثيقه." },
              { name: "ربط إحداثي", enabled: true, description: "ربط الموقع بالشبكة المساحية." },
              { name: "تحديد المناسيب", enabled: true, description: "قياس مناسيب الموقع." }
            ]
          }
        ],
        deliverables: [
          { name: "المخططات المساحية", enabled: true },
          { name: "تقرير الأعمال المساحية", enabled: true },
          { name: "ملفات PDF و CAD للتسليم", enabled: true }
        ]
      }
    ]
  },
  {
    category: "الإشراف الهندسي",
    services: [
      {
        value: "الإشراف الهندسي على التنفيذ",
        title: "عرض خدمات الإشراف الهندسي على التنفيذ",
        scopeGroups: [
          {
            number: "01",
            title: "الإشراف الدوري",
            items: [
              { name: "زيارات إشرافية دورية", enabled: true, description: "زيارات ميدانية لمتابعة التنفيذ." },
              { name: "مطابقة التنفيذ للمخططات", enabled: true, description: "التحقق من مطابقة الأعمال للرخصة." }
            ]
          },
          {
            number: "02",
            title: "التقارير والاعتماد",
            items: [
              { name: "تقارير مراحل التنفيذ", enabled: true, description: "توثيق تقدم العمل ومطابقته." },
              { name: "اعتماد مراحل التنفيذ", enabled: true, description: "اعتماد المراحل عبر بلدي." }
            ]
          }
        ],
        deliverables: [
          { name: "تقارير الإشراف الدورية", enabled: true },
          { name: "محاضر الزيارات", enabled: true },
          { name: "شهادة مطابقة التنفيذ", enabled: true }
        ]
      },
      {
        value: "تعهد الإشراف الهندسي",
        title: "عرض خدمات تعهد الإشراف الهندسي",
        scopeGroups: [
          {
            number: "01",
            title: "التعهد والمتابعة",
            items: [
              { name: "إصدار تعهد الإشراف", enabled: true, description: "إصدار التعهد المطلوب للرخصة." },
              { name: "ربط التعهد بالرخصة ومتابعته", enabled: true, description: "المتابعة عبر منصة بلدي." }
            ]
          }
        ],
        deliverables: [
          { name: "تعهد الإشراف المعتمد", enabled: true },
          { name: "ملفات PDF للتسليم", enabled: true }
        ]
      },
      {
        value: "الإشراف والمتابعة الدورية",
        title: "عرض خدمات الإشراف والمتابعة الدورية",
        scopeGroups: [
          {
            number: "01",
            title: "المتابعة الدورية",
            items: [
              { name: "زيارات متابعة دورية", enabled: true, description: "زيارات منتظمة حسب الاتفاق." },
              { name: "رصد ملاحظات الموقع", enabled: true, description: "توثيق الملاحظات والتوصيات." }
            ]
          }
        ],
        deliverables: [
          { name: "تقارير المتابعة الدورية", enabled: true },
          { name: "محاضر الملاحظات", enabled: true }
        ]
      }
    ]
  },
  {
    category: "شهادات وخدمات أخرى",
    services: [
      {
        value: "إصدار شهادة إتمام بناء",
        title: "عرض خدمات إصدار شهادة إتمام البناء",
        scopeGroups: [
          {
            number: "01",
            title: "المعاينة والمطابقة",
            items: [
              { name: "معاينة المبنى المنفذ", enabled: true, description: "معاينة المبنى بعد التنفيذ." },
              { name: "مطابقة المبنى للرخصة", enabled: true, description: "التحقق من المطابقة للمخططات." }
            ]
          },
          {
            number: "02",
            title: "إصدار الشهادة",
            items: [
              { name: "تجهيز متطلبات الشهادة", enabled: true, description: "إعداد المستندات اللازمة." },
              { name: "متابعة إصدار شهادة الإتمام", enabled: true, description: "المتابعة حتى الإصدار." }
            ]
          }
        ],
        deliverables: [
          { name: "تقرير المطابقة", enabled: true },
          { name: "شهادة إتمام البناء", enabled: true },
          { name: "ملفات PDF للتسليم", enabled: true }
        ]
      },
      {
        value: "تصحيح وضع مبنى قائم",
        title: "عرض خدمات تصحيح وضع مبنى قائم",
        scopeGroups: [
          {
            number: "01",
            title: "الرفع والتقييم",
            items: [
              { name: "رفع مساحي للمبنى القائم", enabled: true, description: "توثيق الوضع القائم." },
              { name: "حصر المخالفات", enabled: true, description: "تحديد ما يلزم تصحيحه." }
            ]
          },
          {
            number: "02",
            title: "التصحيح والاعتماد",
            items: [
              { name: "إعداد مخططات الوضع القائم", enabled: true, description: "توثيق المبنى كما هو منفّذ." },
              { name: "متابعة تصحيح الوضع", enabled: true, description: "المتابعة حتى الاعتماد." }
            ]
          }
        ],
        deliverables: [
          { name: "مخططات الوضع القائم", enabled: true },
          { name: "ملف التصحيح", enabled: true },
          { name: "متابعة الاعتماد", enabled: true }
        ]
      },
      {
        value: "استشارات هندسية",
        title: "عرض خدمات الاستشارات الهندسية",
        scopeGroups: [
          {
            number: "01",
            title: "الاستشارة الفنية",
            items: [
              { name: "دراسة الحالة", enabled: true, description: "تحليل المتطلبات والوضع القائم." },
              { name: "تقديم التوصيات الفنية", enabled: true, description: "توصيات هندسية مكتوبة." }
            ]
          }
        ],
        deliverables: [
          { name: "تقرير استشاري", enabled: true },
          { name: "التوصيات الفنية", enabled: true }
        ]
      }
    ]
  }
];

// Flattened list of every service (used by the cover-title lookup and the filtered editor dropdown).
const permitTypeOptions = serviceCatalog.flatMap((cat) => cat.services);

// Sentinel dropdown value for "type my own service name". When chosen, the user names the
// service freely and the cover title becomes عرض خدمات <اسم الخدمة>.
const CUSTOM_SERVICE_VALUE = "__custom__";

function isCustomService(value) {
  const name = String(value || "").trim();
  return name !== "" && !findServiceByValue(name);
}

function serviceCategoryFor(value) {
  const match = serviceCatalog.find((cat) => cat.services.some((service) => service.value === value));
  return match ? match.category : serviceCatalog[0].category;
}

function findServiceByValue(value) {
  return permitTypeOptions.find((service) => service.value === value) || null;
}

// The scope of work + deliverables to load for a service. A service may defer to the office's
// saved defaults (scopeGroups/deliverables === null) — used by the canonical building permit so
// each office keeps its customized defaults; every other service uses its tailored catalog bundle.
function effectiveServiceTemplate(value) {
  const service = findServiceByValue(value);
  const fallback = getDefaultQuotationData();

  if (!service) {
    return {
      title: getPermitTitle(),
      scopeGroups: cloneData(fallback.scopeGroups),
      deliverables: cloneData(fallback.deliverables)
    };
  }

  return {
    title: service.title,
    scopeGroups: service.scopeGroups ? cloneData(service.scopeGroups) : cloneData(fallback.scopeGroups),
    deliverables: service.deliverables ? cloneData(service.deliverables) : cloneData(fallback.deliverables)
  };
}

// Load a service's tailored template into the current quotation (used when the category/service
// dropdowns change). Replaces scope + deliverables; the cover title follows automatically.
function applyServiceTemplate(value) {
  const template = effectiveServiceTemplate(value);
  quotationData.permitType = value;
  quotationData.serviceCategory = serviceCategoryFor(value);
  quotationData.serviceIsCustom = false;
  quotationData.scopeGroups = template.scopeGroups;
  quotationData.deliverables = template.deliverables;
}

const clientTitleOptions = ["السيد", "السيدة", "السادة"];
const responsibleTitleOptions = ["المهندس", "المهندسة", "السيد", "السيدة"];
const projectStatusOptions = [
  { value: "sent", label: "تم الإرسال" },
  { value: "accepted", label: "تم القبول" },
  { value: "rejected", label: "تم الرفض" }
];

const fields = [
  {
    id: "start",
    title: "ابدأ العرض",
    items: [
      ["serviceCategory", "فئة الخدمة", "category"],
      ["permitType", "نوع الخدمة", "permit"],
      ["projectType", "نوع المشروع", "select"],
      ["clientTitle", "اللقب", "clientTitle"],
      ["clientName", "اسم العميل"],
      ["city", "المدينة"],
      ["district", "الحي"],
      ["quotationNumber", "رقم العرض"]
    ]
  },
  {
    id: "contact",
    title: "بيانات التواصل والتاريخ",
    items: [
      ["clientPhone", "رقم الجوال"],
      ["clientEmail", "البريد الإلكتروني", "email"],
      ["date", "التاريخ", "date"],
      ["validityPeriod", "مدة صلاحية العرض", "unit:أيام"],
      ["bilingual", "إظهار العناوين بالإنجليزية", "checkbox"]
    ]
  },
  {
    id: "land",
    title: "تفاصيل الأرض والصك",
    items: [
      ["plotNumber", "رقم القطعة"],
      ["landArea", "مساحة الأرض", "unit:م²"],
      ["planNumber", "رقم المخطط"],
      ["deedNumber", "رقم الصك"],
      ["deedDate", "تاريخ الصك", "date"]
    ]
  },
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
const baseTemplateSnapshot = JSON.stringify(quotationData);

// New quotations start from the base template merged with the office's saved defaults
// (brandProfile.defaults), so each office's usual lists and payment plan come pre-filled.
function getDefaultQuotationData() {
  const base = JSON.parse(baseTemplateSnapshot);
  return brandProfile.defaults ? { ...base, ...cloneData(brandProfile.defaults) } : base;
}
const datePickerMonths = {
  quotation: quotationData.dateIso,
  deed: quotationData.deedDateIso || quotationData.dateIso
};
let savedProjects = [];
let activeProjectId = "";

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
  if (selectedPermit) {
    return selectedPermit.title;
  }

  // Custom (user-typed) service name → derive the same "عرض خدمات …" heading.
  const custom = String(quotationData.permitType || "").trim();
  return custom ? `عرض خدمات ${custom}` : permitTypeOptions[0].title;
}

function getClientDisplayName(data = quotationData) {
  return [data.clientTitle, data.clientName].filter(Boolean).join(" ");
}

function getResponsibleDisplayName(data = quotationData) {
  return [data.responsibleTitle, data.responsibleName].filter(Boolean).join(" ");
}

function normalizeContactPhone(value) {
  const normalizedDigits = String(value || "")
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
  const cleaned = normalizedDigits.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");

  if (!cleaned) {
    return "";
  }

  if (cleaned.startsWith("+")) {
    return cleaned.slice(1);
  }

  if (cleaned.startsWith("00")) {
    return cleaned.slice(2);
  }

  return cleaned.startsWith("0") ? `966${cleaned.slice(1)}` : cleaned;
}

function getResponsibleContactUrl(data = quotationData) {
  const phone = normalizeContactPhone(data.responsiblePhone);
  return phone ? `https://wa.me/${phone}` : "";
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

// No mail server is required: a mailto link opens the user's own mail client with the
// recipient, subject and a formal Arabic body pre-filled from the quotation, so the
// secretary only needs to attach the saved PDF and hit send.
function buildEmailSubject() {
  const number = quotationData.quotationNumber ? ` — عرض رقم ${quotationData.quotationNumber}` : "";
  return `${getPermitTitle()}${number}`;
}

function buildEmailBody() {
  const recipient = getClientDisplayName(quotationData).trim();
  const location = [quotationData.district, quotationData.city].filter(Boolean).join("، ");

  return [
    recipient ? `الفاضل/ ${recipient}،` : "السادة الأفاضل،",
    "",
    `يسرّ ${brandProfile.companyName} أن تقدّم لكم عرض السعر التالي:`,
    "",
    `• ${getPermitTitle()}`,
    quotationData.projectType && `• نوع المشروع: ${quotationData.projectType}`,
    location && `• الموقع: ${location}`,
    quotationData.quotationNumber && `• رقم العرض: ${quotationData.quotationNumber}`,
    quotationData.mainPriceNumber && `• قيمة العرض: ${formatRiyalAmount(quotationData.mainPriceNumber)}`,
    quotationData.validityPeriod && `• مدة صلاحية العرض: ${quotationData.validityPeriod}`,
    "",
    "نرفق لكم العرض التفصيلي بصيغة PDF.",
    "",
    "وتفضلوا بقبول فائق الاحترام،",
    brandProfile.companyName
  ].filter((line) => line !== false && line !== undefined).join("\n");
}

function getMailtoUrl() {
  const to = encodeURIComponent(String(quotationData.clientEmail || "").trim());
  const subject = encodeURIComponent(buildEmailSubject());
  const body = encodeURIComponent(buildEmailBody());
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

function sendQuotationEmail() {
  const emailInput = editorForm.querySelector("#clientEmail");

  if (!String(quotationData.clientEmail || "").trim()) {
    if (emailInput) {
      emailInput.focus();
    }
    return;
  }

  const anchor = document.createElement("a");
  anchor.href = getMailtoUrl();
  anchor.click();
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

function readLocalStorageValue(key, fallback = "") {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function writeLocalStorageValue(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

function createProjectId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (Number(char) ^ (Math.random() * 16 >> (Number(char) / 4))).toString(16)
  );
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

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function normalizeProjectStatus(status) {
  const value = String(status || "");
  return projectStatusOptions.some((option) => option.value === value) ? value : "";
}

function normalizeProjectRecord(project) {
  if (!project || !project.data) {
    return null;
  }

  const data = migrateProjectData(project.data);

  return {
    id: isUuid(project.id) ? project.id : createProjectId(),
    name: project.name || getProjectName(project.data),
    updatedAt: project.updatedAt || new Date().toISOString(),
    status: normalizeProjectStatus(project.status || project.data.projectStatus),
    data
  };
}

function readRawLocalProjects() {
  try {
    const parsedProjects = JSON.parse(readLocalStorageValue(PROJECTS_STORAGE_KEY, "[]"));
    return Array.isArray(parsedProjects) ? parsedProjects.filter((project) => project && project.id && project.data) : [];
  } catch (error) {
    return [];
  }
}

function readSavedProjects() {
  return readRawLocalProjects().map(normalizeProjectRecord).filter(Boolean);
}

function persistProjectsLocal() {
  writeLocalStorageValue(PROJECTS_STORAGE_KEY, JSON.stringify(savedProjects));
  writeLocalStorageValue(ACTIVE_PROJECT_STORAGE_KEY, activeProjectId);
}

function persistProjects() {
  persistProjectsLocal();
  scheduleCloudProjectSync();
}

function getActiveProject() {
  return savedProjects.find((project) => project.id === activeProjectId);
}

function mergeBrandProfile(profile) {
  const source = profile && typeof profile === "object" ? profile : {};

  return {
    ...cloneData(defaultBrandProfile),
    ...source,
    footerFields: { ...cloneData(defaultBrandProfile.footerFields), ...(source.footerFields || {}) }
  };
}

function projectToSupabaseRow(project, officeId) {
  return {
    id: project.id,
    office_id: officeId,
    name: project.name || getProjectName(project.data),
    data: {
      ...migrateProjectData(project.data),
      projectStatus: normalizeProjectStatus(project.status)
    },
    updated_at: project.updatedAt || new Date().toISOString()
  };
}

function projectFromSupabaseRow(row) {
  if (!row || !row.id || !row.data) {
    return null;
  }

  return {
    id: row.id,
    name: row.name || getProjectName(row.data),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    status: normalizeProjectStatus(row.status || row.data.projectStatus),
    data: migrateProjectData(row.data)
  };
}

function shouldUploadLocalProjects(cloudProjects, localProjects) {
  return cloudProjects.length === 0 && localProjects.length > 0;
}

function setSyncStatus(state, message) {
  if (!syncStatus) {
    return;
  }

  syncStatus.dataset.state = state;
  syncStatus.textContent = message;
}

function setLoginMessage(message) {
  if (loginStatus) {
    loginStatus.textContent = message || "";
  }
}

function isLocalModePreferred() {
  try {
    return localStorage.getItem(LOCAL_MODE_STORAGE_KEY) === "1";
  } catch (error) {
    return false;
  }
}

function setLocalModePreference(enabled) {
  try {
    if (enabled) {
      localStorage.setItem(LOCAL_MODE_STORAGE_KEY, "1");
    } else {
      localStorage.removeItem(LOCAL_MODE_STORAGE_KEY);
    }
  } catch (error) {
    // Ignore storage failures; the current click still continues locally.
  }
}

let loginOverlayPendingAfterIntro = false;

function isIntroOverlayVisible() {
  const overlay = document.querySelector("#introOverlay");
  return Boolean(overlay && !overlay.hidden);
}

function showLoginOverlay(show) {
  const shouldDeferLogin = show && isIntroOverlayVisible();
  loginOverlayPendingAfterIntro = shouldDeferLogin;

  if (loginOverlay) {
    loginOverlay.hidden = !show || shouldDeferLogin;
  }

  if (cloudLoginBtn) {
    cloudLoginBtn.hidden = show || !cloudState.configured || cloudState.ready;
  }

  if (logoutBtn) {
    logoutBtn.hidden = show || !cloudState.ready;
  }
}

function continueWithoutSync() {
  setLocalModePreference(true);
  cloudState.ready = false;
  cloudState.officeId = "";
  setAuthMode("signin");
  setLoginMessage("");
  setSyncStatus("local", "محلي فقط - بدون مزامنة");
  showLoginOverlay(false);
}

async function showCloudLogin() {
  setLocalModePreference(false);
  setAuthMode("signin");
  setLoginMessage("");
  await initializeCloudSession();
}

function setAuthMode(mode) {
  authMode = ["signup", "recovery"].includes(mode) ? mode : "signin";
  const isSignup = authMode === "signup";
  const isRecovery = authMode === "recovery";

  if (loginHeading) {
    loginHeading.textContent = isSignup
      ? "إنشاء حساب جديد"
      : isRecovery
        ? "تعيين كلمة مرور جديدة"
        : "تسجيل الدخول";
  }
  if (loginIntro) {
    loginIntro.textContent = isSignup
      ? "أنشئ حساباً جديداً بمساحة عمل خاصة بك لحفظ عروضك على الإنترنت."
      : isRecovery
        ? "اكتب كلمة مرور جديدة لحسابك ثم احفظها للمتابعة."
        : "سجّل الدخول لفتح مشاريعك المحفوظة على الإنترنت.";
  }
  if (loginSubmitBtn) {
    loginSubmitBtn.textContent = isSignup ? "إنشاء حساب" : isRecovery ? "حفظ كلمة المرور" : "دخول";
  }
  if (authSwitchPrompt) {
    authSwitchPrompt.textContent = isSignup ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟";
  }
  if (authModeToggle) {
    authModeToggle.textContent = isSignup ? "تسجيل الدخول" : "إنشاء حساب جديد";
  }
  if (loginPassword) {
    loginPassword.autocomplete = isSignup || isRecovery ? "new-password" : "current-password";
  }
  if (officeNameLabel) {
    officeNameLabel.hidden = !isSignup;
  }
  if (signupOfficeName) {
    signupOfficeName.hidden = !isSignup;
  }
  if (resetPasswordConfirmLabel) {
    resetPasswordConfirmLabel.hidden = !isRecovery;
  }
  if (resetPasswordConfirm) {
    resetPasswordConfirm.hidden = !isRecovery;
    resetPasswordConfirm.required = isRecovery;
    if (!isRecovery) {
      resetPasswordConfirm.value = "";
    }
  }
  if (forgotPasswordBtn) {
    forgotPasswordBtn.hidden = !(!isSignup && !isRecovery);
  }
  if (authSwitch) {
    authSwitch.hidden = isRecovery;
  }

  setLoginMessage("");
}

function getPasswordRecoveryRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

function createSupabaseClient() {
  const config = window.OROUDI_SUPABASE_CONFIG || {};
  const url = String(config.SUPABASE_URL || "").trim();
  const anonKey = String(config.SUPABASE_ANON_KEY || "").trim();

  if (!url || !anonKey || !window.supabase || typeof window.supabase.createClient !== "function") {
    return null;
  }

  return window.supabase.createClient(url, anonKey);
}

function applyCloudProjects(cloudProjects) {
  const nextProjects = cloudProjects.map(projectFromSupabaseRow).filter(Boolean);

  if (!nextProjects.length) {
    return;
  }

  savedProjects = nextProjects;
  activeProjectId = nextProjects.some((project) => project.id === activeProjectId)
    ? activeProjectId
    : nextProjects[0].id;
  applyProjectData(getActiveProject().data);
  persistProjectsLocal();
}

async function syncBrandProfileNow() {
  if (!cloudState.ready || !cloudState.client || !cloudState.officeId) {
    return;
  }

  const { error } = await cloudState.client
    .from("offices")
    .update({
      brand_profile: brandProfile,
      updated_at: new Date().toISOString()
    })
    .eq("id", cloudState.officeId);

  if (error) {
    throw error;
  }
}

async function syncProjectsNow() {
  if (!cloudState.ready || !cloudState.client || !cloudState.officeId) {
    return;
  }

  const deleteIds = Array.from(cloudState.pendingDeleteIds);
  cloudState.pendingDeleteIds.clear();

  if (deleteIds.length) {
    const { error: deleteError } = await cloudState.client
      .from("projects")
      .delete()
      .in("id", deleteIds);

    if (deleteError) {
      deleteIds.forEach((id) => cloudState.pendingDeleteIds.add(id));
      throw deleteError;
    }
  }

  if (!savedProjects.length) {
    return;
  }

  const rows = savedProjects.map((project) => projectToSupabaseRow(project, cloudState.officeId));
  const { error } = await cloudState.client
    .from("projects")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    throw error;
  }
}

function scheduleCloudBrandSync() {
  if (!cloudState.ready || cloudState.applyingCloud) {
    return;
  }

  clearTimeout(cloudState.brandTimer);
  cloudState.brandTimer = setTimeout(async () => {
    try {
      setSyncStatus("syncing", "مزامنة هوية المكتب...");
      await syncBrandProfileNow();
      setSyncStatus("ready", "متصل - تمت المزامنة");
    } catch (error) {
      setSyncStatus("error", "تعذرت مزامنة هوية المكتب");
    }
  }, CLOUD_SYNC_DEBOUNCE_MS);
}

function scheduleCloudProjectSync() {
  if (!cloudState.ready || cloudState.applyingCloud) {
    return;
  }

  clearTimeout(cloudState.projectTimer);
  cloudState.projectTimer = setTimeout(async () => {
    try {
      cloudState.syncing = true;
      setSyncStatus("syncing", "مزامنة المشاريع...");
      await syncProjectsNow();
      setSyncStatus("ready", "متصل - تمت المزامنة");
    } catch (error) {
      setSyncStatus("error", "تعذرت مزامنة المشاريع");
    } finally {
      cloudState.syncing = false;
    }
  }, CLOUD_SYNC_DEBOUNCE_MS);
}

async function uploadInitialLocalWorkspace(localProjects) {
  savedProjects = localProjects.map(normalizeProjectRecord).filter(Boolean);

  if (!savedProjects.length) {
    const firstProject = createProject(quotationData, getProjectName(quotationData));
    savedProjects = [firstProject];
  }

  // Seed the new (empty) office with fresh project ids. The local ids may have
  // been claimed by a different office on a shared browser (e.g. a previous user
  // signed up here), and reusing them would make the cross-tenant upsert hit that
  // office's rows and fail RLS. New ids keep this account's first upload isolated.
  savedProjects = savedProjects.map((project) => ({ ...project, id: createProjectId() }));

  activeProjectId = savedProjects.some((project) => project.id === activeProjectId)
    ? activeProjectId
    : savedProjects[0].id;
  persistProjectsLocal();
  await syncBrandProfileNow();
  await syncProjectsNow();
}

async function loadCloudWorkspace() {
  if (!cloudState.client) {
    return;
  }

  try {
    setSyncStatus("syncing", "جاري تحميل مشاريع المكتب...");
    showLoginOverlay(false);

    const { data: memberships, error: memberError } = await cloudState.client
      .from("members")
      .select("office_id, role")
      .limit(1);

    if (memberError) {
      throw memberError;
    }

    const membership = memberships && memberships[0];
    if (!membership || !membership.office_id) {
      throw new Error("no office membership");
    }

    cloudState.officeId = membership.office_id;

    const { data: office, error: officeError } = await cloudState.client
      .from("offices")
      .select("id, name, brand_profile")
      .eq("id", cloudState.officeId)
      .single();

    if (officeError) {
      throw officeError;
    }

    const { data: projectRows, error: projectsError } = await cloudState.client
      .from("projects")
      .select("id, name, data, updated_at, created_at")
      .eq("office_id", cloudState.officeId)
      .order("updated_at", { ascending: false });

    if (projectsError) {
      throw projectsError;
    }

    const cloudProjects = (projectRows || []).map(projectFromSupabaseRow).filter(Boolean);
    const localProjects = readRawLocalProjects().map(normalizeProjectRecord).filter(Boolean);

    cloudState.ready = true;
    cloudState.applyingCloud = true;

    if (office && office.brand_profile) {
      brandProfile = mergeBrandProfile(office.brand_profile);
      persistBrandProfileLocal();
    }

    if (shouldUploadLocalProjects(cloudProjects, localProjects)) {
      await uploadInitialLocalWorkspace(localProjects);
    } else if (cloudProjects.length) {
      applyCloudProjects(projectRows || []);
    } else {
      await uploadInitialLocalWorkspace(savedProjects);
    }

    cloudState.applyingCloud = false;
    renderApp();
    showLoginOverlay(false);
    setSyncStatus("ready", "متصل - مشاريع المكتب مشتركة");
  } catch (error) {
    cloudState.ready = false;
    cloudState.applyingCloud = false;
    setSyncStatus("error", "تعذر الاتصال بمشاريع المكتب");
    showLoginOverlay(true);
    setLoginMessage("تحقق من بيانات الدخول أو إعدادات Supabase.");
  }
}

function bindAuthStateListener() {
  if (cloudState.authListenerBound || !cloudState.client) {
    return;
  }

  cloudState.authListenerBound = true;
  cloudState.client.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      if (loginEmail && session && session.user && session.user.email) {
        loginEmail.value = session.user.email;
      }
      setAuthMode("recovery");
      showLoginOverlay(true);
      setLoginMessage("اكتب كلمة مرور جديدة ثم اضغط حفظ كلمة المرور.");
    } else if (event === "SIGNED_IN" && session && authMode !== "recovery") {
      // Defer out of the auth callback: supabase-js holds an internal lock while
      // this runs, and awaiting further Supabase calls inside it (loadCloudWorkspace)
      // contends with that lock and fails. setTimeout(0) runs it after the lock frees.
      setTimeout(() => loadCloudWorkspace(), 0);
    } else if (event === "SIGNED_OUT") {
      cloudState.ready = false;
      cloudState.officeId = "";
      if (isLocalModePreferred()) {
        setSyncStatus("local", "محلي فقط - بدون مزامنة");
        showLoginOverlay(false);
      } else {
        setSyncStatus("error", "غير مسجل الدخول");
        showLoginOverlay(true);
      }
    }
  });
}

async function initializeCloudSession() {
  cloudState.client = createSupabaseClient();
  cloudState.configured = Boolean(cloudState.client);

  if (!cloudState.client) {
    setSyncStatus("local", "محلي فقط - أضف إعدادات Supabase للنشر");
    showLoginOverlay(false);
    return;
  }

  bindAuthStateListener();

  if (isLocalModePreferred()) {
    setSyncStatus("local", "محلي فقط - بدون مزامنة");
    showLoginOverlay(false);
    return;
  }

  setSyncStatus("syncing", "فحص جلسة الدخول...");

  const { data } = await cloudState.client.auth.getSession();
  if (data && data.session) {
    await loadCloudWorkspace();
  } else {
    setSyncStatus("error", "غير مسجل الدخول");
    showLoginOverlay(true);
  }
}

function migrateProjectData(data) {
  const migratedData = cloneData(data);

  // Office identity used to live inside each saved quotation; it now lives in the
  // brand profile, so stale per-project copies are dropped.
  ["companyName", "logoPath", "footerImagePath", "signaturePath", "closingText"].forEach((key) => {
    delete migratedData[key];
  });
  delete migratedData.projectStatus;

  if (!migratedData.clientTitle) {
    migratedData.clientTitle = "السيد";
  }

  if (!migratedData.responsibleTitle) {
    migratedData.responsibleTitle = "المهندس";
  }

  if (migratedData.responsibleName === undefined) {
    migratedData.responsibleName = "";
  }

  if (migratedData.responsiblePhone === undefined) {
    migratedData.responsiblePhone = "";
  }

  // The service category is new; older quotations only stored permitType. Derive the
  // category from the saved service so the filtered dropdown opens on the right group.
  if (!migratedData.serviceCategory) {
    migratedData.serviceCategory = serviceCategoryFor(migratedData.permitType);
  }

  // Restore custom-service mode for saved quotations whose service name isn't in the catalog.
  if (migratedData.serviceIsCustom === undefined) {
    migratedData.serviceIsCustom = isCustomService(migratedData.permitType);
  }

  // Quotations saved before auto-tafqit had a hand-typed written amount; keep it.
  if (migratedData.mainPriceWrittenManual === undefined && String(migratedData.mainPriceWritten || "").trim()) {
    migratedData.mainPriceWrittenManual = true;
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
        ? group.items.map((item) => {
            const name = typeof item === "string" ? item : item.name;

            return {
              name,
              enabled: typeof item === "string" ? true : item.enabled !== false,
              // Descriptions used to come from a fixed map; older items inherit theirs.
              description: typeof item === "string" || item.description === undefined
                ? scopeDescriptionMap[name] || ""
                : item.description
            };
          })
        : []
    }));
  }

  // Deliverables follow the same string → { name, enabled, description } migration as scope items.
  if (Array.isArray(migratedData.deliverables)) {
    migratedData.deliverables = migratedData.deliverables.map((item) =>
      typeof item === "string"
        ? { name: item, enabled: true, description: "" }
        : { name: item.name, enabled: item.enabled !== false, description: item.description || "" }
    );
  }

  return migratedData;
}

function applyProjectData(data) {
  const nextData = {
    ...getDefaultQuotationData(),
    ...migrateProjectData(data)
  };

  Object.keys(quotationData).forEach((key) => delete quotationData[key]);
  Object.assign(quotationData, nextData);
  setQuotationDate(quotationData.dateIso);
  datePickerMonths.quotation = quotationData.dateIso;
  datePickerMonths.deed = quotationData.deedDateIso || quotationData.dateIso;
}

function createProject(data = getDefaultQuotationData(), name = getProjectName(data)) {
  const now = new Date().toISOString();

  return {
    id: createProjectId(),
    name,
    updatedAt: now,
    status: "",
    data: migrateProjectData(data)
  };
}

function initializeProjects() {
  savedProjects = readSavedProjects();
  activeProjectId = readLocalStorageValue(ACTIVE_PROJECT_STORAGE_KEY);

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

  const nextProject = createProject(getDefaultQuotationData(), "مشروع جديد");
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
  copy.status = normalizeProjectStatus(project.status);
  savedProjects.unshift(copy);
  activeProjectId = copy.id;
  applyProjectData(copy.data);
  persistProjects();
  renderApp();
}

function deleteProject(projectId) {
  const project = savedProjects.find((savedProject) => savedProject.id === projectId);

  if (!project || !window.confirm("هل تريد حذف هذا المشروع؟")) {
    return;
  }

  cloudState.pendingDeleteIds.add(project.id);
  savedProjects = savedProjects.filter((savedProject) => savedProject.id !== project.id);

  if (!savedProjects.length) {
    const replacementProject = createProject(getDefaultQuotationData(), "مشروع جديد");
    savedProjects = [replacementProject];
  }

  if (project.id === activeProjectId || !getActiveProject()) {
    activeProjectId = savedProjects[0].id;
    applyProjectData(savedProjects[0].data);
  }

  persistProjects();
  renderApp();
}

function setProjectStatus(projectId, status) {
  const project = savedProjects.find((savedProject) => savedProject.id === projectId);

  if (!project) {
    return;
  }

  project.status = normalizeProjectStatus(status);
  project.updatedAt = new Date().toISOString();
  persistProjects();
  renderProjectsPanel();
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
        <div class="calendar-nav-group">
          <button type="button" data-calendar-nav="-12" data-date-field="${field}" aria-label="السنة السابقة" title="السنة السابقة">«</button>
          <button type="button" data-calendar-nav="-1" data-date-field="${field}" aria-label="الشهر السابق" title="الشهر السابق">‹</button>
        </div>
        <strong>${escapeHtml(gregorianMonthFormatter.format(monthDate))}</strong>
        <div class="calendar-nav-group">
          <button type="button" data-calendar-nav="1" data-date-field="${field}" aria-label="الشهر التالي" title="الشهر التالي">›</button>
          <button type="button" data-calendar-nav="12" data-date-field="${field}" aria-label="السنة التالية" title="السنة التالية">»</button>
        </div>
      </div>
      <div class="calendar-weekdays">
        ${weekdayLabels.map((day) => `<span>${day}</span>`).join("")}
      </div>
      <div class="calendar-grid">${emptyDays}${days}</div>
    </div>
  `;
}

const DEFAULT_OPEN_SECTION_ID = "start";

// Which editor sections are expanded. Full app renders open the fast-start section,
// while in-section edits (which call renderEditor only) keep the user's open sections.
const expandedSections = new Set([DEFAULT_OPEN_SECTION_ID]);

function resetExpandedSections() {
  expandedSections.clear();
  expandedSections.add(DEFAULT_OPEN_SECTION_ID);
}

// Which section title is currently in edit mode (null = none). Titles show as static text
// with a small ✎ button; clicking it swaps just that title to an input.
let editingSectionTitle = null;

// Default section titles, shared by the editor and the PDF so a rename stays in sync.
// scope / deliverables / financial / optional are also the document's page titles, so
// renaming those sections renames the matching page in the quotation (see the render*
// functions). The others have no standalone heading in the PDF, so their titles are
// editor-only labels.
const SECTION_DEFAULT_TITLES = {
  start: "ابدأ العرض",
  contact: "بيانات التواصل والتاريخ",
  land: "تفاصيل الأرض والصك",
  scope: "نطاق الأعمال",
  deliverables: "المخرجات المتوقعة",
  financial: "العرض المالي",
  terms: "الشروط المالية",
  payments: "جدول الدفعات والضريبة",
  optional: "ملحق الخدمات الاختيارية",
  responsible: "المسؤول عن تجهيز العرض"
};

function getSectionTitle(id) {
  if (typeof id === "string" && id.startsWith("custom:")) {
    const section = getCustomSection(id);
    return section && typeof section.title === "string" && section.title.trim() ? section.title : "قسم جديد";
  }
  const overrides = (quotationData && quotationData.sectionTitles) || {};
  const value = overrides[id];
  return typeof value === "string" && value.trim() ? value : (SECTION_DEFAULT_TITLES[id] || "");
}

function getCustomSection(id) {
  return (quotationData.customSections || []).find((section) => section.id === id);
}

function customSectionHasContent(section) {
  return (section.items || []).some((text) => String(text).trim());
}

// Editor body for a custom section: editable free-text lines (each prints as a list item)
// plus an add-line row. Mirrors the other list sections' add/remove pattern.
function customSectionEditorBody(section) {
  const items = (section.items || [])
    .map((text, index) => `
      <div class="term-edit-row">
        <input data-custom-item="${escapeHtml(section.id)}" data-custom-index="${index}" type="text" value="${escapeHtml(text)}" placeholder="نص يظهر في العرض…" aria-label="بند">
        <button type="button" class="scope-remove" data-custom-item-remove="${escapeHtml(section.id)}" data-custom-index="${index}" aria-label="إزالة البند" title="إزالة البند">×</button>
      </div>
    `)
    .join("");

  return `
    <p class="scope-hint">يظهر هذا القسم كصفحة في العرض بعنوانه وبنوده.</p>
    ${items}
    <div class="scope-add-row">
      <input type="text" data-custom-item-add="${escapeHtml(section.id)}" placeholder="إضافة بند جديد…" aria-label="إضافة بند جديد">
      <button type="button" class="scope-add" data-custom-item-add-btn="${escapeHtml(section.id)}">إضافة</button>
    </div>
  `;
}

// Wraps a section's inputs in a collapsible, numbered accordion card. The title shows as
// text with an edit (✎) button; while editing it becomes an input. `opts.extraClass` keeps
// section-specific styling hooks; `opts.removable` adds a delete control for custom sections.
function sectionShell(id, number, bodyHtml, opts = {}) {
  const open = expandedSections.has(id);
  const editing = editingSectionTitle === id;
  const title = getSectionTitle(id);
  const extraClass = opts.extraClass ? ` ${opts.extraClass}` : "";
  const removeBtn = opts.removable
    ? `<button type="button" class="section-remove" data-section-remove="${escapeHtml(id)}" aria-label="حذف القسم" title="حذف القسم">×</button>`
    : "";
  const titleArea = editing
    ? `<input class="section-title-input" type="text" value="${escapeHtml(title)}" data-section-title="${escapeHtml(id)}" aria-label="عنوان القسم" placeholder="عنوان القسم">
        <button type="button" class="section-edit is-done" data-section-edit="${escapeHtml(id)}" aria-label="حفظ العنوان" title="حفظ العنوان">✓</button>`
    : `<span class="section-title-text">${escapeHtml(title)}</span>
        <button type="button" class="section-edit" data-section-edit="${escapeHtml(id)}" aria-label="تعديل العنوان" title="تعديل العنوان">✎</button>`;

  return `
    <section class="form-group accordion-section${open ? " is-open" : ""}${extraClass}" data-section="${escapeHtml(id)}">
      <div class="section-bar">
        <button type="button" class="section-toggle" data-section-toggle="${escapeHtml(id)}" aria-expanded="${open}" title="طي أو فتح القسم">
          <span class="section-num">${number}</span>
          <span class="section-chevron" aria-hidden="true"></span>
        </button>
        ${titleArea}
        ${removeBtn}
      </div>
      <div class="section-body"${open ? "" : " hidden"}>
        ${bodyHtml}
      </div>
    </section>
  `;
}

function toggleSection(id) {
  editingSectionTitle = null; // collapsing/expanding exits title edit mode
  if (expandedSections.has(id)) {
    expandedSections.delete(id);
  } else {
    expandedSections.add(id);
  }
  renderEditor();
}

// Toggle edit mode for one section's title. Re-renders, then focuses the input with the
// caret at the end. Clicking another section's ✎ moves edit mode there (no stale state).
function beginSectionTitleEdit(id) {
  editingSectionTitle = editingSectionTitle === id ? null : id;
  renderEditor();

  if (editingSectionTitle === id) {
    const input = editorForm.querySelector(`[data-section-title="${id}"]`);
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }
}

function addCustomSection() {
  quotationData.customSections = quotationData.customSections || [];
  const id = `custom:${createProjectId()}`;
  quotationData.customSections.push({ id, title: "قسم جديد", items: [] });
  expandedSections.add(id); // open the new section so its fields are visible
  editingSectionTitle = id; // start in title-edit mode so the user names it first
  renderEditor();
  const input = editorForm.querySelector(`[data-section-title="${id}"]`);
  if (input) {
    input.focus();
    input.select();
  }
  renderPreview();
  saveActiveProject();
}

function removeCustomSection(id) {
  if (!Array.isArray(quotationData.customSections)) {
    return;
  }
  quotationData.customSections = quotationData.customSections.filter((section) => section.id !== id);
  expandedSections.delete(id);
  if (editingSectionTitle === id) {
    editingSectionTitle = null;
  }
  renderEditor();
  renderPreview();
  saveActiveProject();
}

function addCustomItem(id) {
  const section = getCustomSection(id);
  const input = editorForm.querySelector(`[data-custom-item-add="${id}"]`);
  const value = input ? input.value.trim() : "";

  if (!section || !value) {
    if (input) {
      input.focus();
    }
    return;
  }

  section.items = section.items || [];
  section.items.push(value);
  renderEditor();
  renderPreview();
  saveActiveProject();
  const nextInput = editorForm.querySelector(`[data-custom-item-add="${id}"]`);
  if (nextInput) {
    nextInput.focus();
  }
}

function removeCustomItem(id, index) {
  const section = getCustomSection(id);
  if (!section || !Array.isArray(section.items)) {
    return;
  }
  section.items.splice(index, 1);
  renderEditor();
  renderPreview();
  saveActiveProject();
}

function renderEditor() {
  const builtinSections = fields
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
                  <span class="date-input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 2.5v4M16 2.5v4"/></svg>
                  </span>
                  <input id="${key}" class="date-input" data-date-input data-date-field="${field}" type="text" value="${escapeHtml(quotationData[config.primaryKey] || "")}" placeholder="${escapeHtml(label)}" readonly aria-haspopup="dialog" aria-expanded="false">
                  <span class="inline-hijri-date">${escapeHtml(quotationData[config.secondaryKey] || "")}</span>
                </div>
                ${renderDatePicker(field)}
              </div>
            `;
          }

          if (type === "select") {
            const options = getProjectTypeOptions(quotationData.serviceCategory)
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

          if (type === "category") {
            const options = serviceCatalog
              .map((cat) => `<option value="${escapeHtml(cat.category)}" ${cat.category === quotationData[key] ? "selected" : ""}>${escapeHtml(cat.category)}</option>`)
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
            const activeCategory = serviceCatalog.find((cat) => cat.category === quotationData.serviceCategory) || serviceCatalog[0];
            const custom = quotationData.serviceIsCustom === true;
            const options = activeCategory.services
              .map((service) => `<option value="${escapeHtml(service.value)}" ${service.value === quotationData[key] ? "selected" : ""}>${escapeHtml(service.value)}</option>`)
              .join("")
              + `<option value="${CUSTOM_SERVICE_VALUE}" ${custom ? "selected" : ""}>✏️ خدمة مخصّصة (كتابة)…</option>`;

            return `
              <div class="field">
                <label for="${key}">${label}</label>
                <select id="${key}" data-key="${key}">
                  ${options}
                </select>
                ${custom ? `<input class="custom-service-input" data-custom-service type="text" value="${escapeHtml(quotationData[key])}" placeholder="اكتب اسم الخدمة كما تريد إظهاره في العرض" aria-label="اسم الخدمة المخصّصة">` : ""}
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

          if (type === "email") {
            return `
              <div class="field">
                <label for="${key}">${label}</label>
                <div class="email-input-row">
                  <input id="${key}" data-key="${key}" type="email" inputmode="email" placeholder="${escapeHtml(label)}" value="${escapeHtml(quotationData[key])}">
                  <button type="button" class="email-send-btn" data-email-send title="إرسال العرض إلى العميل بالبريد الإلكتروني" aria-label="إرسال العرض إلى العميل بالبريد الإلكتروني">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22 2 11 13"/>
                      <path d="M22 2 15 22l-4-9-9-4 20-7z"/>
                    </svg>
                  </button>
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

      const body = group.id === DEFAULT_OPEN_SECTION_ID
        ? `<p class="quick-start-hint">اختر الخدمة، اكتب العميل والسعر، ثم اطبع أو احفظ PDF.</p>${inputs}`
        : inputs;

      return { id: group.id, body };
    });

  const responsibleTitleSelectOptions = responsibleTitleOptions
    .map((option) => `<option value="${escapeHtml(option)}" ${option === quotationData.responsibleTitle ? "selected" : ""}>${escapeHtml(option)}</option>`)
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

      const descOpen = openDescEditors.has(`service:${index}`);

      return `
        <div class="field">
          <div class="service-label-row">
            <label for="service-${index}">${escapeHtml(service.name)}</label>
            <button type="button" class="desc-toggle${descOpen ? " is-open" : ""}" data-service-desc-toggle="${index}" title="تعديل وصف الخدمة">وصف</button>
            <button type="button" class="scope-remove" data-service-remove="${index}" aria-label="إزالة ${escapeHtml(service.name)}" title="إزالة الخدمة">×</button>
          </div>
          ${descOpen ? `<input type="text" class="desc-input" data-service-desc="${index}" value="${escapeHtml(service.description || "")}" placeholder="وصف يظهر في جدول الخدمات…" aria-label="وصف ${escapeHtml(service.name)}">` : ""}
          ${serviceInput}
        </div>
      `;
    })
    .join("");

  const deliverableInputs = quotationData.deliverables
    .map((item, index) => {
      const descOpen = openDescEditors.has(`deliverable:${index}`);

      return `
      <div class="scope-check-row">
        <label class="scope-check">
          <input type="checkbox" data-deliverable-item="${index}" ${item.enabled !== false ? "checked" : ""}>
          <span>${escapeHtml(item.name)}</span>
        </label>
        <button type="button" class="desc-toggle${descOpen ? " is-open" : ""}" data-deliverable-desc-toggle="${index}" title="تعديل وصف المخرج">وصف</button>
        <button type="button" class="scope-remove" data-deliverable-remove="${index}" aria-label="إزالة ${escapeHtml(item.name)}" title="إزالة البند">×</button>
      </div>
      ${descOpen ? `<input type="text" class="desc-input" data-deliverable-desc="${index}" value="${escapeHtml(item.description || "")}" placeholder="وصف يظهر تحت المخرج في العرض…" aria-label="وصف ${escapeHtml(item.name)}">` : ""}
    `;
    })
    .join("");

  const paymentScheduleInputs = quotationData.paymentSchedule
    .map((payment, index) => `
      <div class="payment-edit-row">
        <div class="money-input-row payment-percent">
          <input id="payment-percent-${index}" data-payment-index="${index}" type="text" inputmode="decimal" value="${escapeHtml(payment.percent)}" aria-label="نسبة الدفعة">
          <span>%</span>
        </div>
        <input data-payment-label="${index}" type="text" value="${escapeHtml(payment.label)}" placeholder="وصف الدفعة" aria-label="وصف الدفعة">
        <button type="button" class="scope-remove" data-payment-remove="${index}" aria-label="إزالة الدفعة" title="إزالة الدفعة">×</button>
      </div>
    `)
    .join("");

  const financialTermInputs = quotationData.financialTerms
    .map((term, index) => `
      <div class="term-edit-row">
        <input data-term-index="${index}" type="text" value="${escapeHtml(term)}" aria-label="شرط مالي">
        <button type="button" class="scope-remove" data-term-remove="${index}" aria-label="إزالة الشرط" title="إزالة الشرط">×</button>
      </div>
    `)
    .join("");

  const scopeGroupsInputs = quotationData.scopeGroups
    .map((group, groupIndex) => {
      const itemsMarkup = group.items
        .map((item, itemIndex) => {
          const descOpen = openDescEditors.has(`scope:${groupIndex}:${itemIndex}`);

          return `
          <div class="scope-check-row">
            <label class="scope-check">
              <input type="checkbox" data-scope-group="${groupIndex}" data-scope-item="${itemIndex}" ${item.enabled !== false ? "checked" : ""}>
              <span>${escapeHtml(item.name)}</span>
            </label>
            <button type="button" class="desc-toggle${descOpen ? " is-open" : ""}" data-scope-desc-toggle="${groupIndex}:${itemIndex}" title="تعديل وصف البند">وصف</button>
            <button type="button" class="scope-remove" data-scope-remove="${groupIndex}:${itemIndex}" aria-label="إزالة ${escapeHtml(item.name)}" title="إزالة البند">×</button>
          </div>
          ${descOpen ? `<input type="text" class="desc-input" data-scope-desc="${groupIndex}:${itemIndex}" value="${escapeHtml(item.description || "")}" placeholder="وصف يظهر تحت البند في العرض…" aria-label="وصف ${escapeHtml(item.name)}">` : ""}
        `;
        })
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

  const scopeBody = `
    <p class="scope-hint">البنود المحددة تظهر في العرض. أزِل التحديد لإخفاء بند دون حذفه، أو أضِف بنوداً جديدة.</p>
    ${scopeGroupsInputs}
    <button type="button" class="reset-defaults-btn" data-reset-scope>إعادة تعبئة القائمة الافتراضية</button>
  `;

  const deliverablesBody = `
    <label class="toggle-label section-show-toggle">
      <input id="showDeliverables" data-key="showDeliverables" type="checkbox" ${quotationData.showDeliverables ? "checked" : ""}>
      <span>إظهار في العرض</span>
    </label>
    ${deliverableInputs}
    <div class="scope-add-row">
      <input type="text" data-deliverable-add-input placeholder="إضافة مخرج جديد…" aria-label="إضافة مخرج جديد">
      <button type="button" class="scope-add" data-deliverable-add>إضافة</button>
    </div>
    <button type="button" class="reset-defaults-btn" data-reset-deliverables>إعادة تعبئة القائمة الافتراضية</button>
  `;

  const financialBody = `
    <div class="field">
      <label for="mainPriceNumber">قيمة العرض</label>
      <div class="money-input-row">
        <input id="mainPriceNumber" data-key="mainPriceNumber" data-money-key="mainPriceNumber" type="text" inputmode="decimal" placeholder="0" value="${escapeHtml(getMoneyInputValue(quotationData.mainPriceNumber))}">
        <span>ريال</span>
      </div>
    </div>
    <div class="field">
      <label for="mainPriceWritten">قيمة العرض كتابة</label>
      <input id="mainPriceWritten" data-key="mainPriceWritten" type="text" placeholder="قيمة العرض كتابة" value="${escapeHtml(quotationData.mainPriceWritten)}">
    </div>
    <div class="field">
      <label for="notes">ملاحظات</label>
      <textarea id="notes" data-key="notes" placeholder="ملاحظات">${escapeHtml(quotationData.notes)}</textarea>
    </div>
  `;

  const termsBody = `
    ${financialTermInputs}
    <div class="scope-add-row">
      <input type="text" data-term-add-input placeholder="إضافة شرط جديد…" aria-label="إضافة شرط مالي جديد">
      <button type="button" class="scope-add" data-term-add>إضافة</button>
    </div>
    <button type="button" class="reset-defaults-btn" data-reset-terms>إعادة تعبئة القائمة الافتراضية</button>
  `;

  const paymentsBody = `
    <p class="scope-hint">النسبة والوصف لكل دفعة، ويمكن إضافة دفعات أو حذفها. الضريبة 15% تُحسب تلقائياً.</p>
    ${paymentScheduleInputs}
    <div class="scope-add-row">
      <button type="button" class="scope-add" data-payment-add>إضافة دفعة</button>
    </div>
    <button type="button" class="reset-defaults-btn" data-reset-payments>إعادة تعبئة القائمة الافتراضية</button>
  `;

  const optionalBody = `
    <div class="field toggle-field">
      <label for="showOptionalAnnex">إظهار ملحق الخدمات الاختيارية</label>
      <input id="showOptionalAnnex" data-key="showOptionalAnnex" type="checkbox" ${quotationData.showOptionalAnnex ? "checked" : ""}>
    </div>
    ${optionalServiceInputs}
    <div class="scope-add-row">
      <input type="text" data-service-add-name placeholder="إضافة خدمة جديدة…" aria-label="إضافة خدمة اختيارية جديدة">
      <button type="button" class="scope-add" data-service-add>إضافة</button>
    </div>
    <button type="button" class="reset-defaults-btn" data-reset-services>إعادة تعبئة القائمة الافتراضية</button>
    <div class="field">
      <label for="optionalAnnexNote">ملاحظة ملحق الخدمات</label>
      <textarea id="optionalAnnexNote" data-key="optionalAnnexNote" placeholder="ملاحظة تظهر أسفل جدول الخدمات الاختيارية">${escapeHtml(quotationData.optionalAnnexNote)}</textarea>
    </div>
  `;

  const responsibleBody = `
    <div class="field responsible-name-row">
      <div>
        <label for="responsibleTitle">الصفة</label>
        <select id="responsibleTitle" data-key="responsibleTitle">
          ${responsibleTitleSelectOptions}
        </select>
      </div>
      <div>
        <label for="responsibleName">الاسم</label>
        <input id="responsibleName" data-key="responsibleName" type="text" placeholder="اسم المسؤول" value="${escapeHtml(quotationData.responsibleName)}">
      </div>
    </div>
    <div class="field">
      <label for="responsiblePhone">رقم الجوال</label>
      <input id="responsiblePhone" data-key="responsiblePhone" type="tel" inputmode="tel" placeholder="05xxxxxxxx" value="${escapeHtml(quotationData.responsiblePhone)}">
    </div>
  `;

  const sections = [
    ...builtinSections,
    { id: "scope", body: scopeBody, extraClass: "scope-editor" },
    { id: "deliverables", body: deliverablesBody, extraClass: "scope-editor" },
    { id: "financial", body: financialBody },
    { id: "terms", body: termsBody, extraClass: "scope-editor" },
    { id: "payments", body: paymentsBody, extraClass: "scope-editor" },
    { id: "optional", body: optionalBody },
    { id: "responsible", body: responsibleBody }
  ];

  (quotationData.customSections || []).forEach((section) => {
    sections.push({ id: section.id, body: customSectionEditorBody(section), removable: true });
  });

  editorForm.innerHTML = sections
    .map((section, index) => sectionShell(section.id, index + 1, section.body, { extraClass: section.extraClass, removable: section.removable }))
    .join("") +
    `<button type="button" class="add-section-btn" data-add-section>+ إضافة قسم جديد</button>`;
}

let projectSearchQuery = "";

// Which inline description editors are open (keys: "scope:g:i", "service:i") —
// kept across editor re-renders so toggles don't collapse while working.
const openDescEditors = new Set();

// Search matches the visible name plus the data a secretary actually remembers:
// client, city, district, quotation number, project type.
function projectMatchesSearch(project, query) {
  if (!query) {
    return true;
  }

  const projectData = project.data || {};
  const haystack = [
    project.name,
    projectData.clientName,
    projectData.city,
    projectData.district,
    projectData.quotationNumber,
    projectData.projectType
  ].filter(Boolean).join(" ").toLowerCase();

  return query.toLowerCase().trim().split(/\s+/).every((word) => haystack.includes(word));
}

function renderProjectsPanel() {
  if (!projectsList) {
    return;
  }

  const matchingProjects = savedProjects.filter((project) => projectMatchesSearch(project, projectSearchQuery));
  const projectsCount = document.querySelector("#projectsCount");

  if (projectsCount) {
    projectsCount.textContent = projectSearchQuery
      ? `${matchingProjects.length} من ${savedProjects.length}`
      : `${savedProjects.length} ${savedProjects.length === 1 ? "مشروع" : "مشاريع"}`;
  }

  const projects = matchingProjects
    .map((project) => {
      const activeClass = project.id === activeProjectId ? " is-active" : "";
      const projectStatus = normalizeProjectStatus(project.status);
      const projectData = project.data || {};
      const projectMeta = [
        projectData.city,
        projectData.district,
        formatProjectUpdatedAt(project.updatedAt)
      ].filter(Boolean).join(" • ");
      const statusButtons = projectStatusOptions
        .map((status) => `
          <button class="project-status-btn${projectStatus === status.value ? " is-active" : ""}" type="button" data-project-status="${escapeHtml(project.id)}:${escapeHtml(status.value)}">
            ${escapeHtml(status.label)}
          </button>
        `)
        .join("");

      return `
        <div class="project-card${activeClass}">
          <button class="project-item" type="button" data-project-id="${escapeHtml(project.id)}">
            <strong>${escapeHtml(project.name)}</strong>
            <span>${escapeHtml(projectMeta)}</span>
          </button>
          <div class="project-card-actions" aria-label="إجراءات المشروع">
            ${statusButtons}
            <button class="project-delete-btn" type="button" data-project-delete="${escapeHtml(project.id)}">حذف المشروع</button>
          </div>
        </div>
      `;
    })
    .join("");

  const emptyMessage = projectSearchQuery
    ? `<p class="empty-projects">لا توجد نتائج مطابقة لبحثك.</p>`
    : `<p class="empty-projects">لا توجد مشاريع محفوظة بعد.</p>`;

  projectsList.innerHTML = projects || emptyMessage;
  renderSaveStatus();
}

function getProjectRows() {
  return [
    ["اسم العميل", quotationData.clientName ? getClientDisplayName(quotationData) : ""],
    ["رقم الجوال", quotationData.clientPhone],
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

// The structured footer strip: rendered, centered, from the office's registration and
// contact fields — no pre-designed artwork, so a new office is print-ready without a
// designer. Until the office fills its data, a screen-only hint shows in the preview.
function renderFooterStrip() {
  const fieldsData = brandProfile.footerFields;
  const contactCells = [
    fieldsData.phone && `<span class="footer-cell">هاتف: ${escapeHtml(fieldsData.phone)}</span>`,
    fieldsData.email && `<span class="footer-cell">${escapeHtml(fieldsData.email)}</span>`,
    fieldsData.website && `<span class="footer-cell">${escapeHtml(fieldsData.website)}</span>`,
    fieldsData.address && `<span class="footer-cell">${escapeHtml(fieldsData.address)}</span>`
  ].filter(Boolean).join("");
  const registrationCells = [
    fieldsData.crNumber && `س.ت: ${escapeHtml(fieldsData.crNumber)}`,
    fieldsData.vatNumber && `الرقم الضريبي: ${escapeHtml(fieldsData.vatNumber)}`,
    fieldsData.accreditation && `اعتماد الهيئة السعودية للمهندسين: ${escapeHtml(fieldsData.accreditation)}`
  ].filter(Boolean).join(" · ");
  const qrMarkup = fieldsData.qrDataUrl
    ? `<img class="footer-qr" src="${escapeHtml(fieldsData.qrDataUrl)}" alt="رمز الاستجابة السريعة للمكتب">`
    : "";

  if (!contactCells && !registrationCells && !qrMarkup) {
    return `<div class="footer-strip-hint">أكمِل بيانات التذييل (السجل، الضريبي، التواصل) من إعدادات المكتب لتظهر هنا.</div>`;
  }

  return `
    <div class="footer-strip">
      ${qrMarkup}
      <div class="footer-strip-text">
        <div class="footer-contacts">${contactCells}</div>
        ${registrationCells ? `<div class="footer-registrations">${registrationCells}</div>` : ""}
      </div>
    </div>
  `;
}

function renderFooter(pageNumber, totalPages) {
  return `
    <footer class="doc-footer">
      ${renderFooterStrip()}
      <span class="page-number">${pageNumber}/${totalPages}</span>
    </footer>
  `;
}

function renderAcceptanceContactButton() {
  const contactUrl = getResponsibleContactUrl();
  const responsibleName = getResponsibleDisplayName();

  if (!contactUrl || !responsibleName) {
    return "";
  }

  return `
    <a class="acceptance-contact-btn" href="${escapeHtml(contactUrl)}" target="_blank" rel="noopener">
      <span>لقبول العرض أو بحال أي إستفسار</span>
      <strong>أنقر هنا للتواصل مع ${escapeHtml(responsibleName)}</strong>
    </a>
  `;
}

function renderClosingBlock() {
  return `
    <section class="closing-block">
      <p>${escapeHtml(brandProfile.closingText)}</p>
      <p class="closing-regards">وتفضلوا بقبول فائق الاحترام والتقدير</p>
      ${renderAcceptanceContactButton()}
      <img class="closing-signature" src="${escapeHtml(getSignatureSrc())}" alt="توقيع وختم المكتب">
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

// English page titles shown under the Arabic ones when the bilingual option is on.
const pageTitleTranslations = {
  "ملخص المشروع": "Project Summary",
  "نطاق الأعمال": "Scope of Work",
  "المخرجات المتوقعة": "Deliverables",
  "العرض المالي": "Financial Proposal",
  "ملحق الخدمات الاختيارية": "Optional Services Annex"
};

function renderPageTitle(title) {
  const english = quotationData.bilingual && pageTitleTranslations[title];
  return `<h2 class="page-title">${title}${english ? `<span class="page-title-en">${escapeHtml(english)}</span>` : ""}</h2>`;
}

function pageShell(title, body, pageNumber, totalPages, isLast = false) {
  return `
    <article class="page${isLast ? " is-last-page" : ""}">
      <div class="page-content">
        <header class="doc-header">
          <div>
            <div class="doc-company">${escapeHtml(brandProfile.companyName)}</div>
            <div class="doc-meta">عرض رقم ${escapeHtml(quotationData.quotationNumber)} · ${renderDatePair()}</div>
          </div>
          <img class="doc-logo" src="${escapeHtml(getLogoSrc())}" alt="">
        </header>
        ${renderPageTitle(title)}
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
          <div></div>
          <div class="cover-badge">عرض سعر رسمي${quotationData.bilingual ? `<span class="cover-badge-en">Official Price Quotation</span>` : ""}</div>
        </div>
        <section class="cover-title">
          <img class="cover-logo" src="${escapeHtml(getLogoSrc())}" alt="">
          <p class="kicker">${escapeHtml(brandProfile.companyName)}</p>
          <h2>${escapeHtml(getPermitTitle())}</h2>
          <p>${escapeHtml(quotationData.projectType)} — ${ph(quotationData.city, "المدينة")}</p>
        </section>
        <section class="cover-grid">
          <div class="info-card"><span>العميل</span><strong>${ph(quotationData.clientName ? getClientDisplayName(quotationData) : "", "اسم العميل")}</strong></div>
          <div class="info-card"><span>موقع المشروع</span><strong>${quotationData.district ? `${escapeHtml(quotationData.district)}، ${ph(quotationData.city, "المدينة")}` : ph(quotationData.city, "المدينة")}</strong></div>
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

function renderSummary(pageNumber, totalPages) {
  const rows = getProjectRows()
    .map(([label, value]) => `<tr><th>${label}</th><td>${ph(value, label)}</td></tr>`)
    .join("");

  return pageShell(
    "ملخص المشروع",
    `
      <p class="intro">
        بناءً على بيانات الأرض المقدمة، تقدم ${escapeHtml(brandProfile.companyName)} عرضها
        ل${escapeHtml(quotationData.projectType)} في حي ${ph(quotationData.district, "الحي")} بمدينة ${ph(quotationData.city, "المدينة")}،
        وذلك وفق نطاق الأعمال المفصّل في هذا العرض.
      </p>
      <table class="data-table"><tbody>${rows}</tbody></table>
    `,
    pageNumber,
    totalPages
  );
}

function renderScope(pageNumber, totalPages) {
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
                  <small class="scope-description">${escapeHtml(item.description || "")}</small>
                </div>
              </li>
            `).join("")}
          </ul>
        </section>
      `;
    })
    .join("");

  return pageShell(getSectionTitle("scope"), body, pageNumber, totalPages);
}

function renderDeliverables(pageNumber, totalPages) {
  return pageShell(
    getSectionTitle("deliverables"),
    `
      <ul class="deliverables-list">
        ${quotationData.deliverables
          .filter((item) => item.enabled !== false)
          .map((item) => `<li class="deliverable"><span class="check">✓</span><div><span>${escapeHtml(item.name)}</span>${item.description ? `<small class="scope-description">${escapeHtml(item.description)}</small>` : ""}</div></li>`)
          .join("")}
      </ul>
      ${quotationData.notes.trim() ? `<div class="note">${escapeHtml(quotationData.notes)}</div>` : ""}
    `,
    pageNumber,
    totalPages
  );
}

// Offer date + validity period (in days) → the explicit expiry date, both calendars.
function getValidUntilText() {
  const days = parseInt(String(quotationData.validityPeriod).replace(/[^\d]/g, ""), 10);

  if (!days || !quotationData.dateIso) {
    return "";
  }

  const expiry = dateFromIso(quotationData.dateIso);
  expiry.setDate(expiry.getDate() + days);
  const expiryIso = isoFromDate(expiry);

  return `${formatGregorianDate(expiryIso)} (${formatHijriDate(expiryIso)})`;
}

function getGrandTotal() {
  const subtotal = parseMoneyAmount(quotationData.mainPriceNumber);
  return subtotal ? subtotal * 1.15 : 0;
}

function renderFinancial(pageNumber, totalPages) {
  const validUntil = getValidUntilText();
  const terms = [
    ...quotationData.financialTerms,
    `العرض صالح لمدة ${quotationData.validityPeriod}${validUntil ? ` — حتى تاريخ ${validUntil}` : ""}`
  ];
  const closingBlock = quotationData.showOptionalAnnex ? "" : renderClosingBlock();
  const grandTotal = getGrandTotal();
  const grandTotalWords = grandTotal && typeof tafqitRiyals === "function" ? tafqitRiyals(grandTotal) : "";
  const grandTotalMarkup = grandTotal
    ? `
      <div class="grand-total-row">
        <span>الإجمالي شامل ضريبة القيمة المضافة 15%</span>
        <strong>${formatMoneyAmount(grandTotal)} ريال</strong>
      </div>
    `
    : "";

  return pageShell(
    getSectionTitle("financial"),
    `
      <div class="price-card">
        <span>القيمة الأساسية للعرض</span>
        <strong>${ph(formatRiyalAmount(quotationData.mainPriceNumber), "قيمة العرض")}</strong>
        <em>${ph(quotationData.mainPriceWritten, "القيمة كتابةً")}</em>
        ${grandTotalMarkup}
      </div>
      <h3 class="scope-heading">${escapeHtml(getSectionTitle("terms"))}</h3>
      <ul class="terms-list">
        ${terms.map((term) => `<li>${escapeHtml(term)}</li>`).join("")}
      </ul>
      <h3 class="scope-heading">${escapeHtml(getSectionTitle("payments"))}</h3>
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
    pageNumber,
    totalPages,
    !quotationData.showOptionalAnnex
  );
}

function renderOptionalAnnex(pageNumber, totalPages) {
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
    getSectionTitle("optional"),
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
    pageNumber,
    totalPages,
    true
  );
}

// A user-added section prints as its own page: the section title as the page title and
// each non-empty line as a list item. Placed after deliverables, before the financial page.
function renderCustomSection(section, pageNumber, totalPages) {
  const items = (section.items || []).filter((text) => String(text).trim());
  const body = `
    <ul class="custom-section-list">
      ${items.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}
    </ul>
  `;

  return pageShell(getSectionTitle(section.id), body, pageNumber, totalPages);
}

function renderPreview() {
  const customSections = (quotationData.customSections || []).filter(customSectionHasContent);

  // Build the page list in document order, then number them sequentially so toggling the
  // optional pages or adding custom sections never desyncs the "n/total" footer.
  const builders = [
    (n, t) => renderSummary(n, t),
    (n, t) => renderScope(n, t)
  ];
  if (quotationData.showDeliverables) {
    builders.push((n, t) => renderDeliverables(n, t));
  }
  customSections.forEach((section) => {
    builders.push((n, t) => renderCustomSection(section, n, t));
  });
  builders.push((n, t) => renderFinancial(n, t));
  if (quotationData.showOptionalAnnex) {
    builders.push((n, t) => renderOptionalAnnex(n, t));
  }

  const totalPages = builders.length + 1; // + cover (page 1)
  const pages = [renderCover(totalPages)];
  builders.forEach((build, index) => pages.push(build(index + 2, totalPages)));

  preview.innerHTML = pages.join("");
  pageCount.textContent = `${pages.length} صفحات`;
  applyPreviewZoom();
  fitPages();
  flagPageOverflow();
}

// Auto-fit: any page whose content would spill past one A4 sheet is scaled down (via zoom on
// its content) so the document prints exactly one page per sheet — no stray overflow page when,
// e.g., the optional annex is off and the closing block lands on the financial page. The scale
// is derived from the A4 ratio, so it is independent of the on-screen preview zoom and carries
// into print. A floor keeps text from becoming unreadably small for extreme content.
function fitPages() {
  const a4Ratio = 297 / 210;
  const padRatio = 38 / 210; // 19mm top + 19mm bottom page padding, relative to the 210mm width
  const pages = Array.from(preview.querySelectorAll(".page"));

  // Reset any previous fit so natural heights are measured.
  pages.forEach((page) => {
    const content = page.querySelector(".page-content");
    if (content) {
      content.style.zoom = "";
    }
  });

  pages.forEach((page) => {
    const content = page.querySelector(".page-content");
    const rect = page.getBoundingClientRect();
    if (!content || !rect.width) {
      return;
    }

    const paddingPx = rect.width * padRatio;
    const available = rect.width * a4Ratio - paddingPx; // content height that fits one sheet
    const current = rect.height - paddingPx; // current (possibly overflowing) content height

    if (current > available + 1) {
      content.style.zoom = String(Math.max(0.5, (available / current) * 0.99));
    }
  });
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

function applyPreviewZoom() {
  const page = preview.querySelector(".page");
  const shell = preview.closest(".preview-shell");

  if (!page || !shell) {
    return;
  }

  preview.style.setProperty("--preview-zoom", "1");
  const pageWidth = page.getBoundingClientRect().width;
  const availableWidth = shell.clientWidth - 16;
  const scale = Math.min(1, Math.max(0.42, availableWidth / pageWidth));
  preview.style.setProperty("--preview-zoom", String(scale));
}

function renderApp() {
  // Full reloads (init, switch/create/duplicate project) return users to fast-start.
  resetExpandedSections();
  editingSectionTitle = null;
  renderShellBrand();
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

  // Editing a section title: store the override and save. No re-render, so the title
  // input keeps focus while typing.
  if (input.dataset.sectionTitle !== undefined) {
    const sectionId = input.dataset.sectionTitle;
    if (sectionId.startsWith("custom:")) {
      const section = getCustomSection(sectionId);
      if (section) {
        section.title = input.value;
      }
    } else {
      quotationData.sectionTitles = quotationData.sectionTitles || {};
      quotationData.sectionTitles[sectionId] = input.value;
    }
    // Re-render the document (not the editor) so synced page titles update live while
    // typing; the editor input keeps focus.
    renderPreview();
    saveActiveProject();
    return;
  }

  if (input.dataset.customItem !== undefined) {
    const section = getCustomSection(input.dataset.customItem);
    const itemIndex = Number(input.dataset.customIndex);
    if (section && Array.isArray(section.items) && itemIndex >= 0) {
      section.items[itemIndex] = input.value;
      renderPreview();
      saveActiveProject();
    }
    return;
  }

  // Free-typed custom service name: only the title changes; scope/deliverables are left as-is.
  if (input.dataset.customService !== undefined) {
    quotationData.permitType = input.value;
    renderPreview();
    saveActiveProject();
    return;
  }

  // Service-type selection loads that service's tailored scope/deliverables/title.
  if (key === "permitType") {
    if (input.value === CUSTOM_SERVICE_VALUE) {
      // Enter custom mode: blank the name for typing, keep the current scope/deliverables.
      quotationData.serviceIsCustom = true;
      quotationData.permitType = "";
      renderEditor();
      const customInput = editorForm.querySelector("[data-custom-service]");
      if (customInput) {
        customInput.focus();
      }
      renderPreview();
      saveActiveProject();
      return;
    }

    applyServiceTemplate(input.value);
    renderEditor();
    renderPreview();
    saveActiveProject();
    return;
  }

  // Changing the category narrows the service list and selects that category's first service.
  if (key === "serviceCategory") {
    const category = serviceCatalog.find((cat) => cat.category === input.value) || serviceCatalog[0];
    applyServiceTemplate(category.services[0].value);

    // نوع المشروع options depend on the category; switch to a matching one when the current
    // value no longer fits (e.g. building type → land type when moving to أعمال المساحة).
    const projectTypes = getProjectTypeOptions(quotationData.serviceCategory);
    if (!projectTypes.includes(quotationData.projectType)) {
      quotationData.projectType = projectTypes[0];
    }

    renderEditor();
    renderPreview();
    saveActiveProject();
    return;
  }

  if (input.dataset.scopeGroup !== undefined && input.dataset.scopeItem !== undefined) {
    quotationData.scopeGroups[Number(input.dataset.scopeGroup)].items[Number(input.dataset.scopeItem)].enabled = input.checked;
    renderPreview();
    saveActiveProject();
    return;
  }

  if (input.dataset.deliverableItem !== undefined) {
    quotationData.deliverables[Number(input.dataset.deliverableItem)].enabled = input.checked;
    renderPreview();
    saveActiveProject();
    return;
  }

  if (input.dataset.scopeDesc !== undefined) {
    const [groupIndex, itemIndex] = input.dataset.scopeDesc.split(":").map(Number);
    quotationData.scopeGroups[groupIndex].items[itemIndex].description = input.value;
    renderPreview();
    saveActiveProject();
    return;
  }

  if (input.dataset.serviceDesc !== undefined) {
    quotationData.optionalServices[Number(input.dataset.serviceDesc)].description = input.value;
    renderPreview();
    saveActiveProject();
    return;
  }

  if (input.dataset.deliverableDesc !== undefined) {
    quotationData.deliverables[Number(input.dataset.deliverableDesc)].description = input.value;
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

  // The written amount (تفقيط) follows the figure automatically; typing in the field
  // takes manual control, and clearing it hands control back to the automatic text.
  if (key === "mainPriceNumber" && !quotationData.mainPriceWrittenManual) {
    quotationData.mainPriceWritten = tafqitRiyals(parseMoneyAmount(quotationData.mainPriceNumber));
    const writtenInput = editorForm.querySelector("#mainPriceWritten");

    if (writtenInput) {
      writtenInput.value = quotationData.mainPriceWritten;
    }
  }

  if (key === "mainPriceWritten") {
    quotationData.mainPriceWrittenManual = input.value.trim() !== "";

    if (!quotationData.mainPriceWrittenManual) {
      quotationData.mainPriceWritten = tafqitRiyals(parseMoneyAmount(quotationData.mainPriceNumber));
      input.value = quotationData.mainPriceWritten;
    }
  }

  if (serviceIndex !== undefined) {
    quotationData.optionalServices[Number(serviceIndex)].price = input.dataset.moneyServiceIndex !== undefined ? formatRiyalAmount(input.value) : input.value;
  }

  if (paymentIndex !== undefined) {
    quotationData.paymentSchedule[Number(paymentIndex)].percent = input.value;
  }

  if (input.dataset.paymentLabel !== undefined) {
    quotationData.paymentSchedule[Number(input.dataset.paymentLabel)].label = input.value;
  }

  if (input.dataset.termIndex !== undefined) {
    quotationData.financialTerms[Number(input.dataset.termIndex)] = input.value;
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

  quotationData.scopeGroups[groupIndex].items.push({ name, enabled: true, description: "" });
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

// Deliverables and optional services use the same add/toggle/remove pattern as scope items.
function addDeliverable() {
  const input = editorForm.querySelector("[data-deliverable-add-input]");
  const name = input ? input.value.trim() : "";

  if (!name) {
    return;
  }

  quotationData.deliverables.push({ name, enabled: true, description: "" });
  renderEditor();
  renderPreview();
  saveActiveProject();

  const nextInput = editorForm.querySelector("[data-deliverable-add-input]");
  if (nextInput) {
    nextInput.focus();
  }
}

function removeDeliverable(index) {
  if (!quotationData.deliverables[index]) {
    return;
  }

  quotationData.deliverables.splice(index, 1);
  renderEditor();
  renderPreview();
  saveActiveProject();
}

function addOptionalService() {
  const input = editorForm.querySelector("[data-service-add-name]");
  const name = input ? input.value.trim() : "";

  if (!name) {
    return;
  }

  quotationData.optionalServices.push({ name, description: "", price: "" });
  renderEditor();
  renderPreview();
  saveActiveProject();

  const nextInput = editorForm.querySelector("[data-service-add-name]");
  if (nextInput) {
    nextInput.focus();
  }
}

function removeOptionalService(index) {
  if (!quotationData.optionalServices[index]) {
    return;
  }

  quotationData.optionalServices.splice(index, 1);
  renderEditor();
  renderPreview();
  saveActiveProject();
}

// Open/close an inline description editor and focus its input when opening.
function toggleDescEditor(key, inputSelector) {
  if (openDescEditors.has(key)) {
    openDescEditors.delete(key);
  } else {
    openDescEditors.add(key);
  }

  renderEditor();

  if (openDescEditors.has(key)) {
    const descInput = editorForm.querySelector(inputSelector);

    if (descInput) {
      descInput.focus();
    }
  }
}

function addPaymentPhase() {
  quotationData.paymentSchedule.push({ percent: "", label: "" });
  renderEditor();
  renderPreview();
  saveActiveProject();

  const rows = editorForm.querySelectorAll("[data-payment-index]");
  const lastRow = rows[rows.length - 1];
  if (lastRow) {
    lastRow.focus();
  }
}

function removePaymentPhase(index) {
  if (!quotationData.paymentSchedule[index]) {
    return;
  }

  quotationData.paymentSchedule.splice(index, 1);
  renderEditor();
  renderPreview();
  saveActiveProject();
}

function addFinancialTerm() {
  const input = editorForm.querySelector("[data-term-add-input]");
  const term = input ? input.value.trim() : "";

  if (!term) {
    return;
  }

  quotationData.financialTerms.push(term);
  renderEditor();
  renderPreview();
  saveActiveProject();

  const nextInput = editorForm.querySelector("[data-term-add-input]");
  if (nextInput) {
    nextInput.focus();
  }
}

function removeFinancialTerm(index) {
  if (quotationData.financialTerms[index] === undefined) {
    return;
  }

  quotationData.financialTerms.splice(index, 1);
  renderEditor();
  renderPreview();
  saveActiveProject();
}

// A lone text input submits the form on Enter, which would reload the page; block that.
editorForm.addEventListener("submit", (event) => event.preventDefault());

editorForm.addEventListener("keydown", (event) => {
  // Enter or Escape confirms a section-title edit and returns it to read-only text.
  if (event.target.matches("[data-section-title]")) {
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      editingSectionTitle = null;
      renderEditor();
    }
    return;
  }

  if (event.key !== "Enter") {
    return;
  }

  if (event.target.matches("[data-scope-add-input]")) {
    event.preventDefault();
    addScopeItem(Number(event.target.dataset.scopeAddInput));
  } else if (event.target.matches("[data-deliverable-add-input]")) {
    event.preventDefault();
    addDeliverable();
  } else if (event.target.matches("[data-service-add-name]")) {
    event.preventDefault();
    addOptionalService();
  } else if (event.target.matches("[data-term-add-input]")) {
    event.preventDefault();
    addFinancialTerm();
  } else if (event.target.matches("[data-custom-item-add]")) {
    event.preventDefault();
    addCustomItem(event.target.dataset.customItemAdd);
  }
});

editorForm.addEventListener("input", updateEditorValue);

projectsList.addEventListener("click", (event) => {
  const statusButton = event.target.closest("[data-project-status]");
  if (statusButton) {
    const [projectId, status] = statusButton.dataset.projectStatus.split(":");
    setProjectStatus(projectId, status);
    return;
  }

  const deleteButton = event.target.closest("[data-project-delete]");
  if (deleteButton) {
    deleteProject(deleteButton.dataset.projectDelete);
    return;
  }

  const projectButton = event.target.closest("[data-project-id]");

  if (projectButton) {
    switchProject(projectButton.dataset.projectId);
  }
});

const projectSearchInput = document.querySelector("#projectSearch");

if (projectSearchInput) {
  projectSearchInput.addEventListener("input", () => {
    projectSearchQuery = projectSearchInput.value;
    renderProjectsPanel();
  });
}

editorForm.addEventListener("click", (event) => {
  const sectionToggle = event.target.closest("[data-section-toggle]");
  if (sectionToggle) {
    toggleSection(sectionToggle.dataset.sectionToggle);
    return;
  }

  const sectionEdit = event.target.closest("[data-section-edit]");
  if (sectionEdit) {
    beginSectionTitleEdit(sectionEdit.dataset.sectionEdit);
    return;
  }

  if (event.target.closest("[data-add-section]")) {
    addCustomSection();
    return;
  }

  const sectionRemove = event.target.closest("[data-section-remove]");
  if (sectionRemove) {
    removeCustomSection(sectionRemove.dataset.sectionRemove);
    return;
  }

  const customItemAddBtn = event.target.closest("[data-custom-item-add-btn]");
  if (customItemAddBtn) {
    addCustomItem(customItemAddBtn.dataset.customItemAddBtn);
    return;
  }

  const customItemRemove = event.target.closest("[data-custom-item-remove]");
  if (customItemRemove) {
    removeCustomItem(customItemRemove.dataset.customItemRemove, Number(customItemRemove.dataset.customIndex));
    return;
  }

  const scopeAdd = event.target.closest("[data-scope-add]");
  const scopeRemove = event.target.closest("[data-scope-remove]");
  const deliverableAdd = event.target.closest("[data-deliverable-add]");
  const deliverableRemove = event.target.closest("[data-deliverable-remove]");
  const serviceAdd = event.target.closest("[data-service-add]");
  const serviceRemove = event.target.closest("[data-service-remove]");
  const dateInput = event.target.closest("[data-date-input]");
  const calendarNav = event.target.closest("[data-calendar-nav]");
  const dateChoice = event.target.closest("[data-date-choice]");

  if (event.target.closest("[data-email-send]")) {
    sendQuotationEmail();
    return;
  }

  if (scopeAdd) {
    addScopeItem(Number(scopeAdd.dataset.scopeAdd));
    return;
  }

  if (scopeRemove) {
    const [groupIndex, itemIndex] = scopeRemove.dataset.scopeRemove.split(":").map(Number);
    removeScopeItem(groupIndex, itemIndex);
    return;
  }

  if (deliverableAdd) {
    addDeliverable();
    return;
  }

  if (event.target.closest("[data-reset-scope]")) {
    quotationData.scopeGroups = effectiveServiceTemplate(quotationData.permitType).scopeGroups;
    renderEditor();
    renderPreview();
    saveActiveProject();
    return;
  }

  if (event.target.closest("[data-reset-deliverables]")) {
    quotationData.deliverables = effectiveServiceTemplate(quotationData.permitType).deliverables;
    renderEditor();
    renderPreview();
    saveActiveProject();
    return;
  }

  if (event.target.closest("[data-reset-payments]")) {
    quotationData.paymentSchedule = cloneData(getDefaultQuotationData().paymentSchedule);
    renderEditor();
    renderPreview();
    saveActiveProject();
    return;
  }

  if (event.target.closest("[data-reset-terms]")) {
    quotationData.financialTerms = cloneData(getDefaultQuotationData().financialTerms);
    renderEditor();
    renderPreview();
    saveActiveProject();
    return;
  }

  if (event.target.closest("[data-reset-services]")) {
    quotationData.optionalServices = cloneData(getDefaultQuotationData().optionalServices);
    renderEditor();
    renderPreview();
    saveActiveProject();
    return;
  }

  if (deliverableRemove) {
    removeDeliverable(Number(deliverableRemove.dataset.deliverableRemove));
    return;
  }

  if (serviceAdd) {
    addOptionalService();
    return;
  }

  if (serviceRemove) {
    removeOptionalService(Number(serviceRemove.dataset.serviceRemove));
    return;
  }

  const scopeDescToggle = event.target.closest("[data-scope-desc-toggle]");
  if (scopeDescToggle) {
    toggleDescEditor(`scope:${scopeDescToggle.dataset.scopeDescToggle}`, `[data-scope-desc="${scopeDescToggle.dataset.scopeDescToggle}"]`);
    return;
  }

  const serviceDescToggle = event.target.closest("[data-service-desc-toggle]");
  if (serviceDescToggle) {
    toggleDescEditor(`service:${serviceDescToggle.dataset.serviceDescToggle}`, `[data-service-desc="${serviceDescToggle.dataset.serviceDescToggle}"]`);
    return;
  }

  const deliverableDescToggle = event.target.closest("[data-deliverable-desc-toggle]");
  if (deliverableDescToggle) {
    toggleDescEditor(`deliverable:${deliverableDescToggle.dataset.deliverableDescToggle}`, `[data-deliverable-desc="${deliverableDescToggle.dataset.deliverableDescToggle}"]`);
    return;
  }

  if (event.target.closest("[data-payment-add]")) {
    addPaymentPhase();
    return;
  }

  const paymentRemove = event.target.closest("[data-payment-remove]");
  if (paymentRemove) {
    removePaymentPhase(Number(paymentRemove.dataset.paymentRemove));
    return;
  }

  if (event.target.closest("[data-term-add]")) {
    addFinancialTerm();
    return;
  }

  const termRemove = event.target.closest("[data-term-remove]");
  if (termRemove) {
    removeFinancialTerm(Number(termRemove.dataset.termRemove));
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


newProjectBtn.addEventListener("click", createNewProject);
saveProjectBtn.addEventListener("click", saveActiveProject);
duplicateProjectBtn.addEventListener("click", duplicateActiveProject);
window.addEventListener("resize", applyPreviewZoom);
window.addEventListener("load", flagPageOverflow);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(flagPageOverflow);
}

/* ----------------------------------------------------------------------------
   Office settings (إعدادات المكتب): the office edits its identity — name, logo,
   stamp, footer (image or structured fields), closing text — in a draft that is
   committed to the brand profile only on save. Uploaded images are downscaled to
   keep localStorage small.
---------------------------------------------------------------------------- */

const settingsDialog = document.querySelector("#settingsDialog");
const settingsForm = document.querySelector("#settingsForm");
const officeSettingsBtn = document.querySelector("#officeSettingsBtn");

let settingsDraft = null;

function renderShellBrand() {
  const brandName = document.querySelector("#brandOfficeName");
  const brandLogo = document.querySelector("#brandLogo");

  if (brandName) {
    brandName.textContent = brandProfile.companyName;
  }

  if (brandLogo) {
    brandLogo.src = getLogoSrc();
  }
}

function readImageAsDataUrl(file, maxDimension = 640) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));

        if (scale === 1) {
          resolve(String(reader.result));
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = () => reject(new Error("invalid image"));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function setSettingsValue(id, value) {
  const input = settingsForm.querySelector(`#${id}`);

  if (input) {
    input.value = value || "";
  }
}

function getSettingsValue(id) {
  const input = settingsForm.querySelector(`#${id}`);
  return input ? input.value.trim() : "";
}

function updateSettingsPreview(id, src) {
  const previewImg = settingsForm.querySelector(`#${id}`);

  if (previewImg) {
    previewImg.src = src || "";
    previewImg.hidden = !src;
  }
}

function refreshSettingsPreviews() {
  updateSettingsPreview("settingsLogoPreview", settingsDraft.logoDataUrl || settingsDraft.logoPath);
  updateSettingsPreview("settingsSignaturePreview", settingsDraft.signatureDataUrl || settingsDraft.signaturePath);
  updateSettingsPreview("settingsQrPreview", settingsDraft.footerFields.qrDataUrl);
}

function openOfficeSettings() {
  settingsDraft = cloneData(brandProfile);
  setSettingsValue("settingsCompanyName", settingsDraft.companyName);
  setSettingsValue("settingsClosingText", settingsDraft.closingText);
  setSettingsValue("settingsCr", settingsDraft.footerFields.crNumber);
  setSettingsValue("settingsVat", settingsDraft.footerFields.vatNumber);
  setSettingsValue("settingsAccreditation", settingsDraft.footerFields.accreditation);
  setSettingsValue("settingsAddress", settingsDraft.footerFields.address);
  setSettingsValue("settingsPhone", settingsDraft.footerFields.phone);
  setSettingsValue("settingsEmail", settingsDraft.footerFields.email);
  setSettingsValue("settingsWebsite", settingsDraft.footerFields.website);

  const defaultsStatus = settingsForm.querySelector("#settingsDefaultsStatus");
  if (defaultsStatus) {
    defaultsStatus.textContent = settingsDraft.defaults
      ? "للمكتب قوائم افتراضية محفوظة."
      : "لم تُحفظ قوائم افتراضية بعد — تُستخدم قوائم التطبيق الأساسية.";
  }

  refreshSettingsPreviews();
  settingsDialog.showModal();
}

async function handleSettingsImageUpload(input) {
  const file = input.files && input.files[0];

  if (!file) {
    return;
  }

  try {
    const dataUrl = await readImageAsDataUrl(file, input.dataset.settingsImage === "qr" ? 320 : 640);

    if (input.dataset.settingsImage === "logo") {
      settingsDraft.logoDataUrl = dataUrl;
    } else if (input.dataset.settingsImage === "signature") {
      settingsDraft.signatureDataUrl = dataUrl;
    } else if (input.dataset.settingsImage === "qr") {
      settingsDraft.footerFields.qrDataUrl = dataUrl;
    }

    refreshSettingsPreviews();
  } catch (error) {
    window.alert("تعذّر قراءة الصورة. جرّب ملف PNG أو JPG آخر.");
  } finally {
    input.value = "";
  }
}

function saveOfficeSettings() {
  settingsDraft.companyName = getSettingsValue("settingsCompanyName") || defaultBrandProfile.companyName;
  settingsDraft.closingText = getSettingsValue("settingsClosingText") || defaultBrandProfile.closingText;
  settingsDraft.footerFields.crNumber = getSettingsValue("settingsCr");
  settingsDraft.footerFields.vatNumber = getSettingsValue("settingsVat");
  settingsDraft.footerFields.accreditation = getSettingsValue("settingsAccreditation");
  settingsDraft.footerFields.address = getSettingsValue("settingsAddress");
  settingsDraft.footerFields.phone = getSettingsValue("settingsPhone");
  settingsDraft.footerFields.email = getSettingsValue("settingsEmail");
  settingsDraft.footerFields.website = getSettingsValue("settingsWebsite");

  brandProfile = settingsDraft;
  settingsDraft = null;
  persistBrandProfile();
  settingsDialog.close();
  renderApp();
}

if (officeSettingsBtn && settingsDialog && settingsForm) {
  officeSettingsBtn.addEventListener("click", openOfficeSettings);

  settingsForm.addEventListener("change", (event) => {
    if (event.target.matches("[data-settings-image]")) {
      handleSettingsImageUpload(event.target);
    }
  });

  settingsForm.addEventListener("click", (event) => {
    if (event.target.closest("#settingsSaveBtn")) {
      event.preventDefault();
      saveOfficeSettings();
      return;
    }

    if (event.target.closest("#settingsCancelBtn")) {
      event.preventDefault();
      settingsDraft = null;
      settingsDialog.close();
      return;
    }

    if (event.target.closest("#settingsSaveDefaultsBtn")) {
      event.preventDefault();
      settingsDraft.defaults = {
        validityPeriod: quotationData.validityPeriod,
        notes: quotationData.notes,
        showOptionalAnnex: quotationData.showOptionalAnnex,
        scopeGroups: cloneData(quotationData.scopeGroups),
        deliverables: cloneData(quotationData.deliverables),
        financialTerms: cloneData(quotationData.financialTerms),
        paymentSchedule: cloneData(quotationData.paymentSchedule),
        optionalAnnexNote: quotationData.optionalAnnexNote,
        optionalServices: cloneData(quotationData.optionalServices)
      };

      const defaultsStatus = settingsForm.querySelector("#settingsDefaultsStatus");
      if (defaultsStatus) {
        defaultsStatus.textContent = "تم التقاط قوائم العرض الحالي — تُعتمد عند حفظ الإعدادات.";
      }
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!cloudState.client) {
      setLoginMessage("إعدادات Supabase غير مكتملة.");
      return;
    }

    const email = loginEmail ? loginEmail.value.trim() : "";
    const password = loginPassword ? loginPassword.value : "";

    if (authMode !== "recovery" && (!email || !password)) {
      setLoginMessage("أدخل البريد الإلكتروني وكلمة المرور.");
      return;
    }

    if (!password) {
      setLoginMessage("أدخل كلمة المرور الجديدة.");
      return;
    }

    if (authMode === "recovery") {
      const confirmation = resetPasswordConfirm ? resetPasswordConfirm.value : "";

      if (password.length < 6) {
        setLoginMessage("كلمة المرور ضعيفة جداً (6 أحرف على الأقل).");
        return;
      }
      if (password !== confirmation) {
        setLoginMessage("كلمتا المرور غير متطابقتين.");
        return;
      }

      try {
        setLoginMessage("جاري حفظ كلمة المرور...");
        setSyncStatus("syncing", "جاري تحديث كلمة المرور...");
        const { error } = await cloudState.client.auth.updateUser({ password });

        if (error) {
          throw error;
        }

        setAuthMode("signin");
        await loadCloudWorkspace();
      } catch (error) {
        setSyncStatus("error", "تعذّر تحديث كلمة المرور");
        setLoginMessage("تعذّر تحديث كلمة المرور. اطلب رابطاً جديداً وحاول مرة أخرى.");
      }
      return;
    }

    if (authMode === "signup") {
      const officeName = signupOfficeName ? signupOfficeName.value.trim() : "";

      try {
        setLoginMessage("جاري إنشاء الحساب...");
        setSyncStatus("syncing", "جاري إنشاء الحساب...");
        const { data, error } = await cloudState.client.auth.signUp({
          email,
          password,
          options: { data: { office_name: officeName } }
        });

        if (error) {
          throw error;
        }

        if (data && data.session) {
          // Email confirmation is off: the SIGNED_IN listener loads the workspace.
          setLoginMessage("");
        } else {
          // Email confirmation is on: no session yet, wait for the emailed link.
          // setAuthMode clears the status line, so switch first, then show the notice.
          setAuthMode("signin");
          setSyncStatus("error", "بانتظار تأكيد البريد");
          setLoginMessage("تم إرسال رابط التأكيد إلى بريدك الإلكتروني. افتحه ثم سجّل الدخول.");
        }
      } catch (error) {
        setSyncStatus("error", "تعذّر إنشاء الحساب");
        const message = error && error.message ? error.message : "";
        if (/already\s*registered|already.*exists|user.*exists/i.test(message)) {
          setLoginMessage("هذا البريد مسجّل بالفعل. سجّل الدخول بدلاً من ذلك.");
        } else if (/password/i.test(message)) {
          setLoginMessage("كلمة المرور ضعيفة جداً (6 أحرف على الأقل).");
        } else {
          setLoginMessage("تعذّر إنشاء الحساب. تحقّق من البيانات والاتصال.");
        }
      }
      return;
    }

    try {
      setLoginMessage("جاري تسجيل الدخول...");
      setSyncStatus("syncing", "جاري تسجيل الدخول...");
      const { error } = await cloudState.client.auth.signInWithPassword({ email, password });

      if (error) {
        throw error;
      }

      setLoginMessage("");
    } catch (error) {
      setSyncStatus("error", "فشل تسجيل الدخول");
      setLoginMessage("بيانات الدخول غير صحيحة أو الاتصال غير متاح.");
    }
  });
}

if (authModeToggle) {
  authModeToggle.addEventListener("click", () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
  });
}

if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener("click", async () => {
    if (!cloudState.client) {
      setLoginMessage("إعدادات Supabase غير مكتملة.");
      return;
    }

    const email = loginEmail ? loginEmail.value.trim() : "";
    if (!email) {
      setLoginMessage("أدخل بريدك الإلكتروني أولاً.");
      return;
    }

    try {
      setLoginMessage("جاري إرسال رابط الاستعادة...");
      setSyncStatus("syncing", "جاري إرسال رابط الاستعادة...");
      const { error } = await cloudState.client.auth.resetPasswordForEmail(email, {
        redirectTo: getPasswordRecoveryRedirectUrl()
      });

      if (error) {
        throw error;
      }

      setSyncStatus("ready", "تحقق من بريدك الإلكتروني");
      setLoginMessage("إذا كان البريد مسجلاً، فسيصلك رابط لتعيين كلمة مرور جديدة.");
    } catch (error) {
      setSyncStatus("error", "تعذّر إرسال رابط الاستعادة");
      setLoginMessage("تعذّر إرسال رابط الاستعادة. تحقّق من البريد والاتصال.");
    }
  });
}

if (continueLocalBtn) {
  continueLocalBtn.addEventListener("click", continueWithoutSync);
}

if (cloudLoginBtn) {
  cloudLoginBtn.addEventListener("click", showCloudLogin);
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    if (cloudState.client) {
      await cloudState.client.auth.signOut();
    }
  });
}

// First-visit walkthrough: an in-app animated intro (not a recorded GIF) that auto-plays
// through the steps, can be skipped, and is reopened anytime via "كيف يعمل التطبيق؟".
const INTRO_SEEN_KEY = "oroudiIntroSeen";
const introOverlay = document.querySelector("#introOverlay");
const introStage = document.querySelector("#introStage");
const introDots = document.querySelector("#introDots");
const introNextBtn = document.querySelector("#introNextBtn");
const introSkipBtn = document.querySelector("#introSkipBtn");
const introReplayBtn = document.querySelector("#introReplayBtn");
const introSlides = introStage ? Array.from(introStage.querySelectorAll("[data-intro-slide]")) : [];

let introIndex = 0;
let introTimer = 0;
const introReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function renderIntroSlide() {
  introSlides.forEach((slide, i) => slide.classList.toggle("is-active", i === introIndex));
  if (introDots) {
    Array.from(introDots.children).forEach((dot, i) => dot.classList.toggle("is-active", i === introIndex));
  }
  if (introNextBtn) {
    introNextBtn.textContent = introIndex === introSlides.length - 1 ? "ابدأ الآن" : "التالي";
  }
}

function goToIntroSlide(index) {
  introIndex = (index + introSlides.length) % introSlides.length;
  renderIntroSlide();
}

function stopIntroAutoplay() {
  clearInterval(introTimer);
  introTimer = 0;
}

function startIntroAutoplay() {
  if (introReducedMotion || introSlides.length < 2) {
    return;
  }
  stopIntroAutoplay();
  introTimer = setInterval(() => goToIntroSlide(introIndex + 1), 3200);
}

function hideIntro(markSeen) {
  stopIntroAutoplay();
  if (introOverlay) {
    introOverlay.hidden = true;
  }
  if (markSeen) {
    try {
      localStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch (error) {
      /* ignore storage failures */
    }
  }
  if (loginOverlayPendingAfterIntro) {
    loginOverlayPendingAfterIntro = false;
    if (cloudState.configured && !cloudState.ready && !isLocalModePreferred()) {
      showLoginOverlay(true);
    }
  }
}

function showIntro() {
  if (!introOverlay || !introSlides.length) {
    return;
  }
  if (loginOverlay && !loginOverlay.hidden) {
    loginOverlayPendingAfterIntro = true;
    loginOverlay.hidden = true;
  }
  introIndex = 0;
  renderIntroSlide();
  introOverlay.hidden = false;
  startIntroAutoplay();
}

function maybeShowIntro() {
  let seen = false;
  try {
    seen = localStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch (error) {
    seen = false;
  }
  if (!seen) {
    showIntro();
  }
}

if (introDots && introSlides.length) {
  introSlides.forEach((slide, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `الخطوة ${i + 1}`);
    dot.addEventListener("click", () => {
      stopIntroAutoplay();
      goToIntroSlide(i);
    });
    introDots.appendChild(dot);
  });
}

if (introNextBtn) {
  introNextBtn.addEventListener("click", () => {
    if (introIndex === introSlides.length - 1) {
      hideIntro(true);
      return;
    }
    stopIntroAutoplay();
    goToIntroSlide(introIndex + 1);
  });
}

if (introSkipBtn) {
  introSkipBtn.addEventListener("click", () => hideIntro(true));
}

if (introReplayBtn) {
  introReplayBtn.addEventListener("click", () => showIntro());
}

async function bootstrapApp() {
  initializeProjects();
  renderApp();
  maybeShowIntro();
  await initializeCloudSession();
}

bootstrapApp();
