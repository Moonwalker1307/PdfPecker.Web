# HTML and CSS support

PdfPecker lays out HTML and CSS the way Chrome prints it. Anything not listed here should be assumed missing; the
known gaps are listed under [Limitations](/docs/limitations/).

## HTML

The common document elements: headings, paragraphs, `div`/`section`-style blocks, `span`, `a` (external links
and `#id` links inside the document), `b`/`strong`, `i`/`em`, `u`, `s`, `sub`, `sup`, `small`, `big`, `mark`, `code`,
`pre`, `blockquote`, `hr`, `br`, `ul`/`ol`/`li` (nested, with `start` and `value`), `dl`, `table` (with `thead`,
`tbody`, `tfoot`, `caption`, `colspan`, `rowspan`, `col width`), `img`, inline `<svg>`, and legacy attributes such as `align`,
`valign`, `bgcolor`, `width`, `height`, `border`, `cellpadding`, `cellspacing` and `<font>`. The `dir` attribute
(`ltr`, `rtl` and `auto`), `<bdi>` and `<bdo>` set the text direction. The parser is forgiving
about unclosed and misnested tags, the way browsers are.

Markdown is converted to this HTML first; see [Markdown](/docs/markdown/).

## CSS {changed 1.9.0}

`<style>` blocks, `<link rel="stylesheet">`, `@import` (with `layer()`, `supports()` and media queries; a relative URL
is relative to the importing stylesheet), inline `style` attributes, `@media` (media queries level 4:
`print`, `width`/`height` and `orientation` of the page area, ranges such as `(400px <= width <= 800px)`, `and`, `or`,
`not`), `@supports` (property tests, `selector()`, `and`/`or`/`not`), `@layer` cascade layers, CSS nesting (`&`),
`@property` (initial values and inheritance of registered custom properties), `@container` (see
[Container queries](#container-queries)) and `@page` (see [Paged media](/docs/paged-media/)). Selectors: type, `.class`, `#id`, `*`, attribute selectors (`[a]`, `=`, `~=`, `|=`,
`^=`, `$=`, `*=`, with `i`/`s` flags), descendant, `>`, `+`, `~`, `:first-child`, `:last-child`, `:only-child`,
`:nth-child()` and `:nth-last-child()` (incl. `of S`), `:first-of-type`, `:last-of-type`, `:only-of-type`,
`:nth-of-type()`, `:nth-last-of-type()`, `:not()`, `:is()`, `:where()` and `:has()` (all with lists of complex
selectors, such as `:is(nav > a, .menu li)`, nested to any sensible depth; `:is()` and `:where()` skip entries they do
not understand), `:root`, `:link`, `:empty`, `:lang()`, form states (`:checked`,
`:disabled`, `:enabled`, `:required`, `:optional`, `:read-only`, `:placeholder-shown` and the like), `::before`,
`::after`, `::marker`, `::first-letter` (drop caps, floated or not) and `::first-line`, with specificity and `!important`
handled as in browsers. As when Chrome prints, interaction states such as `:hover` and `:focus` never match.

## CSS properties {changed 1.9.0}

| Area | Properties |
| --- | --- |
| Box model | `display` (block, inline, inline-block, flex, inline-flex, grid, inline-grid, list-item, table parts, none), `margin`, `padding` (also the logical `margin-inline`/`-block` and `padding-inline`/`-block` properties and their `-start`/`-end` longhands), `border` (solid, dashed, dotted, double, groove, ridge, inset, outset), `border-image` (images, SVG files and gradients, with `-slice` incl. `fill`, `-width`, `-outset` and `-repeat`: stretch, repeat, round, space), `border-radius` (incl. elliptical `/` radii and percentages; rounds backgrounds, borders, shadows and images), `box-shadow` (outer and `inset` shadows; a blur is drawn as fading bands), `overflow` (`hidden`, `clip`, `auto` and `scroll` clip to the padding box, following its rounded corners, also in table cells; `overflow-x`/`overflow-y`), `outline` and `outline-offset` (all border styles; follows rounded corners), `width`, `height`, `min-`/`max-width`, `min-height`, `box-sizing`, `aspect-ratio` (incl. `auto <ratio>`; also in shrink-to-fit widths, with `min-`/`max-height`, and on tables), `object-fit` and `object-position` on images (SVG files too), `clip-path` (`inset()`, `circle()`, `ellipse()`, `polygon()`, `path()`, reference boxes, and `url(#id)` of a `clipPath` in inline SVG) |
| Text | `color`, `font`, `font-family`, `font-size`, `font-weight`, `font-style`, `font-stretch`, `font-variation-settings`, `font-optical-sizing` (see [Variable fonts](/docs/fonts/#variable-fonts)), `line-height`, `text-align` (incl. justify, `start` and `end`), `direction`, `unicode-bidi`, `text-decoration`, `text-transform`, `text-indent`, `letter-spacing`, `word-spacing`, `white-space`, `overflow-wrap`/`word-wrap`, `word-break` (`break-all`, `keep-all`), `line-break` (`auto`, `strict`, `normal`, `loose`, `anywhere`; see [CJK line breaking](/docs/languages/#chinese-japanese-and-korean-line-breaking)), `vertical-align`, `text-shadow` (several shadows, a true Gaussian blur, and underlines and line-throughs get the shadow too), `text-overflow` (`ellipsis`, `clip` or a string such as `" [more]"`, on a box that clips its overflow), `text-decoration-style` (`solid`, `double`, `dotted`, `dashed`, `wavy`), `text-decoration-color`, `text-decoration-thickness`, `text-underline-offset`, `text-align-last`, `tab-size`, `font-variant: small-caps` (synthesized from capitals when the font has none), `font-variant-numeric` and `font-feature-settings` (see [OpenType features](/docs/fonts/#opentype-features)), `line-clamp` and `-webkit-line-clamp` (with an ellipsis), `hyphens: manual | none | auto` (see [Hyphenation](/docs/languages/#hyphenation)), `hyphenate-character`. Lines break as in Chrome: at spaces, after hyphens and dashes, at `&shy;` (showing a hyphen) and `&#8203;`, and between Chinese, Japanese and Korean characters following the kinsoku rules; a word too wide for its line overflows unless `overflow-wrap` or `word-break` allows breaking it. `line-height: normal` comes from the font's own metrics, rounded to whole pixels as Chrome does, and border widths snap to whole pixels. Text is kerned as in Chrome: from the font's GPOS or `kern` table, and for the standard fonts from the Liberation fonts browsers use in their place. Embedded fonts get their standard ligatures (GSUB `liga`/`clig`, such as fi and ffi) as in Chrome, except in letter-spaced text; `font-variant-ligatures: none` or `font-feature-settings: "liga" 0` turns them off |
| Backgrounds | `background-color`, `background-image` and `background` with `url()` images (PNG, JPEG, GIF, WebP, BMP, TIFF, and SVG files drawn as vectors), `linear-gradient()`, `radial-gradient()`, `conic-gradient()` (pie charts and colour wheels, drawn as smooth PDF shadings) and their `repeating-` forms (several layers allowed); `background-repeat` (incl. `space`, `round`), `background-position` (incl. edge offsets like `right 10px bottom 5px`), `background-size` (`cover`, `contain`, lengths), `background-origin`, `background-clip`, `background-blend-mode`. Repeated images are written once as PDF tiling patterns. `url()` in a linked stylesheet is relative to the stylesheet and follows the same file access rules as `<img>`. As in Chrome's print output, the background of `<html>`, or else of `<body>`, fills every page area (images and gradients too, positioned against the root box and continuing from page to page); `@page { background: <colour> }` also colours the page margins. `opacity` on SVG |
| Flexbox | `flex-direction`, `flex-wrap`, `flex-flow`, `flex`, `flex-grow`/`-shrink`/`-basis`, `order`, `justify-content`, `align-items`, `align-self`, `align-content`, `gap`, `margin: auto` |
| Grid | `grid-auto-flow: dense` packing, `grid-template-columns`/`-rows` (lengths, `%`, `fr`, `auto`, `min-content`, `max-content`, `minmax()`, `fit-content()`, `repeat()` incl. `auto-fill`/`auto-fit`), `grid-auto-rows`/`-columns`, `grid-auto-flow`, `grid-template-areas`, `grid-template`, named lines (`[name]`), `grid-column`/`-row` (line numbers, names and `span`), `grid-area` (incl. area names), `gap`, `justify-items`/`-self`, `align-items`/`-self`, `justify-content`, `align-content`, `place-*` |
| Columns | `column-count`, `column-width`, `columns`, `column-gap`, `column-rule` (all border styles), `column-span: all` |
| Variables | custom properties (`--name: value`) and `var(--name, fallback)`, anywhere including shorthands |
| Math functions | `calc()`, `min()`, `max()`, `clamp()`, `round()`, `mod()`, `rem()`, `abs()`, `sign()`, `sin()`, `cos()`, `tan()`, `asin()`, `acos()`, `atan()`, `atan2()`, `pow()`, `sqrt()`, `hypot()`, `log()` and `exp()` for lengths, numbers and angles, nested in any combination and mixing units (`calc(100% - 2em)`, `min(100%, 600px)`, `clamp(1rem, 2.5vw, 2rem)`), with `var()` inside them. Percentages resolve against the property's own reference (the containing block's width for `width` and margins, the parent's font size for `font-size`), so they work in widths, heights, margins, padding, flex bases, grid tracks, gaps, positions, translations, font sizes and borders |
| Positioning | `float` and `clear`; `position` (`relative`, `absolute`, `fixed`; `sticky` is drawn as `relative`, as in Chrome's print output) with `top`, `right`, `bottom` and `left`; `z-index` |
| Transparency | `opacity` (a block is painted as one PDF transparency group; an inline `<span>` fades its text and background), translucent colours everywhere (`rgba()`, `hsla()`, `#rrggbbaa`, `transparent`), gradients that fade to `transparent` (as a soft mask). PDF/A-2 and 3 allow all of this |
| Effects | `filter`: `grayscale()`, `sepia()`, `saturate()`, `hue-rotate()`, `invert()`, `opacity()`, `brightness()` and `contrast()` recolour the box's text, borders and backgrounds as vectors (images through their pixels), while `blur()` and `drop-shadow()` are applied to the rendered box at 144 dpi, and text under `blur()` stays selectable and searchable; `mix-blend-mode` (all separable and non-separable modes, as PDF blend modes) and `isolation` |
| Transforms | `transform` (`translate()`, `translateX()`/`Y()`, `scale()`, `scaleX()`/`Y()`, `rotate()`, `skew()`, `skewX()`/`Y()`, `matrix()`), `transform-origin`, and the individual `translate`, `rotate` and `scale` properties |
| Generated content | `::before`, `::after` and `::marker` with `content` (strings, `attr()`, `counter()`, `counters()`, `open-quote`/`close-quote`, and for paged media `target-counter()`, `target-text()`, `leader()`, `string()` and `content()`), `counter-reset`, `counter-increment`, `counter-set`, `string-set` |
| SVG | `fill`, `stroke`, `stroke-width`, `fill-opacity`, `stroke-opacity`, `fill-rule`, `stroke-linecap`, `stroke-linejoin`, `stroke-miterlimit`, `clip-path`, `clip-rule`, `mask`, `mask-type`, `filter`, `marker`, `marker-start`/`-mid`/`-end`, `flood-color`, `flood-opacity`, `color-interpolation-filters`, `text-anchor`, `dominant-baseline` (as CSS or presentation attributes) |
| Lists | `list-style-type` (every predefined style of CSS Counter Styles 3, such as `lower-greek`, `hebrew`, `japanese-formal`, `cjk-decimal`, `disclosure-open`, written as Chrome writes them, or a string such as `'— '`), `@counter-style` rules (every system and descriptor) and `symbols()`, also in `counter()` and `counters()`; `list-style-image` (raster images and SVG files, falling back to the type when the image does not load), `list-style`, `::marker` (content, colour, font) |
| Tables | `border-collapse` (each shared border drawn once, the wider one winning), `border-spacing`, cell `vertical-align`, automatic column widths (a column width that mixes a percentage with a length, such as `calc(50% - 10px)`, counts as `auto`, as in Chrome), `table-layout: fixed`, a table `height` shared out over the rows |
| Paging | `page-break-before`/`after`/`inside`, `break-before`/`after`/`inside` (`always`, `page`, `avoid`), `orphans`, `widows`, `@page` size, margins and background, `@page :first`/`:left`/`:right`, the sixteen page-margin boxes (`@top-center` and the like), named pages (`page`), `string-set`, footnotes (`float: footnote`, `@footnote`) (see [Paged media](/docs/paged-media/)) |

## Units and colours {changed 1.9.0}

Units: `px`, `pt`, `em`, `rem`, `%`, `mm`, `cm`, `in`, `pc`, `ex`, `ch`, `vw`, `vh`, `vmin`, `vmax` (the viewport is
the page's content area, minus any running header and footer, in whole pixels as in Chrome), and the container query
units `cqw`, `cqh`, `cqi`, `cqb`, `cqmin` and `cqmax`. Colours: names, `#rgb`, `#rrggbb`,
`#rrggbbaa`, `rgb()`, `rgba()`, `hsl()`, `hsla()` (comma or space syntax), `hwb()`, `lab()`, `lch()`, `oklab()`,
`oklch()`, `color()` (sRGB, Display P3 and the other predefined spaces, mapped to sRGB), `color-mix()`,
`light-dark()` (the light value), `currentColor`, and relative colours (`rgb(from var(--brand) r g b / 50%)`,
`oklch(from teal calc(l + 0.1) c h)` and the like, in every colour function, with the channels usable in math
functions).

## Container queries {new 1.9.0}

`container-type` (`inline-size` or `size`), `container-name` and the `container` shorthand make an element a query
container, and `@container` rules style its descendants by the container's size: `width`, `height`, `inline-size`,
`block-size`, `aspect-ratio` and `orientation`, with `min-`/`max-` prefixes or range syntax, combined with `and`, `or`
and `not`. A name picks a container (`@container sidebar (width < 300px)`), and `style(--compact: 1)` queries a custom
property. The `cq` units are percentages of the nearest container's size. One component can then lay itself out for a
narrow sidebar and a wide main column without knowing where it is placed.

```css
.card-slot { container: card / inline-size }
.card { display: grid; gap: 8px }
@container card (width >= 400px) { .card { grid-template-columns: 120px 1fr } }
.card h3 { font-size: clamp(14px, 5cqi, 22px) }
```

A document that uses container queries is laid out again until the container sizes settle, which takes about two to
four times as long; documents without them are laid out as before.

## Pagination

Lines, images and table rows are never cut in half at a page boundary; table header rows repeat on
every page a table spans; backgrounds and borders continue across pages. Flex lines and grid rows move to the next
page as a whole when they don't fit. A paragraph that splits leaves at least `orphans` lines (default 2) at the bottom
of a page and carries at least `widows` lines (default 2) to the next. Headings keep with the content that follows
them (`break-after: avoid` in the default styles), and `break-before`/`break-after: avoid` does the same for any block.
`break-inside: avoid` keeps a block or a whole table on one page when it fits.

## Links and bookmarks

`<a href>` becomes a clickable link, whether inline or a block (a card wrapped in a link),
and stays clickable on both pages when a page break splits it. External URLs open in the viewer's browser and `#id`
links jump to the element. Headings `h1`-`h6` become the PDF's bookmarks, nested by level; set
`PdfOptions.Bookmarks = false` to leave them out.

## SVG {changed 1.8.0}

Inline `<svg>` and SVG files (in `<img>` and as `url()` backgrounds, including `data:image/svg+xml` URIs) with `path` (all commands, arcs included), `rect` (incl. rounded), `circle`, `ellipse`, `line`,
`polyline`, `polygon`, `text` and `tspan` (`x`, `y`, `dx`, `dy`, `text-anchor`, `dominant-baseline`, `direction`,
registered fonts and right-to-left text),
`g`, `use`, nested `svg`, `image` (raster images and SVG files, with `preserveAspectRatio`; inside an SVG file only
`data:` URIs load, as in browsers), `viewBox`, `preserveAspectRatio` and `transform`, drawn as vector paths. `linearGradient` and
`radialGradient` (both units, `gradientTransform`, `spreadMethod`, `href` inheritance) become PDF shadings, and
`pattern` fills and strokes (both units, `viewBox`, `patternTransform`, `href` inheritance) become PDF tiling patterns.
`clipPath` clips the elements that reference it, and `mask` (luminance or alpha, both units) becomes a PDF soft mask.
`marker` draws arrowheads and dots at the vertices of paths, lines, polylines and polygons (`orient` incl. `auto` and
`auto-start-reverse`, `markerUnits`, `viewBox`, `refX`/`refY`, clipped to the marker unless `overflow="visible"`).
`filter` is applied in pixels, at 144 dpi, and drawn as an image, with every filter primitive: `feGaussianBlur`,
`feOffset`, `feDropShadow`, `feFlood`, `feMerge`, `feComposite` (all operators), `feBlend` (separable modes),
`feColorMatrix`, `feComponentTransfer`, `feMorphology`, `feTurbulence`, `feImage`, `feTile`, `feConvolveMatrix`,
`feDisplacementMap`, and `feDiffuseLighting` and `feSpecularLighting` with distant, point and spot lights and
`lighting-color`, in linearRGB or sRGB. Primitive subregions (`x`, `y`, `width`, `height`) work as in Chrome. Text
under a filter stays selectable and searchable: an invisible copy of it is kept on top of the image. As in browsers, an SVG file is styled only by its own `<style>`
elements and attributes, not by the page's CSS, and loads nothing else.

## Images {changed 1.8.0}

JPEG (embedded as-is, RGB, grayscale and CMYK), PNG (all colour types and bit depths, transparency,
interlacing), GIF (transparency, interlacing), WebP (lossy, lossless and with alpha), BMP (1 to 32 bits, palettes, RLE, bit fields
and alpha) and TIFF (uncompressed, LZW, Deflate, PackBits, CCITT G3 and G4, JPEG; strips or tiles, planar, alpha,
16-bit; bilevel images stay 1 bit per pixel), from files, `data:` URIs or
your `ResourceResolver`. Animated GIF and WebP files show their first frame, as a PDF page is still. SVG files are drawn as vectors (see [SVG](#svg)
above). Opaque PNGs are passed through without re-encoding. Images wider than the page are scaled down to fit.
