# التثبيت / Installation — عروضي (Oroudi)

برنامج محلي بالكامل يعمل دون إنترنت. لا يحتاج إلى تنصيب Node أو Python أو أي برنامج إضافي —
فقط نظام Windows ومتصفح Microsoft Edge (الموجود أساساً في كل أجهزة Windows).

A fully local, offline app. It needs **only Windows + Microsoft Edge** (already on every
Windows PC) — no Node, no Python, no admin rights.

## التثبيت على جهاز السكرتير / Install on the secretary's laptop

1. **انسخ هذا المجلد كاملاً** إلى مكان دائم لا يتغيّر، مثل `C:\Oroudi\QuotationEditor`.
   لا تضعه في "التنزيلات" أو مجلد مؤقت (مكان الملف يحدّد مكان حفظ بياناتك).
   _Copy this whole folder to a permanent location (e.g. `C:\Oroudi\QuotationEditor`).
   Do not run it from Downloads or a temp folder — the location anchors where data lives._
2. انقر مرتين على **`setup.bat`**. سيُنشئ اختصاراً على سطح المكتب وفي قائمة ابدأ.
   _Double-click **`setup.bat`** — it creates a Desktop and Start Menu shortcut._
3. افتح التطبيق من اختصار **«عروضي»**. يفتح في نافذة خاصة تشبه التطبيق المُثبّت.
   _Open it from the **"عروضي"** shortcut — it opens in its own app-style window._
4. (اختياري) لتثبيته على شريط المهام: انقر بزر الفأرة الأيمن على أيقونة النافذة ثم «تثبيت على شريط المهام».
   _Optional: right-click the window's taskbar icon > Pin to taskbar._

## أين تُحفظ البيانات / Where your data is stored

تُحفظ كل العروض تلقائياً داخل المتصفح (localStorage) المرتبط بعنوان `localhost` الذي يفتحه الاختصار —
لا يوجد زر حفظ ولا ملف نسخ احتياطي. تبقى البيانات على هذا الجهاز ما دام التطبيق يُفتح من نفس الاختصار.
_All quotations are saved automatically in the browser (localStorage), tied to the `localhost`
origin the shortcut opens — there is no Save button and no backup file. The data stays on this PC as
long as you open the app from the same shortcut._

> للمشاركة بين الأجهزة أو العمل أونلاين، استخدم مزامنة Supabase السحابية (انظر [`DEPLOYMENT.md`](DEPLOYMENT.md))
> بدلاً من ملف نسخ احتياطي محلي.
> _To share across devices or work online, use Supabase cloud sync (see
> [`DEPLOYMENT.md`](DEPLOYMENT.md)) instead of a local backup file._

## الاستخدام اليومي / Daily use

- عدّل الحقول على اليمين، وتظهر المعاينة مباشرة.
- **طباعة / حفظ PDF**: اختر الطابعة «Microsoft Print to PDF» أو «حفظ كـ PDF».
- إذا ظهر تنبيه أحمر بأن المحتوى يتجاوز الصفحة، اختصر النص قليلاً قبل الطباعة.

## الانتقال إلى جهاز جديد / Moving to a new laptop

انسخ المجلد كاملاً وشغّل `setup.bat`. البيانات المحفوظة في المتصفح لا تنتقل مع المجلد؛ للاحتفاظ بها
بين الأجهزة استخدم مزامنة Supabase (انظر [`DEPLOYMENT.md`](DEPLOYMENT.md)).
_Copy the whole folder and run `setup.bat`. Data saved in the browser does not travel with the
folder — to keep it across devices, use Supabase sync (see [`DEPLOYMENT.md`](DEPLOYMENT.md))._

## إزالة التثبيت / Uninstall

احذف الاختصارين (سطح المكتب وقائمة ابدأ > Oroudi) ثم احذف المجلد. لا توجد تغييرات في النظام.
_Delete the two shortcuts (Desktop and Start Menu > Oroudi) and the folder. Nothing else is
changed on the system._

## حل المشكلات / Troubleshooting

- **«تعذّر العثور على Microsoft Edge»** — ثبّت Microsoft Edge (موجود افتراضياً في Windows 10/11).
- **اختفت العروض المحفوظة؟** افتح التطبيق دائماً عبر الاختصار (وليس بفتح `index.html` مباشرة)، لأن
  البيانات مرتبطة بعنوان `localhost` الذي يفتحه الاختصار؛ فتح الملف مباشرة يستخدم تخزيناً مختلفاً.
  _Saved quotations missing? Always open the app via the shortcut (not by opening `index.html`
  directly) — the data is tied to the `localhost` origin the shortcut serves; opening the file
  directly uses a different storage._
- لا شيء يظهر؟ تأكد أن مجلد التطبيق كامل (الملفات `server.ps1` و`launch.vbs` و`index.html`
  ومجلد `assets`).
