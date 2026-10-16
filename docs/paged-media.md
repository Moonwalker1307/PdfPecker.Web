# Paged media

## Page rules and margin boxes

`@page` rules set the page size, margins and background, and their margin boxes (`@top-left`, `@top-center`,
`@bottom-right` and the other thirteen) print headers and footers with `counter(page)` and `counter(pages)`, chosen
per page with `:first`, `:left` and `:right`. Those three can also change the page's size, margins and background:
`@page :first { margin-top: 70mm }` leaves room for a letterhead on page 1 only, and mirrored `:left` and `:right`
margins give a bound booklet a wider inner margin. The first page is a right page. On top of that:

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
