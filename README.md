# PdfPecker.Web

<p align="center"><img src="wwwroot/logo.png" alt="PdfPecker" width="320"></p>

The website and HTTP API behind [pdfpecker.net](https://pdfpecker.net): a small ASP.NET Core site built on the
[PdfPecker](https://www.nuget.org/packages/PdfPecker) NuGet package
([source](https://github.com/Moonwalker1307/PdfPecker)). The static pages in `wwwroot` are:

- `/` (`index.html`): the home page, introducing the library.
- `/html-to-pdf/`: paste or open an `.html` file (or drag one onto the page), set any `PdfOptions` setting in the
  settings panel (and copy them as C#), and preview or download the PDF or PNG images of its pages.
- `/markdown/`: the same for Markdown, which can also be converted to HTML. It has a visual (WYSIWYG) editor and a
  Markdown editor with a shared formatting toolbar (`md-editor.js`); visual edits are written back as Markdown. Lists
  continue on Enter, pasted rich text keeps its formatting, and pasted or dropped images are embedded as data URLs
  (reference links at the end of the document). `md-tools.js` adds what other online Markdown editors have: autosave
  in the browser, live preview, Editor/Split/Preview views, an outline, a word count, an Export menu (Markdown, HTML,
  formatted text) and share links that carry the whole document after the `#`, so nothing is stored on the server.

- `/compare/`: PdfPecker side by side with other HTML to PDF converters for .NET.
- `/documentdesigner/`: a document designer, unlisted while it is being tried out (nothing links to it, it is not
  in the sitemap, and it sends `noindex`). Blocks for text, tables, images, invoices and page breaks are dragged onto
  a page-sized canvas ([GrapesJS](https://github.com/GrapesJS/grapesjs), BSD-3-Clause, served from `vendor/` so the
  CSP stays `'self'`); a Code tab shows the whole HTML document to edit by hand; and the PDF beside it is remade
  through `/api/convert` a moment after each change, one request at a time. `{{placeholders}}` and `data-repeat` are
  filled from sample JSON for the preview. The page size and margins are written into the HTML as an `@page` rule, so
  a downloaded template converts the same with `HtmlToPdf.Convert(html)`; the other `PdfOptions` (header and footer
  text, watermark, password, PDF/A, document properties) are in a PDF settings drawer that slides in from the right. The document is kept in the browser only.
- `/docs/`: the PdfPecker manual, one page per topic. The pages in `wwwroot/docs` are generated from the Markdown in
  `docs/` by `tools/DocsBuilder`, which renders it with PdfPecker's own Markdown converter. Edit the Markdown, then run
  `dotnet run --project tools/DocsBuilder` and commit both; CI fails when they are out of step. The same run writes
  `wwwroot/docs/search.json` (the index `docs-search.js` searches in the browser) and the whole manual as
  `wwwroot/docs/pdfpecker-docs.pdf`, made by PdfPecker with a table of contents. The PDF is not committed, because
  every PDF gets a random file ID; the Deploy workflow builds it before uploading the site. The docs describe the
  PdfPecker version the site uses, so update them together with its `PackageReference`.
  - Older manuals: the version picker opens the manual of any release. The latest is at `/docs/`, earlier ones at
    `/docs/v1.7.0/` and so on, built with the same templates from the Markdown kept in `docs/archive/<version>`
    (`docs/*.md` and a `pages.json` with that version's sidebar; 1.0.0 to 1.6.0 hold the library README of that
    release, which was the manual then, and are one page). Their PDFs are checked in under `wwwroot/docs/versions`,
    since they never change. Before bumping the `PackageReference`, run `dotnet run --project tools/DocsBuilder -- archive`
    and commit what it keeps; the builder refuses to build for the new version until the old manual is there. Old
    manuals are marked `noindex` and left out of the sitemap, so search engines send people to the latest.
  - What changed: end a heading in `docs/*.md` with `{new 1.8.0}` or `{changed 1.8.0}` (on the `#` title for a whole
    page). Marks for the version the site uses get a badge, a tag in the sidebar, a line under the page title and a
    place in the list on the docs home page, in the PDF too; older marks are hidden, so only what changed since the
    previous release is highlighted. Each archived manual shows the marks of its own version.

Both converter pages share `converter.js` and `examples.js`; `site.css` styles every page.

```
dotnet run -c Release        # then open the URL it prints
docker build -t pdfpecker-web . && docker run -p 8080:8080 --memory 2g pdfpecker-web
```

It also exposes the converter as an HTTP API:

```
curl -X POST "http://localhost:8080/api/convert?pageSize=Letter&pageNumbers=true" \
     -H "Content-Type: text/html" --data-binary @invoice.html -o invoice.pdf
```

Or upload a file as a form:

```
curl -X POST http://localhost:8080/api/convert -F "file=@invoice.html" -F pageSize=A4 -F pageNumbers=true -o invoice.pdf
```

`POST /api/pdf-to-image` turns a PDF into PNGs: one page with `?page=N` (or when the PDF has one page), otherwise a
zip with a PNG per page. With `format=tiff` it returns one TIFF with every page (or the page asked for), in the colour
mode `color` names (`color`, `grayscale` or `bw`). Options: `dpi` (10 to 300, default 150), `width`, `height` and
`password`.

```
curl -X POST "http://localhost:8080/api/pdf-to-image?page=1&dpi=200" --data-binary @report.pdf -o page1.png
curl -X POST http://localhost:8080/api/pdf-to-image -F "file=@report.pdf" -o pages.zip
curl -X POST "http://localhost:8080/api/pdf-to-image?format=tiff&color=bw&dpi=200" --data-binary @report.pdf -o report.tif
```

`POST /api/convert` also accepts JSON: `{ "html": "...", "pageSize": "A4", "landscape": false, "marginMm": 12.7, "pageNumbers": true }`.
Add `watermark` (text stamped on every page), `password` (AES-256, needed to open the PDF) or `pdfa: true` (PDF/A-2b) in
any of the three forms; send passwords in the form or JSON body rather than the query string, which servers tend to log.

The JSON form also takes an `options` object with the rest of `PdfOptions` that is safe to take from a visitor:
page size (or `pageWidthMm`/`pageHeightMm`), `landscape`, the four `margin*Mm`, `scale`, `shrinkToFit`, `headerText`, `footerText`,
`userStyleSheet`, `embedStandardFonts`, `watermark` (text or base64 image, font, colour, opacity, angle, ...),
`security` (passwords and `permissions` by name), `conformance`, `eInvoiceXml`, the document properties,
`customProperties`, `bookmarks`, `compress`, `compressionLevel` and `maxPages` (at most 1,000). Every value is checked
and anything out of range is refused with a 400. Fonts are always the standard ones: registered fonts, system fonts,
file access, resource loading and signatures cannot be turned on from a request, and the HTML never runs scripts or
reaches the network.

```
curl -X POST http://localhost:8080/api/convert -H "Content-Type: application/json" \
     -d '{"html":"<h1>Hi</h1>","options":{"pageSize":"Letter","footerText":"Page {page} of {pages}","watermark":{"text":"DRAFT"}}}' -o hi.pdf
```

Markdown works the same way. The input is read as Markdown when it is uploaded as a `.md`/`.markdown` file, sent as
`"markdown"` in JSON or as a `markdown` form field, posted with `Content-Type: text/markdown`, or marked with
`format=markdown`. Add `output=html` to get the HTML page instead of a PDF:

```
curl -X POST http://localhost:8080/api/convert -F "file=@README.md" -o README.pdf
curl -X POST http://localhost:8080/api/convert -F "file=@README.md" -F output=html -o README.html
curl -X POST http://localhost:8080/api/convert -H "Content-Type: application/json" -d '{"markdown":"# Hi","output":"html"}'
```

The site never reads files from the server, limits requests to 5 MB, 15 seconds, 1,000 pages and 120 conversions per
minute per IP address (per /64 network for IPv6), runs a few conversions at a time (answering 503 when busy or low on
memory), and stores nothing. Give the container a memory limit (`--memory 2g`): the number of simultaneous conversions
follows it, and a document that would need more is refused instead of affecting the host. Behind a reverse proxy or
CDN, set `TrustedProxies` to the proxy's addresses or networks (for example `-e TrustedProxies=10.0.0.0/8`) so the
rate limit applies to each visitor rather than to the proxy. The page sends a strict Content-Security-Policy (no inline
script) along with the usual security headers.

CI checks this on every pull request: `tools/check-api.sh` sends bad requests to the built Docker image and expects
a clear 4xx for each, the security headers and a working `/health` afterwards (run it locally against a running app
with `tools/check-api.sh http://localhost:8080`), and `.github/workflows/codeql.yml` scans the C# and the site's
JavaScript and TypeScript with CodeQL. The converters themselves are fuzzed in the PdfPecker repository.

## Requirements

.NET 10. The container needs about 2 GB (`--memory 2g`): it runs one conversion per 512 MB of its memory limit (up to
one per core) and refuses documents over 1,000 pages, so 2 GB lets four large documents convert at once.

## Hosting

pdfpecker.net runs on [Cloudflare Containers](https://developers.cloudflare.com/containers/). A small Worker
(`worker/index.ts`, configured in `wrangler.jsonc`) answers every request: Cloudflare serves the page from `wwwroot`
itself (with the headers in `wwwroot/_headers`), and everything else goes to one container built from the
`Dockerfile`. The container sleeps after 10 minutes without requests and starts again on the next one, so the page
loads at once and only the first conversion after a quiet spell waits for it.

- **Size:** Cloudflare has no 2 GB instance, so the container has 1 vCPU and 3 GiB with the .NET heap capped at 2 GB
  (`DOTNET_GCHeapHardLimit`), which gives the same limits as `--memory 2g`.
- **Visitor addresses:** the Worker sets `X-Forwarded-For` to the visitor's address and the container trusts it
  (`TrustedProxies`), so the rate limit applies per visitor. Nothing but the Worker can reach the container.
- **No internet:** the container cannot make outbound connections.
- **Deploys:** `.github/workflows/deploy.yml` deploys `main` after the Build workflow passes, using the repository
  secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Locally: `npm ci && npx wrangler deploy` (needs Docker).

## Updating PdfPecker

The site uses the published PdfPecker package, so it gets new library features when a new version is released on
nuget.org. Dependabot opens a pull request each week when there is one; or change the version in `PdfPecker.Web.csproj`.

## Builds

Every pull request and push to `main` builds the site and the Docker image and checks that the image starts and
serves the page. Publishing a GitHub release (tag `v1.2.3`) attaches the published site as a zip and the Docker image
as a `.docker.tar.gz` to the release.

The workflows cache `~/.nuget/packages`, and CI copies the restored packages into `nuget-seed/` before it builds the
Docker image, because the runner's Docker cache starts empty. That way a run does not download PdfPecker from
nuget.org again, which would count towards its public download number.

Dependabot's patch and minor updates merge themselves: `.github/workflows/dependabot-auto-merge.yml` turns on
auto-merge (squash) and GitHub merges once the required checks pass. Major updates and PdfPecker updates wait for a
person. This needs "Allow auto-merge" under Settings → General and a branch ruleset (or branch protection) on `main`
that requires the checks `build`, `worker`, `analyze (csharp, manual)` and
`analyze (javascript-typescript, none)` and no approving
review. A merge made this way does not start the Build workflow on `main` (GitHub does not start workflows for pushes
made with a workflow's token), so it reaches pdfpecker.net with the next deploy; run Deploy by hand to ship it sooner.

## License

[MIT](LICENSE)
