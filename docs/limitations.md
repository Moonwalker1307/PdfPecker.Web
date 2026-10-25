# Limitations

PdfPecker is built for fast conversion of HTML templates you control, not for rendering arbitrary web pages. These are
the known gaps; most are scope choices for speed and size, and they are the first candidates for future work. Anything
not listed in [What is supported](/docs/html-and-css/) should be assumed missing. The [PDF feature checklist](/docs/pdf-features/)
marks every PDF feature as supported, partly supported or missing.

## By design

- No JavaScript. Scripts are never run, so content must be in the HTML before conversion (render it server-side first).
- No network access: `http:`/`https:` stylesheets and images are not downloaded. Supply them through your
  `ResourceResolver`, as files under `BaseDirectory`, or as `data:` URIs.
- `<canvas>`, `<iframe>`, `<video>`, `<audio>`, `<object>` and `<embed>` are not drawn, nor are file, range, colour and
  image inputs. Form fields have no JavaScript (no calculations, formats or submit actions), and a field inside a
  transformed box, a running header or footer, or a `position: fixed` box is drawn but not fillable.

## Text and fonts {changed 1.18.0}

- Without registered fonts or `EmbedStandardFonts`, text uses the standard PDF fonts, so characters are limited to
  the Windows-1252 set (Western European languages) plus what the [built-in fallback fonts](/docs/fonts/#missing-fonts-and-characters)
  add: Central European, Greek and Cyrillic letters and common symbols. They have no CJK or other scripts, and no
  emoji: register fonts for those.
- Complex-script shaping covers Arabic and Hebrew (and other scripts written with Arabic letters, such as Persian and
  Urdu), [nine Indic scripts, Thai and Lao](/docs/languages/#indic-thai-and-lao-scripts). Khmer, Myanmar, Sinhala,
  Tibetan, Mongolian, Javanese, Adlam and Syriac are not shaped, so their vowel signs and conjuncts come out wrong.
  Thai and Lao text breaks only at spaces, since there is no dictionary for word breaks.
- [Vertical text](/docs/html-and-css/#vertical-text) is drawn as turned horizontal text: Chinese and Japanese characters
  are turned rather than upright (`text-orientation` and `text-combine-upright` are not supported), `vertical-lr`
  stacks several lines right to left, a box nested inside a vertical box takes its width as its height, and a vertical
  `html` or `body` is laid out horizontally. `vi` and `vb` stay the page width and height in vertical boxes (Chrome
  swaps them), and `initial-letter` makes no drop cap in a vertical box.
- [CJK punctuation trimming](/docs/languages/#cjk-punctuation-trimming) does not use the vertical `vhal` feature, and the
  `text-spacing` shorthand is not read. `text-emphasis` marks and `hanging-punctuation` are not supported.
- In Latin and other simple scripts, shaping is limited to kerning, standard ligatures and features that swap one
  glyph for another (see [OpenType features](/docs/fonts/#opentype-features)) and fractions; contextual alternates
  (`calt`) and ordinals are not applied, and `small-caps` is synthesized from scaled
  capitals when the font has no small capitals of its own. `font-variant-alternates` and `font-palette` (colour font
  palettes) are not supported.
- Solid underlines, overlines and line-throughs are a little thinner than Chrome's (about 1.5 px for 20 px text where
  Chrome draws 2 px), and a solid overline sits about a pixel lower; dashed, dotted, double and wavy lines match Chrome.
  `text-decoration` on SVG text is always a solid line in the text's fill, and is not drawn on `textPath` text.
- Automatic hyphenation (`hyphens: auto`) has [built-in patterns](/docs/languages/#hyphenation) for English, Danish,
  German, Dutch, Norwegian, Swedish, Spanish, French, Italian, Portuguese and Polish; other languages need their
  patterns in `PdfOptions.Hyphenation`.
- SVG `<text>` uses only the first value of position lists; in a text chunk with right-to-left
  text, `dx` on its `tspan`s is ignored.

## CSS {changed 1.18.0}

- Container queries: no `scroll-state()` queries, `style()` works only on custom properties, and style containment
  (counter scoping) and the `contain` property are not implemented. A document with container queries takes about two
  to four times as long to lay out, and queries that keep changing the layout stop after six passes. In running
  headers and footers, `@page` margin boxes and SVG images, the `cq` units fall back to viewport units.
- Footnotes: `@footnote` inside `@page :first`, `:left` or `:right` is ignored, `footnote-policy: block` acts like
  `line`, and `footnote-display: compact` is always inline. A note split across pages does not carry its background
  or border onto the next page, and margins between block notes do not collapse.
- When `@page :first`, `:left` or `:right` give pages different widths, floats, inline-blocks, flex, grid and
  multi-column containers, and boxes with transforms or filters keep the width of the page they start on (Chrome
  re-sizes floats, inline-blocks and multi-column per page). A named page's `:first` is the document's first page, as
  in Chrome, not the first page of the named run.
- Selectors: a rule with an unsupported selector is skipped. A complex selector may have at most 64 compound parts and
  16 levels of nesting, and `:has()` cannot contain `:has()`.
- Blurred text shadows are drawn as images at 144 dpi (down to 72 dpi for wide blurs, with the blur capped at about
  200px), so shadowing long body text adds to the file size; the shadow of an underline is painted under the glyphs
  rather than between them and their own underline. `filter: blur()` and `drop-shadow()` draw the box as an image;
  its text stays selectable, and the colour filters keep everything as vectors.
- `text-overflow` applies only at the end of the line, as in the spec and Chrome.
- `inline-size`, `block-size` and their `min-` and `max-` forms always mean width and height, also in vertical
  writing modes; the logical margins, paddings, insets and borders do follow `writing-mode`.
- [Percentage heights](/docs/html-and-css/#percentage-heights) still count as `auto` in a flexed item of a container
  that has only a `min-height`, against a table row's height on its own or a rowspanning cell, and in footnotes and
  running headers and footers. When pages differ in size, a box resolves its percentage height against the page it
  starts on and keeps that height if it breaks onto a page of another height (Chrome recomputes it there).
- `background-attachment: fixed` scrolls with the box, since paper has no scrolling viewport.
- Not supported: `contain`, `content-visibility`, `cross-fade()`, `element()`, `paint()`, `env()`, `anchor()`, `attr()`
  outside `content`, `::selection` and `:nth-col()`. In `@page` margins and media queries, `ex`, `ch` and the other
  font units use the initial 16 px font.
- [3D transforms](/docs/html-and-css/#3d-transforms) are drawn flat, since a PDF page has only flat transforms: a box with
  a perspective stays a rectangle or parallelogram where Chrome draws a trapezoid, only the parent's `perspective`
  counts, and nested `preserve-3d` scenes, such as a cube, do not come out the way a screen shows them.
- [`backdrop-filter`](/docs/html-and-css/#masks-and-backdrop-filter) draws what is behind the box as a 144 dpi image, up to
  64 per document. A mask with more than 16 layers is ignored, and `mask-clip: no-clip`, `stroke-box` and `view-box`
  act as `border-box`.
- [Float shapes](/docs/html-and-css/#float-shapes): an SVG image in `shape-outside` falls back to the margin box, and
  image and path shapes are measured at 1 px per CSS pixel, up to 4 million pixels and a `shape-margin` of 1,024 px
  (beyond that the float keeps its rectangle).
- `text-wrap: balance` and `pretty` do not apply beside floats, with `::first-line`, or on pages of different widths.
- [`display: contents`](/docs/html-and-css/#display-contents): a link to the `id` of such an element finds no place on
  the page when its children are blocks, and in a tagged PDF the wrapper's own tag (a list or link around blocks) is
  left out; its children are tagged.
- Gradient stops that fade to transparent are mixed in unpremultiplied colours, so the middle of such a gradient is a
  little greyer than in Chrome.
- A document without a doctype is laid out in standards mode; Chrome uses quirks mode for it, which, among other things,
  ignores the first paragraph's top margin in the body.

## Backgrounds and transparency {changed 1.16.0}

- Inset box shadows of inline elements (`<span>`) are not drawn.
  `box-decoration-break` applies to inline elements, not to blocks split across pages or columns.
- Inline boxes nested more than 16 deep are not decorated, and one layout paints at most 50,000 inline box fragments
  with a shared budget for their layers, shadows and outlines; past it, fragments show only their background colour.
- A translucent box shadow without blur is blended onto white rather than truly see-through. Blurs are drawn as
  bands, so very wide blurs may show faint steps when zoomed in.

## Layout {changed 1.17.0}

- [Subgrid](/docs/html-and-css/#subgrid): percentage gaps, margins and padding on a subgrid resolve against the parent
  grid's width rather than the subgrid's area; subgrid items are not baseline-aligned with the parent's items; and only
  the horizontal `writing-mode` is supported.
- [Multi-column](/docs/html-and-css/#multi-column-layout): `column-span: all` works only on direct children of the
  multi-column box, and multi-column boxes nested more than two levels deep keep their children whole instead of
  splitting them. Footnotes inside columns are placed at their call and do not reserve space at the bottom of the
  column, orphans and widows are not applied to lines beside floats, and content that overflows a fixed-height
  multi-column box with `overflow: hidden` is clipped from view but stays in the PDF's text.
- Overflow: a positioned child with a `z-index` inside a clipping box stays stacked within that box.
- Collapsed table borders on `col` and `colgroup` are not drawn; borders on cells, rows, row groups and the table are.

## Images and SVG {changed 1.17.0}

- No AVIF images: decoding them needs an AV1 video decoder, which is not planned. Convert them to WebP, PNG or JPEG.
- SVG filters are applied in pixels at 144 dpi, so filtered shapes become an image (text keeps an invisible,
  selectable copy).
- A missing image with alt text shows the text without Chrome's small broken-image icon, and a missing image without
  alt text or a size has no box rather than Chrome's 16 px icon box.
- An SVG `symbol` is not clipped to its viewport, and its `preserveAspectRatio` is always the default (`xMidYMid meet`).

## Reading and changing existing PDFs {changed 1.17.0}

- [Text extraction](/docs/text-extraction/) reads columns that sit side by side across, line by line, rather than one
  column after the other, and it does not use the structure tree of a tagged PDF to find the reading order. Text drawn
  only as outlines or images is not extracted; there is no OCR. Indic vowel signs drawn before their consonant come
  out in that visual order unless the PDF carries `/ActualText`.
- [PDF to HTML](/docs/pdf-to-html/) keeps the PDF's layout: the page is an image and the text an invisible layer over
  it, so the HTML does not reflow into paragraphs and tables, text zooms as an image does, and what text extraction
  cannot read (outlines, scans) cannot be selected either.
- [Form filling](/docs/forms/#filling-and-flattening-existing-pdfs) does not shape text, so values in Arabic, Hebrew,
  Devanagari and other scripts that need shaping are stored but not drawn correctly. XFA forms are not filled: their
  XFA data is removed and the AcroForm fields are filled instead. Field JavaScript (calculations, formats) is not run.
- [Signature verification](/docs/signatures/#verifying-signatures) checks the changes made after a
  [certification signature](/docs/signatures/#certification-signatures) against its level, but not field locks
  (FieldMDP), so after an approval signature it counts the updates but cannot tell an allowed form fill from a changed
  page. Revocation is checked only when `RevocationMode` asks the platform to, not from the OCSP
  responses and CRLs stored in the PDF.

## Markdown and the PDF renderer {changed 1.14.1}

- Markdown: no math. Definition list terms are one line each (no several terms for one definition), and `~` does not
  start a definition. A footnote's text cannot hold another page-bottom footnote: a reference inside a footnote links to
  its note, and a note that only other notes reference is listed after the text.
- `PdfRenderer` (PDF to image): no predefined CJK CMaps or non-embedded CJK fonts, and ICC profiles are not applied
  (ICC-based colours use their device equivalents). WebP output is lossless only (no lossy VP8), and JPEG output is
  baseline only (no progressive or arithmetic coding).
