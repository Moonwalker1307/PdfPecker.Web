# HTML and CSS support

PdfPecker lays out HTML and CSS the way Chrome prints it. Anything not listed here should be assumed missing; the
known gaps are listed under [Limitations](/docs/limitations/), and [CSS support](/docs/css-support/) marks every CSS
property, selector and unit as supported or not.

## HTML {changed 1.18.0}

The common document elements: headings, paragraphs, `div`/`section`-style blocks, `span`, `a` (external links
and `#id` links inside the document), `b`/`strong`, `i`/`em`, `u`, `s`, `sub`, `sup`, `small`, `big`, `mark`, `code`,
`pre`, `blockquote`, `hr`, `br`, `ul`/`ol`/`li` (nested, with `start`, `value`, `type` and `reversed`), `dl`, `table` (with `thead`,
`tbody`, `tfoot`, `caption`, `colspan`, `rowspan`, `col width`), `img`, inline `<svg>`, `<details>` and `<summary>`
(with the disclosure triangle; a closed `details` shows only its summary), and `<progress>` and `<meter>` drawn as
Chrome draws them (meter colours from `low`, `high` and `optimum`). Legacy attributes work as in browsers: `align`,
`valign`, `bgcolor`, `width`, `height`, `border`, `cellpadding`, `cellspacing`, `<font>`, `<center>`, `img align=left|right`
(a float, with `hspace` and `vspace`), `table bordercolor` and `rules`, and `align=center` on a `div` or cell, which
centres a nested table as e-mail templates expect, `<br clear=all>` (and `left`, `right`, `both`), which starts the
next line below the floats, and `<hr size>`, `color` and `noshade`; the default `<hr>` has Chrome's shaded grey edges. The `dir` attribute
(`ltr`, `rtl` and `auto`), `<bdi>` and `<bdo>` set the text direction. The parser is forgiving
about unclosed and misnested tags, the way browsers are, and a document that leaves out `html`, `head` or `body` gets
them, as in a browser: head content (`title`, `meta`, `link`, `style`) goes into the head and the first other tag or
text starts the body, so `body { ... }`, `html { ... }` and `:root` rules apply to a fragment too. A body the document
leaves out has no default margin, so fragment templates keep their layout; a `<body>` tag brings the usual 8px, as in
Chrome.

Markdown is converted to this HTML first; see [Markdown](/docs/markdown/).

## CSS {changed 1.17.0}

`<style>` blocks, `<link rel="stylesheet">`, `@import` (with `layer()`, `supports()` and media queries; a relative URL
is relative to the importing stylesheet), inline `style` attributes, `@media` (media queries level 4:
`print`, `width`/`height`, `aspect-ratio` and `orientation` of the page area, ranges such as `(400px <= width <= 800px)`, `and`, `or`,
`not`; the other features answer as a printer does: `prefers-color-scheme: light`, `hover` and `pointer: none`,
`scripting: none`, `overflow-block: paged`, and `resolution`, `color` and `color-gamut: srgb`), `@supports` (property tests, `selector()`, `and`/`or`/`not`), `@layer` cascade layers, CSS nesting (`&`),
`@property` (initial values and inheritance of registered custom properties), `@container` (see
[Container queries](#container-queries)) and `@page` (see [Paged media](/docs/paged-media/)). Selectors: type, `.class`, `#id`, `*`, attribute selectors (`[a]`, `=`, `~=`, `|=`,
`^=`, `$=`, `*=`, with `i`/`s` flags), descendant, `>`, `+`, `~`, `:first-child`, `:last-child`, `:only-child`,
`:nth-child()` and `:nth-last-child()` (incl. `of S`), `:first-of-type`, `:last-of-type`, `:only-of-type`,
`:nth-of-type()`, `:nth-last-of-type()`, `:not()`, `:is()`, `:where()` and `:has()` (all with lists of complex
selectors, such as `:is(nav > a, .menu li)`, nested to any sensible depth; `:is()` and `:where()` skip entries they do
not understand), `:root`, `:link`, `:empty`, `:lang()`, `:dir(ltr|rtl)` (from the `dir` attribute, `auto` by the
first strong character; the `direction` property does not count, as in browsers), form states (`:checked`,
`:disabled`, `:enabled`, `:required`, `:optional`, `:read-only`, `:placeholder-shown` and the like), `::before`,
`::after`, `::marker`, `::first-letter` (drop caps, floated or with [`initial-letter`](#drop-caps)), `::first-line` and
`::placeholder` (also `::-webkit-input-placeholder`) on text fields and textareas, with specificity and `!important`
handled as in browsers. As when Chrome prints, interaction states such as `:hover`, `:focus` and `:target` never match,
and neither does `:indeterminate`. The CSS-wide keywords `inherit`, `initial`, `unset`, `revert` and `revert-layer`
work on every property, shorthands included (`border: inherit`), and `all` resets everything but `direction` and
`unicode-bidi`.

## CSS properties {changed 1.18.0}

| Area | Properties |
| --- | --- |
| Box model | `display` (block, inline, inline-block, flow-root, flex, inline-flex, grid, inline-grid, list-item, none, the two-value forms such as `block flex`, `-webkit-box`, [CSS tables on any element](#tables), and [`contents`](#display-contents)), `margin`, `padding` (also the logical `margin-inline`/`-block` and `padding-inline`/`-block` properties and their `-start`/`-end` longhands, which follow `direction` and `writing-mode`; auto margins on an inline-block count as 0, as in Chrome), `border` (solid, dashed, dotted, double, groove, ridge, inset, outset; also the logical `border-inline`, `border-block`, their `-start`/`-end`, `-width`, `-style` and `-color` forms and the logical radii such as `border-start-end-radius`, placed by `direction` and `writing-mode`), `border-image` (images, SVG files and gradients, with `-slice` incl. `fill`, `-width`, `-outset` and `-repeat`: stretch, repeat, round, space), `border-radius` (incl. elliptical `/` radii and percentages; rounds backgrounds, borders, shadows and images), `box-shadow` (outer and `inset` shadows; a blur is drawn as fading bands, truly transparent over whatever is behind it), `overflow` (`hidden`, `clip`, `auto` and `scroll` clip to the padding box, following its rounded corners, also in table cells; `overflow-x`/`overflow-y`), `outline` and `outline-offset` (all border styles; follows rounded corners), `width`, `height`, `min-`/`max-width`, `min-`/`max-height` (percentages as in browsers; see [Percentage heights](#percentage-heights)), the logical `inline-size`, `block-size` and their `min-`/`max-` forms, `min-content`, `max-content` and `fit-content` widths (also `-webkit-` spelled) that size a box from its content, also as a flex or grid item, `box-sizing`, `aspect-ratio` (incl. `auto <ratio>`; also in shrink-to-fit widths, with `min-`/`max-height`, and on tables), `object-fit` and `object-position` on images (SVG files too), `clip-path` (`inset()`, `circle()`, `ellipse()`, `polygon()`, `path()`, reference boxes, and `url(#id)` of a `clipPath` in inline SVG) |
| Text | `color`, `font`, `font-family`, `font-size`, `font-weight`, `font-style`, `font-stretch`, `font-variation-settings`, `font-optical-sizing` (see [Variable fonts](/docs/fonts/#variable-fonts)), `font-kerning`, `font-synthesis` and its longhands, `font-size-adjust`, `font-variant-position` and `font-variant-east-asian` (see [Font properties](/docs/fonts/#font-properties)), `line-height`, `text-align` (incl. justify, `start` and `end`), `text-justify` (see [Text wrapping and justification](#text-wrapping-and-justification)), `direction`, `unicode-bidi`, `text-decoration`, `text-transform`, `text-indent`, `letter-spacing`, `word-spacing`, `white-space`, `overflow-wrap`/`word-wrap`, `word-break` (`break-all`, `keep-all`), `line-break` (`auto`, `strict`, `normal`, `loose`, `anywhere`; see [CJK line breaking](/docs/languages/#chinese-japanese-and-korean-line-breaking)), `vertical-align` (keywords, lengths and percentages such as `-0.125em` for icons; `top` and `bottom` align to the line box and `text-top`, `text-bottom` and `middle` to the parent's font, also for smaller inline text such as a currency sign at the top of a price, and nested `sup` and `sub` are raised again from their parent, as in Chrome), `text-shadow` (several shadows, a true Gaussian blur, and underlines and line-throughs get the shadow too), `text-overflow` (`ellipsis`, `clip` or a string such as `" [more]"`, on a box that clips its overflow), `text-decoration-style` (`solid`, `double`, `dotted`, `dashed`, `wavy`, the last four drawn with Chrome's thickness, dash lengths and wave shape), `text-decoration-color`, `text-decoration-thickness`, `text-underline-offset`, `text-decoration-skip-ink` (`auto`, the default, leaves gaps where descenders cross an underline, as in Chrome; `none` and `all`), `-webkit-text-stroke` (outlined text that stays selectable) with `paint-order`, `text-align-last`, `tab-size`, `font-variant: small-caps` (the font's own small capitals, or synthesized from capitals when it has none), `font-variant-numeric` and `font-feature-settings` (see [OpenType features](/docs/fonts/#opentype-features)), `line-clamp` and `-webkit-line-clamp` (with an ellipsis), `hyphens: manual | none | auto` (see [Hyphenation](/docs/languages/#hyphenation)), `hyphenate-character`, `hyphenate-limit-chars`, `text-wrap` (`balance`, `pretty`), `writing-mode` (see [Vertical text](#vertical-text)), `text-spacing-trim` (see [CJK punctuation trimming](/docs/languages/#cjk-punctuation-trimming)), `initial-letter` (see [Drop caps](#drop-caps)). Lines break as in Chrome: at spaces, after hyphens and dashes, at `&shy;` (showing a hyphen) and `&#8203;`, and between Chinese, Japanese and Korean characters following the kinsoku rules; a word too wide for its line overflows unless `overflow-wrap` or `word-break` allows breaking it. `line-height: normal` comes from the font's own metrics, rounded to whole pixels as Chrome does, and border widths snap to whole pixels. Text is kerned as in Chrome: from the font's GPOS or `kern` table, and for the standard fonts from the Liberation fonts browsers use in their place. Embedded fonts get their standard ligatures (GSUB `liga`/`clig`, such as fi and ffi) as in Chrome, except in letter-spaced text; `font-variant-ligatures: none` or `font-feature-settings: "liga" 0` turns them off |
| Backgrounds | `background-color`, `background-image` and `background` with `url()` images (PNG, JPEG, GIF, WebP, BMP, TIFF, and SVG files drawn as vectors), `linear-gradient()`, `radial-gradient()`, `conic-gradient()` (pie charts and colour wheels, drawn as smooth PDF shadings) and their `repeating-` forms (several layers allowed); `background-repeat` (incl. `space`, `round`), `background-position` (incl. edge offsets like `right 10px bottom 5px`), `background-size` (`cover`, `contain`, lengths), `background-origin`, `background-clip` (incl. `text`, also as `-webkit-background-clip`), `background-blend-mode`. Inline elements such as `<span>`, `<mark>` and `<code>` get the same backgrounds and borders as blocks, including images, gradients, `border-radius` and clipping to text; `box-decoration-break: slice | clone` (also `-webkit-box-decoration-break`) decides whether a background and border split over several lines is laid out as one box or repeated on each line, as in Chrome. Repeated images are written once as PDF tiling patterns. `url()` in a linked stylesheet is relative to the stylesheet and follows the same file access rules as `<img>`. As in Chrome's print output, the background of `<html>`, or else of `<body>`, fills every page area (images and gradients too, positioned against the root box and continuing from page to page); `@page { background: <colour> }` also colours the page margins. `opacity` on SVG |
| Flexbox | `flex-direction`, `flex-wrap`, `flex-flow`, `flex`, `flex-grow`/`-shrink`/`-basis`, `order`, `justify-content`, `align-items`, `align-self`, `align-content`, `gap`, `margin: auto`. The first and last child's margins stay inside a flex item. A wrapping column flex box of fixed height starts a new column when one is full, `min-width: 0` lets a flex item shrink below its longest word, and an item taller than its fixed-height row (a Bootstrap progress bar) stays in place, as in Chrome |
| Grid | `grid-auto-flow: dense` packing, `grid-template-columns`/`-rows` (lengths, `%`, `fr`, `auto`, `min-content`, `max-content`, `minmax()`, `fit-content()` capped at its length, `repeat()` incl. `auto-fill`/`auto-fit`), `grid-auto-rows`/`-columns`, `grid-auto-flow`, `grid-template-areas`, `grid-template`, named lines (`[name]`), `grid-column`/`-row` (line numbers, names and `span`), `grid-area` (incl. area names), `subgrid` in `grid-template-columns`/`-rows` (see [Subgrid](#subgrid)), `gap`, `justify-items`/`-self`, `align-items`/`-self`, `justify-content`, `align-content`, `place-*` |
| Columns | `column-count`, `column-width`, `columns`, `column-gap`, `column-rule` (all border styles), `column-span: all`, `column-fill`, `break-before`/`-after: column`, `break-inside: avoid-column` (see [Multi-column layout](#multi-column-layout)) |
| Variables | custom properties (`--name: value`) and `var(--name, fallback)`, anywhere including shorthands |
| Math functions | `calc()`, `min()`, `max()`, `clamp()`, `round()`, `mod()`, `rem()`, `abs()`, `sign()`, `sin()`, `cos()`, `tan()`, `asin()`, `acos()`, `atan()`, `atan2()`, `pow()`, `sqrt()`, `hypot()`, `log()` and `exp()` for lengths, numbers and angles, nested in any combination and mixing units (`calc(100% - 2em)`, `min(100%, 600px)`, `clamp(1rem, 2.5vw, 2rem)`), with `var()` inside them. Percentages resolve against the property's own reference (the containing block's width for `width` and margins, the parent's font size for `font-size`), so they work in widths, heights, margins, padding, flex bases, grid tracks, gaps, positions, translations, font sizes and borders |
| Positioning | `float` and `clear` (with text wrapping round [float shapes](#float-shapes); an empty clearfix `div` moves what follows below the floats and makes its container grow round them); `position` (`relative`, `absolute`, `fixed`; `sticky` is drawn as `relative`, as in Chrome's print output) with `top`, `right`, `bottom` and `left`, `inset`, and the logical `inset-inline` and `inset-block` with their `-start`/`-end` longhands (the inline side follows `dir` and `direction`); `z-index`. An absolutely positioned child of a flex or grid container takes no room in its rows or columns and is placed by its offsets, and a `position: relative` table cell is the containing block of its positioned content, so corner ribbons and badges on cards and cells land where Chrome puts them |
| Transparency | `opacity` (a block is painted as one PDF transparency group; an inline `<span>` fades its text and background), translucent colours everywhere (`rgba()`, `hsla()`, `#rrggbbaa`, `transparent`), gradients that fade to `transparent` (as a soft mask). Blurred box shadows, repeated gradient tiles with translucent stops and SVG gradients with `stop-opacity` are truly see-through, over images too. PDF/A-2 and 3 and PDF/UA allow all of this |
| Effects | `filter`: `grayscale()`, `sepia()`, `saturate()`, `hue-rotate()`, `invert()`, `opacity()`, `brightness()` and `contrast()` recolour the box's text, borders and backgrounds as vectors (images through their pixels), while `blur()` and `drop-shadow()` are applied to the rendered box at 144 dpi, and text under `blur()` stays selectable and searchable; `mix-blend-mode` (all separable and non-separable modes, as PDF blend modes) and `isolation`; [masks and `backdrop-filter`](#masks-and-backdrop-filter) |
| Transforms | `transform` (`translate()`, `translateX()`/`Y()`, `scale()`, `scaleX()`/`Y()`, `rotate()`, `skew()`, `skewX()`/`Y()`, `matrix()`), `transform-origin`, and the individual `translate`, `rotate` and `scale` properties. Gradients, background tiles and SVG patterns inside a transformed box turn and scale with it. [3D transforms](#3d-transforms) are drawn flat |
| Generated content | `::before`, `::after` and `::marker` with `content` (strings, `attr()`, `counter()`, `counters()`, `open-quote`/`close-quote` with the `quotes` property (`none`, `auto`, or string pairs; `auto` follows `lang` as in Chrome, with the CLDR quotes for German, French, Italian, Dutch, Swedish, Polish, Russian, Japanese and more), and for paged media `target-counter()`, `target-text()`, `leader()`, `string()` and `content()`), `counter-reset`, `counter-increment`, `counter-set`, `string-set` |
| SVG | `fill`, `stroke`, `stroke-width`, `fill-opacity`, `stroke-opacity`, `fill-rule`, `stroke-linecap`, `stroke-linejoin`, `stroke-miterlimit`, `stroke-dasharray`, `stroke-dashoffset`, `clip-path`, `clip-rule`, `mask`, `mask-type`, `filter`, `marker`, `marker-start`/`-mid`/`-end`, `flood-color`, `flood-opacity`, `color-interpolation-filters`, `text-anchor`, `dominant-baseline` (as CSS or presentation attributes) |
| Lists | `list-style-type` (every predefined style of CSS Counter Styles 3, such as `lower-greek`, `hebrew`, `japanese-formal`, `cjk-decimal`, `disclosure-open`, written as Chrome writes them, or a string such as `'— '`), `@counter-style` rules (every system and descriptor) and `symbols()`, also in `counter()` and `counters()`; `list-style-image` (raster images and SVG files, falling back to the type when the image does not load), `list-style-position` (`outside` and `inside`), `list-style`, `::marker` (content, colour, font) |
| Tables | `border-collapse`, `border-spacing`, cell `vertical-align`, automatic column widths, `table-layout: fixed`, a table `height` shared out over the rows, `caption-side` (`top`, `bottom`), `empty-cells`, cell `min-width` and `max-width`, and backgrounds on `thead`, `tbody`, `tfoot`, `col` and `colgroup` (see [Tables](#tables)) |
| Paging | `page-break-before`/`after`/`inside`, `break-before`/`after`/`inside` (`always`, `page`, `avoid`), `orphans`, `widows`, `@page` size, margins and background, `@page :first`/`:left`/`:right`, the sixteen page-margin boxes (`@top-center` and the like), named pages (`page`), `string-set`, footnotes (`float: footnote`, `@footnote`) (see [Paged media](/docs/paged-media/)) |

## Units and colours {changed 1.17.0}

Units: `px`, `pt`, `pc`, `in`, `cm`, `mm`, `q`, `em`, `rem`, `%`, the font-relative `ex` (the font's x-height), `ch`
(the advance of "0"), `cap` (cap height), `ic` (the advance of 水, or one em), `lh` (the line height) and their root
versions `rex`, `rch`, `rcap`, `ric` and `rlh`, measured from the font, standard and embedded fonts alike; `vw`, `vh`,
`vmin`, `vmax`, `vi`, `vb` and the small, large and dynamic sets (`svh`, `lvw`, `dvh`, `svmin` and the like), which
all equal `vw` and `vh` on paper (the viewport is the page's content area, minus any running header and footer, in
whole pixels as in Chrome); and the container query units `cqw`, `cqh`, `cqi`, `cqb`, `cqmin` and `cqmax`. Colours: names, `#rgb`, `#rrggbb`,
`#rrggbbaa`, `rgb()`, `rgba()`, `hsl()`, `hsla()` (comma or space syntax), `hwb()`, `lab()`, `lch()`, `oklab()`,
`oklch()`, `color()` (sRGB, Display P3 and the other predefined spaces, mapped to sRGB), `color-mix()`,
`light-dark()` (the light value), `currentColor`, and relative colours (`rgb(from var(--brand) r g b / 50%)`,
`oklch(from teal calc(l + 0.1) c h)` and the like, in every colour function, with the channels usable in math
functions).

## Subgrid {new 1.11.0}

`grid-template-columns: subgrid` and `grid-template-rows: subgrid` (CSS Grid Level 2) let a grid item that is itself a
grid share its parent's tracks on that axis, so the rows of nested cards or the columns of a form line up across the
whole grid. The subgrid's items take part in sizing the parent's tracks, gaps come from the parent unless the subgrid
sets its own, and line names come from the parent and from the subgrid's own list (including `repeat()` and
`repeat(auto-fill, …)`). Subgrids nest, and a subgrid that is not a grid item is laid out as `none`, as in browsers.
Rows paginate as the parent grid's rows do.

```css
.plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px }
.plan { display: grid; grid-row: span 3; grid-template-rows: subgrid }   /* title, features and price line up */
```

## Multi-column layout {changed 1.11.0}

`column-count`, `column-width` and `columns` lay content out the way Chrome does. Paragraphs, lists, tables and other
boxes continue from one column into the next, every column on every page is filled, and the last row of columns is
balanced (`column-fill: balance`) or filled in turn (`column-fill: auto`). `column-span: all`, `column-gap`,
`column-rule`, `break-before`/`break-after: column`, `break-inside: avoid` and `avoid-column`, orphans and widows,
repeated table headers and right-to-left columns work as in Chrome, which also ignores `break-before: page` inside
columns.

## Percentage heights {new 1.11.0}

Percentage `height`, `min-height` and `max-height` resolve as in browsers when the containing block's height is
definite: a length, a chain of percentages up to the page (`html, body { height: 100% }`), a stretched flex or grid
item, a flex item grown in a container of definite height, an `aspect-ratio` height, or the padding box for absolutely
positioned boxes. Children of a table cell resolve against it when the cell has a fixed height or the table has a
height. Against an `auto` height a percentage behaves as `auto`, as in browsers.

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

## Tables {changed 1.18.0}

`display: table`, `inline-table`, `table-row`, `table-cell` and the other table values work on any element, with the
anonymous table, row and cell boxes CSS adds around them, so a lone `display: table-cell`, a table `div` with only
text and an `inline-table` lay out as in Chrome; `border-spacing` starts at 0 except on `<table>`. Column widths are
shared out as Chrome does: columns under a cell that spans several are sized by their own content, a percentage width
on a spanning cell is shared by the columns it spans, and percentages that add up to more than 100% are cut down from
the last column that has one. A table is never narrower than its columns' narrowest content, so a long word or URL
widens it instead of running into the next cell, and never narrower than its caption's longest word. Percentage
columns that would squeeze the other columns below their narrowest content give way in proportion, so the table keeps
its width, and an image with a percentage width in a cell shrinks with the column instead of widening the table.

With `border-collapse: collapse`, each shared border is drawn once and conflicts are resolved as in CSS 2.1 and Chrome:
`hidden` wins, then the wider border, then the style (double, solid, dashed, dotted, ridge, outset, groove, inset), then
cell before row, row group and table. Borders on `tr`, `thead`, `tbody` and `tfoot` take part, and cells sit inside the
border that wins on each side. Backgrounds on `thead`, `tbody`, `tfoot`, `col` and `colgroup` are painted in the CSS 2.1
order, under the cells' own. `caption-side: bottom`, `empty-cells: hide` and cell `min-width` and `max-width` work too; a `max-width` caps its
column even below the text's narrowest width, so a `nowrap` cell with `text-overflow: ellipsis` is cut at that width. A
`position: relative` cell holds its absolutely positioned content, which moves with `vertical-align` and is clipped
with the cell, and outlines on cells of a collapsed table are drawn above the table.

## display: contents {new 1.17.0}

`display: contents` makes no box: the element's children, `::before` and `::after` included, are laid out as children of
its parent, so they become flex items, grid cells, or rows and cells of the table around it, such as a `<ul>` whose
items join a grid or a `div` that wraps table rows. The element's own border, padding, margin, background, transforms
and position do not apply, but inherited properties such as colour and font still reach its children, and counters
still count. On replaced elements and form controls (`img`, `svg`, `input`, `select`, `progress` and the like) it hides
the element, as CSS Display asks, and on the root element it acts as `block`.

## Text wrapping and justification {new 1.17.0}

`text-wrap: balance` evens out the lines of a heading or short paragraph (up to six lines, as in Chrome), and
`text-wrap: pretty` rewraps a paragraph's last four lines so it does not end on a single short word. `text-wrap-mode`
and `text-wrap-style` are the longhands; `stable` lays out as `auto`. Neither applies beside floats, with
`::first-line`, `word-break: break-all` or `line-break: anywhere`, or on pages of different widths.

```css
h1, h2 { text-wrap: balance }
p { text-wrap: pretty }
```

With `text-align: justify`, `text-justify: auto` spreads the free space at spaces and, as Chrome does, between Chinese
and Japanese characters and CJK punctuation (Korean Hangul only at spaces). `inter-word` uses only spaces,
`inter-character` (or `distribute`) every character, as Firefox does, and `none` leaves lines unjustified. No-break
spaces stretch like spaces. Right-to-left and bidirectional lines are justified at spaces only.

## Vertical text {new 1.17.0}

`writing-mode: vertical-rl`, `vertical-lr`, `sideways-rl` and `sideways-lr` on blocks, inline-blocks, flex items and
table cells turn the box's text a quarter turn, as Chrome draws Latin text in those modes: column headers in narrow
table cells, labels along the side of a card, and spine text. See [Limitations](/docs/limitations/#text-and-fonts) for
what is not done yet, such as upright CJK.

```html
<th style="writing-mode: sideways-lr">Quarter 1</th>   <!-- reads from bottom to top -->
```

## Float shapes {new 1.17.0}

`shape-outside` makes the text beside a float wrap round a shape instead of the float's rectangle, as in Chrome:
`circle()`, `ellipse()`, `inset()` (with `round` corners), `polygon()` and `path()`, optionally with a reference box
(`margin-box`, the default, `border-box`, `padding-box`, `content-box`); a box keyword on its own follows the float's
`border-radius`. Images (PNG, JPEG, GIF, WebP) and gradients work too: pixels more opaque than
`shape-image-threshold` (0 to 1, default 0) count as the shape, so text follows the outline of a cut-out photo.
`shape-margin` grows the shape outwards. Lines beside a shape step down a pixel at a time until they fit, as in Chrome.

```css
.portrait { float: left; width: 160px; shape-outside: circle(50%); shape-margin: 12px; border-radius: 50% }
.logo { float: right; shape-outside: url(logo.png); shape-image-threshold: 0.3 }
```

## Drop caps {new 1.17.0}

`initial-letter` on `::first-letter` makes a drop cap, as in Chrome. `initial-letter: 3` (or `3 drop`) is three lines
tall and sits on the third line's baseline, `3 raise` stands on the first line, and `3 2` sinks two lines; sizes such
as `2.5` work too. The letter's font size is chosen so its cap height spans the lines, the lines beside it flow round
it like a float, and padding, borders, backgrounds and colours on the letter apply.

```css
article > p:first-of-type::first-letter { initial-letter: 3; color: #8b1e3f; margin-right: 6px }
```

## Masks and backdrop-filter {new 1.17.0}

`mask-image`, `mask-size`, `mask-position`, `mask-repeat`, `mask-origin`, `mask-clip`, `mask-mode`, `mask-composite`
and the `mask` shorthand work on HTML elements, and so do the `-webkit-mask` spellings. Mask layers take the same
images as backgrounds (gradients, PNG, JPEG, WebP, GIF, SVG files and `data:` URIs) and are sized and tiled the same
way; `url(#id)` points at an SVG `<mask>` in the document. A mask is a PDF soft mask, so masked text stays text:
selectable, searchable and tagged. If no mask layer loads, the element is drawn unmasked, as in Chrome.

`backdrop-filter` (and `-webkit-backdrop-filter`) takes every filter function. What is behind the box is rendered at
144 dpi, filtered and drawn under the box, clipped to its border box and rounded corners; the box's own content stays
vector. Chrome's own print to PDF leaves out `backdrop-filter` and `mask-composite`; PdfPecker draws them as Chrome
shows them on screen.

```css
.fade { mask-image: linear-gradient(to bottom, black 60%, transparent) }
.glass { background: rgb(255 255 255 / 40%); backdrop-filter: blur(8px) saturate(1.4) }
```

## 3D transforms {new 1.17.0}

`translate3d()`, `translateZ()`, `scale3d()`, `scaleZ()`, `rotateX()`, `rotateY()`, `rotate3d()`, `matrix3d()`,
`perspective()`, the `perspective` and `perspective-origin` properties, and the `translate`, `scale` and `rotate`
properties with a z value or an axis are accepted. A PDF page has only flat (affine) transforms, so a 3D transform is
drawn flat: `rotateY(60deg)` makes a box half as wide, and with a perspective the box gets the scale and shear the
projection has at its centre, so it stays a rectangle or parallelogram where Chrome draws a trapezoid. A box turned
edge-on or away from the viewer is not drawn. `transform-style` and `backface-visibility` are accepted and, as in
Chrome's print output, both faces of a flip card are drawn.

## Scale content to fit a box {new 1.19.0}

`-pdfpecker-scale-to-fit: shrink` on a box with a `height` or `max-height` draws its content smaller until it fits
the box, for labels, name badges and certificates that have a fixed space for text of any length. The text reflows
wider into fewer lines before it gets smaller, and the box's own border and background keep their size. Content that
already fits is not changed, and table cells with a height scale their content too. A scaled box is drawn whole, so
like a box with `break-inside: avoid` it moves to the next page rather than across a page break. Scaled boxes nest at
most two levels deep.

```html
<div style="width: 80mm; height: 25mm; -pdfpecker-scale-to-fit: shrink">Dr. Maximiliane Alexandra von Rosenberg-Hohenstein</div>
```

## Pagination {changed 1.18.0}

Lines, images and table rows are never cut in half at a page boundary; table header rows repeat at the top and
`<tfoot>` rows at the bottom of every page a table spans, as in Chrome; backgrounds and borders continue across pages.
Flex lines move to the next page as a whole when they don't fit. A grid row breaks across the page boundary where it starts, as in Chrome, and moves whole only when one of its items cannot break (a line of text, an image, or a box with `break-inside: avoid`). A table inside a flex or grid item
breaks across pages like any other table, with its header repeated, and the line or row grows to match. A paragraph that splits leaves at least `orphans` lines (default 2) at the bottom
of a page and carries at least `widows` lines (default 2) to the next. Headings keep with the content that follows
them (`break-after: avoid` in the default styles), and `break-before`/`break-after: avoid` does the same for any block.
`break-inside: avoid` keeps a block or a whole table on one page when it fits. As in Chrome, a margin that runs past the end of a page is dropped rather than carried to the next one (except after a forced break), and a box's top and bottom borders and padding stay on the same page as its first and last content. A box shadow paints on the pages
its box reaches but never adds a page of its own.

## Links and bookmarks

`<a href>` becomes a clickable link, whether inline or a block (a card wrapped in a link),
and stays clickable on both pages when a page break splits it. External URLs open in the viewer's browser and `#id`
links jump to the element. Headings `h1`-`h6` become the PDF's bookmarks, nested by level; set
`PdfOptions.Bookmarks = false` to leave them out.

## SVG {changed 1.17.0}

Inline `<svg>` and SVG files (in `<img>` and as `url()` backgrounds, including `data:image/svg+xml` URIs) with `path` (all commands, arcs included), `rect` (incl. rounded), `circle`, `ellipse`, `line`,
`polyline`, `polygon`, `text` and `tspan` (`x`, `y`, `dx`, `dy`, `text-anchor`, `dominant-baseline`, `direction`,
registered fonts and right-to-left text), `textPath` (text along a path, with `startOffset` and the path's `pathLength`, as in Chrome),
`g`, `use` (also of a `symbol`, gradient or clip path defined in another inline SVG on the page, with the symbol's `viewBox` fitted into the `use` size), nested `svg`, `image` (raster images and SVG files, with `preserveAspectRatio`; inside an SVG file only
`data:` URIs load, as in browsers), `viewBox`, `preserveAspectRatio` and `transform`, drawn as vector paths. Strokes can be dashed with `stroke-dasharray` and `stroke-dashoffset`, scaled by `pathLength`. `opacity` on a `g`, `use` or nested `svg` fades the group as one, so overlapping children do not show through each other, and `text-decoration` on `text` and `tspan` draws underlines, overlines and line-throughs in the text's fill. `linearGradient` and
`radialGradient` (both units, `gradientTransform`, `spreadMethod`, `href` inheritance, and `stop-opacity` that is truly transparent) become PDF shadings, and
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

## Images {changed 1.18.0}

JPEG (embedded as-is, RGB, grayscale and CMYK), PNG (all colour types and bit depths, transparency,
interlacing), GIF (transparency, interlacing), WebP (lossy, lossless and with alpha), BMP (1 to 32 bits, palettes, RLE, bit fields
and alpha) and TIFF (uncompressed, LZW, Deflate, PackBits, CCITT G3 and G4, JPEG; strips or tiles, planar, alpha,
16-bit; bilevel images stay 1 bit per pixel), from files, `data:` URIs or
your `ResourceResolver`. Animated GIF and WebP files show their first frame, as a PDF page is still. SVG files are drawn as vectors (see [SVG](#svg)
above). Opaque PNGs are passed through without re-encoding. An image wider than its box overflows it, as in Chrome; an image wider than
the page makes the whole page [shrink to fit](/docs/paged-media/#shrink-to-fit), as Chrome prints it, and is scaled down
on its own only past 1.5 times the page width or with `ShrinkToFit` off. A percentage `width`, `max-width` or padding on an image is a share of
the containing block, inline images draw their border, padding, background and shadow, and vertical margins on inline
images and SVG take room in the line, all as in Chrome.

An `<img>` whose picture is missing (no `src`, a file or `ResourceResolver` that finds nothing, or data that cannot be
decoded) prints its `alt` text instead, as Chrome does, in the text style around it plus the image's own border,
padding, colour and font; this works for Markdown's `![alt](missing.png)` too. Without alt text, or with `alt=""`, a
missing image keeps an empty box of the width and height given.
