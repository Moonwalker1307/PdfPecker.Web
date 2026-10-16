# Performance

PdfPecker lays out documents in your own process, without a browser, so a typical one-page document takes about a
millisecond. For memory and CPU per document, see [System requirements](/docs/#system-requirements).

## Compared with other converters

The same three documents converted to A4 PDF by PdfPecker and six .NET alternatives, on one 4-core cloud VM
(Intel Xeon @ 2.8 GHz, 16 GB, Linux, .NET 10.0.12). Times are medians after a 3-second warm-up; "first PDF" includes
starting the browser where there is one. Parallel runs one conversion per core at once on the 5-page document. Peak
memory is the proportional set size (PSS) of the whole process tree, so a browser's helper processes are included
once and shared pages are not double-counted.

| Converter | Engine | To deploy | First PDF | Invoice, 1 page | Feature tour, 5 pages | Report, 30 pages | Parallel | Peak memory |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **PdfPecker** | own, managed | 3.1 MB DLL | 0.27 s | **0.86 ms** | **2.7 ms** | **39 ms** | **962 docs/s** | **83 MB** |
| HtmlRenderer.PdfSharp 1.6.1 | own, managed (CSS 2) | 2.4 MB of DLLs | 0.47 s | 5.0 ms | 16 ms | 473 ms | 88 docs/s | 255 MB |
| iText pdfHTML 6.3.4 \* | own, managed | 11 MB of DLLs | 1.68 s | 41 ms | 242 ms | 4.2 s | 8 docs/s | 614 MB |
| wkhtmltopdf 0.12.6 | Qt WebKit, native | about 90 MB with Qt | 0.31 s | 289 ms | 333 ms | 693 ms | 12 docs/s | 164 MB |
| PuppeteerSharp 25.13 | Chromium 141 | about 600 MB browser | 0.91 s | 128 ms | 166 ms | 539 ms | 12 docs/s | 849 MB |
| Microsoft.Playwright 1.63 | Chromium 141 | browser + 135 MB driver | 1.08 s | 142 ms | 191 ms | 522 ms | 11 docs/s | 986 MB |
| Syncfusion HTML to PDF 35.1.40 \* | Chrome (Blink), bundled | about 545 MB with Chrome | 2.52 s | 263 ms | 314 ms | 1.7 s | 1 doc/s | 2,195 MB |

\* Measured later (October 2026) on the same VM type with the same program. In that run the other converters were up to
70% slower than in the table above and PdfPecker slightly faster, so these two rows are approximate and, if anything,
a little slower than a like-for-like run would show.

How to read it:

- PdfPecker is 60 to 150 times faster than the Chromium-based converters on the 1 and 5-page documents and about
  14 times faster on the 30-page report, and uses a tenth of their memory. Per-document overhead (a browser tab, a process
  start) dominates for the others on small documents.
- Output is not identical. Chromium is the reference for modern CSS and runs JavaScript, which PdfPecker does not.
  HtmlRenderer supports only HTML 4 and CSS 2 (it drops the invoice's table header colours), and wkhtmltopdf uses
  a 2016 WebKit, shrinks content to fit by default (24 pages for the report instead of 29) and was archived in 2023.
- iText pdfHTML lays out the documents itself, like PdfPecker, but its time grows faster than the page count: 242 ms for
  5 pages and 4.2 s for the 30-page report, which is one long table.
- Syncfusion ran as a trial without a licence key, which adds a line of text to each page. Its `AdditionalDelay`
  (2 seconds of waiting for scripts by default) was set to 0, as the other Chromium converters don't wait either. With
  its default settings it scales content down, so the report took 13 pages instead of 29.
- PDF sizes for the 1 / 5 / 30-page documents: PdfPecker 12 / 26 / 126 KB, Chromium 72 / 139 / 171 KB,
  wkhtmltopdf 30 / 59 / 191 KB, HtmlRenderer 35 / 65 / 273 KB, iText 26 / 45 / 104 KB, Syncfusion 42 / 89 / 132 KB.
- Each converter was used the way its documentation suggests for many documents: PdfPecker and HtmlRenderer in
  process, wkhtmltopdf as one process per document, and PuppeteerSharp and Playwright with one shared browser and a
  new tab per document (Playwright in one shared browser context, tagged PDF output off for both). iText reuses one
  font provider per thread, as its knowledge base advises. Syncfusion keeps one converter per concurrent conversion with
  `ReuseBrowserProcess` on, as its support forum advises, so the parallel run starts four browsers.

IronPDF was not measured here. One user compared PdfPecker with **IronPDF 2026.7.2** (Chrome-based)
on the 26 templates of their production app, on a 22-core development machine after warm-up: IronPDF took 13.6 s
for all 26 documents one at a time and PdfPecker 17 ms (about 800 times faster), and with 22 in parallel IronPDF made
9.2 documents/s and PdfPecker 1,143 (about 125 times). 24 of the 26 documents came out identical; the other two differ
by less than 0.25 mm.

To reproduce the table from a clone of the [PdfPecker repository](https://github.com/Moonwalker1307/PdfPecker) (needs wkhtmltopdf on `PATH` and a Chromium at `CHROMIUM_PATH`):

```
dotnet run --project bench/PdfPecker.Comparison -c Release
```

The comparison project is not part of `PdfPecker.sln`, so its third-party packages never reach the library or its
tests. Your numbers will differ with hardware and documents.

## Conversion speed

Measured with `bench/PdfPecker.Benchmarks` (in the PdfPecker repository) on a 4-core cloud VM (.NET 10, Release, after JIT warm-up):

| Document | Pages | Median | Throughput |
| --- | --- | --- | --- |
| Invoice with a PNG logo and a styled table | 1 | 0.55 ms | about 1,800 docs/s on one core |
| Feature tour (text, lists, tables, JPEG and PNG) | 5 | 2.5 ms | about 1,700 docs/s on 4 cores |
| Dense report with 1,000 table rows | 30 | 19.5 ms | about 1,500 pages/s on one core |
| Markdown guide (`guide.md`, headings, lists, code, a table) to PDF | 2 | 0.9 ms | about 1,000 docs/s on one core |

Parsing Markdown to HTML runs at roughly 20 to 45 MB/s, so it is a small part of a Markdown to PDF conversion.

The first conversion in a process also pays for JIT compilation (about 150 ms); later ones run at the speeds above.

Rendering PDF pages to images, same machine, one core per page (`PdfRenderer`, first render of each page of a freshly
opened document, so fonts and images are decoded too):

| Document | Render at 96 DPI | Render at 150 DPI | PNG encoding at 150 DPI |
| --- | --- | --- | --- |
| Invoice (1 page) | 13 ms | 19 ms | 24 ms |
| Feature tour (5 pages) | 7 ms per page | 12 ms per page | 26 ms per page |
| Large report (30 pages) | 5 ms per page | 10 ms per page | 29 ms per page |

Rendering the same page again (fonts and glyphs cached) takes about 5 ms at 150 DPI. Multi-page conversions render
pages in parallel. Encoding one 150 DPI A4 page (1240 x 1754) takes about 15 to 60 ms as PNG, 20 to 70 ms as JPEG
and 40 to 85 ms as WebP at the default quality, depending on content.
