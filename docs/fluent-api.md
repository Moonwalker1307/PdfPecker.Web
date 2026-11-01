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

## What it covers {changed 1.22.0}

- **Layout**: `Column`, `Row`, `Table` (row and column spans, header and footer rows repeated on every page, cell backgrounds and borders that fill the
  row in any call order, as in QuestPDF), padding,
  borders, corner radius, background, sizes, alignment, page breaks, `Layers`, `Inlined`, `MultiColumn`, `EnsureSpace`,
  `Decoration`, lists, transforms and `ScaleToFit`, which draws content smaller until it fits a box of fixed size,
  for badges and labels.
- **Text**: spans with font, size, weight, colour, decoration, spacing, superscript and subscript, OpenType features,
  justified text, `ClampLines`, headings that become bookmarks, links, and page numbers and the page count anywhere: in the header, the footer
  and the content. Section page numbers: `BeginPageNumberOfSection`, `EndPageNumberOfSection`,
  `TotalPagesWithinSection` and `PageNumberWithinSection`.
- **Pages**: size, margins, colour, and a header and footer on every page with page numbers. `ShowOnce` and `SkipOnce`
  in the header or footer give the first page a band of its own, such as a letterhead followed by a slim header.
  Several `Page` calls give page sets with their own size, margins, header and footer in one document, and page
  numbers, links, PDF/A, PDF/UA and signatures work across all of them.
- **Form fields and footnotes**, which QuestPDF does not have: `TextField` (one line, multiline or password),
  `CheckBox`, `RadioButton`, `ComboBox` and `ListBox` become fillable PDF fields, and `text.Footnote("...")` numbers a
  note and sets it at the bottom of its page.
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

## Coming from QuestPDF {changed 1.22.0}

Most QuestPDF code ports by changing the `using` lines: `Document.Create`, `Page`, `Header`, `Content`, `Footer`,
`Column`, `Row`, `Table`, `Text`, `Padding`, `Border`, `Background`, `Align*`, `Width`, `Height` and `GeneratePdf` have
the same names. `ScaleToFit`, `ShowOnce`, `SkipOnce`, page numbers in the content and every section page number work
too. Not available yet: `Dynamic`, `Canvas`, `StopPaging`, `RepeatContent` and `ExtendLastCellsToTableBottom`. The package's
[README](https://github.com/Moonwalker1307/PdfPecker/tree/main/src/PdfPecker.Fluent) lists every difference.

## Coming from MigraDoc

MigraDoc builds a document as an object model (`Document`, `Section`, `Paragraph`, `Table`) and renders it through
PDFsharp. With 6.5.0 (October 2026), PDFsharp and MigraDoc moved to AGPL-3.0 or a paid licence; 6.2.4 and earlier
were MIT. PdfPecker.Fluent is MIT and describes the same documents in code. The usual MigraDoc calls map
like this:

- `document.AddSection()`, `section.PageSetup` become `container.Page(page => ...)`, `page.Size`, `page.Margin`
- `section.Headers.Primary`, `section.Footers.Primary` become `page.Header()`, `page.Footer()`
- `Headers.FirstPage` with `DifferentFirstPageHeaderFooter` becomes `ShowOnce()` and `SkipOnce()` in the header or footer
- `AddParagraph`, `AddFormattedText` become `Text("...")`, or `Text(t => t.Span("...").Bold())`
- `AddTable`, `AddColumn`, `AddRow` become `Table` with `ColumnsDefinition` and `Cell()`
- `MergeRight`, `MergeDown` become `ColumnSpan`, `RowSpan`
- `row.HeadingFormat = true` becomes `table.Header(...)`, repeated on every page
- `KeepTogether`, `KeepWith` become `PreventPageBreak()`, `EnsureSpace()`
- `AddPageBreak` becomes `PageBreak()`
- `AddPageField`, `AddNumPagesField` become `CurrentPageNumber()`, `TotalPages()`
- `AddSectionPagesField`, `AddPageRefField` become `TotalPagesWithinSection`, `BeginPageNumberOfSection`
- `AddBookmark`, `AddHyperlink` become `Section("name")`, `SectionLink`, `Hyperlink`
- `AddFootnote` becomes `text.Footnote("...")`
- `AddImage`, `AddTextFrame` become `Image`, `Layers` or `Unconstrained`
- `ListInfo` becomes `List`
- Styles such as `Normal` and `Heading1` become `DefaultTextStyle` and `TextStyle` objects you reuse

Not available in this version: charts, tab stops with leaders, separate headers and footers for even pages, and RTF
output. What PdfPecker.Fluent adds over MigraDoc: complex scripts and right-to-left text, hyphenation, PDF/A and PDF/UA
built from the layout, signatures, form fields, QR codes and output as images or HTML.

The fluent layer adds well under a millisecond to a typical document. On the same invoice, built call for call, it is
about four times as fast as QuestPDF 2026.9.1, as measured in the
[PdfPecker.Benchmarks](https://github.com/Moonwalker1307/PdfPecker.Benchmarks) repository.
