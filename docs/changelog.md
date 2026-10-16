# Changelog

What changed in each PdfPecker release on [NuGet](https://www.nuget.org/packages/PdfPecker), newest first. The
manual for any of these versions can be downloaded as a PDF with the version picker next to Download PDF; the source
of every change is in the [PdfPecker repository](https://github.com/Moonwalker1307/PdfPecker).

## 1.9.0

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
