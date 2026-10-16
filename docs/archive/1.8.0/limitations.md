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

## Text and fonts {changed 1.8.0}

- Without registered fonts or `EmbedStandardFonts`, text uses the standard PDF fonts, so characters are limited to
  the Windows-1252 set (Western European languages); other characters are replaced with `?`. The bundled Liberation
  fonts add Central European, Greek and Cyrillic, but not CJK or other scripts: register fonts for those.
- Complex-script shaping covers Arabic and Hebrew (and other scripts written with Arabic letters, such as Persian and
  Urdu). Devanagari and other Indic scripts, Thai, Khmer, Myanmar and Syriac are not shaped, so their vowel signs
  and conjuncts come out wrong, and Thai text breaks only at spaces. There is no vertical text (`writing-mode`).
- In Latin and other simple scripts, shaping is limited to kerning, standard ligatures and features that swap one
  glyph for another (see [OpenType features](/docs/fonts/#opentype-features)); contextual alternates and other
  features that depend on neighbouring characters are not applied, and `small-caps` is synthesized from scaled
  capitals.
- Automatic hyphenation (`hyphens: auto`) has built-in patterns for English, Danish, German, Dutch and Norwegian only;
  other languages need their patterns in `PdfOptions.Hyphenation`. `hyphenate-limit-chars` is not supported.
- SVG `<text>` uses only the first value of position lists and has no `textPath`; in a text chunk with right-to-left
  text, `dx` on its `tspan`s is ignored.

## CSS {changed 1.8.0}

- Rules inside `@container` blocks are skipped. A named page's `:first` is the document's first page, as in Chrome,
  not the first page of the named run. When `@page :first`, `:left` or `:right` margins give pages different content
  widths, the content is laid out at the narrowest width on every page; the first page is always a right page, also
  in right-to-left documents.
- Selectors: a rule with an unsupported selector is skipped. Selectors inside `:is()`, `:where()` and `:not()` may
  have at most eight compound parts (one when nested in another of them).
- `filter: blur()` turns the box into an image at 144 dpi, so text in it is no longer selectable. The colour filters
  keep everything as vectors, and `drop-shadow()` only adds the shadow as an image.
- `text-shadow` blur is approximated with faint copies of the text rather than a true Gaussian blur, and decorations
  (underlines) get no shadow. `text-overflow` applies only at the end of the line. `aspect-ratio` does not take part
  in min-/max-content sizing (shrink-to-fit widths) and is ignored on tables. `object-fit` applies to raster images; an SVG file in `<img>` keeps its own
  `preserveAspectRatio` fit.
- `background-attachment: fixed` scrolls with the box.

## Backgrounds and transparency

- No `background-clip: text`; backgrounds of inline elements (`<span>`) show only their colour, not images or
  gradients.
- Blurred box shadows and repeating gradients with translucent stops are blended onto the background colour rather
  than truly see-through; SVG gradient stops with transparency are blended onto white.

## Layout

- Grid: no subgrid.
- Multi-column: children are kept whole and balanced between columns; a single block is never split across columns.
- Overflow: a positioned child with a `z-index` inside a clipping box stays stacked within that box.

## Images and SVG {changed 1.8.0}

- No AVIF images: decoding them needs an AV1 video decoder, which is not planned. Convert them to WebP, PNG or JPEG.
- SVG filters are applied in pixels at 144 dpi, so filtered shapes become an image (text keeps an invisible,
  selectable copy).

## Markdown and the PDF renderer

- Markdown: no footnotes, definition lists, math or front matter.
- `PdfRenderer` (PDF to image): no predefined CJK CMaps or non-embedded CJK fonts, and ICC profiles are not applied
  (ICC-based colours use their device equivalents). WebP output is lossless only (no lossy VP8), and JPEG output is
  baseline only (no progressive or arithmetic coding).
