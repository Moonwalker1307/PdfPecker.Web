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

## Text and fonts

- Without registered fonts or `EmbedStandardFonts`, text uses the standard PDF fonts, so characters are limited to
  the Windows-1252 set (Western European languages); other characters are replaced with `?`. The bundled Liberation
  fonts add Central European, Greek and Cyrillic, but not CJK or other scripts: register fonts for those.
- Complex-script shaping covers Arabic and Hebrew (and other scripts written with Arabic letters, such as Persian and
  Urdu). Devanagari and other Indic scripts, Thai, Khmer, Myanmar and Syriac are not shaped, so their vowel signs
  and conjuncts come out wrong, and Thai text breaks only at spaces. There is no vertical text (`writing-mode`).
- In Latin and other simple scripts, shaping is limited to pair kerning and standard ligatures; no contextual
  alternates or other OpenType features (`small-caps` is synthesized from scaled capitals).
- Variable fonts use their default instance (`font-variation-settings` and `font-stretch` are ignored).
- Automatic hyphenation (`hyphens: auto`) has built-in patterns for English, Danish, German, Dutch and Norwegian only;
  other languages need their patterns in `PdfOptions.Hyphenation`. `hyphenate-limit-chars` is not supported.
- SVG `<text>` uses only the first value of position lists and has no `textPath`; in a text chunk with right-to-left
  text, `dx` on its `tspan`s is ignored.

## CSS

- A table column width that mixes a percentage with other units (`calc(50% - 10px)`) is sized as `auto`.
- `@import` is ignored (use `<link rel="stylesheet">`), and rules inside `@container` blocks are skipped. `@page`
  rules for `:first`, `:left` and `:right` pages can style margin boxes but not change the page size or margins.
  A named page's `:first` is the document's first page, as in Chrome, not the first page of the named run.
- Selectors: no `::first-letter`/`::first-line`. A rule with an unsupported selector is skipped. `:hover`, `:focus`
  and similar interaction states never match. Selectors inside `:is()`, `:where()` and `:not()` may have at most eight
  compound parts (one when nested in another of them).
- Properties not supported: `filter`, `mix-blend-mode`, `clip-path` on HTML elements (only in SVG), `border-image`,
  `list-style-image`, `font-variant-numeric` and inset `box-shadow`. No relative colours (`rgb(from …)`).
- `text-shadow` blur is approximated with faint copies of the text rather than a true Gaussian blur, and decorations
  (underlines) get no shadow. `text-overflow` only supports `ellipsis` at the end of the line (`clip` and custom
  strings do nothing). `aspect-ratio` does not take part in min-/max-content sizing (shrink-to-fit widths) and is
  ignored on tables. `object-fit` applies to raster images; an SVG file in `<img>` keeps its own
  `preserveAspectRatio` fit.
- Borders: `groove`, `ridge`, `inset` and `outset` draw as solid.
- `position: sticky` is drawn as `relative`; `background-attachment: fixed` scrolls with the box.
- Lists: `list-style-type` covers disc, circle, square, decimal, decimal-leading-zero, alpha, roman and strings only
  (no Greek, CJK or `@counter-style`).

## Backgrounds and transparency

- No `background-clip: text`; backgrounds of inline elements (`<span>`) show only their colour, not images or
  gradients.
- Blurred box shadows and repeating gradients with translucent stops are blended onto the background colour rather
  than truly see-through; SVG gradient stops with transparency are blended onto white.

## Layout

- Grid: no subgrid.
- Multi-column: children are kept whole and balanced between columns; a single block is never split across columns.
- Overflow: a positioned child with a `z-index` inside a clipping box stays stacked within that box.

## Images and SVG

- Images: no AVIF, BMP or TIFF. Animated GIF and WebP files show only their first frame.
- SVG (inline and files): no embedded `<image>`. Filters have no `feTurbulence`, `feImage`, `feTile`,
  `feConvolveMatrix`, `feDisplacementMap` or lighting (these pass their input through unchanged) and ignore primitive
  subregions; filtered content becomes an image (text in it is no longer selectable). Watermark images must be raster
  images (PNG, JPEG, GIF or WebP).

## Markdown and the PDF renderer

- Markdown: no footnotes, definition lists, math or front matter.
- `PdfRenderer` (PDF to image): no predefined CJK CMaps or non-embedded CJK fonts, and ICC profiles are not applied
  (ICC-based colours use their device equivalents). WebP output is lossless only (no lossy VP8), and JPEG output is
  baseline only (no progressive or arithmetic coding).
