# A wkhtmltopdf alternative for .NET

wkhtmltopdf was archived in January 2023 and gets no more fixes, security fixes included. It renders with a Qt WebKit
engine from 2016, so flexbox, grid and most CSS written since then don't work, and it has to be deployed as a native
binary of about 90 MB for each operating system. .NET wrappers such as DinkToPdf, Rotativa, NReco.PdfGenerator and
WkHtmlToPdf-DotNet carry the same engine with them.

PdfPecker is a replacement written in plain C#. It is one NuGet package with no native files, it supports modern CSS,
and it converts in your own process instead of starting a program for every PDF. It is free under the MIT license.

```
dotnet add package PdfPecker
```

## Replace the wkhtmltopdf call

### From the command line or a Process

```csharp
// Before: one wkhtmltopdf process per document
var process = Process.Start("wkhtmltopdf", "--page-size A4 -T 20mm -B 20mm invoice.html invoice.pdf");
process.WaitForExit();
```

```csharp
// After
using PdfPecker;

HtmlToPdf.ConvertFile("invoice.html", "invoice.pdf", new PdfOptions
{
    PageSize = PageSize.A4,
    Margins = PageMargins.FromMillimeters(20, 10, 20, 10),
});
```

### From DinkToPdf or WkHtmlToPdf-DotNet

```csharp
// Before
var converter = new SynchronizedConverter(new PdfTools());
var document = new HtmlToPdfDocument
{
    GlobalSettings = { PaperSize = PaperKind.A4, Orientation = Orientation.Landscape },
    Objects = { new ObjectSettings { HtmlContent = html } },
};
byte[] pdf = converter.Convert(document);
```

```csharp
// After
byte[] pdf = HtmlToPdf.Convert(html, new PdfOptions { PageSize = PageSize.A4.Landscape });
```

There is no converter object to keep alive and no native library to load: `HtmlToPdf` is static and thread-safe, so
many requests can convert at the same time without the `SynchronizedConverter` lock.

### From Rotativa in ASP.NET Core

Rotativa renders a Razor view and passes the HTML to wkhtmltopdf. Render the view to a string the way you already do
for emails, or build the HTML from a template, and return the PDF:

```csharp
app.MapGet("/invoice/{id}", (int id) =>
    Results.File(HtmlToPdf.Convert(RenderInvoice(id)), "application/pdf", $"invoice-{id}.pdf"));
```

## Options side by side

| wkhtmltopdf | PdfPecker |
| --- | --- |
| `--page-size A4`, `-O Landscape` | `PageSize = PageSize.A4.Landscape`, or CSS `@page { size: A4 landscape }` |
| `-T`, `-R`, `-B`, `-L` | `Margins = PageMargins.FromMillimeters(top, right, bottom, left)`, or CSS `@page { margin: ... }` |
| `--footer-center "[page] of [topage]"` | `FooterText = "{page} of {pages}"`, or an `@page` margin box with `counter(page)` and `counter(pages)` |
| `--header-html header.html` | An element with `data-sticky-pdf-header` in the page (see [Paged media](/docs/paged-media/)) |
| `--title` | `Title`, or the document's `<title>` |
| `--outline` | On by default: bookmarks come from `h1` to `h6` |
| `toc` | Write the table of contents in your HTML with `target-counter()` and `leader()` for page numbers |
| `--print-media-type` | Always on: `@media print` rules apply |
| `--enable-local-file-access` | Files under `BaseDirectory` are read; `AllowFileAccess = true` allows others |
| `--zoom`, smart shrinking | `Scale`. PdfPecker does not shrink content to fit, so check page breaks after switching |
| `--javascript-delay`, `--run-script` | Not supported: render the content into the HTML before converting |
| `--enable-forms` | On by default: inputs become fillable fields (`FormFields = false` turns it off) |

## What changes in the output

- Pages can count differently. wkhtmltopdf shrinks content to fit the page by default, so a report that was 24
  pages can become 29 at its real size. Set `Scale` if you need the old size back, but the real size is usually what
  the CSS meant.
- Flexbox, grid, `calc()`, CSS variables and other modern CSS now work, so workarounds written for the old WebKit,
  such as tables used for layout or `-webkit-box`, can be removed or left as they are.
- JavaScript is not run. Charts or text that scripts add to the page have to be in the HTML already, for example
  as SVG made on the server.
- Fonts come from files you register, not from the server's installed fonts, so the output is the same on every
  machine. See [Fonts](/docs/fonts/).

## Speed and size

On the same 4-core Linux VM, a one-page invoice took 282 ms with wkhtmltopdf and 0.92 ms with PdfPecker, and a
30-page report 600 ms and 33 ms. Deployment drops from about 90 MB of native files to one 5 MB DLL. The full
comparison is on the [Performance](/docs/performance/) page.

## Next steps

- [HTML to PDF in C#](/docs/html-to-pdf-csharp/): a walk-through with templates, ASP.NET Core and fonts.
- [HTML and CSS](/docs/html-and-css/) and [Limitations](/docs/limitations/): what your templates can use.
- [Compare](/compare/): PdfPecker next to wkhtmltopdf and the other .NET converters, feature by feature.
