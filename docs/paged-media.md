# Paged media

## Page rules and margin boxes {changed 1.23.0}

`@page` rules set the page size, margins and background, and their margin boxes (`@top-left`, `@top-center`,
`@bottom-right` and the other thirteen) print headers and footers with `counter(page)` and `counter(pages)`, chosen
per page with `:first`, `:left` and `:right`. Those three can also change the page's size, margins and background:
`@page :first { margin-top: 70mm }` leaves room for a letterhead on page 1 only, and mirrored `:left` and `:right`
margins give a bound booklet a wider inner margin, and each page is laid out at its own content width. The first page
is a right page; in a right-to-left document (`dir="rtl"` on `<html>`) it is a left page, and PDF viewers are told the
pages run right to left. A border and padding on the `@page` box are drawn inside the margins, with the content inside
them, and the page's background images cover the whole sheet, as Chrome prints them (the images are positioned in the
page box, as CSS Paged Media 3 says). On top of that:

- **Named pages**: `page: wide` puts an element on pages styled by `@page wide { ... }`, with their own size,
  orientation, margins, background and margin boxes. Content on another named page starts a new page, so a landscape
  table or a full-bleed cover can sit between portrait pages.
- **Running headers**: `string-set` copies text from the document (`content()`, `attr()`, strings and counters) into
  a named string, and `string(name)` shows it in a margin box: the chapter title in the page header, say. As in the
  spec, `string(name, first | start | last | first-except)` picks which value a page shows.
- **Running elements**: `position: running(logo)` takes an element out of the flow, and `content: element(logo)` in a
  margin box lays it out there on each page, with the styles it has in the document, as Prince, WeasyPrint and
  Paged.js do: a logo, a small table or a formatted title in the header. `element(name, first | start | last |
  first-except)` picks which one a page shows, and page counters in its `::before` and `::after` count the page that
  shows it.
- **Pages as tall as their content**: `@page { size: 80mm auto }` gives each page the width and as much height as its
  content needs, for receipts and labels on a roll. Content longer than 200 inches, the most PDF readers accept,
  continues on pages of that height.
- **Tables of contents**: `target-counter(attr(href), page)` shows the page number of the element a link points to,
  and `leader(dotted)` (or `solid`, `space`, or a string) fills the space before it. `target-text()` shows the
  linked element's text. `target-counters(attr(href), section, ".")` writes every level of a nested counter, for
  cross references such as "see 2.3.1". The document is laid out again with the numbers it finds, so they are
  always right.
- **Page count in the content**: `counter(pages)` works anywhere, not only in margin boxes, as in Prince: "This report
  has 12 pages" on its first page.
- **Sections**: `-pdfpecker-target-pages(attr(href), first | last | count | current)` gives the first or last page of
  the element a link points to, how many pages it covers, or the page counted from its first (with an optional counter
  style, as `target-counter()` takes): "Chapter 3, pages 12–17" in a table of contents, or "page 2 of 6" within a
  section. In a sticky header or footer, `{section-page:id}` (the id percent-encoded) is the page within that section.

```css
@page { size: A4; margin: 20mm;
  @top-center { content: string(chapter) }
  @bottom-right { content: "Page " counter(page) " of " counter(pages) } }
@page cover { margin: 0; background: #1d3557; @top-center { content: none } @bottom-right { content: none } }
@page wide { size: A4 landscape }
.cover { page: cover }
.wide-table { page: wide }
h2 { string-set: chapter content(); break-before: page }
nav a::after { content: leader(dotted) target-counter(attr(href), page) }
```

Chrome supports named pages and margin boxes, but not running strings or elements, `target-counter()`,
`target-counters()`, `leader()`, the page count in the content or section page numbers; `-pdfpecker-target-pages()`
and `size: <width> auto` are PdfPecker's own.

## Footnotes {new 1.9.0}

`float: footnote` moves an element to the footnote area at the bottom of the page its call is on, as in CSS Generated
Content for Paged Media. The `footnote` counter numbers them; `::footnote-call` styles the number in the text (a
superscript by default) and `::footnote-marker` the number before the note. `@page { counter-reset: footnote }`
restarts the numbering on every page, and `@footnote` inside `@page` styles the area with margins, padding, borders, a
background and `max-height`. `footnote-display: inline` runs short notes together on one line, and
`footnote-policy: line` moves the line with the call to the next page when its note does not fit. A long note
continues on the next page. Each call links to its note, and tagged PDFs mark the notes as `Note` (PDF/UA-1) or
`FENote` (PDF/UA-2).

```css
.note { float: footnote; font-size: 8pt }
.note::footnote-call { content: "[" counter(footnote) "]"; vertical-align: baseline }
@page { @footnote { border-top: 0.5pt solid #999; padding-top: 4pt; margin-top: 8pt } }
```

```html
<p>Paid on the last banking day<span class="note">Or the day before a holiday.</span>.</p>
```

## Running header and footer from HTML {changed 1.23.0}

An element with the `data-sticky-pdf-header` or `data-sticky-pdf-footer` attribute is
taken out of the flow and drawn at the top or bottom of every page, and the page content flows in the space between.
Inside it, `{page}` and `{total-pages}` (or `{pages}`) are replaced with the page number and page count. An optional
`height` attribute (`height="17mm"`) reserves at least that much space.

Each of the tokens, `{section-page:id}` included, takes a counter style after a colon: `{page:upper-roman}` for a
preface numbered i, ii, iii, `{page:lower-alpha}`, or a style from the document's own `@counter-style` rules, such as
one that pads numbers to three digits. An unknown style name gives decimal numbers, as in CSS.

```html
<header data-sticky-pdf-header height="17mm">ACME Ltd · Payslip</header>
<main>...</main>
<footer data-sticky-pdf-footer height="12mm">Page {page} of {total-pages}</footer>
```

An element with `data-sticky-pdf-first-header` or `data-sticky-pdf-first-footer` takes the place of the running header
or footer on the first page only: a letterhead on page one and a slim header after it, or, left empty, no header or
footer on page one at all. The content on page one uses the space its own bands leave.

```html
<header data-sticky-pdf-first-header height="40mm"><img src="letterhead.png" alt="ACME Ltd"></header>
<header data-sticky-pdf-header height="12mm">ACME Ltd · Offer 2041</header>
<footer data-sticky-pdf-first-footer></footer>
<footer data-sticky-pdf-footer>Page {page} of {total-pages}</footer>
```

A band with `data-sticky-pdf-page="name"` is the header or footer of the pages of that [named page](#page-rules-and-margin-boxes)
instead of the document's bands, and a first-page band with it shows on the first page of each run of that page.
Pages without bands of their own keep the document's. One HTML document can so hold a cover, a portrait letter and a
landscape appendix, each with its own size, margins, header and footer, while page numbers run on through the whole
document.

```html
<style>
  @page appendix { size: A4 landscape }
  .appendix { page: appendix }
</style>
<footer data-sticky-pdf-footer>Page {page} of {total-pages}</footer>
<footer data-sticky-pdf-footer data-sticky-pdf-page="appendix">Appendix · page {page}</footer>
```

Elements with `data-sticky-pdf-even-header` and `data-sticky-pdf-even-footer` take the place of the running bands on
the even pages (2, 4, ...), for documents printed on both sides. On a named page the page's own even band wins, then
its running band, then the document's even band.

A `position: fixed` box, such as a watermark or a page frame, paints over the running header and footer when its
`z-index` is `auto` or 0 or more, as over a header Chrome prints in the flow; with a negative `z-index` it stays under
them.

## Shrink to fit {new 1.18.0}

When content sticks out past the right edge of the page area, Chrome prints the page laid out as much wider as the
content reaches and drawn smaller, and PdfPecker does the same. A box or image wider than the page, a long word or
`white-space: nowrap` text, a Bootstrap `.row` without a `.container` (its negative margin), a relative offset, a
`translateX()` or an absolutely positioned box can each widen the layout, by at most 1.5 times (drawn at 67%), on top
of `Scale`. The paper keeps its size and the margins keep theirs. As in Chrome, overflow to the left, content inside an
`overflow: hidden` or `clip` box (other than `html` and `body`) and `position: fixed` boxes do not count.

Set `ShrinkToFit = false` to lay the document out at the page width as before 1.18.0, with the overflow running into
the margin; an image wider than the page is then scaled down on its own.

```csharp
var pdf = HtmlToPdf.Convert(html, new PdfOptions { ShrinkToFit = false });
```
