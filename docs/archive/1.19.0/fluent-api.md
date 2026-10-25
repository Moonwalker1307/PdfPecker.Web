# Fluent C# API {new 1.19.0}

[PdfPecker.Fluent](https://www.nuget.org/packages/PdfPecker.Fluent) builds PDFs from C# code instead of HTML, in the
style of QuestPDF. You describe pages, headers, footers, columns, rows, tables, text, images and barcodes in code;
PdfPecker.Fluent writes compact HTML and CSS for them and renders it with PdfPecker. It needs no browser, no native
binaries and no package other than PdfPecker.

```
dotnet add package PdfPecker.Fluent
```

It is released together with PdfPecker, always with the same version, and depends on the PdfPecker release of that
version. It runs on .NET 8, 9 and 10, and is trimmable and Native AOT compatible.

```csharp
using PdfPecker.Fluent;

Document.Create(container =>
{
    container.Page(page =>
    {
        page.Size(PageSizes.A4);
        page.Margin(2, Unit.Centimetre);
        page.DefaultTextStyle(x => x.FontSize(11));

        page.Header().Text("Hello PdfPecker").FontSize(20).Bold().FontColor(Colors.Blue.Darken2);

        page.Content().PaddingVertical(1, Unit.Centimetre).Column(column =>
        {
            column.Spacing(10);
            column.Item().Text("A paragraph of text.");
            column.Item().Image(File.ReadAllBytes("logo.png")).FitWidth();
        });

        page.Footer().AlignCenter().Text(x =>
        {
            x.Span("Page ");
            x.CurrentPageNumber();
            x.Span(" of ");
            x.TotalPages();
        });
    });
})
.GeneratePdf("hello.pdf");
```

## What it covers

- **Layout**: `Column`, `Row`, `Table` (row and column spans, header and footer rows repeated on every page), padding,
  borders, corner radius, background, sizes, alignment, page breaks, `Layers`, `Inlined`, `MultiColumn`, `EnsureSpace`,
  `Decoration`, lists and transforms.
- **Text**: spans with font, size, weight, colour, decoration, spacing, superscript and subscript, OpenType features,
  justified text, `ClampLines`, headings that become bookmarks, links, and page numbers in the header and footer.
- **Images and graphics**: PNG, JPEG, WebP, BMP, TIFF, GIF and SVG images, lines, and QR, EPC payment QR, Code 128 and
  EAN-13 barcodes.
- **Accessibility**: QuestPDF's `Semantic*` calls write the HTML PdfPecker tags a PDF/UA document from.
- **Everything else in PdfPecker** through [`PdfOptions`](/docs/options/): PDF/A, PDF/UA, signatures, passwords,
  watermarks, e-invoices, attachments and fonts.
- **Output**: `GeneratePdf` (bytes, file or stream), `GeneratePdfAsync`, `GenerateImages` and `GenerateHtml`, which
  shows the HTML PdfPecker renders.

Text, links, colours and names you pass are encoded, so caller data never turns into markup. `Html()` and `Css()` are
the exception: they insert trusted HTML and CSS as they are, for anything the fluent calls don't cover yet, so never
pass user input to them.

## Coming from QuestPDF

Most QuestPDF code ports by changing the `using` lines: `Document.Create`, `Page`, `Header`, `Content`, `Footer`,
`Column`, `Row`, `Table`, `Text`, `Padding`, `Border`, `Background`, `Align*`, `Width`, `Height` and `GeneratePdf` have
the same names. Not available yet: `Dynamic`, `Canvas`, `StopPaging`, `ShowOnce`, `SkipOnce`, `RepeatContent`,
`ScaleToFit` and some section page numbers. The package's
[README](https://github.com/Moonwalker1307/PdfPecker/tree/main/src/PdfPecker.Fluent) lists every difference.

The fluent layer adds well under a millisecond to a typical document. On the same invoice, built call for call, it is
about four times as fast as QuestPDF 2026.9.1, as measured in the
[PdfPecker.Benchmarks](https://github.com/Moonwalker1307/PdfPecker.Benchmarks) repository.
