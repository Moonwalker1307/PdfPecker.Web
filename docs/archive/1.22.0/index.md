# Getting started

PdfPecker turns HTML and Markdown into PDF, and PDF pages into PNG, JPEG, WebP or TIFF images, in .NET. It has its own HTML
parser, CSS engine, layout engine, PDF writer and PDF renderer, so it never starts a browser, ships no native binaries
and depends on nothing but the .NET base class library. These pages describe the latest release; the version picker has the manual for earlier ones.

```csharp
using PdfPecker;

byte[] pdf = HtmlToPdf.Convert("<h1>Hello</h1><p>World</p>");
File.WriteAllBytes("hello.pdf", pdf);
```

## Install

```
dotnet add package PdfPecker
```

The package targets `net8.0`, `net9.0` and `net10.0`, so it works on .NET 8 and later.

## Usage

```csharp
// String to bytes
byte[] pdf = HtmlToPdf.Convert(html);

// String to a stream
using (var file = File.Create("out.pdf")) HtmlToPdf.Convert(html, file);

// ASP.NET Core
app.MapGet("/invoice", () => Results.File(HtmlToPdf.Convert(html), "application/pdf", "invoice.pdf"));

// File to file; relative <img> and <link> paths resolve against the HTML file's folder
HtmlToPdf.ConvertFile("invoice.html", "invoice.pdf");

// Off the calling thread
byte[] pdf = await HtmlToPdf.ConvertAsync(html);
```

The conversion methods are static and thread-safe, so you can convert many documents in parallel. The few instance
types are `FontCollection` and `PdfRenderer`, which parallel work can share, and `StreamingPdfMerger`, which builds
one output and is used from one thread at a time. Page size, margins, headers,
footers and the rest are set with [`PdfOptions`](/docs/options/).

## System requirements

**Required:** the .NET 8, .NET 9 or .NET 10 runtime (or later). Nothing else: the library is pure managed code with no
native binaries, browser or third-party packages, so it runs wherever .NET runs (Windows, Linux, macOS; x64 and ARM64).
The rendered pages are the same on every version; only the compressed bytes can differ, because each .NET version ships
its own zlib build.

**Recommended:**

- Register the fonts your templates use with `options.Fonts` (see [Fonts](/docs/fonts/)); other fonts fall back to Helvetica,
  Times or Courier metrics.
- Memory and CPU are small. Measured on a 4-core 2.1 GHz Xeon cloud VM (Linux, .NET 10, Release), each document in a
  fresh process:

  | Document | Pages | Time, warm | Time, first in process | Peak process memory | Smallest heap that works |
  | --- | --- | --- | --- | --- | --- |
  | Payslip, invoice, voucher | 1 to 3 | 1 to 3 ms | 0.2 s | 50 MB | under 16 MB |
  | Same with PDF/A or embedded fonts | 1 to 3 | 3 to 5 ms | 0.2 s | 56 MB | under 16 MB |
  | Report with tables | 30 | 30 to 40 ms | 0.3 s | 75 MB | under 16 MB |
  | Report with tables | 1,000 | 1.7 s | 3 s | 480 MB | 245 MB |

  The process itself starts at about 32 MB; a conversion uses about one core, so throughput grows with cores. PDF/A and
  font embedding add a few milliseconds and about 5 MB for the embedded font data. Memory grows roughly with page
  count, so plan about 0.5 MB per page for very long documents.

From a clone of the [PdfPecker repository](https://github.com/Moonwalker1307/PdfPecker),
`dotnet run --project bench/PdfPecker.Benchmarks -c Release -- --requirements [your.html ...]` measures this on your
own machine and documents.

## Where to go next

- [Options](/docs/options/): page size, margins, headers and footers, document properties and file access.
- [HTML and CSS support](/docs/html-and-css/) and [Paged media](/docs/paged-media/): what your templates can use.
- [Fonts](/docs/fonts/): register your own fonts and use any Unicode text.
- [Fluent C# API](/docs/fluent-api/): build PDFs from C# code instead of HTML, in the style of QuestPDF.
- [Limitations](/docs/limitations/): what PdfPecker does not do (yet).
