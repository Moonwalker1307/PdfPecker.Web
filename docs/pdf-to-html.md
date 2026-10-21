# PDF to HTML {new 1.17.0}

`PdfToHtml` turns any PDF, not only those PdfPecker made, into one HTML file that looks like the PDF. Each page is an
image of the page, and the page's text is laid invisibly over it word by word, so it can be selected, copied, found
with the browser's search and read by screen readers. The PDF's web, mail and phone links and its links between pages
keep working. Use it to show statements, invoices or reports in a web page or an e-mail portal without a PDF viewer.

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

## The HTML

The output is one self-contained HTML file with no scripts: the page images, the style sheet and the small web font of
the text layer are all inside it, so it can be saved, mailed or served as it is. Pages scale to the width of the window,
down to a phone screen, and print on paper of their own size. Every page is a `div` with the class `pdf-page` and the
id `page-` followed by its page number, so `report.html#page-3` opens the third page.

The pages are drawn by PdfPecker's own [PDF renderer](/docs/pdf-to-image/) and the text comes from
[text extraction](/docs/text-extraction/), so everything those can read works here: any fonts, JPEG 2000, JBIG2 and
CCITT images, encrypted PDFs, form fields and annotations. Pages are converted in parallel.

## Options

| `PdfHtmlOptions` | Default | |
| --- | --- | --- |
| `Password` | none | The user or owner password of an encrypted PDF |
| `Pages` | every page | The pages to convert, such as `PdfPageRange.Parse("1-3")` |
| `Dpi` | 150 | The resolution of the page images; higher is sharper on high-density screens and makes larger files |
| `ImageFormat` | `WebP` | `WebP` (lossless), `Png`, or `Jpeg` (smaller for photos and scans, but lossy) |
| `Quality` | 85 | The JPEG quality, or the WebP compression effort, from 1 to 100 |
| `IncludeText` | true | Lay the text invisibly over the images |
| `IncludeLinks` | true | Turn web, mail, phone and page links into links; `javascript:` and file links are always left out |
| `RenderAnnotations` | true | Draw form fields, stamps and comments, and include their text |
| `Title` | the PDF's title | The HTML document's title |
| `MaxDimension` | 16,384 | The most pixels on either side of a page image; larger pages get a lower resolution |
| `MaxPages` | 10,000 | More pages throw `PdfLimitException` |
| `MaxDegreeOfParallelism` | processor count | The most pages converted at the same time |

## What it is not

The HTML keeps the PDF's layout rather than reflowing it into paragraphs and tables, and the text is shown in the image
rather than in the PDF's fonts, so it zooms as an image does. Text that the PDF draws only as outlines or images, such
as a scan, can be seen but not selected, since there is no OCR. See [Limitations](/docs/limitations/#reading-and-changing-existing-pdfs).
