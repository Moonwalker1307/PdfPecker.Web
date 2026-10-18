# Changelog

What changed in each PdfPecker release on [NuGet](https://www.nuget.org/packages/PdfPecker), newest first. The
manual for any of these versions can be downloaded as a PDF with the version picker next to Download PDF; the source
of every change is in the [PdfPecker repository](https://github.com/Moonwalker1307/PdfPecker).

## 1.14.1

Released 18 October 2026.

- Collapsed table borders stay visible over cell backgrounds: shaded header and footer rows keep their vertical lines,
  and striped rows keep the line above them, as in Chrome. Tables with `border-collapse` and cell backgrounds look
  different from 1.14.0.

## 1.14.0

Released 18 October 2026.

- [Backgrounds on inline elements](/docs/html-and-css/#css-properties): `<span>`, `<mark>`, `<code>` and badges get
  images, gradients, `border-radius` and clipping to text, not just a colour, and `box-decoration-break` decides how a
  background split over several lines is drawn.
- [Markdown footnotes, definition lists and front matter](/docs/markdown/#footnotes-definition-lists-and-front-matter),
  with footnotes at the bottom of the page in a PDF.
- [`hyphenate-limit-chars`](/docs/languages/#hyphenation) for the shortest hyphenated word and the fewest letters around
  a hyphen.
- Rows of collapsed tables with lines only under or over each row now have Chrome's height, and balanced columns keep
  `break-inside: avoid` boxes whole without growing taller than needed.
- Bounded work for repeating gradients and deeply nested decorated inline elements on hostile input. Tables with
  collapsed row lines, rounded inline badges and some multi-column layouts look different from 1.13.0.

## 1.13.0

Released 18 October 2026.

- [Barcodes](/docs/barcodes/): QR codes (versions 1 to 40, error correction L to H), Code 128 and EAN-13 as vector SVG
  for your templates, and `Barcode.ToDataUri` for an `<img>`, a CSS background or a Markdown image.
- [EPC payment QR codes](/docs/barcodes/#epc-payment-qr-codes) (GiroCode) for euro transfers, with the IBAN, BIC,
  amount and field lengths checked.
- [Images to PDF](/docs/images-to-pdf/): PNG, JPEG, GIF, WebP, BMP and TIFF images one per page, at their own size or
  fitted to a page size with margins.
- [HTML to images](/docs/pdf-to-image/#html-to-images) in one call with `HtmlToImage`.
- No output changes: PDFs from 1.12.0 templates are byte-identical.

## 1.12.0

Released 18 October 2026.

- [Indic, Thai and Lao shaping](/docs/languages/#indic-thai-and-lao-scripts): Devanagari, Bengali, Gurmukhi, Gujarati,
  Oriya, Tamil, Telugu, Kannada and Malayalam, Thai and Lao are shaped as HarfBuzz shapes them, and combining marks in
  Latin, Greek and Cyrillic are placed on their letters.
- `background-clip: text` (also as `-webkit-background-clip`).
- [Tables across pages](/docs/html-and-css/#pagination): `<tfoot>` repeats at the bottom of every page, and tables
  inside flex and grid items break across pages instead of moving whole.
- [Reproducible output](/docs/options/#reproducible-output): with `CreationDate` or `SOURCE_DATE_EPOCH` the same input
  gives a byte-identical PDF, also for merging, page tools, stamping and form filling.
- [Cancellable signing](/docs/signatures/#long-term-validation), `AddValidationDataAsync`, and cancellation-token and
  `Stream` overloads across the API.
- [`PdfPeckerException`](/docs/options/#errors-cancellation-and-output-files) as the base of the library's own
  exceptions, and file output that leaves an existing file untouched when a conversion fails.
- [`StampHtml`](/docs/stamping/#placement) ignores the footer, header, watermark and other document-level options.
- `text-transform: uppercase` turns ß into SS and handles Turkish dotted and dotless i; `hyphens: auto` hyphenates
  decomposed words; CSS integers are read correctly on servers with an Arabic or Persian culture.
- Bounded work on malformed JPEG 2000, JBIG2, e-invoices, attachments and CSS, and less memory for JPEG and WebP
  output. Tables with a `<tfoot>`, tables in flex and grid, and Indic and Thai text look different from 1.11.0 on
  purpose.

## 1.11.0

Released 18 October 2026.

- [Subgrid](/docs/html-and-css/#subgrid) (CSS Grid Level 2): `grid-template-columns` and `grid-template-rows: subgrid`
  line nested grids up with their parent's tracks.
- [Multi-column layout](/docs/html-and-css/#multi-column-layout) splits paragraphs, lists and tables across columns
  and onto later pages, as Chrome does, instead of keeping each child whole in the first columns.
- [Percentage heights](/docs/html-and-css/#percentage-heights) resolve against definite containing blocks, as in
  browsers.
- Blurred box shadows, translucent gradient stops and SVG `stop-opacity` are truly transparent, blending with what is
  behind them instead of with white.
- [Hyphenation](/docs/languages/#hyphenation) in Swedish, Spanish, French, Italian, Portuguese and Polish; French and
  Italian also hyphenate words with elisions such as *l'ordinateur*.
- Correct word widths in paragraphs with an inline-block, and shaping of Arabic Extended-C characters outside the
  Basic Multilingual Plane.
- Bounded work on crafted fonts and malformed PDFs, and linear time for Markdown autolinks, nested inline-blocks and
  headings kept with nested lists, flex rows and tables. No public API changes.

## 1.10.0

Released 18 October 2026.

- [PDF to TIFF](/docs/pdf-to-image/#tiff): a whole PDF as one multi-page TIFF, or single pages, in colour, greyscale
  or black and white with CCITT Group 4, LZW, Deflate or PackBits compression.
- [Read the invoice back](/docs/e-invoices/#reading-the-invoice-from-a-received-pdf) from a received Factur-X,
  ZUGFeRD or XRechnung PDF with `PdfEInvoice.Read`.
- [Trusted timestamps](/docs/signatures/#trusted-timestamps): a timestamp's time is used to check the signer's
  certificate only when its authority is trusted (`TimestampTrusted`), so an untrusted timestamp no longer makes an
  expired certificate pass.
- [`PdfLtvOptions.UrlFilter`](/docs/signatures/#long-term-validation) decides which OCSP and CRL addresses long-term
  validation may contact, and fetching is bounded in URLs, redirects and time.
- `::first-line` styles on small capitals and mixed-direction text no longer lose their style or throw, and Arabic
  text in PDF/A-2u, 3u and PDF/UA maps every glyph back to Unicode.
- Tighter limits for hostile input found by fuzzing (images, SVG filters, soft masks, fonts, signature stores), more
  renderer features (soft-mask Matte, CalRGB and CalGray), and symbol packages with SourceLink on NuGet.

## 1.9.0

Released 16 October 2026.

- [Chinese, Japanese and Korean line breaking](/docs/languages/#chinese-japanese-and-korean-line-breaking) with
  kinsoku rules, CSS `line-break` and `word-break: keep-all`.
- [External signers](/docs/signatures/#external-signers-hsms-smart-cards-and-key-vaults): sign with a key in an HSM,
  smart card or cloud key vault, and `PdfSigner.SignAsync`.
- [Signature verification](/docs/signatures/#verifying-signatures) and
  [long-term validation](/docs/signatures/#long-term-validation) (PAdES B-LT and B-LTA).
- [Text extraction](/docs/text-extraction/) from any PDF, with the position of every line and word.
- [Fill and flatten the forms](/docs/forms/#filling-and-flattening-existing-pdfs) of existing PDFs.
- [Container queries](/docs/html-and-css/#container-queries) and the `cq` units.
- [Footnotes](/docs/paged-media/#footnotes) with `float: footnote`, numbered calls and a styled footnote area.
- Each page laid out at its own width when `:first`, `:left` or `:right` change it, and right-to-left page order.
- Blurred text shadows with a true Gaussian blur, shadows on underlines, and selectable text under `filter: blur()`.
- `aspect-ratio` in shrink-to-fit widths, with `min-`/`max-height` and on tables; `object-fit` for SVG images; and
  complex selectors inside `:is()`, `:where()`, `:not()` and `:has()`.

## 1.8.0

Released 16 October 2026.

- Variable fonts: weight, width, italic and optical size axes, `font-variation-settings`, kerning and CFF2 outlines
  (see [Fonts](/docs/fonts/#variable-fonts)).
- OpenType figures and features: `font-variant-numeric` (tabular, old-style, fractions and more) and
  `font-feature-settings` (see [Fonts](/docs/fonts/#opentype-features)).
- `border-image`, CSS `filter`, `clip-path` on HTML elements, blend modes, 3D border styles, inset box shadows,
  `::first-letter` and `::first-line`, `@counter-style` and relative colours.
- Every SVG filter primitive, with primitive subregions, and text inside filtered SVG stays selectable.
- `<image>` in SVG, SVG watermarks, and BMP and TIFF images.
- `@import`, and `:first`, `:left` and `:right` page margins and sizes.
- The manual moved from the README to [pdfpecker.net/docs](/docs/), and the NuGet package links to it and has an icon.

## 1.7.0

Released 15 October 2026.

- [Stamping](/docs/stamping/): put a page of one PDF over or under the pages of another.
- [Attachments](/docs/attachments/): attach any file to a PDF and read attachments back.
- [Automatic hyphenation](/docs/languages/#hyphenation) with `hyphens: auto`.
- [Add, change or remove passwords](/docs/pdfa-and-passwords/#passwords-on-existing-pdfs) on existing PDFs.
- [Extract, reorder, remove, rotate and split pages](/docs/merging/#extracting-reordering-and-splitting-pages).
- [JPEG and WebP output](/docs/pdf-to-image/#output-formats) from `PdfToImage`.
- [PDF/A](/docs/pdfa-and-passwords/#pdfa)-2u, 3u, 4 and 4f, and [PDF/UA-2](/docs/accessibility/#pdfua-2).
- Right-to-left text in SVG, and right-to-left ellipsis.

## 1.6.0

Released 15 October 2026.

- [Right-to-left text](/docs/languages/) with Arabic and Hebrew shaping.
- Named pages, running headers and footers from HTML, table of contents page numbers with `target-counter()` and
  `leader()`, and `conic-gradient()` (see [Paged media](/docs/paged-media/)).
- Much more of CSS3: modern colour syntax, `calc()` and the other math functions, `@layer`, nesting, `@supports`,
  `@property`, media queries, `:has()` and margin boxes.
- Sign into an existing empty signature field, merging keeps tagging and PDF/UA, and `PdfOptions.MissingCharacter`
  reports characters no font has.

## 1.5.1

Released 14 October 2026.

- Targets .NET 8 and 9 as well as .NET 10.
- Complete third-party licence notices, used as the NuGet package licence. 1.5.0 was never published, because
  nuget.org did not accept its licence expression.

## 1.4.0

Released 14 October 2026.

- [Fillable PDF forms](/docs/forms/) from HTML inputs, check boxes, radio buttons, selects and text areas.

## 1.3.0

Released 14 October 2026.

- [Tagged PDF and PDF/UA-1](/docs/accessibility/) output.
- SVG masks, patterns, markers and filters, clipping in table cells, and double rounded borders.

## 1.2.0

Released 14 October 2026.

- Attach PDFs to [Peppol and OIOUBL (UBL) e-invoices](/docs/e-invoices/).
- Faster HTML to PDF, with half the memory allocations and decoded images reused.

## 1.1.1

Released 13 October 2026.

- The README shows its logo on nuget.org and has a NuGet badge. No changes to the library.

## 1.1.0

Released 13 October 2026.

- [Factur-X and ZUGFeRD e-invoices](/docs/e-invoices/).
- SVG, GIF and WebP images.
- [Streaming PDF merging](/docs/merging/): stream and async overloads with one input in memory at a time.
- `calc()`, `min()`, `max()` and `clamp()`, `:nth-of-type`, `:is()`, `:where()`, `object-fit`, `text-overflow`,
  `outline`, `text-shadow` and `aspect-ratio`.
- Header and footer heights are rounded to whole points, as Chrome does.

## 1.0.0

Released 12 October 2026.

- The first release: HTML and Markdown to PDF and PDF to PNG with its own HTML parser, CSS engine, layout engine, PDF
  writer and renderer, and no dependencies outside the .NET base class library.
