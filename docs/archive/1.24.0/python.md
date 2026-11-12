# Python {new 1.23.0}

[pdfpecker](https://pypi.org/project/pdfpecker/) on PyPI is PdfPecker for Python: HTML and Markdown to PDF, and PDFs
to images, text and Markdown, from a `pip install`. It is the same library as the NuGet package, compiled ahead of
time into a native library inside the wheel, so there is no .NET to install, no browser and no Python dependencies.

```
pip install pdfpecker
```

The package version is the PdfPecker version it holds, so everything this manual says about HTML, CSS and paged media
applies to it. Wheels cover Linux (glibc 2.28 or later and musl, x86-64 and ARM64), macOS (Apple Silicon and Intel)
and Windows (x64 and ARM64), on Python 3.9 and later.

## Converting

```python
import pdfpecker

pdf = pdfpecker.html_to_pdf("<h1>Invoice 42</h1><p>Total: <b>1,250.00 EUR</b></p>")
pdfpecker.html_file_to_pdf("templates/invoice.html", "invoice.pdf")   # images and CSS load next to the file
pdfpecker.markdown_file_to_pdf("README.md", "readme.pdf")

pngs = pdfpecker.pdf_to_images(pdf, dpi=96)    # one PNG per page, or format="jpeg" or "webp"
text = pdfpecker.pdf_to_text(pdf)              # the text in reading order, pages separated by \f
both = pdfpecker.merge_pdfs([pdf, "terms.pdf"])
```

The HTML and Markdown functions take keyword options that match [PdfOptions](/docs/options/): `page_size`,
`landscape`, `margin`, `header_text`, `footer_text`, `fonts`, `title`, `conformance` (PDF/A), `accessibility`
(tagged PDF and PDF/UA), `creation_date` for byte-identical output, and more. A document from a string loads no local
files unless `base_dir` names the folder its images, style sheets and fonts are in. The other functions are
`pdf_to_text_pages`, `pdf_to_markdown`, `pdf_to_pdfa`, `pdf_page_count` and `library_version`.

Every function takes bytes or a path for PDFs and raises a subclass of `PdfPeckerError` when the work fails. The calls
are thread-safe and release the GIL while they work, so threads convert in parallel. The
[package README](https://pypi.org/project/pdfpecker/) lists every function, option and error.

## MCP server

The package includes a [Model Context Protocol](https://modelcontextprotocol.io/) server, so chat apps and coding
agents can make PDFs, look at their pages and read them. It runs over stdio and needs nothing but the package. In
Claude Code:

```
claude mcp add pdfpecker -- uvx pdfpecker mcp
```

For Claude Desktop and other apps with an `mcpServers` setting:

```json
{ "mcpServers": { "pdfpecker": { "command": "uvx", "args": ["pdfpecker", "mcp", "--root", "/Users/me/Documents/pdfs"] } } }
```

The tools convert HTML and Markdown to PDF files, render pages to PNG for the model to look at, read text and
Markdown, convert to PDF/A and merge files. They read and write only inside the `--root` folders, because the model
picks the paths. The server is listed in the [MCP Registry](https://registry.modelcontextprotocol.io/) as
`io.github.Moonwalker1307/pdfpecker`.

## Agent skill

The [PdfPecker Skills](https://github.com/Moonwalker1307/PdfPecker.Skills) repository holds an Agent Skill that teaches
an agent to write HTML with print CSS, convert it with pdfpecker, look at the pages and fix them, with an invoice and
a report template. In Claude Code, add the marketplace and install the plugin:

```
/plugin marketplace add Moonwalker1307/PdfPecker.Skills
/plugin install pdfpecker@pdfpecker-skills
```

The repository's README covers Claude.ai, the Claude API and other agents that read skill folders.

## What to know

- There is no JavaScript: charts must be SVG or images, not scripts that draw them.
- Nothing loads from the network: images, style sheets and fonts come from `base_dir` or `data:` URIs.
- The built-in fonts cover Latin, Greek and Cyrillic. For Chinese, Japanese, Arabic, Hebrew, Hindi or Thai, pass
  `fonts=[...]` with a font that covers the script, or `use_system_fonts=True`. See [Fonts](/docs/fonts/).
- The package is built from [PdfPecker.Python](https://github.com/Moonwalker1307/PdfPecker.Python) after each
  PdfPecker release on NuGet, so a new version reaches PyPI shortly after.
