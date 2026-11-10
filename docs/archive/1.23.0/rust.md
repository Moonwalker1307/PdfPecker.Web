# Rust {new 1.23.0}

[pdfpecker](https://crates.io/crates/pdfpecker) on crates.io is PdfPecker for Rust: HTML and Markdown to PDF, and
PDFs to images, text and Markdown, with a safe Rust API and no runtime dependencies. It is the same library as the
NuGet package, compiled ahead of time into a native library, so there is no .NET to install and no browser.

```
cargo add pdfpecker
```

The crate version is the PdfPecker version it holds, so everything this manual says about HTML, CSS and paged media
applies to it. It needs Rust 1.85 or later on Linux (glibc 2.28 or later and musl, x86-64 and ARM64), macOS (Apple
Silicon and Intel) or Windows (x64 and ARM64).

## Converting

```rust
use pdfpecker::{ImageOptions, PageSize, PdfOptions, TextOptions};

let html = "<h1>Invoice 42</h1><p>Total: <b>1,250.00 EUR</b></p>";
let pdf = pdfpecker::html_to_pdf(html, &PdfOptions::new())?;

// Images and CSS load next to the file.
let invoice = pdfpecker::html_file_to_pdf("templates/invoice.html", &PdfOptions::new())?;
let letter = PdfOptions::new().page_size(PageSize::Letter);
let readme = pdfpecker::markdown_file_to_pdf("README.md", &letter)?;

// One PNG per page, or JPEG or WebP; the text has pages separated by \f.
let pngs = pdfpecker::pdf_to_images(&pdf, &ImageOptions::new().dpi(96.0))?;
let text = pdfpecker::pdf_to_text(&pdf, &TextOptions::new())?;
let both = pdfpecker::merge_pdfs(&[&invoice, &readme], &Default::default())?;
```

`PdfOptions` has the settings of [PdfOptions](/docs/options/) as chained methods: `page_size`, `landscape`, `margin`,
`header_text`, `footer_text`, `font`, `title`, `conformance` (PDF/A), `accessibility` (tagged PDF and PDF/UA),
`creation_date` for byte-identical output, and more. A document from a string loads no local files unless `base_dir`
names the folder its images, style sheets and fonts are in. The other functions are `pdf_to_text_pages`,
`pdf_to_markdown`, `pdf_to_pdfa`, `pdf_page_count`, `library_version` and `library_path`.

Every function returns `pdfpecker::Result`, whose error has an `ErrorKind` such as `Unreadable`, `Password`, `Limit`
or `Timeout`. The functions are safe to call from several threads at once and convert in parallel; they block, so
async code runs them with `tokio::task::spawn_blocking`. The [crate documentation](https://docs.rs/pdfpecker) lists
every function and option.

## Deploying

The build script downloads the target's native library from the pdfpecker wheel on PyPI, about 9 MB once, and checks it
against SHA-256 values the crate carries; `cargo run` and `cargo test` then find it on their own. To ship a program,
copy `pdfpecker_native.so` (`.dylib` on macOS, `.dll` on Windows) from `target/<profile>/build/pdfpecker-*/out/` next
to the executable. Offline builds set `PDFPECKER_LIB_DIR` to a folder that already holds the library.

On musl (Alpine), the program must be linked dynamically to load the library: build with
`RUSTFLAGS="-C target-feature=-crt-static"`.

## Speed

From Rust on a 4-core Linux cloud VM, median time per document after warm-up, against IronPress, a Rust HTML to PDF
crate, and Chrome driven by chromiumoxide. The Chrome score compares each engine's pages with what Chrome prints, over
54 test pages, where 1 is identical:

| | Invoice, 1 page | Report, 29 pages | New process, first PDF | Peak memory, one PDF | Chrome score |
|---|---:|---:|---:|---:|---:|
| **pdfpecker 1.23.0** | **0.72 ms** | **28 ms** | **22 ms** | **26 MB** | **0.95** |
| IronPress 1.7.0 | 41 ms | 1,873 ms | 185 ms | 40 MB | 0.47 |
| Chrome 153 via chromiumoxide 0.9 | 18 ms | 231 ms | 115 ms | 396 MB | 1 |

See [Compare](/compare/#rust) for more on the comparison.

## What to know

- There is no JavaScript: charts must be SVG or images, not scripts that draw them.
- Nothing loads from the network: images, style sheets and fonts come from `base_dir` or `data:` URIs.
- The built-in fonts cover Latin, Greek and Cyrillic. For other scripts, add a font that covers them with `font(...)`,
  or turn on `use_system_fonts`. See [Fonts](/docs/fonts/).
- The crate is built from [PdfPecker.Rust](https://github.com/Moonwalker1307/PdfPecker.Rust) after each PdfPecker
  release reaches PyPI.
