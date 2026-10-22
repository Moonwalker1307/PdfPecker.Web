# Paged media

## Page rules and margin boxes {changed 1.9.0}

`@page` rules set the page size, margins and background, and their margin boxes (`@top-left`, `@top-center`,
`@bottom-right` and the other thirteen) print headers and footers with `counter(page)` and `counter(pages)`, chosen
per page with `:first`, `:left` and `:right`. Those three can also change the page's size, margins and background:
`@page :first { margin-top: 70mm }` leaves room for a letterhead on page 1 only, and mirrored `:left` and `:right`
margins give a bound booklet a wider inner margin, and each page is laid out at its own content width. The first page
is a right page; in a right-to-left document (`dir="rtl"` on `<html>`) it is a left page, and PDF viewers are told the
pages run right to left. On top of that:

- **Named pages**: `page: wide` puts an element on pages styled by `@page wide { ... }`, with their own size,
  orientation, margins, background and margin boxes. Content on another named page starts a new page, so a landscape
  table or a full-bleed cover can sit between portrait pages.
- **Running headers**: `string-set` copies text from the document (`content()`, `attr()`, strings and counters) into
  a named string, and `string(name)` shows it in a margin box: the chapter title in the page header, say. As in the
  spec, `string(name, first | start | last | first-except)` picks which value a page shows.
- **Tables of contents**: `target-counter(attr(href), page)` shows the page number of the element a link points to,
  and `leader(dotted)` (or `solid`, `space`, or a string) fills the space before it. `target-text()` shows the
  linked element's text. The document is laid out again with the numbers it finds, so they are always right.

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

Chrome supports named pages and margin boxes, but not running strings, `target-counter()` or `leader()`.

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

## Running header and footer from HTML

An element with the `data-sticky-pdf-header` or `data-sticky-pdf-footer` attribute is
taken out of the flow and drawn at the top or bottom of every page, and the page content flows in the space between.
Inside it, `{page}` and `{total-pages}` (or `{pages}`) are replaced with the page number and page count. An optional
`height` attribute (`height="17mm"`) reserves at least that much space.

```html
<header data-sticky-pdf-header height="17mm">ACME Ltd · Payslip</header>
<main>...</main>
<footer data-sticky-pdf-footer height="12mm">Page {page} of {total-pages}</footer>
```

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
