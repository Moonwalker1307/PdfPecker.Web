# An IronPDF alternative

IronPDF converts HTML with an embedded Chrome engine and is sold per developer. PdfPecker converts the same kind of
templates with its own engine written in C#: no Chrome binaries to deploy, no licence key, and an MIT licence that is
free for commercial use. For invoices, payslips, reports and other HTML you control, the output can match IronPDF's
to a fraction of a millimetre.

```
dotnet add package PdfPecker
```

## Replace the IronPDF call

```csharp
// Before
var renderer = new ChromePdfRenderer();
renderer.RenderingOptions.PaperSize = PdfPaperSize.A4;
renderer.RenderingOptions.MarginTop = 20;
renderer.RenderingOptions.MarginBottom = 20;
renderer.RenderingOptions.TextFooter = new TextHeaderFooter { CenterText = "{page} of {total-pages}" };
using var document = renderer.RenderHtmlAsPdf(html);
byte[] pdf = document.BinaryData;
```

```csharp
// After
using PdfPecker;

byte[] pdf = HtmlToPdf.Convert(html, new PdfOptions
{
    PageSize = PageSize.A4,
    Margins = PageMargins.FromMillimeters(20, 15, 20, 15),
    FooterText = "{page} of {pages}",
});
```

`HtmlToPdf` is static and thread-safe, so there is no renderer to create or dispose, and conversions can run in
parallel. To write the PDF to a file or a response stream, pass the stream: `HtmlToPdf.Convert(html, stream)`.

## Headers and footers in HTML

IronPDF's `HtmlHeaderFooter` takes a piece of HTML with `{page}` and `{total-pages}`. In PdfPecker the header or
footer is an element of the page itself, marked with `data-sticky-pdf-header` or `data-sticky-pdf-footer`, and the
same placeholders work:

```html
<header data-sticky-pdf-header height="17mm"><img src="logo.png" height="40"> ACME Ltd</header>
<main>...</main>
<footer data-sticky-pdf-footer height="12mm">Page {page} of {total-pages}</footer>
```

The element is drawn on every page and the content flows between them. See [Paged media](/docs/paged-media/) for
`@page` margin boxes and running headers.

## Matching IronPDF's output exactly

Chrome lays a page out at a whole number of CSS pixels and stretches it to the paper, so IronPDF's PDFs are a little
larger than the CSS says. If you are switching an existing system and want every box and glyph where IronPDF put it,
for example to compare old and new PDFs, use the same page geometry:

```csharp
var options = new PdfOptions
{
    PageSize = new PageSize(594.96f, 841.92f),   // A4 as Chrome writes it
    Scale = 793.28f / 793f,
    TruncateBandsToWholePoints = true,           // header and footer heights rounded as Chrome does
};
```

One user ran this on the 26 templates of their production app: 24 came out identical to IronPDF's output and the
other two differed by less than 0.25 mm. For a new system, the defaults are fine.

## Options side by side

| IronPDF `RenderingOptions` | PdfPecker `PdfOptions` |
| --- | --- |
| `PaperSize`, `PaperOrientation` | `PageSize = PageSize.A4.Landscape`, or CSS `@page { size: A4 landscape }` |
| `MarginTop`, `MarginBottom`, `MarginLeft`, `MarginRight` (mm) | `Margins = PageMargins.FromMillimeters(top, right, bottom, left)` |
| `TextHeader`, `TextFooter` | `HeaderText`, `FooterText` with `{page}` and `{pages}` |
| `HtmlHeader`, `HtmlFooter` | `data-sticky-pdf-header` and `data-sticky-pdf-footer` elements |
| `CssMediaType = Print` | Always print: `@media print` rules apply |
| `PrintHtmlBackgrounds` | Always on, as in Chrome's print output |
| `Zoom` | `Scale` |
| `CreatePdfFormsFromHtml` | On by default (`FormFields = false` turns it off) |
| `Title` and `MetaData` | `Title`, `Author`, `Subject`, `Keywords` and `CustomProperties` |
| `EnableJavaScript`, `WaitFor` | Not supported: render the content into the HTML before converting |
| `RenderHtmlAsPdf(html, baseUrl)` | `BaseDirectory` for files, `ResourceResolver` for `http` URLs |

PDF/A, PDF/UA, passwords, watermarks, digital signatures, ZUGFeRD and Factur-X, merging, stamping and PDF to image are
built in too; each has a page in these docs.

## Speed

On the same 26 production templates, IronPDF 2026.7.2 took 13.6 s for all of them one at a time and PdfPecker 17 ms.
With 22 in parallel, IronPDF made 9.2 documents per second and PdfPecker 1,143. Details are on the
[Performance](/docs/performance/) page.

## When IronPDF is the better choice

IronPDF prints exactly what Chrome prints, runs JavaScript, converts live websites and comes with paid support and a
large PDF editing API. If your pages build themselves with scripts, or you need output identical to a browser for
arbitrary HTML, keep a Chrome-based converter. [Compare](/compare/) lists what each converter can do.
