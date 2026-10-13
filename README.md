# PdfPecker.Web

<p align="center"><img src="wwwroot/logo.png" alt="PdfPecker" width="320"></p>

The website and HTTP API behind [pdfpecker.net](https://pdfpecker.net): a small ASP.NET Core site built on the
[PdfPecker](https://www.nuget.org/packages/PdfPecker) NuGet package
([source](https://github.com/Moonwalker1307/PdfPecker)) for converting HTML and Markdown in the browser:
paste or open an `.html` or `.md` file (or drag one onto the page), pick page size, orientation, margins and page numbers, and preview or
download the PDF. Markdown can also be converted to HTML.

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
zip with a PNG per page. Options: `dpi` (10 to 300, default 150), `width`, `height` and `password`.

```
curl -X POST "http://localhost:8080/api/pdf-to-image?page=1&dpi=200" --data-binary @report.pdf -o page1.png
curl -X POST http://localhost:8080/api/pdf-to-image -F "file=@report.pdf" -o pages.zip
```

`POST /api/convert` also accepts JSON: `{ "html": "...", "pageSize": "A4", "landscape": false, "marginMm": 12.7, "pageNumbers": true }`.
Add `watermark` (text stamped on every page), `password` (AES-256, needed to open the PDF) or `pdfa: true` (PDF/A-2b) in
any of the three forms; send passwords in the form or JSON body rather than the query string, which servers tend to log.

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

## License

[MIT](LICENSE)
