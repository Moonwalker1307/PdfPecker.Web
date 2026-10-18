# Limitations

PdfPecker is built for fast conversion of HTML templates you control, not for rendering arbitrary web pages. These are
the known gaps; most are scope choices for speed and size, and they are the first candidates for future work. Anything
not listed in [What is supported](/docs/html-and-css/) should be assumed missing.

## By design

- No JavaScript. Scripts are never run, so content must be in the HTML before conversion (render it server-side first).
- No network access: `http:`/`https:` stylesheets and images are not downloaded. Supply them through your
  `ResourceResolver`, as files under `BaseDirectory`, or as `data:` URIs.
- `<canvas>`, `<iframe>`, `<video>`, `<audio>`, `<object>` and `<embed>` are not drawn, nor are file, range, colour and
  image inputs. Form fields have no JavaScript (no calculations, formats or submit actions), and a field inside a
  transformed box, a running header or footer, or a `position: fixed` box is drawn but not fillable.

## Text and fonts {changed 1.12.0}

- Without registered fonts or `EmbedStandardFonts`, text uses the standard PDF fonts, so characters are limited to
  the Windows-1252 set (Western European languages); other characters are replaced with `?`. The bundled Liberation
  fonts add Central European, Greek and Cyrillic, but not CJK or other scripts: register fonts for those.
- Complex-script shaping covers Arabic and Hebrew (and other scripts written with Arabic letters, such as Persian and
  Urdu), [nine Indic scripts, Thai and Lao](/docs/languages/#indic-thai-and-lao-scripts). Khmer, Myanmar, Sinhala,
  Tibetan, Mongolian, Javanese, Adlam and Syriac are not shaped, so their vowel signs and conjuncts come out wrong.
  Thai and Lao text breaks only at spaces, since there is no dictionary for word breaks. There is no vertical text (`writing-mode`).
- Chinese, Japanese and Korean text [breaks into lines](/docs/languages/#chinese-japanese-and-korean-line-breaking), but
  `text-align: justify` stretches only spaces, so CJK lines without spaces are not justified (`text-justify` is not
  supported), and punctuation is not compressed at the start or end of a line.
- In Latin and other simple scripts, shaping is limited to kerning, standard ligatures and features that swap one
  glyph for another (see [OpenType features](/docs/fonts/#opentype-features)); contextual alternates and other
  features that depend on neighbouring characters are not applied, and `small-caps` is synthesized from scaled
  capitals.
- Automatic hyphenation (`hyphens: auto`) has [built-in patterns](/docs/languages/#hyphenation) for English, Danish,
  German, Dutch, Norwegian, Swedish, Spanish, French, Italian, Portuguese and Polish; other languages need their
  patterns in `PdfOptions.Hyphenation`. `hyphenate-limit-chars` is not supported.
- SVG `<text>` uses only the first value of position lists and has no `textPath`; in a text chunk with right-to-left
  text, `dx` on its `tspan`s is ignored.

## CSS {changed 1.11.0}

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
- [Percentage heights](/docs/html-and-css/#percentage-heights) still count as `auto` in a flexed item of a container
  that has only a `min-height`, against a table row's height on its own or a rowspanning cell, and in footnotes and
  running headers and footers. When pages differ in size, a box resolves its percentage height against the page it
  starts on and keeps that height if it breaks onto a page of another height (Chrome recomputes it there).
- `background-attachment: fixed` scrolls with the box, since paper has no scrolling viewport.

## Backgrounds and transparency {changed 1.12.0}

- Backgrounds of inline elements (`<span>`) show only their colour, not images or gradients.
- A translucent box shadow without blur is blended onto white rather than truly see-through. Blurs are drawn as
  bands, so very wide blurs may show faint steps when zoomed in.

## Layout {changed 1.11.0}

- [Subgrid](/docs/html-and-css/#subgrid): percentage gaps, margins and padding on a subgrid resolve against the parent
  grid's width rather than the subgrid's area; subgrid items are not baseline-aligned with the parent's items; and only
  the horizontal `writing-mode` is supported.
- [Multi-column](/docs/html-and-css/#multi-column-layout): `column-span: all` works only on direct children of the
  multi-column box, and multi-column boxes nested more than two levels deep keep their children whole instead of
  splitting them. Footnotes inside columns are placed at their call and do not reserve space at the bottom of the
  column, orphans and widows are not applied to lines beside floats, and content that overflows a fixed-height
  multi-column box with `overflow: hidden` is clipped from view but stays in the PDF's text.
- Overflow: a positioned child with a `z-index` inside a clipping box stays stacked within that box.

## Images and SVG {changed 1.8.0}

- No AVIF images: decoding them needs an AV1 video decoder, which is not planned. Convert them to WebP, PNG or JPEG.
- SVG filters are applied in pixels at 144 dpi, so filtered shapes become an image (text keeps an invisible,
  selectable copy).

## Reading and changing existing PDFs {new 1.9.0}

- [Text extraction](/docs/text-extraction/) reads columns that sit side by side across, line by line, rather than one
  column after the other, and it does not use the structure tree of a tagged PDF to find the reading order. Text drawn
  only as outlines or images is not extracted; there is no OCR. Indic vowel signs drawn before their consonant come
  out in that visual order unless the PDF carries `/ActualText`.
- [Form filling](/docs/forms/#filling-and-flattening-existing-pdfs) does not shape text, so values in Arabic, Hebrew,
  Devanagari and other scripts that need shaping are stored but not drawn correctly. XFA forms are not filled: their
  XFA data is removed and the AcroForm fields are filled instead. Field JavaScript (calculations, formats) is not run.
- [Signature verification](/docs/signatures/#verifying-signatures) counts the updates made after a signature but does
  not analyse them against its permissions (no DocMDP or FieldMDP change analysis), so it cannot tell an allowed form
  fill from a changed page. Revocation is checked only when `RevocationMode` asks the platform to, not from the OCSP
  responses and CRLs stored in the PDF.

## Markdown and the PDF renderer

- Markdown: no `[^1]` footnote syntax (use HTML with `float: footnote`), definition lists, math or front matter.
- `PdfRenderer` (PDF to image): no predefined CJK CMaps or non-embedded CJK fonts, and ICC profiles are not applied
  (ICC-based colours use their device equivalents). WebP output is lossless only (no lossy VP8), and JPEG output is
  baseline only (no progressive or arithmetic coding).
