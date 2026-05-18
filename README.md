# Dural Nafis Quotation Editor V1

Static Arabic RTL quotation editor for preparing a polished A4 engineering consulting proposal.

## Files

- `index.html` - app shell, editor panel, preview container, and action buttons.
- `styles.css` - premium RTL layout, A4 page styling, responsive layout, and print CSS.
- `app.js` - `quotationData`, form rendering, live preview rendering, reset, and print behavior.
- `assets/LOGO.png` - company logo used in the preview and header.

## Usage

Open `index.html` in a browser. Edit the fields in the left panel and the A4 quotation preview updates immediately on the right.

Use `طباعة / حفظ PDF` to open the browser print dialog. Choose "Save as PDF" to export the quotation.

Use `إعادة تعبئة البيانات الافتراضية` to restore the default quotation data.

## Notes

- The app uses plain HTML, CSS, and JavaScript.
- There is no backend, database, framework, or build step.
- The optional services annex can be shown or hidden from the editor.
- Print styles hide the editor and print each quotation page as a separate A4 page.
