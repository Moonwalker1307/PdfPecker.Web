# AGENTS.md

Guidance for coding agents (and people) working in this repository. `CLAUDE.md` imports this file, so Claude Code and
other agents read the same rules.

PdfPecker.Web is the website and HTTP API at [pdfpecker.net](https://pdfpecker.net): a small ASP.NET Core app with
static pages in `wwwroot`, the PdfPecker manual generated from `docs/*.md`, and a Cloudflare Worker in front. It uses
the published [PdfPecker](https://www.nuget.org/packages/PdfPecker) NuGet package; the library itself lives in
[Moonwalker1307/PdfPecker](https://github.com/Moonwalker1307/PdfPecker).

## Read first

Before non-trivial work, read:

- `README.md` – the pages, the HTTP API and its limits, the docs build and versioned manuals, hosting on Cloudflare,
  updating PdfPecker and the builds. This repository keeps all of that in the README rather than in separate BUILD,
  TESTING, CONFIG and RELEASING files; the sections to read for each are named in "Build and verify" below.
- The library's `AGENTS.md`, when the work describes what PdfPecker does: the manual must match the library version
  in `PdfPecker.Web.csproj`, not the library's `main`.

## Core rules

- **The site runs the released package.** Library features reach the site only after a NuGet release and a
  `PackageReference` bump, in `PdfPecker.Web.csproj` and `tools/DocsBuilder/DocsBuilder.csproj` together. Never point
  the site at unreleased library code, and never document a feature the referenced version does not have.
- **Generated docs are checked in.** Edit `docs/*.md`, run `dotnet run --project tools/DocsBuilder`, and commit the
  Markdown with the regenerated `wwwroot/docs`. CI fails when they are out of step.
- **The API stays a safe public service.** Keep the request limits (5 MB, 15 seconds, 1,000 pages, 120 conversions a
  minute per address), the memory-based concurrency, `TrustedProxies` handling, no server-side file reads, and storing
  nothing. A new option exposed to visitors must be safe for untrusted input.
- **Strict Content-Security-Policy.** No inline script and no third-party scripts, fonts or trackers. The headers in
  `Program.cs` and `wwwroot/_headers` must stay in step.
- **Never name a user's private application or employer** in code, pages, docs, commits or PR descriptions, and never
  put benchmark numbers from a user's own production app on the site.

## Repo map

- `Program.cs` – the whole web app: `/api/convert`, `/api/pdf-to-image`, `/health`, rate limiting, concurrency and
  security headers.
- `wwwroot/` – the static site Cloudflare serves as it is: `index.html` and `home.js` (home), `html-to-pdf/` and
  `markdown/` (converters, sharing `converter.js` and `examples.js`), `md-editor.js` and `md-tools.js` (Markdown
  editor), `compare/`, `nav.js`, `site.css`, `_headers`, `sitemap.xml`, `robots.txt`, logos and icons.
- `docs/*.md` – the manual's source, one page per topic, plus `docs/changelog.md`. `docs/archive/<version>` holds
  earlier manuals.
- `wwwroot/docs/` – generated pages, search index and archived PDFs. Don't hand-edit.
- `tools/DocsBuilder/` – turns the Markdown into `wwwroot/docs` with PdfPecker's own Markdown converter; its page list
  and sidebar are in `Program.cs`.
- `worker/index.ts`, `wrangler.jsonc`, `Dockerfile` – Cloudflare Worker and container.
- `.github/workflows/build.yml` (build, docs check, Docker smoke test, Worker check, release assets) and `deploy.yml`
  (deploys `main` after Build passes). `.github/dependabot.yml` proposes package bumps weekly.

## Build and verify

```
dotnet run -c Release                                   # the site and API locally
dotnet run --project tools/DocsBuilder                  # regenerate wwwroot/docs after editing docs/*.md
docker build -t pdfpecker-web . && docker run -p 8080:8080 --memory 2g pdfpecker-web
```

- Build: the README's opening section and "Requirements" (.NET 10, about 2 GB for the container).
- Testing: there is no unit test project. CI is the check: it builds, verifies `wwwroot/docs` is current, builds the
  Docker image and requests the main pages from it. For page changes, look at them in a browser at desktop width and
  at 360 px.
- Config: the README's API section (`TrustedProxies`, limits) and "Hosting" (container size, the 2 GB heap cap,
  Worker, secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`).
- Releasing: the README's "Updating PdfPecker" and "Builds". A push to `main` deploys to pdfpecker.net, so merging is
  releasing.

## Change-specific guidance

- **New PdfPecker release** (one PR): wait until nuget.org lists the version; run
  `dotnet run --project tools/DocsBuilder -- archive` before the bump (the builder refuses the new version until the
  old manual is kept); bump both `PackageReference` lines; mark changed docs headings with `{new X.Y.Z}` or
  `{changed X.Y.Z}`; add a section to `docs/changelog.md`; then check the limitations page, home page cards, the
  compare page and the converter settings panel for what the release changes.
- **New docs page**: add it to the page list in `tools/DocsBuilder/Program.cs` and to `wwwroot/sitemap.xml`.
- **Converter options**: a new `PdfOptions` setting in the settings panel needs the form field and `csharp()` in
  `converter.js`, its handling in `BuildOptions` in `Program.cs`, and a line in the README's API section.
- **Security headers or CSP**: change `Program.cs` and `wwwroot/_headers` together.
- **Benchmark figures and comparison claims**: ask the user before changing numbers; they come from measured runs.
- **Hosting**: `wrangler.jsonc`, the Worker and the `Dockerfile` change how the live site runs; describe the effect in
  the PR.

## Avoid

- Hand-editing `wwwroot/docs`, or committing `wwwroot/docs/pdfpecker-docs.pdf` (its file ID is random each build).
- Bumping PdfPecker without archiving the previous manual first.
- Inline `<script>`, `on*=` attributes, `eval`, or scripts and fonts from other origins.
- Server-side storage, logging of submitted documents, or reading files from the server's disk.
- Loosening the request, page, time or rate limits to make something work.
- Red as a badge colour for docs changes: New is green and Changed is amber; red reads as an error.
- Describing Chrome's or paper's normal behaviour as a PdfPecker limitation.

## Working mindset

- The site is the library's shop window: keep wording accurate to the released version, short and plain.
- Every page must work on a phone. Check 360 px wide, not just desktop.
- Prefer the smallest change; `Program.cs` and the shared scripts serve every page, so check all pages they touch.
- Merging deploys. Treat `main` as production.

## Commit guidance

- Branch from the latest `origin/main`, one branch per piece of work.
- Name the branch after the work it carries, in lowercase words joined by hyphens, with a `claude/` prefix when an
  agent creates it (e.g. `claude/barcode-qr-codes`). Never use a generic or generated name such as
  `claude/project-thread-xxxx`, even when a tool suggests one, and never reuse a name, even one whose pull request is
  merged. Don't rename a branch that already has an open pull request.
- Commit subjects are short imperative or descriptive sentences without prefixes, e.g. "Site and docs on PdfPecker
  1.11.0".
- Commit the regenerated `wwwroot/docs` in the same commit as the Markdown that caused it.
- Say in the PR which pages change and how they look; screenshots help for layout changes.

## Wisdom

- nuget.org lists a new version in the registration API some minutes before its flat container serves it; a restore
  right after publishing can still fail.
- Old manuals are `noindex` and left out of the sitemap so search engines send people to the latest.
- Only the marks for the version the site uses get badges; older marks are hidden, so each release's PR adds its own.
- The container sleeps after 10 minutes without requests; only the first conversion after a quiet spell is slow.
