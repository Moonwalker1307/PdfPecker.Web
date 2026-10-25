# Merging and splitting PDFs

## Merging {changed 1.20.0}

`PdfMerger` combines PDFs into one, any PDFs, not only those PdfPecker made:

```csharp
byte[] merged = PdfMerger.Merge(invoicePdf, termsPdf, attachmentPdf);

// With passwords for encrypted inputs (by position), and properties for the result.
byte[] merged2 = PdfMerger.Merge(new[] { a, b }, new PdfMergeOptions
{
    Passwords = new string?[] { null, "secret" },
    Title = "Payslips October",
    CustomProperties = { ["RunId"] = "42" },
});

PdfMerger.MergeFiles("all.pdf", new[] { "a.pdf", "b.pdf" });

// Streams in and out: inputs are read one at a time and the result is written as it is made.
PdfMerger.Merge(new[] { invoiceStream, termsStream }, outputStream);
await PdfMerger.MergeAsync(uploads.Select(f => f.OpenReadStream()), response.Body);
```

Tagged inputs stay tagged: their structure trees are joined under one root, so the merged file is still accessible,
and when every input is PDF/UA-1 the result says so too (veraPDF passes it). The merged file is PDF 1.7, so PDF/UA-2
inputs stay tagged but the result claims no PDF/UA level. An input in another language than the
first keeps its language on its own part of the tree. Untagged inputs merge as before.

With streams (and `MergeFiles`), only one input is held in memory at a time and the merged document goes to the output
as each input is done, so memory follows the largest input rather than the whole batch: merging 100 files of 32 MB in
total peaks at 14 MB of managed memory, against 105 MB with byte arrays. `MergeAsync` reads and writes asynchronously,
as ASP.NET Core requires for request and response bodies. Input streams are read from their current position and are
not disposed; the sequence is enumerated lazily, so an iterator can open each one only when its turn comes. `MergeFiles`
writes to a temporary file and moves it into place, so the output can be one of the inputs and a failed merge leaves
no partial file behind.

## Merging PDFs as they arrive

For PDFs that arrive one at a time from elsewhere, such as downloads read a few at a time, use `StreamingPdfMerger`. It
writes each PDF's pages when it is added and then lets the PDF go, so memory stays at about one input, and between
inputs you decide what comes next: skip a missing document, or check that anything was added before answering. The
output can be an HTTP response body or a file; it does not need to be seekable.

```csharp
var merger = new StreamingPdfMerger(response.Body, new PdfMergeOptions { Title = "Payslips October" });
foreach (var path in paths)
{
    var pdf = await storage.DownloadAsync(path, ct);
    if (pdf.Length == 0) continue;          // skip a missing document
    await merger.AddAsync(pdf, ct);
}
if (merger.InputCount == 0) return Results.NotFound();
await merger.CompleteAsync(ct);             // writes the page tree, bookmarks, form and cross-reference table

// Or, from an IAsyncEnumerable<byte[]>:
int pages = await PdfMerger.MergeAsync(DownloadInOrder(paths), response.Body, cancellationToken: ct);
```

The result is the same as `PdfMerger.Merge`'s, but the output is only a valid PDF once `Complete` has run. If adding a
PDF throws (a damaged or encrypted input, `MaxPages` reached), what was written cannot be used and the merger refuses
further calls. `Passwords` are matched to inputs in the order they are added.

The pages keep their content, fonts, images, links, annotations, layers and fillable form fields, and each input's
bookmarks follow each other. A form field named like one in an earlier input is renamed `name_2`, `name_3` and so on, so
the copies keep their own values. Document properties come from the first input unless `PdfMergeOptions` sets them. The
result is never encrypted (pass it to `PdfProtector.Encrypt` to protect it) and has no signatures (merging would break
them); PDF/A conformance is not carried over. `PdfMergeOptions.Viewer` and `PageLabels` set the
[viewer settings and page labels](/docs/options/#viewer-settings-and-page-labels) of the result, and
[`PdfLinearizer`](/docs/compacting/#fast-web-view) makes it load fast on the web. Without `PageLabels`, the inputs'
page labels are kept (pages of an input without them are numbered as in that input), and attachments too, with one named like an earlier input's listed as `name (2).ext`. Images, fonts and other resources that are byte-for-byte the same in several inputs, such
as a logo on every payslip of a run, are written once.

Inputs are handled as untrusted: damaged files are repaired where possible, decoding is limited per input, and
`MaxPages` (default 100,000) caps the result. Inputs without any pages throw `InvalidDataException`. Merging was tested
on PDFs from Chrome (as IronPDF makes them), Ghostscript, LibreOffice, MuPDF, qpdf, ReportLab, pypdf incremental
updates, scanners (JPEG, CCITT G4, CMYK, OCR text layers) and damaged files (wrong or missing cross-reference tables,
truncated files, junk before the header); every merged page rendered pixel-identical to its original in Poppler.
Merging four small documents takes about 1 ms, and 1,000 one-page Chrome payslips about 1 s.

## Extracting, reordering and splitting pages {new 1.7.0}

`PdfPages` works on the pages of any existing PDF. Pages are numbered from 1, and ranges are written like `"1-3,5,8-"`
(pages 1 to 3, 5, and 8 to the end): `"3,1,2"` reorders, `"1,1"` repeats, `"5-3"` runs backwards and `"last"` is the
last page. `PdfPageRange.Parse` reads a range once for reuse; a page past the end throws `ArgumentOutOfRangeException`
("Page 9 is out of range: the PDF has 5 pages.").

```csharp
byte[] summary = PdfPages.Extract(report, "1-3,5");              // or new[] { 3, 1, 2 }
byte[] withoutCover = PdfPages.Remove(report, "1");
byte[] turned = PdfPages.Rotate(scan, 90, "2,4");                 // clockwise; null pages = every page
byte[][] parts = PdfPages.Split(report, 10);                      // 10 pages each
byte[][] chapters = PdfPages.Split(report, "1-4", "5-9", "10-");
int pages = PdfPages.Count(report);

// Encrypted input, files, streams.
byte[] page = PdfPages.Extract(secret, "2", new PdfPagesOptions { Password = "pw", Title = "Page 2" });
PdfPages.ExtractFile("report.pdf", "summary.pdf", "1-3");
PdfPages.SplitFile("report.pdf", 1, n => $"report-{n}.pdf");

// Selected pages of several PDFs merged into one (also StreamingPdfMerger.Add(pdf, pages)).
byte[] merged = PdfMerger.Merge(new[] { new PdfMergeInput(invoice, "1"), new PdfMergeInput(terms, "2-") });
```

For the pages taken, the result keeps their content, links and other annotations, the form fields with a widget on
them, the bookmarks that go to them, page labels, the document properties and language. Links and bookmarks to pages
left out are dropped (a bookmark with a kept bookmark below it stays, without a destination); links between pages taken
go to their new place. A tagged input stays tagged: structure elements are kept when some of their content is on a page
taken, so a PDF/UA-1 input gives a PDF/UA-1 result (veraPDF passes extracted, removed and split parts). A page taken more
than once is copied with its links, but its form fields stay on the first copy and the later copies are not tagged, so
such a result no longer claims PDF/UA. `Split` parses the PDF once for all parts. As with merging, the result is not
encrypted and has no signatures.
