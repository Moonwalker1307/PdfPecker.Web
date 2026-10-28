# PDF to HTML {new 1.17.0}

`PdfToHtml` turns any PDF, not only those PdfPecker made, into one HTML file that looks like the PDF. Each page is an
image of the page, and the page's text is laid invisibly over it line by line, so it can be selected, copied, found
with the browser's search (whole phrases too) and read by screen readers. The PDF's web, mail and phone links and its links between pages
keep working. Use it to show statements, invoices or reports in a web page or an e-mail portal without a PDF viewer.
The [structured mode](#structured-html) writes the text instead as headings, paragraphs, lists and tables that flow,
for search indexes, language models and small screens.

```csharp
// Any PDF as one self-contained HTML page
string html = PdfToHtml.Convert(File.ReadAllBytes("statement.pdf"));

// File to file, or straight to a stream a few pages at a time, so a long PDF is never held in memory whole
PdfToHtml.ConvertFile("report.pdf", "report.html");
using (var file = File.Create("report.html")) PdfToHtml.Convert(pdfBytes, file);

// Some pages of an encrypted PDF, as sharper JPEG images
string first = PdfToHtml.Convert(pdfBytes, new PdfHtmlOptions
{
    Password = "pw",
    Pages = PdfPageRange.Parse("1-3"),
    Dpi = 200,
    ImageFormat = PdfImageFormat.Jpeg,
    Quality = 80,
});
```

`Convert` also takes a `Stream`, and every method takes a `CancellationToken`.

## The HTML {changed 1.20.0}

The output is one self-contained HTML file with no scripts: the page images, the style sheet and the small web font of
the text layer are all inside it, so it can be saved, mailed or served as it is. Pages scale to the width of the window,
down to a phone screen, and print on paper of their own size. Every page is a `div` with the class `pdf-page` and the
id `page-` followed by its page number, so `report.html#page-3` opens the third page. Each line of the text layer is
one box with its words inside, so the browser's find matches phrases across words, not only single words.

The pages are drawn by PdfPecker's own [PDF renderer](/docs/pdf-to-image/) and the text comes from
[text extraction](/docs/text-extraction/), so everything those can read works here: any fonts, JPEG 2000, JBIG2 and
CCITT images, encrypted PDFs, form fields and annotations. Pages are converted in parallel.

## Structured HTML {new 1.21.0}

`Mode = PdfHtmlMode.Structured` writes the pages' text as flowing headings, paragraphs, lists and real `<table>`
elements in reading order, with nothing placed at a fixed position. A tagged PDF (PDF/UA, or any PDF with a structure
tree) is read from its tags, which say exactly what each heading, list item and table cell is. Other PDFs are read from
their layout: tables come from the rules and borders the PDF draws and from text that lines up in columns, with header
rows, spanned cells, wrapped cells and indented row labels.

```csharp
// Plain structure: one readable style, no pictures
string text = PdfToHtml.Convert(pdfBytes, new PdfHtmlOptions { Mode = PdfHtmlMode.Structured });

// The same structure with the PDF's fonts, colours, backgrounds, borders and pictures
string styled = PdfToHtml.Convert(pdfBytes,
    new PdfHtmlOptions { Mode = PdfHtmlMode.Structured, IncludeStyles = true, IncludeImages = true });
```

`IncludeStyles` keeps how the page looks as CSS classes of each page: the fonts, sizes and colours of the text, the
backgrounds, rounded corners and border lines of table cells and coloured boxes (dashed ones too), where text sits in
its cell, and the widths of tables and columns. The text still flows. `IncludeImages` adds the pictures the pages draw,
such as a logo, as JPEG or PNG images where they sit in the flow; a picture that fills most of a page (a scan under its
text), image masks, turned pictures and pictures too small to see are left out. The image options of the table below
do not apply to structured HTML.

## Options {changed 1.21.0}

| `PdfHtmlOptions` | Default | |
| --- | --- | --- |
| `Mode` | `Visual` | `Visual` pages that look like the PDF, or `Structured` flowing text and tables (see [Structured HTML](#structured-html)) |
| `IncludeStyles` | false | Structured HTML only: keep the PDF's fonts, colours, fills, borders and column widths as CSS classes |
| `IncludeImages` | false | Structured HTML only: include the pages' pictures as images in the flow |
| `Password` | none | The user or owner password of an encrypted PDF |
| `Pages` | every page | The pages to convert, such as `PdfPageRange.Parse("1-3")` |
| `Dpi` | 150 | The resolution of the page images; higher is sharper on high-density screens and makes larger files |
| `ImageFormat` | `WebP` | `WebP` (lossless), `Png`, or `Jpeg` (smaller for photos and scans, but lossy) |
| `Quality` | 85 for JPEG, 29 for WebP | The JPEG quality, or the WebP compression effort, from 1 to 100; WebP never loses a pixel, and 85 (the default before 1.19.0) makes it about 1% smaller and slower |
| `IncludeText` | true | Lay the text invisibly over the images |
| `IncludeLinks` | true | Turn web, mail, phone and page links into links; `javascript:` and file links are always left out |
| `RenderAnnotations` | true | Draw form fields, stamps and comments, and include their text |
| `Title` | the PDF's title | The HTML document's title |
| `MaxDimension` | 16,384 | The most pixels on either side of a page image; larger pages get a lower resolution |
| `MaxPages` | 10,000 | More pages throw `PdfLimitException` |
| `MaxDegreeOfParallelism` | processor count | The most pages converted at the same time |

## What it is not

Visual HTML keeps the PDF's layout rather than reflowing it into paragraphs and tables, and the text is shown in the
image rather than in the PDF's fonts, so it zooms as an image does. Structured HTML reflows, but an untagged PDF's
structure is read from its layout, so unusual layouts, floats and charts can come out as plain paragraphs. Text that the PDF draws only as outlines or images, such
as a scan, can be seen but not selected, since there is no OCR. See [Limitations](/docs/limitations/#reading-and-changing-existing-pdfs).
