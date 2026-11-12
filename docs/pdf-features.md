# PDF feature checklist

What the PDF format and other PDF libraries offer, and whether PdfPecker does it. Of the 234 features below, PdfPecker supports 130, supports 37 in part and leaves out 67. Some of those are left out on purpose, such as JavaScript in PDFs and the old RC4 encryption. The list follows the PDF standard, ISO 32000-2 (PDF 2.0, which includes PDF 1.7), and the ISO profiles and RFCs built on it. The [limitations](/docs/limitations/) page has the details of what is missing in HTML and CSS.

## File format and structure {changed 1.25.0}

The PDF file itself: versions, cross-reference tables, pages and their boxes.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| Write PDF 1.4 and 1.7 | ✓ Yes | 1.4 for plain output, 1.7 when tagged, encrypted or PDF/A, 1.6 for PDF/X-4. |
| Write PDF 2.0 | ✓ Yes | Used for PDF/A-4 and PDF/UA-2 output. |
| Compressed object streams and xref streams | ✓ Yes | `PdfCompactor` packs objects into them; `HtmlToPdf` writes a classic xref table. |
| Incremental updates | ✓ Yes | Signing and long-term validation append to the file, so earlier signatures stay valid. |
| Linearization (Fast Web View) | ✓ Yes | `PdfOptions.Linearize` for new documents, `PdfLinearizer` for existing ones; encrypted, PDF/A and PDF/UA output too. |
| Open damaged files | ✓ Yes | Rebuilds a broken cross-reference table from the object headers. |
| Page sizes, orientation and `@page` | ✓ Yes | A4, Letter, Legal, A3, A5, any custom size, landscape, and per-page sizes from CSS `@page`. |
| Page rotation | ✓ Yes | `PdfPages.Rotate` on existing files; `/Rotate` is honoured when rendering. |
| Page boxes (Crop, Bleed, Trim, Art) | ½ Partly | CropBox is read and kept. CSS `@page { bleed; marks: crop cross }` writes the bleed and trim boxes with crop and cross marks, and PDF/X-4 gives every page both; art boxes are not written. |
| Very large documents | ✓ Yes | Streaming merge and `MaxPages` limits; the readers have resource limits for hostile input. |
| All object types (names, strings, arrays, dictionaries, streams) | ✓ Yes |  |
| Text strings in PDFDocEncoding and UTF-16 | ✓ Yes | Bookmarks, properties, field values and tags use UTF-16 when the text needs it. |
| Hybrid-reference files (/XRefStm) | ½ Partly | Read, not written. Read; not written, since every current reader understands plain xref streams. |
| Name trees and number trees | ✓ Yes | Embedded files, page labels and the structure parent tree. |
| Page tree with inherited attributes | ✓ Yes |  |
| Developer extensions (/Extensions) | ✓ Yes | Adobe extension level 8 is declared for AES-256 in PDF 1.7 files. |
| Document parts (/DPartRoot) | ✕ No | PDF 2.0 page grouping, used by PDF/VT. |
| External file streams (/F on a stream) | ✕ No | Stream data kept in another file. Left out on purpose: conversion never reads files by itself. |
| User units (/UserUnit) | ½ Partly | Read, not written. Pages larger than 200 inches render at their real size. |
| Thumbnail images (/Thumb) | ✕ No | Viewers make their own; `PdfCompactor` drops stored ones. |
| Page-piece dictionaries (/PieceInfo) | ✕ No | Application data; `PdfCompactor` removes it. |
| FlateDecode with PNG and TIFF predictors | ✓ Yes | Everything PdfPecker writes is Flate-compressed unless it is a JPEG. |
| Crypt filters | ✓ Yes | AES-256 standard crypt filter; Identity and named filters read. |

## Creating content {changed 1.23.0}

Ways to produce a new PDF.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| HTML and CSS to PDF | ✓ Yes | Own parser, CSS engine and layout: flexbox, grid, tables, floats, multi-column, SVG and more. |
| Markdown to PDF | ✓ Yes | CommonMark 0.31 and GitHub Flavored Markdown, with footnotes. |
| Images to PDF | ✓ Yes | PNG, JPEG, GIF, WebP, BMP and TIFF, one per page. |
| Fluent C# API | ✓ Yes | [PdfPecker.Fluent](/docs/fluent-api/), in the style of QuestPDF. |
| Headers, footers and page numbers | ✓ Yes | Running bands, `@page` margin boxes, `{page}` and `{pages}` tokens, and a different or no header and footer on the first page. |
| Table of contents with page numbers | ✓ Yes | `target-counter()` and `leader()` from CSS Paged Media. |
| Footnotes | ✓ Yes | CSS `float: footnote`, and Markdown footnotes at the page bottom. |
| Scale content to fit a box | ✓ Yes | `-pdfpecker-scale-to-fit: shrink` for labels, badges and certificates. |
| Barcodes and QR codes | ✓ Yes | QR, EPC payment QR, Swiss QR-bill, Code 128, EAN-13, Data Matrix and GS1 Data Matrix, drawn as vectors. |
| Content rendered by JavaScript | ✕ No | By design: no scripts run. Render the HTML on the server first. |
| Low-level drawing API | ✕ No | There is no canvas-style API to draw paths and text at coordinates; content comes from HTML, Markdown, images or the fluent API. |

## Text and fonts {changed 1.25.0}

How text is stored, so it looks right and stays searchable.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| Standard 14 fonts | ✓ Yes | Used by default; `EmbedStandardFonts` embeds metric-compatible fonts instead. |
| TrueType and OpenType (CFF) embedding | ✓ Yes | Subset to the glyphs used. |
| WOFF and WOFF2 web fonts | ✓ Yes | Decoded by the library's own WOFF2 decoder. |
| Variable fonts | ✓ Yes | Instanced at the weight and width the CSS asks for. |
| Copyable, searchable Unicode text | ✓ Yes | `ToUnicode` maps on every embedded font. |
| Kerning, ligatures and OpenType features | ✓ Yes | Numerals, fractions, small capitals, super and subscripts. |
| Complex scripts | ½ Partly | Arabic, Hebrew, nine Indic scripts, Khmer, Myanmar, Sinhala, Tibetan, Thai and Lao are shaped. Mongolian, Javanese, Adlam, Syriac and others are not. |
| Vertical text | ½ Partly | CJK characters stand upright with the font's vertical forms, `text-combine-upright` and upright images, as in Chrome; tables inside vertical text are turned with it. |
| Fallback fonts | ✓ Yes | Bundled fonts for Central European, Greek, Cyrillic and symbols when your fonts lack a character. |
| Colour fonts and emoji | ½ Partly | COLR colour fonts, versions 0 and 1 (such as Noto Color Emoji), print in colour as text; SVG and bitmap colour glyphs are not drawn. |
| Outlined and stroked text | ✓ Yes | `-webkit-text-stroke` and `paint-order`, written as PDF text render modes. |
| Text state (spacing, scaling, rise, leading) | ✓ Yes |  |
| Embedded Type 1 fonts | ½ Partly | Read, not written. |
| Type 3 fonts | ✓ Yes | Written for colour glyphs. |
| Composite (Type 0) fonts with CIDFonts | ✓ Yes | Identity-H encoding. |
| Embedded CMaps and /UseCMap | ✓ Yes |  |

## Graphics, images and colour {changed 1.25.0}

What can be drawn on a page.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| Vector paths and inline SVG | ✓ Yes | SVG becomes PDF vector paths, not pictures. |
| Gradients | ✓ Yes | Linear, radial and conic gradients as PDF shadings. |
| Transparency, soft masks and blend modes | ✓ Yes | Opacity, `mask-image`, `mix-blend-mode`, `isolation`. |
| Clipping | ✓ Yes | `overflow`, `border-radius`, `clip-path`. |
| Tiling patterns | ✓ Yes | Repeated backgrounds and SVG patterns. |
| Images: JPEG, PNG, GIF, WebP, BMP, TIFF | ✓ Yes | JPEG is passed through unchanged; PNG alpha becomes a soft mask. |
| AVIF images | ✕ No | Needs an AV1 decoder, which is not planned. |
| sRGB output intent | ✓ Yes | Written for PDF/A; PDF/X-4 writes the press's CMYK intent instead. |
| CMYK | ✓ Yes | CSS `device-cmyk()` is written as DeviceCMYK for text, backgrounds, borders and SVG shapes; CMYK JPEGs are embedded. Mixes, shadows and gradients of CMYK colours stay RGB, and PDF/A converts to RGB. |
| Spot colours (Separation, DeviceN) | ✕ No | Not written. Read and rendered in existing PDFs. |
| Overprint control | ✕ No | Not written, and not simulated when rendering. |
| Filters and blur | ½ Partly | CSS filter, `backdrop-filter` and blurred shadows; blurs are drawn as 144 dpi images, colour filters stay vectors. |
| Paths, fills and strokes | ✓ Yes | Line widths, caps, joins, miter limits and dash patterns. |
| Graphics state (/ExtGState) | ✓ Yes | Opacity, blend mode, soft mask and line settings. |
| Form XObjects | ✓ Yes | Shared content, stamps, watermarks and appearances. |
| Reference XObjects (page from another file) | ✕ No |  |
| PostScript XObjects | ✕ No | Deprecated in the spec; skipped when rendering, as viewers do. |
| Rendering intents | ✕ No | Screen rendering ignores them, as most viewers do. |
| Halftones, transfer functions, black generation, undercolour removal | ✕ No | Device-dependent printer settings; ignored when rendering. `PdfToPdfA` removes the ones PDF/A forbids. |
| Marked content (BMC, BDC, EMC) | ✓ Yes | Written for tags, artifacts and /ActualText; read for reading order and extraction. |
| DeviceRGB and DeviceGray | ✓ Yes |  |
| Indexed colour | ½ Partly | Read, not written. Palette PNGs are stored as RGB. |
| Functions: sampled, exponential, stitching, PostScript calculator | ½ Partly | Exponential and stitching functions are written for gradients; all four types are read. |
| Knockout groups | ✕ No | Rare outside print production. |
| Image soft masks with /Matte (pre-multiplied colour) | ✕ No |  |
| Inline images (BI ... EI) | ½ Partly | Read, not written. |
| Stencil and colour-key masks | ½ Partly | Read, not written. |
| Alternate images | ✕ No |  |

## Navigation and interactivity {changed 1.22.0}

What a reader can click or open in a viewer.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| Bookmarks (outlines) | ✓ Yes | Built from h1 to h6 or from CSS `bookmark-level`, `bookmark-label` and `bookmark-state`; kept and nested when merging. |
| Internal links | ✓ Yes | Links to #ids jump to the right page and position. |
| External web links | ✓ Yes | URI link annotations. |
| Named destinations | ½ Partly | Read when rendering and converting to HTML. New files use direct page destinations instead of a /Dests name tree. |
| Page labels (i, ii, iii, A-1) | ✓ Yes | `PdfOptions.PageLabels` for new documents and `PdfMergeOptions.PageLabels` for merges; kept when merging otherwise. |
| Viewer preferences | ✓ Yes | `PdfOptions.Viewer`: page mode, page layout, start page and zoom, window settings, print scaling and duplex. |
| Annotations | ½ Partly | Links and form widgets are written. Notes, highlights, stamps, free text, ink and shapes cannot be created. Existing ones are rendered and their text extracted. |
| Layers (optional content) | ½ Partly | Not created. Existing layers are kept on merge and their visibility is honoured when rendering. |
| JavaScript in the PDF | ✕ No | By design: no document or field scripts are written or run; `PdfSanitizer` removes them from PDFs you receive. |
| Page transitions and presentation mode | ✕ No |  |
| Multimedia, 3D and rich media | ✕ No | Sound, video, 3D models and RichMedia annotations. |
| PDF portfolios (collections) | ✕ No |  |
| Article threads | ✕ No |  |
| Bookmark colour and bold or italic style | ✕ No |  |
| Navigation nodes (presentation steps) | ✕ No |  |
| Measurement and geospatial features | ✕ No |  |
| Document requirements (/Requirements) | ✕ No |  |

## Annotations {changed 1.25.0}

Which kinds of annotation PdfPecker writes, and which it shows when rendering. Existing annotations are drawn from their stored appearance and kept when merging.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| Text (sticky note) and Popup | ½ Partly | Shown from the appearance the PDF stores, or drawn from its properties when it has none; not created. The note icon renders; pop-ups do not open, as on paper. |
| FreeText | ½ Partly | Shown from the appearance the PDF stores, or drawn from its properties when it has none; not created. |
| Line, Square, Circle, Polygon and PolyLine | ½ Partly | Shown from the appearance the PDF stores, or drawn from its properties when it has none; not created. |
| Highlight, Underline, Squiggly and StrikeOut | ½ Partly | Shown from the appearance the PDF stores, or drawn from its properties when it has none; not created. |
| Caret, Rubber stamp and Ink | ½ Partly | Shown when the PDF stores its appearance (ink is also drawn without one); not created. |
| Redact (marked for redaction) | ✕ No | `PdfRedactor` removes content directly instead of marking it. |
| Watermark annotations | ½ Partly | Shown when the PDF stores its appearance; not created. Watermarks are written as page content. |
| Printer's mark and trap network | ½ Partly | Shown when the PDF stores its appearance; not created. Crop and cross marks from `@page { marks }` are page content. |
| Projection | ✕ No |  |
| Annotations without an appearance stream | ✓ Yes | Notes, highlights, underlines, strike-outs, squiggly lines, shapes, lines with their arrowheads, ink and free text are drawn from their properties when rendering, as viewers draw them. |
| Hidden, NoView and Print flags | ✓ Yes |  |

## Actions

What a link, bookmark or field can do when clicked.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| GoTo (jump inside the document) | ✓ Yes |  |
| GoToR and GoToE (other or embedded PDF) | ✕ No |  |
| GoToDp (document part, PDF 2.0) | ✕ No |  |
| Named actions (next page, print) | ✕ No |  |
| Launch | ✕ No | By design; `PdfSanitizer` removes it. |
| Hide, SetOCGState, Rendition, Sound, Movie, Trans, GoTo3DView | ✕ No | Media ones are removed by `PdfSanitizer`. |
| Additional actions (/AA) on pages, fields and the document | ✕ No |  |

## Forms (AcroForm)

Fillable fields.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| Create fields from HTML | ✓ Yes | Text, multi-line, password, checkbox, radio group, drop-down, list box and button. |
| Read fields of any PDF | ✓ Yes | Name, type, value, options, flags and page. |
| Fill fields | ✓ Yes | With new appearance streams, optionally with your own font. |
| Flatten fields | ✓ Yes | Turn the fields into ordinary page content. |
| Field calculations, formats and validation | ✕ No | These need JavaScript. |
| Submit and reset actions | ✕ No |  |
| XFA forms | ✕ No | XFA data is removed when filling; the AcroForm fields are filled instead. |
| Fill in complex scripts | ½ Partly | Arabic, Hebrew and Indic values are stored but not shaped in the appearance. |
| Comb, file-select and rich-text fields | ½ Partly | Not created. Read and filled as ordinary text fields, without comb spacing or rich text. |
| FDF and XFDF import and export | ✕ No |  |

## Security and encryption {changed 1.24.0}

Passwords, permissions and protection.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| AES-256 encryption | ✓ Yes | Standard security handler revision 6, on new or existing PDFs. |
| User and owner passwords | ✓ Yes |  |
| Permissions | ✓ Yes | Print, high-quality print, copy, modify, annotate, fill forms, assemble, accessibility. |
| Open encrypted PDFs | ✓ Yes | RC4 40 to 128 bit, AES-128 and AES-256 (revisions 2 to 6). |
| Remove a password | ✓ Yes | `PdfProtector.Decrypt`. |
| Write RC4 or AES-128 | ✕ No | Only the current AES-256 is written, on purpose. |
| Certificate (public-key) encryption | ✕ No | The Adobe.PubSec handler is not supported. |
| Redaction | ✓ Yes | `PdfRedactor` removes text, image pixels, shapes, links and form fields under areas or matching text from the file, and draws a box over them. |
| Remove JavaScript and active content | ✓ Yes | `PdfSanitizer` takes out scripts, launch, submit and media actions, XFA, media and 3D annotations, and optionally attachments. |
| Sanitising | ½ Partly | `PdfSanitizer` removes active content and `PdfCompactor` metadata and application data; hidden layers and hidden text stay. |
| AES-256 revision 5 (Adobe extension level 3) | ½ Partly | Read, not written. |
| Unencrypted metadata (/EncryptMetadata false) | ½ Partly | Read, not written. |
| Unencrypted wrapper documents (PDF 2.0) | ✕ No |  |
| AES-GCM encryption (ISO/TS 32003) | ✕ No |  |
| Integrity protection (ISO/TS 32004) | ✕ No |  |

## Digital signatures {changed 1.23.0}

Signing and checking signatures.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| PAdES and PKCS#7 detached signatures | ✓ Yes | `ETSI.CAdES.detached` and `adbe.pkcs7.detached`. |
| RSA, RSA-PSS and ECDSA keys | ✓ Yes | SHA-256 and other hash algorithms. |
| Visible signature box | ✓ Yes | Page, position, size, text and border. |
| Empty signature fields | ✓ Yes | `data-pdf-signature` in the HTML makes a field that `PdfSigner` signs later. |
| External signers | ✓ Yes | HSMs, smart cards, PKCS#11 tokens and cloud signing services, also async. |
| RFC 3161 timestamps | ✓ Yes | From the timestamp server you name. |
| Document timestamps | ✓ Yes |  |
| Long-term validation | ✓ Yes | DSS and VRI with OCSP and CRL data, PAdES B-LT and B-LTA. |
| Several signatures | ✓ Yes | Each signature is an incremental update, so earlier ones stay valid. |
| Verify signatures | ✓ Yes | Byte range, digest, signature, timestamp and certificate chain; SHA-1 signatures are not valid unless allowed. |
| Certification signatures (DocMDP) | ✓ Yes | Levels 1 to 3; verification checks later changes against the level, shadow attacks and a dropped `/Perms` included. |
| Change analysis | ½ Partly | Changes after a certification signature are judged against its level; after approval signatures, updates are only counted. |
| Revocation checks during verification | ½ Partly | Uses the platform's online check; the OCSP and CRL data stored in the PDF is not used. |
| adbe.pkcs7.sha1 | ½ Partly | Not written. Verified only with `AllowSha1`. |
| adbe.x509.rsa_sha1 | ✕ No | An obsolete PKCS#1 format. |
| Field locking (FieldMDP, /Lock) | ✕ No |  |
| Usage rights (UR3) | ✕ No | Adobe Reader extensions. |
| Seed values (/SV) | ✕ No |  |
| EdDSA and SHA-3 (ISO 32001, ISO 32002) | ✕ No |  |

## Tagging and accessibility

The structure that screen readers and reflow use.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| PDF 2.0 structure namespaces | ½ Partly | Written for PDF/UA-2. |
| Alternate text (/Alt) | ✓ Yes | From `alt` and form tooltips. |
| Replacement text (/ActualText) | ✓ Yes | For ligatures and glyphs that copy as other characters. |
| Abbreviation expansions (/E) | ✕ No |  |
| Table and list attributes | ✓ Yes | Headers, scope, row and column spans, list numbering. |
| Layout attributes (placement, spacing, colour) | ✕ No |  |
| Artifacts (headers, footers, decoration) | ✓ Yes | Running bands and decoration are marked; extraction can leave them out. |
| Pronunciation hints | ✕ No |  |
| Tagging an untagged existing PDF | ✕ No |  |

## Print production

Settings for print shops and prepress.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| Printer's marks | ½ Partly | Crop and cross marks from `@page { marks }`, as page content. |
| Separation dictionaries | ✕ No |  |
| Trapping | ✕ No |  |
| OPI (Open Prepress Interface) | ✕ No | `PdfToPdfA` removes it. |

## Standards {changed 1.25.0}

ISO and industry profiles.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| PDF/A-1 | ✕ No | Only PDF/A-2 and later. |
| PDF/A-2b, 2u, 3b, 3u | ✓ Yes | Checked with veraPDF in CI. |
| PDF/A-4 and PDF/A-4f | ✓ Yes |  |
| PDF/A level a (2a, 3a) | ✓ Yes | Tagged from the HTML with a declared language; checked with veraPDF in CI, also with PDF/UA-1. |
| PDF/A-4e (engineering) | ✕ No |  |
| Tagged PDF | ✓ Yes | Structure tree built from the HTML. |
| PDF/UA-1 and PDF/UA-2 | ✓ Yes | Accessible PDFs, also combined with PDF/A. |
| Factur-X and ZUGFeRD | ✓ Yes | All profiles from Minimum to Extended and XRechnung; embedded and read back. |
| XRechnung, Peppol BIS 3.0 and OIOUBL XML | ✓ Yes | Built from invoice data, totals checked against EN 16931. |
| PDF/X (print production) | ½ Partly | PDF/X-4 for the press whose ICC profile you pass; no PDF/X-1a or X-3. |
| PDF/E and PDF/VT | ✕ No |  |
| Well-Tagged PDF (WTPDF) | ½ Partly | PDF/UA-2 output follows the same rules; WTPDF itself is not declared. |
| PDF/R raster (ISO 23504) | ✕ No |  |
| PAdES with a signature policy or commitment type | ✕ No |  |

## Internet standards (RFCs)

The RFCs that PDF signatures and links depend on.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| RFC 8118: the application/pdf media type | ✓ Yes | Files follow it; embedded files carry their own MIME type. |
| RFC 5652: Cryptographic Message Syntax | ✓ Yes | Own CMS writer and reader. |
| RFC 5035: signing-certificate-v2 attribute | ✓ Yes | Required by PAdES. |
| RFC 5280: X.509 certificates and CRLs | ✓ Yes | Chains are checked with the platform's certificate store. |
| RFC 6960: OCSP | ½ Partly | Fetched for long-term validation; stored responses are not used when verifying. |
| RFC 8017 and RFC 4055: RSA PKCS#1 and RSA-PSS | ✓ Yes |  |
| RFC 5758: ECDSA in CMS | ✓ Yes |  |
| RFC 8032 and RFC 8419: EdDSA in CMS | ✕ No |  |
| RFC 3986: URIs in links | ✓ Yes |  |

## Metadata and attachments {changed 1.20.0}

Information about the document and files inside it.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| Document properties | ✓ Yes | Title, author, subject, keywords, creator, producer, dates. |
| Custom properties | ✓ Yes |  |
| XMP metadata | ✓ Yes |  |
| Document language | ✓ Yes |  |
| Reproducible output | ✓ Yes | A fixed `CreationDate` or `SOURCE_DATE_EPOCH` gives byte-identical files. |
| Embedded files | ✓ Yes | Add, list and extract, with MIME type, description and PDF/A-3 relationship. |
| File attachment annotations | ✕ No | Files can be attached to the document, not pinned to a spot on a page. |
| Read document properties | ✓ Yes | `PdfDocumentProperties`: properties, XMP, version, page sizes, encryption, PDF/A and PDF/UA claims. |
| Strip photo metadata | ✓ Yes | `PdfOptions.StripImageMetadata` removes EXIF (GPS too), XMP and IPTC from embedded JPEGs. |
| Associated files (/AF) | ✓ Yes | Document-level, with /AFRelationship, for PDF/A-3 and e-invoices. |
| Web Capture | ✕ No |  |

## Editing existing PDFs {changed 1.23.0}

Changing files you already have.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| Merge | ✓ Yes | Also streamed, with bookmarks, page labels and forms kept. |
| Split | ✓ Yes |  |
| Extract, remove and reorder pages | ✓ Yes |  |
| Rotate pages | ✓ Yes |  |
| Stamp, overlay and underlay | ✓ Yes | Another PDF or HTML on every page, or selected pages. |
| Watermarks | ✓ Yes | Text, image and SVG. |
| Compress and optimise | ✓ Yes | Lossless recompression, duplicate fonts and images stored once, optional image downsampling. |
| Add or remove a password | ✓ Yes |  |
| Edit existing text and content | ✕ No | No find-and-replace or content editing. |
| Insert blank pages, crop or resize pages | ✕ No |  |
| N-up and imposition | ✕ No |  |
| Convert an existing PDF to PDF/A | ✓ Yes | `PdfToPdfA`: PDF/A-2b, 2u, 3b or 3u from any PDF, with what it changed and what it could not fix. |

## Reading, rendering and conversion {changed 1.24.0}

Getting things out of existing PDFs.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| Render pages to PNG, JPEG, WebP and TIFF | ✓ Yes | Multi-page TIFF in colour, greyscale or CCITT Group 4. |
| Read barcodes | ✓ Yes | `PdfBarcodes.Find` reads QR, Data Matrix, Code 128 and EAN-13 codes on pages, and `Barcode.Read` in images, with EPC and Swiss QR-bill payments parsed. |
| All PDF image filters | ✓ Yes | Flate, LZW, RunLength, ASCII85, ASCIIHex, DCT, JPEG 2000, JBIG2 and CCITT. |
| All font types | ✓ Yes | Type 1, CFF, TrueType, Type 3 and CID fonts. |
| Fonts that are not embedded | ½ Partly | Standard fonts are substituted; CJK fonts and predefined CJK CMaps are not. |
| All seven shading types | ✓ Yes | Function, axial, radial and the four mesh types. |
| Colour spaces | ✓ Yes | Device, Cal, Lab, ICC-based, Indexed, Separation, DeviceN and Pattern. |
| ICC colour management | ½ Partly | ICC-based colours use their device equivalents; profiles are not applied. |
| Transparency groups, blend modes, soft masks | ✓ Yes |  |
| Annotation appearances | ✓ Yes | Can be switched off. |
| Text extraction with positions | ✓ Yes | Pages, lines and words with coordinates, font and size. |
| Reading order | ✓ Yes | Text extraction, PDF to Markdown and structured PDF to HTML follow a tagged PDF's structure tree, and read columns, boxes, right-to-left columns and vertical CJK text in order from the layout. |
| OCR | ✕ No | Text in scans and outlines cannot be extracted. |
| PDF to HTML | ✓ Yes | Page images with a selectable, searchable text layer and working links. |
| Reflowing PDF to HTML | ✓ Yes | `PdfHtmlMode.Structured`: headings, paragraphs, lists and tables in reading order, from a tagged PDF's tags or else from the layout, optionally with styles and pictures. |
| PDF to Markdown | ✓ Yes | `PdfToMarkdown`: GitHub Flavored Markdown with headings, lists, links and tables. |
| Extract images | ✓ Yes | `PdfImages`: original JPEGs or PNG, with where each is drawn and its EXIF. |
| PDF to Word, Excel or PowerPoint | ✕ No |  |
