# PDF without Chrome: an alternative to PuppeteerSharp and Playwright

PuppeteerSharp and Playwright make PDFs by driving a real Chromium browser. That gives exactly what Chrome prints, but
it means downloading and patching a browser of about 600 MB, keeping it running, and paying for a browser tab for
every document. PdfPecker converts HTML to PDF in your own process with its own engine written in C#, so there is no
browser to install and a one-page document takes about a millisecond. It is free under the MIT license.

```
dotnet add package PdfPecker
```

## Replace the browser code

### From PuppeteerSharp

```csharp
// Before
await new BrowserFetcher().DownloadAsync();
await using var browser = await Puppeteer.LaunchAsync(new LaunchOptions { Headless = true });
await using var page = await browser.NewPageAsync();
await page.SetContentAsync(html);
byte[] pdf = await page.PdfDataAsync(new PdfOptions
{
    Format = PaperFormat.A4,
    PrintBackground = true,
    MarginOptions = new MarginOptions { Top = "20mm", Bottom = "20mm" },
});
```

```csharp
// After
using PdfPecker;

byte[] pdf = HtmlToPdf.Convert(html, new PdfOptions
{
    PageSize = PageSize.A4,
    Margins = PageMargins.FromMillimeters(20, 15, 20, 15),
});
```

Both libraries have a class called `PdfOptions`, so in a project that still uses PuppeteerSharp elsewhere, write
`PdfPecker.PdfOptions`.

### From Playwright

```csharp
// Before
using var playwright = await Playwright.CreateAsync();
await using var browser = await playwright.Chromium.LaunchAsync();
var page = await browser.NewPageAsync();
await page.SetContentAsync(html);
byte[] pdf = await page.PdfAsync(new PagePdfOptions { Format = "A4", PrintBackground = true });
```

```csharp
// After
byte[] pdf = await HtmlToPdf.ConvertAsync(html);
```

A4 is the default page size. `HtmlToPdf` is static and thread-safe, so there is no browser to share between requests
and nothing to dispose or restart.

## Headers and footers

Chrome's `headerTemplate` and `footerTemplate` use `<span class="pageNumber">` and `<span class="totalPages">`, and
need `displayHeaderFooter`. In PdfPecker, use `FooterText = "{page} of {pages}"` for a simple line, or put the header
or footer in the page itself:

```html
<footer data-sticky-pdf-footer height="12mm">Page {page} of {total-pages}</footer>
```

Unlike Chrome's templates, these elements use the page's own stylesheets, fonts and images. `@page` margin boxes with
`counter(page)` work too. See [Paged media](/docs/paged-media/).

## Options side by side

| Chrome `page.pdf()` option | PdfPecker |
| --- | --- |
| `format`, `landscape`, `width`, `height` | `PageSize = PageSize.A4.Landscape`, or `new PageSize(width, height)` in points |
| `margin` | `Margins = PageMargins.FromMillimeters(top, right, bottom, left)` |
| `preferCSSPageSize` | Always on: CSS `@page` sets the size unless `IgnoreCssPageRules = true` |
| `printBackground` | Always on |
| `scale` | `Scale` |
| `displayHeaderFooter`, `headerTemplate`, `footerTemplate` | `HeaderText`, `FooterText`, or `data-sticky-pdf-header` and `data-sticky-pdf-footer` elements |
| `pageRanges` | Convert, then pick pages with the [page tools](/docs/merging/) |
| `outline` | On by default: bookmarks come from `h1` to `h6` |
| `tagged` | `Accessibility`, up to PDF/UA-2 (see [Accessibility](/docs/accessibility/)) |
| `emulateMedia({ media: "print" })` | Always print: `@media print` rules apply |
| `waitForSelector`, `waitForNetworkIdle` | Not needed: nothing loads later, and JavaScript is not run |

## What changes

- JavaScript is not run, so content that scripts build in the browser has to be in the HTML before conversion.
  Templates rendered on the server (Razor, Scriban, string building) work as they are.
- Nothing is downloaded. Images and stylesheets come from files under `BaseDirectory`, `data:` URLs, or your own
  `ResourceResolver` for `http` URLs, so a template can't make the server fetch other addresses.
- PdfPecker supports a large part of modern CSS, including flexbox, grid, variables and `@page` rules, but not all of
  what Chrome does. [Limitations](/docs/limitations/) lists the gaps.

## Speed and memory

On the same 4-core Linux VM, a one-page invoice took 106 ms with PuppeteerSharp, 131 ms with Playwright and 0.92 ms
with PdfPecker. Peak memory was 813 MB and 1,027 MB for the browser-based converters and 92 MB for PdfPecker, and in
parallel PdfPecker made 1,132 documents per second against 12 to 15. The full table is on the
[Performance](/docs/performance/) page.

## When to keep Chrome

PuppeteerSharp and Playwright are free and print exactly what Chrome shows, so they remain the right tool for pages
that build themselves with JavaScript, for live websites and for screenshots. [Compare](/compare/) shows what each
converter can do.
