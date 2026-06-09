# التثبيت / Installation — محرر عروض الدر النفيس

برنامج محلي بالكامل يعمل دون إنترنت. لا يحتاج إلى تنصيب Node أو Python أو أي برنامج إضافي —
فقط نظام Windows ومتصفح Microsoft Edge (الموجود أساساً في كل أجهزة Windows).

A fully local, offline app. It needs **only Windows + Microsoft Edge** (already on every
Windows PC) — no Node, no Python, no admin rights.

## التثبيت على جهاز السكرتير / Install on the secretary's laptop

1. **انسخ هذا المجلد كاملاً** إلى مكان دائم لا يتغيّر، مثل `C:\DuralNafis\QuotationEditor`.
   لا تضعه في "التنزيلات" أو مجلد مؤقت (مكان الملف يحدّد مكان حفظ بياناتك).
   _Copy this whole folder to a permanent location (e.g. `C:\DuralNafis\QuotationEditor`).
   Do not run it from Downloads or a temp folder — the location anchors where data lives._
2. انقر مرتين على **`setup.bat`**. سيُنشئ اختصاراً على سطح المكتب وفي قائمة ابدأ.
   _Double-click **`setup.bat`** — it creates a Desktop and Start Menu shortcut._
3. افتح التطبيق من اختصار **«محرر عروض الدر النفيس»**. يفتح في نافذة خاصة تشبه التطبيق المُثبّت.
   _Open it from the **"محرر عروض الدر النفيس"** shortcut — it opens in its own app-style window._
4. (اختياري) لتثبيته على شريط المهام: انقر بزر الفأرة الأيمن على أيقونة النافذة ثم «تثبيت على شريط المهام».
   _Optional: right-click the window's taskbar icon > Pin to taskbar._

## أول مرة: فعّل النسخ الاحتياطي / First run: turn on backup

من لوحة «المشاريع» اضغط **«تفعيل النسخ الاحتياطي التلقائي»** واختر ملفاً للحفظ — يُفضّل داخل مجلد
OneDrive حتى تُحفظ نسخة خارج الجهاز تلقائياً. بعدها تُحفظ كل العروض في هذا الملف تلقائياً عند كل تعديل.
_In the Projects panel, click **"تفعيل النسخ الاحتياطي التلقائي"** and pick a backup file —
ideally inside a OneDrive folder so it is also copied off the device. After that, every change
is written to that file automatically._

> ملاحظة: قد يطلب Edge السماح بالكتابة في الملف مرة واحدة عند بدء كل جلسة — اضغط «السماح».
> _Edge may ask once per session to allow writing the file — click Allow._

## الاستخدام اليومي / Daily use

- عدّل الحقول على اليمين، وتظهر المعاينة مباشرة.
- **طباعة / حفظ PDF**: اختر الطابعة «Microsoft Print to PDF» أو «حفظ كـ PDF».
- إذا ظهر تنبيه أحمر بأن المحتوى يتجاوز الصفحة، اختصر النص قليلاً قبل الطباعة.

## الانتقال إلى جهاز جديد / Moving to a new laptop

انسخ المجلد + ملف النسخة الاحتياطية، شغّل `setup.bat`، ثم اضغط **«استعادة من ملف»** واختر ملف النسخة.
_Copy the folder + the backup file, run `setup.bat`, then click **"استعادة من ملف"** and pick the
backup file._

## إزالة التثبيت / Uninstall

احذف الاختصارين (سطح المكتب وقائمة ابدأ > Dural Nafis) ثم احذف المجلد. لا توجد تغييرات في النظام.
_Delete the two shortcuts (Desktop and Start Menu > Dural Nafis) and the folder. Nothing else is
changed on the system._

## حل المشكلات / Troubleshooting

- **«تعذّر العثور على Microsoft Edge»** — ثبّت Microsoft Edge (موجود افتراضياً في Windows 10/11).
- **زر النسخ الاحتياطي يقول «غير متاح»** — تأكد من فتح التطبيق عبر الاختصار (وليس بفتح `index.html`
  مباشرة)، لأن النسخ التلقائي يحتاج إلى تشغيل التطبيق عبر الخادم المحلي الذي يفتحه الاختصار.
- لا شيء يظهر؟ تأكد أن مجلد التطبيق كامل (الملفات `server.ps1` و`launch.vbs` و`index.html`
  ومجلد `assets`).
