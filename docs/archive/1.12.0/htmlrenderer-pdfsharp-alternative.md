# An HtmlRenderer.PdfSharp alternative

HtmlRenderer.PdfSharp is a free, managed HTML to PDF converter that runs on top of PDFsharp. Two things make people
look for a replacement:

- **The licence of the engine underneath.** HtmlRenderer.PdfSharp 1.6.1 itself is BSD-licensed and still installs
  PDFsharp 6.2.4, the last MIT version. PDFsharp 6.5.0 (October 2026) and the 7.0 previews are AGPL-3.0 or a paid
  commercial licence. Updating PDFsharp, by hand or with a tool such as Dependabot, adding another package
  that needs a newer PDFsharp, or a future HtmlRenderer release built on it, brings in the AGPL, which requires you to
  publish your own application's source code unless you buy a licence. Staying on MIT means pinning PDFsharp at
  6.2.4 and doing without its future fixes.
- **The CSS.** HtmlRenderer supports HTML 4 and CSS 2, so flexbox, grid, CSS variables, `calc()` and `@page` rules
  are ignored.

PdfPecker is also fully managed and runs in your own process, with no dependencies at all, under the MIT licence. It
supports modern CSS and has PDF/A, PDF/UA, signatures, forms and merging built in.

```
dotnet add package PdfPecker
```

Then remove the `HtmlRenderer.PdfSharp` package, and `PDFsharp` too if nothing else in your project uses it.

## Replace the HtmlRenderer call

```csharp
// Before
using PdfSharp;
using TheArtOfDev.HtmlRenderer.PdfSharp;

var document = PdfGenerator.GeneratePdf(html, PageSize.A4);
document.Save("invoice.pdf");
```

```csharp
// After
using PdfPecker;

File.WriteAllBytes("invoice.pdf", HtmlToPdf.Convert(html));
```

A4 is the default. With margins and a page footer:

```csharp
// Before
var config = new PdfGenerateConfig { PageSize = PageSize.A4, MarginTop = 40, MarginBottom = 40 };
var document = PdfGenerator.GeneratePdf(html, config);
```

```csharp
// After
byte[] pdf = HtmlToPdf.Convert(html, new PdfOptions
{
    Margins = PageMargins.FromMillimeters(14, 15, 14, 15),
    FooterText = "Page {page} of {pages}",
});
```

HtmlRenderer has no page numbers of its own; PdfPecker has `FooterText`, `@page` margin boxes and running headers
and footers written in HTML (see [Paged media](/docs/paged-media/)).

## Options side by side

| HtmlRenderer.PdfSharp | PdfPecker |
| --- | --- |
| `PageSize`, `PageOrientation` in `PdfGenerateConfig` | `PageSize = PageSize.A4.Landscape`, or CSS `@page { size: A4 landscape }` |
| `MarginTop`, `MarginBottom`, `MarginLeft`, `MarginRight` (points) | `Margins = new PageMargins(top, right, bottom, left)` in points, or `PageMargins.FromMillimeters` |
| `cssData` argument | `UserStyleSheet`, or `<style>` and `<link>` in the HTML |
| `imageLoad` and `stylesheetLoad` events | `ResourceResolver`, or files under `BaseDirectory` |
| `PdfDocument` for further editing | PDF bytes; merge, stamp, sign and protect them with PdfPecker's own APIs |
| Fonts from PDFsharp's `GlobalFontSettings.FontResolver` | `options.Fonts.AddFile(...)` or `@font-face` (see [Fonts](/docs/fonts/)) |

## What changes in the output

- Modern CSS now works. Layouts built with tables and floats to suit CSS 2 keep working, and you can move to
  flexbox and grid when you want.
- Backgrounds and colours that HtmlRenderer dropped, such as coloured table headers, are drawn.
- Long tables break across pages with their header row repeated, and rows are never cut in half.
- Text is laid out by PdfPecker's own engine, so line breaks and page breaks can fall in slightly different places.
  Check your longest templates after switching.

## Speed and memory

On the same 4-core Linux VM, a one-page invoice took 6.3 ms with HtmlRenderer.PdfSharp and 0.86 ms with PdfPecker, a
30-page report 639 ms and 45 ms, and peak memory was 236 MB and 90 MB. See [Performance](/docs/performance/).

## When HtmlRenderer is still a fine choice

For simple HTML that already looks right, there is no urgent reason to move today: version 1.6.1 runs on the MIT
PDFsharp 6.2.4. Pin that version so an update can't change the licence. PDFsharp itself remains a solid API for drawing PDFs from code. [Compare](/compare/) shows the
two side by side with the other .NET converters.
