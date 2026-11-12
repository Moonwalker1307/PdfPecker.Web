# Command line {changed 1.24.0}

PdfPecker.Cli is the `pdfpecker` dotnet tool: HTML and Markdown to PDF, and the everyday jobs on existing PDFs, from a
terminal, a script or a build pipeline. It is a thin layer over the library, so it needs no browser, no JavaScript
engine and no native binaries, and it never fetches anything over the network.

```
dotnet tool install -g PdfPecker.Cli
pdfpecker convert invoice.html            # writes invoice.pdf
pdfpecker watch invoice.html              # converts again on every save
pdfpecker merge a.pdf b.pdf:1-3 -o all.pdf
```

`pdfpecker help` lists the commands and `pdfpecker help <command>` gives the options of one. The tool is released with
every PdfPecker release under the same version, and carries the library inside it, so it has no dependencies.

## Native executable {new 1.24.0}

A .NET 10 or 11 SDK installs the tool as a Native AOT executable from a package for its platform (`PdfPecker.Cli.linux-x64`,
`win-arm64`, `osx-arm64`, ...: Linux x64 and Arm64 with glibc or musl, macOS and Windows on x64 and Arm64). It starts a
command in a few milliseconds, where the framework-dependent tool spends about a third of a second starting the
runtime and compiling: the sample invoice converts in 17 ms instead of 355 ms. On other platforms a .NET 10 or 11 SDK
installs `PdfPecker.Cli.any`, the framework-dependent tool, and .NET 8 and 9 SDKs install the framework-dependent tool
as before. The commands and their output are the same in every case. On Windows the SDK starts the native tool through
a `pdfpecker.cmd` file, which Command Prompt and PowerShell run as `pdfpecker`; Git Bash needs the full name,
`pdfpecker.cmd`.

## Commands

| Command | What it does |
| --- | --- |
| `convert` | HTML or Markdown file (or `-` for standard input) to PDF |
| `watch` | `convert`, again each time the file, its folder or the style sheet changes |
| `merge`, `split`, `extract`, `remove`, `rotate` | Join, cut, keep, drop and turn pages |
| `stamp` | Lay a PDF or an HTML page over or under every page |
| `compact`, `linearize`, `sanitize` | Smaller files, Fast Web View, no scripts or launch actions |
| `sign`, `verify`, `encrypt`, `decrypt` | PAdES signatures, AES-256 passwords |
| `to-image`, `to-html`, `text`, `info` | PNG, JPEG, WebP or TIFF, one HTML file, plain text, a summary |

`-` stands for standard input or output, so PDFs can be piped from one command to the next. Progress and errors go to
standard error. The exit code is 0 on success, 1 when the work failed (a damaged file, a wrong password, an invalid
signature) and 2 when the command line is wrong. A command that takes several inputs needs an output ending in
`.pdf`, so a mistyped call cannot overwrite one of the source documents.

### Local files and passwords {new 1.24.0}

A document reads local files (images, style sheets) only from its own folder, unless `--enable-local-file-access` is
given. HTML or Markdown piped in on standard input has no folder, so it reads local files only from a `--base-dir` it
is given: `pdfpecker convert - --base-dir .` keeps relative images working. Every password option has an `-env` form
(`--user-password-env`, `--owner-password-env`, `--password-env`, `--cert-password-env`, `--stamp-password-env`) that
reads it from an environment variable, where other users of the machine cannot see it in the process list.

With several inputs, `convert` merges them into one PDF and then applies what belongs to the whole file: the title,
author and creation date, PDF/A, Fast Web View and encryption. `[page]` and `[topage]` in the header and footer texts
count the whole output, as in wkhtmltopdf, and `[sitepage]` and `[sitepages]` each input's own pages.

`watch` is meant for designing a template: keep the PDF open in a viewer that reloads it, and every save of the HTML
or its style sheet shows up there.

## Replacing wkhtmltopdf

A call without a command word is read like wkhtmltopdf's, with its 10 mm default margins, so scripts written for
wkhtmltopdf keep working:

```
pdfpecker -s A4 -O Landscape -T 15mm --footer-center "Page [page] of [topage]" in.html out.pdf
```

The page size and orientation, margins, `--title`, `--zoom`, `--disable-smart-shrinking`, `--user-style-sheet`,
`--no-outline`, `--no-pdf-compression`, `--enable-local-file-access`, `-q` and the `--header-left/-center/-right` and
`--footer-left/-center/-right` texts (with `[page]`, `[topage]`, `[date]`, `[time]` and `[title]`) work as they do
there; the header and footer texts become [margin boxes](/docs/paged-media/). Options that exist only because
wkhtmltopdf runs a browser (`--javascript-delay`, `--cookie`, `--header-html`, `--grayscale`, ...) are accepted and
ignored with a warning, so a script keeps running. Web addresses are refused: save the page to a file first. The
[wkhtmltopdf page](/docs/wkhtmltopdf-alternative/) covers moving the HTML itself.

## Signing

```
export PDFPECKER_CERT_PASSWORD=...
pdfpecker sign contract.pdf signed.pdf --cert me.pfx --reason "I approve" --page 1 --rect 36,36,200,60
pdfpecker verify signed.pdf --trusted-root ca.cer
```

Passwords given on the command line are visible to other users of the machine; prefer the `-env` options and
`PDFPECKER_CERT_PASSWORD`. [Digital signatures](/docs/signatures/) has what the signatures contain.
