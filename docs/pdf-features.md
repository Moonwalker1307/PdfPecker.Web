# PDF feature checklist

What the PDF format and other PDF libraries offer, and whether PdfPecker does it. Of the 138 features below, PdfPecker supports 97, supports 16 in part and leaves out 25. Some of those are left out on purpose, such as JavaScript in PDFs and the old RC4 encryption. The [limitations](/docs/limitations/) page has the details of what is missing in HTML and CSS.

## File format and structure {changed 1.24.0}

The PDF file itself: versions, cross-reference tables, pages and their boxes.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| Write PDF 1.4 and 1.7 | ✓ Yes | 1.4 for plain output, 1.7 when tagged, encrypted or PDF/A. |
| Write PDF 2.0 | ✓ Yes | Used for PDF/A-4 and PDF/UA-2 output. |
| Compressed object streams and xref streams | ✓ Yes | `PdfCompactor` packs objects into them; `HtmlToPdf` writes a classic xref table. |
| Incremental updates | ✓ Yes | Signing and long-term validation append to the file, so earlier signatures stay valid. |
| Linearization (Fast Web View) | ✓ Yes | `PdfOptions.Linearize` for new documents, `PdfLinearizer` for existing ones; encrypted, PDF/A and PDF/UA output too. |
| Open damaged files | ✓ Yes | Rebuilds a broken cross-reference table from the object headers. |
| Page sizes, orientation and `@page` | ✓ Yes | A4, Letter, Legal, A3, A5, any custom size, landscape, and per-page sizes from CSS `@page`. |
| Page rotation | ✓ Yes | `PdfPages.Rotate` on existing files; `/Rotate` is honoured when rendering. |
| Page boxes (Crop, Bleed, Trim, Art) | ½ Partly | CropBox is read and kept. CSS `@page { bleed; marks: crop cross }` writes the bleed and trim boxes with crop and cross marks; art boxes are not written. |
| Very large documents | ✓ Yes | Streaming merge and `MaxPages` limits; the readers have resource limits for hostile input. |

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

## Text and fonts {changed 1.21.0}

How text is stored, so it looks right and stays searchable.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| Standard 14 fonts | ✓ Yes | Used by default; `EmbedStandardFonts` embeds metric-compatible fonts instead. |
| TrueType and OpenType (CFF) embedding | ✓ Yes | Subset to the glyphs used. |
| WOFF and WOFF2 web fonts | ✓ Yes | Decoded by the library's own WOFF2 decoder. |
| Variable fonts | ✓ Yes | Instanced at the weight and width the CSS asks for. |
| Copyable, searchable Unicode text | ✓ Yes | `ToUnicode` maps on every embedded font. |
| Kerning, ligatures and OpenType features | ✓ Yes | Numerals, fractions, small capitals, super and subscripts. |
| Complex scripts | ½ Partly | Arabic, Hebrew, nine Indic scripts, Thai and Lao are shaped. Khmer, Myanmar, Sinhala, Tibetan and others are not. |
| Vertical text | ½ Partly | Drawn as turned horizontal text; CJK characters are not set upright. |
| Fallback fonts | ✓ Yes | Bundled fonts for Central European, Greek, Cyrillic and symbols when your fonts lack a character. |
| Colour fonts and emoji | ½ Partly | COLR colour fonts, versions 0 and 1 (such as Noto Color Emoji), print in colour as text; SVG and bitmap colour glyphs are not drawn. |
| Outlined and stroked text | ✓ Yes | `-webkit-text-stroke` and `paint-order`, written as PDF text render modes. |

## Graphics, images and colour

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
| sRGB output intent | ✓ Yes | Written for PDF/A. |
| CMYK | ½ Partly | CMYK JPEGs are embedded (converted to RGB for PDF/A). There is no CSS `device-cmyk()` colour, so text and shapes are always RGB. |
| Spot colours (Separation, DeviceN) | ✕ No | Not written. Read and rendered in existing PDFs. |
| Overprint control | ✕ No | Not written, and not simulated when rendering. |
| Filters and blur | ½ Partly | CSS filter, `backdrop-filter` and blurred shadows; blurs are drawn as 144 dpi images, colour filters stay vectors. |

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

## Standards

ISO and industry profiles.

| Feature | PdfPecker | Notes |
| --- | --- | --- |
| PDF/A-1 | ✕ No | Only PDF/A-2 and later. |
| PDF/A-2b, 2u, 3b, 3u | ✓ Yes | Checked with veraPDF in CI. |
| PDF/A-4 and PDF/A-4f | ✓ Yes |  |
| PDF/A level a (2a, 3a) | ½ Partly | Tagging is there (PDF/UA), but the level a conformance itself is not declared. |
| PDF/A-4e (engineering) | ✕ No |  |
| Tagged PDF | ✓ Yes | Structure tree built from the HTML. |
| PDF/UA-1 and PDF/UA-2 | ✓ Yes | Accessible PDFs, also combined with PDF/A. |
| Factur-X and ZUGFeRD | ✓ Yes | All profiles from Minimum to Extended and XRechnung; embedded and read back. |
| XRechnung, Peppol BIS 3.0 and OIOUBL XML | ✓ Yes | Built from invoice data, totals checked against EN 16931. |
| PDF/X (print production) | ✕ No | No PDF/X-1a, X-3 or X-4. |
| PDF/E and PDF/VT | ✕ No |  |

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
