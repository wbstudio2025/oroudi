const quotationData = {
  companyName: "شركة الدر النفيس للاستشارات الهندسية",
  logoPath: "assets/LOGO.png",
  footerImagePath: "assets/Footer.png",
  signaturePath: "assets/Signature.png",
  closingText: "نأمل أن ينال عرضنا هذا استحسانكم، ونتطلع إلى خدمتكم بما يحقق تطلعاتكم.",
  quotationNumber: "001-260517",
  dateIso: "2026-05-17",
  date: "17 مايو 2026",
  hijriDate: "",
  validityPeriod: "10 أيام",
  clientName: "طاهره محمد أحمد بكرين",
  projectType: "فيلا سكنية",
  city: "جدة",
  district: "السامر",
  planNumber: "145 / ج / س / المعدل",
  plotNumber: "197",
  landArea: "828.30 م²",
  deedNumber: "660002550615",
  deedDate: "14 / 05 / 1447 هـ",
  mainPriceNumber: "18,000 ريال سعودي",
  mainPriceWritten: "ثمانية عشر ألف ريال سعودي لا غير",
  notes: "يشمل العرض منظوراً خارجياً واحداً فقط للواجهة الرئيسية. أي مناظير إضافية أو خدمات تصميم داخلي يتم تسعيرها ضمن الخدمات الاختيارية.",
  showOptionalAnnex: true,
  scopeGroups: [
    {
      number: "01",
      title: "الأعمال الأولية",
      items: ["رفع مساحي", "إصدار قرار مساحي", "دراسة تربة"]
    },
    {
      number: "02",
      title: "التصميم والمخططات الهندسية",
      items: ["التصميم المعماري", "التصميم الإنشائي", "التصميم الكهربائي", "التصميم الميكانيكي"]
    },
    {
      number: "03",
      title: "التصور والرخصة",
      items: ["منظور خارجي واحد", "إصدار رخصة بناء"]
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
    { percent: "20", label: "بعد تسليم المخططات الهندسية" }
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
const printBtn = document.querySelector("#printBtn");
const resetBtn = document.querySelector("#resetBtn");

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

const fields = [
  {
    title: "بيانات العميل والعرض",
    items: [
      ["clientName", "اسم العميل"],
      ["quotationNumber", "رقم العرض"],
      ["date", "التاريخ", "date"],
      ["validityPeriod", "مدة صلاحية العرض"]
    ]
  },
  {
    title: "بيانات المشروع",
    items: [
      ["projectType", "نوع المشروع", "select"],
      ["city", "المدينة"],
      ["district", "الحي"],
      ["plotNumber", "رقم القطعة"],
      ["landArea", "مساحة الأرض"],
      ["planNumber", "رقم المخطط"],
      ["deedNumber", "رقم الصك"],
      ["deedDate", "تاريخ الصك"]
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

setQuotationDate(quotationData.dateIso);
const initialSnapshot = JSON.stringify(quotationData);
let datePickerMonthIso = quotationData.dateIso;

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

function formatRiyalAmount(value) {
  const amount = parseMoneyAmount(value);

  return amount ? `${formatMoneyAmount(amount)} ريال` : "";
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

function buildIcon(item) {
  const icon = scopeIconMap[item] || scopeIconMap["التصميم المعماري"];

  return `
    <span class="mini-icon">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        ${icon}
      </svg>
    </span>
  `;
}

function renderDatePicker() {
  const monthDate = dateFromIso(datePickerMonthIso);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const emptyDays = Array.from({ length: firstDay.getDay() }, () => `<span class="calendar-blank"></span>`).join("");
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const isoDate = isoFromDate(new Date(year, month, day));
    const selectedClass = isoDate === quotationData.dateIso ? " is-selected" : "";

    return `
      <button class="calendar-day${selectedClass}" type="button" data-date-choice="${isoDate}">
        <span class="gregorian-day">${day}</span>
        <small class="hijri-day">${escapeHtml(formatHijriDay(isoDate))}</small>
      </button>
    `;
  }).join("");

  return `
    <div class="date-picker" id="datePicker" hidden>
      <div class="calendar-header">
        <button type="button" data-calendar-nav="-1" aria-label="الشهر السابق">‹</button>
        <strong>${escapeHtml(gregorianMonthFormatter.format(monthDate))}</strong>
        <button type="button" data-calendar-nav="1" aria-label="الشهر التالي">›</button>
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
                <textarea id="${key}" data-key="${key}">${escapeHtml(quotationData[key])}</textarea>
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
            return `
              <div class="field date-field">
                <label for="${key}">${label}</label>
                <div class="date-input-row">
                  <input id="${key}" class="date-input" data-date-input type="text" value="${escapeHtml(quotationData.date)}" readonly aria-haspopup="dialog" aria-expanded="false">
                  <span class="inline-hijri-date">${escapeHtml(quotationData.hijriDate)}</span>
                </div>
                ${renderDatePicker()}
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

          if (type === "money") {
            return `
              <div class="field">
                <label for="${key}">${label}</label>
                <div class="money-input-row">
                  <input id="${key}" data-key="${key}" data-money-key="${key}" type="text" inputmode="decimal" value="${escapeHtml(getMoneyInputValue(quotationData[key]))}">
                  <span>ريال</span>
                </div>
              </div>
            `;
          }

          return `
            <div class="field">
              <label for="${key}">${label}</label>
              <input id="${key}" data-key="${key}" type="text" value="${escapeHtml(quotationData[key])}">
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
            <span>ريال</span>
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

  editorForm.innerHTML = `
    ${groups}
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

function getProjectRows() {
  return [
    ["اسم العميل", quotationData.clientName],
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

function pageShell(title, body, pageNumber, totalPages) {
  return `
    <article class="page">
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
        ${renderFooter(pageNumber, totalPages)}
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
          <h2>عرض خدمات التصميم وإصدار رخصة بناء</h2>
          <p>${escapeHtml(quotationData.projectType)} — ${escapeHtml(quotationData.city)}</p>
        </section>
        <section class="cover-grid">
          <div class="info-card"><span>العميل</span><strong>${escapeHtml(quotationData.clientName)}</strong></div>
          <div class="info-card"><span>موقع المشروع</span><strong>${escapeHtml(quotationData.district)}، ${escapeHtml(quotationData.city)}</strong></div>
          <div class="info-card"><span>مساحة الأرض</span><strong>${escapeHtml(quotationData.landArea)}</strong></div>
          <div class="info-card"><span>رقم العرض</span><strong>${escapeHtml(quotationData.quotationNumber)}</strong></div>
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
    .map(([label, value]) => `<tr><th>${label}</th><td>${escapeHtml(value)}</td></tr>`)
    .join("");

  return pageShell(
    "ملخص المشروع",
    `
      <p class="intro">
        بناءً على بيانات الأرض المقدمة، تقدم ${escapeHtml(quotationData.companyName)} عرضها لتصميم وإصدار رخصة بناء
        ل${escapeHtml(quotationData.projectType)} في حي ${escapeHtml(quotationData.district)} بمدينة ${escapeHtml(quotationData.city)}،
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
    .map((group) => `
      <section class="scope-section">
        <div class="scope-heading"><span>${escapeHtml(group.number)}</span>${escapeHtml(group.title)}</div>
        <ul class="scope-list">
          ${group.items.map((item) => `
            <li class="scope-item">
              ${buildIcon(item)}
              <div>
                <strong>${escapeHtml(item)}</strong>
                <small class="scope-description">${escapeHtml(scopeDescriptionMap[item] || "")}</small>
              </div>
            </li>
          `).join("")}
        </ul>
      </section>
    `)
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
        <strong>${escapeHtml(formatRiyalAmount(quotationData.mainPriceNumber))}</strong>
        <em>${escapeHtml(quotationData.mainPriceWritten)}</em>
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
    totalPages
  );
}

function renderOptionalAnnex(totalPages) {
  const rows = quotationData.optionalServices
    .map((service) => `
      <tr>
        <td>${escapeHtml(service.name)}</td>
        <td>${escapeHtml(service.description)}</td>
        <td>${escapeHtml(service.price)}</td>
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
    totalPages
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
}

function renderApp() {
  renderEditor();
  renderPreview();
}

function showDatePicker() {
  const picker = document.querySelector("#datePicker");
  const input = document.querySelector("[data-date-input]");

  if (!picker || !input) {
    return;
  }

  picker.hidden = false;
  input.setAttribute("aria-expanded", "true");
}

function hideDatePicker() {
  const picker = document.querySelector("#datePicker");
  const input = document.querySelector("[data-date-input]");

  if (!picker || !input) {
    return;
  }

  picker.hidden = true;
  input.setAttribute("aria-expanded", "false");
}

function updateEditorValue(event) {
  const input = event.target;
  const key = input.dataset.key;
  const serviceIndex = input.dataset.serviceIndex;
  const paymentIndex = input.dataset.paymentIndex;

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
}

editorForm.addEventListener("input", updateEditorValue);

editorForm.addEventListener("click", (event) => {
  const dateInput = event.target.closest("[data-date-input]");
  const calendarNav = event.target.closest("[data-calendar-nav]");
  const dateChoice = event.target.closest("[data-date-choice]");

  if (dateInput) {
    showDatePicker();
    return;
  }

  if (calendarNav) {
    datePickerMonthIso = shiftMonth(datePickerMonthIso, Number(calendarNav.dataset.calendarNav));
    renderEditor();
    showDatePicker();
    return;
  }

  if (dateChoice) {
    setQuotationDate(dateChoice.dataset.dateChoice);
    datePickerMonthIso = quotationData.dateIso;
    renderEditor();
    renderPreview();
  }
});

editorForm.addEventListener("focusin", (event) => {
  if (event.target.matches("[data-date-input]")) {
    showDatePicker();
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
  window.print();
});

resetBtn.addEventListener("click", () => {
  const defaults = JSON.parse(initialSnapshot);
  Object.keys(quotationData).forEach((key) => delete quotationData[key]);
  Object.assign(quotationData, defaults);
  datePickerMonthIso = quotationData.dateIso;
  renderApp();
});

renderApp();
