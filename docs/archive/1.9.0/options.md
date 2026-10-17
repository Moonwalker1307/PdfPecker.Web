# Options

`PdfOptions` controls the page, the document properties and how resources are loaded. Every conversion method
takes one; leave it out for A4 pages with the defaults below.

```csharp
var options = new PdfOptions
{
    PageSize = PageSize.Letter.Landscape,            // A3, A4 (default), A5, Letter, Legal or new PageSize(w, h) in points
    Margins = PageMargins.FromMillimeters(20, 15, 20, 15),
    Scale = 1,                                        // like Chrome's print scale (see its docs to match IronPDF's output)
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
`IgnoreCssPageRules` is set. PdfPecker never makes network requests on its own: `http(s)` images and stylesheets are only
loaded through `ResourceResolver`.

## Document properties

Custom properties are written to the document information dictionary, where Acrobat shows them under Document
Properties > Custom and `pdfinfo -custom` lists them. For PDF/A they are also written to the XMP metadata (Acrobat's
`pdfx` namespace, with the extension schema PDF/A requires), alongside Keywords, Creator and Producer.

## More options

The other options have pages of their own: [`Fonts`, `EmbedStandardFonts`, `MissingFont` and `MissingCharacter`](/docs/fonts/),
[`Language` and `Hyphenation`](/docs/languages/), [`Watermark`, `Security` and `Conformance`](/docs/pdfa-and-passwords/),
[`Accessibility`](/docs/accessibility/), [`EInvoice`](/docs/e-invoices/), [`Attachments`](/docs/attachments/),
[`Signature`](/docs/signatures/) and [`FormFields`](/docs/forms/).
