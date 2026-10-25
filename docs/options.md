# Options

`PdfOptions` controls the page, the document properties and how resources are loaded. Every conversion method
takes one; leave it out for A4 pages with the defaults below.

```csharp
var options = new PdfOptions
{
    PageSize = PageSize.Letter.Landscape,            // A3, A4 (default), A5, Letter, Legal or new PageSize(w, h) in points
    Margins = PageMargins.FromMillimeters(20, 15, 20, 15),
    Scale = 1,                                        // like Chrome's print scale (see its docs to match IronPDF's output)
    ShrinkToFit = true,                               // lay out too-wide content wider and draw it smaller, as Chrome prints (default)
    TruncateBandsToWholePoints = false,               // round header/footer height attributes down to whole points, as Chrome does
    BaseDirectory = "/var/app/templates",             // where relative image/stylesheet paths are resolved
    ResourceResolver = url => myCache.Get(url),       // serve http(s) or embedded resources yourself; null = default handling
    UserStyleSheet = "body { font-size: 10pt }",      // extra CSS applied after the document's own
    FooterText = "Page {page} of {pages}",            // also HeaderText
    Title = "Invoice 42", Author = "Accounts",        // document properties (Title defaults to <title>)
    Keywords = "invoice", Creator = "MyApp",          // also Subject, and Producer (default "PdfPecker")
    CustomProperties = { ["RunId"] = "42" },          // your own properties, in the PDF's document information
    Bookmarks = true,                                 // PDF bookmarks from h1-h6 (default)
    FormFields = true,                                // inputs, selects and textareas become fillable fields (default)
    Compress = true,                                  // Flate-compress page content (default)
    AllowFileAccess = false,                          // true: also read files outside BaseDirectory (trusted HTML only)
    MaxPages = 1000,                                  // refuse longer documents with PdfLimitException (default 100,000)
    Linearize = true,                                 // Fast Web View: the first page shows before the rest has loaded
    StripImageMetadata = true,                        // drop EXIF (GPS location too), XMP and IPTC from embedded JPEGs
};
byte[] pdf = HtmlToPdf.Convert(html, options);
```

## Files, network and untrusted HTML

Local images and stylesheets are read only from inside `BaseDirectory` (the input file's folder for `ConvertFile`):
absolute paths, `file:` URLs, `..` and symbolic links that lead outside it are ignored unless `AllowFileAccess = true`,
and converting a string without a `BaseDirectory` reads no files at all. For HTML from untrusted users, keep it that
way, set a low `MaxPages`, and pass a cancellation token with a timeout (`HtmlToPdf.Convert(html, options, token)`):
cancelling stops the conversion where it is.

## Page size from CSS

A CSS `@page { size: A4 landscape; margin: 15mm }` rule overrides the page size and margins unless
`IgnoreCssPageRules` is set. Conversion never makes network requests: `http(s)` images and stylesheets are only
loaded through `ResourceResolver`. Only [signing](/docs/signatures/) goes online, and only when asked: a timestamp from
`TimestampUrl`, revocation data with `FetchRevocationData`, and online revocation checks when verifying.

## Document properties

Custom properties are written to the document information dictionary, where Acrobat shows them under Document
Properties > Custom and `pdfinfo -custom` lists them. For PDF/A they are also written to the XMP metadata (Acrobat's
`pdfx` namespace, with the extension schema PDF/A requires), alongside Keywords, Creator and Producer.

## Viewer settings and page labels {new 1.20.0}

`Viewer` sets how a PDF viewer opens the document: the start page and zoom, the page layout (one page, a scrolling
column, or two pages side by side like a book), the panel next to the pages (bookmarks, thumbnails or attachments) or
full screen, the window (fit, centre, hide the toolbar, menu bar or controls, show the title instead of the file name)
and the print dialog (100% instead of fit to paper, so forms and labels print at their real size, and duplex).
`PageLabels` sets the page numbers a viewer shows, such as "i" to "iv" for the front matter and "1" onwards after it,
or "A-1" for an appendix; they do not change `{page}` or CSS page counters. Every setting's default leaves the choice
to the viewer, and viewers treat them as suggestions: browsers in particular ignore some of them.

```csharp
var options = new PdfOptions
{
    Viewer = new PdfViewerSettings
    {
        PageMode = PdfPageMode.Bookmarks,             // also PagesOnly, Thumbnails, Attachments, FullScreen
        PageLayout = PdfPageLayout.OneColumn,         // also SinglePage, TwoColumnLeft/Right, TwoPageLeft/Right
        Zoom = PdfZoom.FitWidth,                      // also FitPage, ActualSize
        StartPage = 1,
        DisablePrintScaling = true,
        Duplex = PdfDuplex.FlipLongEdge,
    },
    PageLabels =
    {
        new PdfPageLabel(1, PdfPageNumberStyle.LowerRoman),   // pages 1-4: i, ii, iii, iv
        new PdfPageLabel(5),                                  // from page 5: 1, 2, 3, ...
        new PdfPageLabel(20, PdfPageNumberStyle.Decimal, prefix: "A-"),
    },
};
```

`PdfMergeOptions` has the same `Viewer` and `PageLabels` for a [merged](/docs/merging/) file. A tagged PDF/UA-2 file
opens at the first element of its start page, as PDF/UA-2 requires.

## Fast Web View and photo metadata {new 1.20.0}

`Linearize = true` writes a linearized PDF (Fast Web View): the first page and a table of where every later page lies
come first, so a browser or viewer loading the file over the web shows the first page before the rest has arrived. It
costs a second pass over the file and adds a little to its size, so it pays off for large documents served over a
network. It works with `Security`, `Conformance` and `Accessibility`, but not with `Signature`, since a signature is
added as an incremental update, which ends the linearization. `PdfLinearizer` does the same for any existing PDF, see
[Compacting](/docs/compacting/#fast-web-view).

JPEG images are embedded byte for byte, so a photo in a template carries its EXIF data into the PDF: the camera, the
time it was taken and often its GPS location. `StripImageMetadata = true` removes EXIF, XMP, IPTC and comments from each
JPEG as it is embedded, and keeps the colour profile, so the images look the same. Other image formats are decoded on
embedding and never keep their metadata.

## Reproducible output {new 1.12.0}

By default every PDF records the time it was made and gets a random file identifier, so two conversions of the same
HTML differ. Set `CreationDate`, or the `SOURCE_DATE_EPOCH` environment variable (seconds since 1970, as used by
reproducible builds), and the dates are fixed and the identifier is derived from a hash of the file, so the same input
gives a byte-identical PDF. `PdfMergeOptions`, `PdfPagesOptions`, `PdfStampOptions` and `PdfFormFillOptions` have the
same `CreationDate`. Signed and encrypted output still differs each time, since signing time and encryption keys are
part of it.

```csharp
var options = new PdfOptions { CreationDate = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero) };
```

## Errors, cancellation and output files {new 1.12.0}

Errors the library raises itself derive from `PdfPeckerException`: `PdfLimitException` (a limit such as `MaxPages`
reached), `PdfPasswordException` and `PdfSignatureException`. Unreadable input PDFs throw `InvalidDataException`, and
bad arguments the usual `ArgumentException`s; each method's documentation lists what it throws. Every method that
writes a file (`ConvertFile`, `StampFile`, `SignFile`, `MergeFiles`, ...) writes to a temporary file first and
replaces the target only when it succeeds, so a failure leaves an existing file untouched. Methods that read or write
PDFs take a `CancellationToken` and have `Stream` overloads, and `ConvertAsync` can write straight to a `Stream`.

## More options

The other options have pages of their own: [`Fonts`, `EmbedStandardFonts`, `MissingFont` and `MissingCharacter`](/docs/fonts/),
[`Language` and `Hyphenation`](/docs/languages/), [`Watermark`, `Security` and `Conformance`](/docs/pdfa-and-passwords/),
[`Accessibility`](/docs/accessibility/), [`EInvoice`](/docs/e-invoices/), [`Attachments`](/docs/attachments/),
[`Signature`](/docs/signatures/) and [`FormFields`](/docs/forms/).
