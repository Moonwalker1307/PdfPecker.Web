// Starting documents and blocks for the document designer (designer.js). A template is a whole HTML document in the
// designer's own layout: the @page rule in <style data-designer="page">, CSS the designer keeps verbatim in a plain
// <style>, and the CSS of the elements, which the style panel edits, in <style data-designer="elements">.

const BASE_CSS = `body { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; line-height: 1.45; color: #1d1d24; margin: 0; }
h1 { font-size: 22pt; line-height: 1.15; margin: 0 0 6pt; }
h2 { font-size: 14pt; line-height: 1.2; margin: 14pt 0 6pt; }
h3 { font-size: 11pt; margin: 10pt 0 4pt; }
p { margin: 0 0 8pt; }
img { max-width: 100%; }`;

function doc(title, page, elementsCss, body, verbatimCss = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style data-designer="page">
@page { ${page} }
</style>
<style>
${verbatimCss}
</style>
<style data-designer="elements">
${BASE_CSS}
${elementsCss}
</style>
</head>
<body>
${body}
</body>
</html>
`;
}

// A small grey logo placeholder, so a new invoice has something to replace.
const LOGO = "data:image/svg+xml;base64," + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80" viewBox="0 0 240 80"><rect width="240" height="80" rx="10" fill="#e9e9ef"/><text x="120" y="48" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="700" fill="#8b8b99" text-anchor="middle">YOUR LOGO</text></svg>`);

const INVOICE_CSS = `.inv-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 20pt; margin-bottom: 24pt; }
.logo { width: 46mm; }
.company { text-align: right; font-size: 9pt; color: #55576a; }
.company strong { display: block; font-size: 11pt; color: #1d1d24; }
.inv-title { font-size: 26pt; letter-spacing: -0.5pt; color: #c81e24; margin: 0 0 14pt; }
.inv-parties { display: flex; gap: 24pt; margin-bottom: 22pt; }
.inv-parties > div { flex: 1; }
.label { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.6pt; color: #8b8b99; margin: 0 0 3pt; }
.meta { border-collapse: collapse; margin-left: auto; }
.meta td { padding: 1pt 0 1pt 14pt; }
.meta td:first-child { color: #55576a; padding-left: 0; }
.items { width: 100%; border-collapse: collapse; margin-bottom: 14pt; }
.items th { text-align: left; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.6pt; color: #55576a; border-bottom: 1.5pt solid #1d1d24; padding: 5pt 6pt; }
.items td { border-bottom: 0.5pt solid #d7d7e0; padding: 6pt; vertical-align: top; }
.items .num { text-align: right; white-space: nowrap; }
.totals { width: 42%; margin-left: auto; border-collapse: collapse; margin-bottom: 26pt; }
.totals td { padding: 3pt 6pt; }
.totals td:last-child { text-align: right; }
.totals .grand td { border-top: 1.5pt solid #1d1d24; font-weight: 700; font-size: 12pt; padding-top: 6pt; }
.payment { background: #f4f4f7; border-radius: 6pt; padding: 10pt 12pt; font-size: 9pt; break-inside: avoid; }
.payment p { margin: 0 0 2pt; }
.thanks { margin-top: 18pt; color: #55576a; }
.page-footer { font-size: 8pt; color: #8b8b99; text-align: center; border-top: 0.5pt solid #d7d7e0; padding-top: 4pt; }`;

const INVOICE_BODY = `<div class="inv-head">
  <img class="logo" src="${LOGO}" alt="Logo">
  <div class="company"><strong>{{company.name}}</strong>{{company.street}}<br>{{company.city}}<br>{{company.email}}</div>
</div>
<h1 class="inv-title">Invoice</h1>
<div class="inv-parties">
  <div>
    <p class="label">Bill to</p>
    <p><strong>{{customer.name}}</strong><br>{{customer.street}}<br>{{customer.city}}</p>
  </div>
  <div>
    <table class="meta">
      <tr><td>Invoice number</td><td>{{invoice.number}}</td></tr>
      <tr><td>Invoice date</td><td>{{invoice.date}}</td></tr>
      <tr><td>Due date</td><td>{{invoice.due}}</td></tr>
    </table>
  </div>
</div>
<table class="items">
  <thead>
    <tr><th>#</th><th>Description</th><th class="num">Qty</th><th class="num">Unit price</th><th class="num">Amount</th></tr>
  </thead>
  <tbody>
    <tr data-repeat="items"><td>{{$number}}</td><td>{{description}}</td><td class="num">{{quantity}}</td><td class="num">{{price | money}}</td><td class="num">{{amount | money}}</td></tr>
  </tbody>
</table>
<table class="totals">
  <tr><td>Subtotal</td><td>{{invoice.subtotal | money}}</td></tr>
  <tr><td>VAT 25%</td><td>{{invoice.vat | money}}</td></tr>
  <tr class="grand"><td>Total {{invoice.currency}}</td><td>{{invoice.total | money}}</td></tr>
</table>
<div class="payment">
  <p class="label">Payment</p>
  <p>Please pay {{invoice.currency}} {{invoice.total | money}} by {{invoice.due}} to IBAN {{company.iban}}, quoting invoice {{invoice.number}}.</p>
</div>
<p class="thanks">Thank you for your business.</p>
<footer class="page-footer" data-sticky-pdf-footer height="12mm">{{company.name}} · {{company.vat}} · Page {page} of {total-pages}</footer>`;

const INVOICE_DATA = {
  company: { name: "Acme Studio ApS", street: "Harbour Street 12", city: "1050 Copenhagen", email: "billing@acme.example", vat: "VAT DK12345678", iban: "DK50 0040 0440 1162 43" },
  customer: { name: "Northwind Traders", street: "Main Road 4", city: "8000 Aarhus" },
  invoice: { number: "2026-1042", date: "21 October 2026", due: "4 November 2026", currency: "DKK", subtotal: 18400, vat: 4600, total: 23000 },
  items: [
    { description: "Design of invoice and letter templates", quantity: 12, price: 950, amount: 11400 },
    { description: "PDF/A archiving setup", quantity: 4, price: 950, amount: 3800 },
    { description: "Support, October", quantity: 1, price: 3200, amount: 3200 },
  ],
};

const LETTER_CSS = `.letterhead { display: flex; justify-content: space-between; align-items: center; border-bottom: 2pt solid #c81e24; padding-bottom: 8pt; margin-bottom: 30pt; }
.letterhead .name { font-size: 16pt; font-weight: 700; letter-spacing: -0.3pt; }
.letterhead .contact { font-size: 8.5pt; color: #55576a; text-align: right; }
.recipient { margin-bottom: 26pt; }
.date { text-align: right; margin-bottom: 20pt; color: #55576a; }
.subject { font-size: 12pt; margin: 0 0 12pt; }
.letter-body p { margin: 0 0 10pt; }
.signature { margin-top: 30pt; }
.signature .line { width: 60mm; border-top: 0.75pt solid #1d1d24; margin: 34pt 0 3pt; }`;

const LETTER_BODY = `<div class="letterhead">
  <div class="name">{{sender.name}}</div>
  <div class="contact">{{sender.street}} · {{sender.city}}<br>{{sender.phone}} · {{sender.email}}</div>
</div>
<div class="recipient">{{recipient.name}}<br>{{recipient.street}}<br>{{recipient.city}}</div>
<p class="date">{{date}}</p>
<h2 class="subject">{{subject}}</h2>
<div class="letter-body">
  <p>Dear {{recipient.contact}},</p>
  <p>Thank you for your enquiry about our services. We are pleased to confirm that we can deliver the templates you
    asked for within three weeks of your approval.</p>
  <p>The attached quote lists each part of the work. Prices are fixed, and you will receive a draft of every
    document for review before anything is delivered.</p>
  <p>Please let us know if you have any questions.</p>
</div>
<div class="signature">
  <p>Kind regards,</p>
  <div class="line"></div>
  <p>{{sender.signatory}}<br><small>{{sender.title}}</small></p>
</div>`;

const LETTER_DATA = {
  sender: { name: "Acme Studio", street: "Harbour Street 12", city: "1050 Copenhagen", phone: "+45 12 34 56 78", email: "hello@acme.example", signatory: "Maria Jensen", title: "Managing Director" },
  recipient: { name: "Northwind Traders", contact: "Mr Hansen", street: "Main Road 4", city: "8000 Aarhus" },
  date: "21 October 2026",
  subject: "Your enquiry about document templates",
};

const REPORT_CSS = `.cover { height: 240mm; display: flex; flex-direction: column; justify-content: flex-end; padding: 0 0 30mm; break-after: page; }
.cover .kicker { color: #c81e24; font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1pt; margin: 0 0 8pt; }
.cover h1 { font-size: 34pt; margin: 0 0 10pt; }
.cover .sub { font-size: 13pt; color: #55576a; }
.page-header { font-size: 8pt; color: #8b8b99; border-bottom: 0.5pt solid #d7d7e0; padding-bottom: 3pt; display: flex; justify-content: space-between; }
.page-footer { font-size: 8pt; color: #8b8b99; text-align: right; }
.kpis { display: flex; gap: 10pt; margin: 10pt 0 16pt; }
.kpi { flex: 1; background: #f4f4f7; border-radius: 6pt; padding: 10pt; }
.kpi .value { font-size: 18pt; font-weight: 700; }
.kpi .name { font-size: 8pt; color: #55576a; text-transform: uppercase; letter-spacing: 0.5pt; }
.data { width: 100%; border-collapse: collapse; margin: 6pt 0 14pt; }
.data th { text-align: left; background: #1d1d24; color: #fff; padding: 5pt 6pt; font-size: 9pt; }
.data td { padding: 5pt 6pt; border-bottom: 0.5pt solid #d7d7e0; }
.data tr:nth-child(even) td { background: #f8f8fb; }
.data .num { text-align: right; }
.note { border-left: 3pt solid #c81e24; padding: 4pt 0 4pt 10pt; color: #55576a; break-inside: avoid; }`;

const REPORT_BODY = `<header class="page-header" data-sticky-pdf-header height="12mm"><span>{{title}}</span><span>{{period}}</span></header>
<section class="cover">
  <p class="kicker">{{company}}</p>
  <h1>{{title}}</h1>
  <p class="sub">{{period}}</p>
</section>
<h2>Summary</h2>
<p>Sales grew in every region this quarter, led by the north. The figures below compare each region with the same
  quarter last year.</p>
<div class="kpis">
  <div class="kpi" data-repeat="kpis"><div class="value">{{value}}</div><div class="name">{{name}}</div></div>
</div>
<h2>Sales by region</h2>
<table class="data">
  <thead><tr><th>Region</th><th class="num">This year</th><th class="num">Last year</th><th class="num">Change</th></tr></thead>
  <tbody><tr data-repeat="regions"><td>{{name}}</td><td class="num">{{now | money}}</td><td class="num">{{before | money}}</td><td class="num">{{change}}</td></tr></tbody>
</table>
<p class="note">Figures are in thousands of euros, before tax.</p>
<h2 style="break-before: page">Outlook</h2>
<p>Next quarter we expect the new product line to add about five percent to sales, and the south to recover as the
  new store opens.</p>
<footer class="page-footer" data-sticky-pdf-footer height="10mm">Page {page} of {total-pages}</footer>`;

const REPORT_DATA = {
  company: "Acme Studio",
  title: "Quarterly sales report",
  period: "Q3 2026",
  kpis: [{ name: "Revenue", value: "€4.2m" }, { name: "Growth", value: "+12%" }, { name: "New customers", value: "318" }],
  regions: [
    { name: "North", now: 1520, before: 1290, change: "+17.8%" },
    { name: "East", now: 1110, before: 1015, change: "+9.4%" },
    { name: "South", now: 880, before: 860, change: "+2.3%" },
    { name: "West", now: 690, before: 590, change: "+16.9%" },
  ],
};

const templates = {
  invoice: { html: doc("Invoice {{invoice.number}}", "size: A4; margin: 16mm 16mm 20mm 16mm", INVOICE_CSS, INVOICE_BODY), data: INVOICE_DATA },
  letter: { html: doc("Letter", "size: A4; margin: 20mm 22mm", LETTER_CSS, LETTER_BODY), data: LETTER_DATA },
  report: { html: doc("Quarterly report", "size: A4; margin: 18mm 18mm 18mm 18mm", REPORT_CSS, REPORT_BODY), data: REPORT_DATA },
  blank: { html: doc("Document", "size: A4; margin: 20mm", "", `<h1>Title</h1>\n<p>Start writing, or drag blocks from the left.</p>`), data: {} },
};

// ---------- Blocks ----------

const icon = path => `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
const ICONS = {
  heading: icon('<path d="M5 5v14M15 5v14M5 12h10M19 9l2-1v11"/>'),
  text: icon('<path d="M4 6h16M4 10h16M4 14h16M4 18h10"/>'),
  list: icon('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>'),
  quote: icon('<path d="M4 4v16M8 7h12M8 12h12M8 17h8"/>'),
  section: icon('<rect x="3" y="4" width="18" height="16" rx="2"/>'),
  cols2: icon('<rect x="3" y="4" width="8" height="16" rx="1.5"/><rect x="13" y="4" width="8" height="16" rx="1.5"/>'),
  cols3: icon('<rect x="2" y="4" width="6" height="16" rx="1.5"/><rect x="9" y="4" width="6" height="16" rx="1.5"/><rect x="16" y="4" width="6" height="16" rx="1.5"/>'),
  divider: icon('<path d="M3 12h18"/>'),
  spacer: icon('<path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4"/>'),
  image: icon('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/>'),
  table: icon('<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9h18M3 14h18M9 9v11M15 9v11"/>'),
  link: icon('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  invoiceHead: icon('<rect x="3" y="4" width="7" height="5" rx="1"/><path d="M14 5h7M14 8h7M3 14h18M3 18h12"/>'),
  parties: icon('<path d="M3 6h7M3 9h6M3 12h7M14 6h7M14 9h7M14 12h7"/>'),
  items: icon('<path d="M3 5h18M3 9h18M3 13h18M3 17h18M7 5v14M17 5v14"/>'),
  totals: icon('<path d="M11 7h10M11 11h10M11 16h10M11 14h10"/>'),
  payment: icon('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>'),
  signature: icon('<path d="M3 19h18M5 15c2-4 3-8 5-8s0 7 2 7 2-3 4-3 2 2 3 2"/>'),
  pageBreak: icon('<path d="M5 3v6h14V3M5 21v-6h14v6M2 12h3M8 12h3M13 12h3M19 12h3"/>'),
  header: icon('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 8h18"/>'),
  footer: icon('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 16h18"/>'),
  keep: icon('<rect x="4" y="5" width="16" height="14" rx="2" stroke-dasharray="3 2"/><path d="M8 10h8M8 14h6"/>'),
  qr: icon('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M21 14v7h-7"/>'),
};

const blocks = [
  // Text
  { id: "heading", label: "Heading", category: "Text", media: ICONS.heading, content: `<h1>Heading</h1>` },
  { id: "subheading", label: "Subheading", category: "Text", media: ICONS.heading, content: `<h2>Subheading</h2>` },
  { id: "paragraph", label: "Paragraph", category: "Text", media: ICONS.text,
    content: `<p>Write your text here. Double-click to edit, and use {{placeholders}} for data.</p>` },
  { id: "list", label: "List", category: "Text", media: ICONS.list, content: `<ul><li>First point</li><li>Second point</li><li>Third point</li></ul>` },
  { id: "note", label: "Note", category: "Text", media: ICONS.quote,
    content: `<div class="note-box"><p>An important note for the reader.</p></div>
<style>.note-box { border-left: 3pt solid #c81e24; background: #fbf4f4; padding: 8pt 12pt; margin: 0 0 10pt; break-inside: avoid; } .note-box p { margin: 0; }</style>` },
  { id: "link", label: "Link", category: "Text", media: ICONS.link, content: { type: "link", content: "A link", attributes: { href: "https://example.com" } } },

  // Layout
  { id: "section", label: "Section", category: "Layout", media: ICONS.section,
    content: `<section class="section"><h2>Section</h2><p>Section text.</p></section>
<style>.section { padding: 10pt 0; }</style>` },
  { id: "cols2", label: "Two columns", category: "Layout", media: ICONS.cols2,
    content: `<div class="row"><div class="col"><p>Left column</p></div><div class="col"><p>Right column</p></div></div>
<style>.row { display: flex; gap: 16pt; margin: 0 0 10pt; } .col { flex: 1; min-width: 0; }</style>` },
  { id: "cols3", label: "Three columns", category: "Layout", media: ICONS.cols3,
    content: `<div class="row"><div class="col"><p>First</p></div><div class="col"><p>Second</p></div><div class="col"><p>Third</p></div></div>
<style>.row { display: flex; gap: 16pt; margin: 0 0 10pt; } .col { flex: 1; min-width: 0; }</style>` },
  { id: "divider", label: "Divider", category: "Layout", media: ICONS.divider,
    content: `<hr class="divider"><style>.divider { border: 0; border-top: 0.75pt solid #d7d7e0; margin: 12pt 0; }</style>` },
  { id: "spacer", label: "Space", category: "Layout", media: ICONS.spacer, content: `<div class="spacer-block"></div><style>.spacer-block { height: 12mm; }</style>` },

  // Media
  { id: "image", label: "Image", category: "Media", media: ICONS.image, activate: true, select: true,
    content: { type: "image", attributes: { alt: "" }, style: { width: "60mm" } } },
  { id: "table", label: "Table", category: "Media", media: ICONS.table,
    content: `<table class="grid"><thead><tr><th>Column</th><th>Column</th><th>Column</th></tr></thead>
<tbody><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr></tbody></table>
<style>.grid { width: 100%; border-collapse: collapse; margin: 0 0 12pt; } .grid th, .grid td { border: 0.5pt solid #c9c9d3; padding: 5pt 6pt; text-align: left; } .grid th { background: #f1f1f5; }</style>` },
  { id: "repeat-table", label: "Table from data", category: "Media", media: ICONS.items,
    content: `<table class="grid"><thead><tr><th>Name</th><th>Value</th></tr></thead>
<tbody><tr data-repeat="rows"><td>{{name}}</td><td>{{value}}</td></tr></tbody></table>
<style>.grid { width: 100%; border-collapse: collapse; margin: 0 0 12pt; } .grid th, .grid td { border: 0.5pt solid #c9c9d3; padding: 5pt 6pt; text-align: left; } .grid th { background: #f1f1f5; }</style>` },

  // Invoice
  { id: "inv-head", label: "Logo and sender", category: "Invoice", media: ICONS.invoiceHead,
    content: `<div class="inv-head"><img class="logo" src="${LOGO}" alt="Logo"><div class="company"><strong>{{company.name}}</strong>{{company.street}}<br>{{company.city}}<br>{{company.email}}</div></div>
<style>${INVOICE_CSS.split("\n").filter(l => /^\.(inv-head|logo|company)/.test(l)).join(" ")}</style>` },
  { id: "inv-parties", label: "Customer and dates", category: "Invoice", media: ICONS.parties,
    content: `<div class="inv-parties"><div><p class="label">Bill to</p><p><strong>{{customer.name}}</strong><br>{{customer.street}}<br>{{customer.city}}</p></div>
<div><table class="meta"><tr><td>Invoice number</td><td>{{invoice.number}}</td></tr><tr><td>Invoice date</td><td>{{invoice.date}}</td></tr><tr><td>Due date</td><td>{{invoice.due}}</td></tr></table></div></div>
<style>${INVOICE_CSS.split("\n").filter(l => /^\.(inv-parties|label|meta)/.test(l)).join(" ")}</style>` },
  { id: "inv-items", label: "Line items", category: "Invoice", media: ICONS.items,
    content: `<table class="items"><thead><tr><th>#</th><th>Description</th><th class="num">Qty</th><th class="num">Unit price</th><th class="num">Amount</th></tr></thead>
<tbody><tr data-repeat="items"><td>{{$number}}</td><td>{{description}}</td><td class="num">{{quantity}}</td><td class="num">{{price | money}}</td><td class="num">{{amount | money}}</td></tr></tbody></table>
<style>${INVOICE_CSS.split("\n").filter(l => /^\.items/.test(l)).join(" ")}</style>` },
  { id: "inv-totals", label: "Totals", category: "Invoice", media: ICONS.totals,
    content: `<table class="totals"><tr><td>Subtotal</td><td>{{invoice.subtotal | money}}</td></tr><tr><td>VAT 25%</td><td>{{invoice.vat | money}}</td></tr><tr class="grand"><td>Total {{invoice.currency}}</td><td>{{invoice.total | money}}</td></tr></table>
<style>${INVOICE_CSS.split("\n").filter(l => /^\.totals/.test(l)).join(" ")}</style>` },
  { id: "inv-payment", label: "Payment details", category: "Invoice", media: ICONS.payment,
    content: `<div class="payment"><p class="label">Payment</p><p>Please pay {{invoice.currency}} {{invoice.total | money}} by {{invoice.due}} to IBAN {{company.iban}}, quoting invoice {{invoice.number}}.</p></div>
<style>${INVOICE_CSS.split("\n").filter(l => /^\.(payment|label)/.test(l)).join(" ")}</style>` },
  { id: "signature", label: "Signature line", category: "Invoice", media: ICONS.signature,
    content: `<div class="sign"><div class="sign-line"></div><p>Name and date</p></div>
<style>.sign { width: 70mm; margin: 24pt 0 10pt; break-inside: avoid; } .sign-line { border-top: 0.75pt solid #1d1d24; margin-top: 30pt; } .sign p { font-size: 8.5pt; color: #55576a; margin: 3pt 0 0; }</style>` },

  // Pages
  { id: "page-break", label: "Page break", category: "Pages", media: ICONS.pageBreak,
    content: `<div class="page-break"></div><style>.page-break { break-after: page; height: 0; }</style>` },
  { id: "keep", label: "Keep together", category: "Pages", media: ICONS.keep,
    content: `<div class="keep"><p>Content in here is never split across two pages.</p></div><style>.keep { break-inside: avoid; }</style>` },
  { id: "page-header", label: "Header on every page", category: "Pages", media: ICONS.header,
    content: `<header class="page-header" data-sticky-pdf-header height="12mm">Company name · Document title</header>
<style>.page-header { font-size: 8pt; color: #8b8b99; border-bottom: 0.5pt solid #d7d7e0; padding-bottom: 3pt; }</style>` },
  { id: "page-footer", label: "Footer on every page", category: "Pages", media: ICONS.footer,
    content: `<footer class="page-footer" data-sticky-pdf-footer height="10mm">Page {page} of {total-pages}</footer>
<style>.page-footer { font-size: 8pt; color: #8b8b99; text-align: center; }</style>` },
];
