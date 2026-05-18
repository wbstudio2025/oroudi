\# Task: Build Premium Arabic RTL Quotation Editor



Build a static browser-based quotation editor for an engineering consulting office.



\## Goal



Create a local HTML tool where I can edit quotation variables from a form and instantly see a polished A4 quotation preview. The final quotation should be printable/exportable to PDF from the browser.



\## Requirements



\- Use plain HTML, CSS, and JavaScript.

\- No backend.

\- No database.

\- No framework.

\- Use logo from: `assets/logo.png`

\- Create:

&#x20; - `index.html`

&#x20; - `styles.css`

&#x20; - `app.js`

&#x20; - `README.md`



\## Layout



The app should have:



1\. Left side: editable form panel.

2\. Right side: live A4 quotation preview.

3\. Button: `طباعة / حفظ PDF`

4\. Button: `إعادة تعبئة البيانات الافتراضية`



\## Design Direction



\- Arabic RTL

\- Premium corporate architecture proposal

\- White background

\- Deep navy / charcoal text

\- Soft gold accents

\- Light grey borders

\- Elegant spacing

\- A4 print-ready pages

\- Minimal professional icons using inline SVG or CSS, not emoji

\- Strong print CSS:

&#x20; - Hide editor while printing

&#x20; - Each quotation page prints separately

&#x20; - Avoid broken cards and tables



\## Default Data



Company:

شركة الدر النفيس للاستشارات الهندسية



Quotation:

رقم العرض: 001-260517  

التاريخ: 17 مايو 2026  

مدة صلاحية العرض: 10 أيام



Client:

طاهره محمد أحمد بكرين



Project:

نوع المشروع: فيلا سكنية  

المدينة: جدة  

الحي: السامر  

رقم المخطط: 145 / ج / س / المعدل  

رقم القطعة: 197  

مساحة الأرض: 828.30 م²  

رقم الصك: 660002550615  

تاريخ الصك: 14 / 05 / 1447 هـ



Main price:

18,000 ريال سعودي  

ثمانية عشر ألف ريال سعودي لا غير



\## Quotation Pages



\### Page 1 — Cover



Include:

\- Logo

\- Title: عرض خدمات التصميم وإصدار رخصة بناء

\- Subtitle: فيلا سكنية — جدة

\- Client name

\- Project location

\- Land area

\- Quotation number

\- Date



\### Page 2 — Project Summary



Include intro:



بناءً على بيانات الأرض المقدمة، تقدم شركة الدر النفيس للاستشارات الهندسية عرضها لتصميم وإصدار رخصة بناء لفيلا سكنية في حي السامر بمدينة جدة، من خلال باقة متكاملة تشمل الدراسات الأولية، التصميم المعماري، المخططات الهندسية، المنظور الخارجي، وإجراءات إصدار رخصة البناء.



Add project information table.



\### Page 3 — Scope of Work



Create icon cards grouped into:



01 — الأعمال الأولية

\- رفع مساحي

\- إصدار قرار مساحي

\- دراسة تربة



02 — التصميم والمخططات الهندسية

\- التصميم المعماري

\- التصميم الإنشائي

\- التصميم الكهربائي

\- التصميم الميكانيكي



03 — التصور والرخصة

\- منظور خارجي واحد

\- إصدار رخصة بناء



\### Page 4 — Deliverables



Checklist:

\- مخططات معمارية للرخصة

\- مخططات إنشائية

\- مخططات كهربائية

\- مخططات ميكانيكية

\- منظور خارجي واحد للواجهة الرئيسية

\- ملفات PDF للاعتماد

\- متابعة إصدار رخصة البناء



Expectation note:

يشمل العرض منظوراً خارجياً واحداً فقط للواجهة الرئيسية. أي مناظير إضافية أو خدمات تصميم داخلي يتم تسعيرها ضمن الخدمات الاختيارية.



\### Page 5 — Financial Offer



Show:

\- Main price

\- VAT excluded

\- Government fees excluded

\- Offer valid for 10 days

\- Formal contract issued upon approval



Payment schedule:

\- 40% عند توقيع العقد

\- 30% بعد اعتماد التصميم المعماري

\- 20% بعد تسليم المخططات الهندسية

\- 10% عند رفع أو إصدار الرخصة



\### Page 6 — Optional Services Annex



Optional services table:

\- منظور خارجي إضافي — زاوية إضافية للواجهة أو الحديقة — 1,000 ريال

\- منظور ليلي — إظهار الإضاءة الخارجية ليلاً — 1,000 ريال

\- منظور داخلي — صالة، مجلس، مطبخ، أو غرفة نوم — يبدأ من 1,500 ريال

\- تصميم داخلي — تصميم داخلي متكامل للفراغات المختارة — حسب النطاق

\- فيديو معماري قصير — عرض سينمائي للمشروع — يبدأ من 3,500 ريال

\- تصميم لاندسكيب — مداخل، جلسات خارجية، مزروعات ومسارات — حسب المساحة

\- متابعة أثناء التنفيذ — زيارات أو استشارات فنية — حسب الاتفاق



Add note:

هذه الخدمات اختيارية ولا تؤثر على قيمة العرض الأساسي، ويتم إضافتها فقط عند طلب العميل.



\## Editor Fields



The form should allow changing:

\- Client name

\- Quotation number

\- Date

\- Project type

\- City

\- District

\- Plot number

\- Land area

\- Plan number

\- Deed number

\- Deed date

\- Main price number

\- Main price written in Arabic

\- Validity period

\- Optional service prices

\- Notes

\- Show/hide optional services annex



\## Technical Requirement



Use one JavaScript object called `quotationData`.



Render all preview content dynamically from `quotationData`.



Changing any input should update the preview immediately.



Keep the code clean, simple, and easy to edit.

