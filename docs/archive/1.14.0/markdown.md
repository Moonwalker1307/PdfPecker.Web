# Markdown

Markdown goes to PDF through the same engine as HTML: it is turned into HTML with a GitHub-like stylesheet first,
so everything on [HTML and CSS support](/docs/html-and-css/) applies to it. You can also stop at the HTML.

```csharp
// Markdown to PDF, styled like a GitHub README
byte[] pdf = MarkdownToPdf.Convert(File.ReadAllText("README.md"));

// File to file; relative image paths resolve against the Markdown file's folder
MarkdownToPdf.ConvertFile("README.md", "README.pdf", new PdfOptions { FooterText = "Page {page} of {pages}" });

// Markdown to HTML: a body fragment, or a complete page with the stylesheet
string fragment = MarkdownToHtml.Convert("# Hello\n\n*World*");     // <h1 id="hello">Hello</h1>\n<p><em>World</em></p>
string page = MarkdownToHtml.ConvertDocument(markdown);
MarkdownToHtml.ConvertFile("README.md", "README.html");
```

`MarkdownOptions` switches the GitHub extensions off for strict CommonMark (`GitHubExtensions = false`), drops heading
ids (`HeadingIds = false`), shows raw HTML as text (`AllowRawHtml = false`), replaces the stylesheet (`StyleSheet`,
see `MarkdownToHtml.DefaultStyleSheet`) or sets the title (default: the front matter's `title`, else the first heading). `MarkdownToPdf` takes
`PdfOptions` and `MarkdownOptions` side by side.

## What is supported {changed 1.14.0}

[CommonMark 0.31](https://spec.commonmark.org/0.31.2/) (651 of the 652 spec examples pass; the one
miss is an exotic HTML5 entity name) plus the GitHub Flavored Markdown extensions: tables with column alignment,
`~~strikethrough~~`, task list items (`- [x]`) and bare `www.`/`https://`/e-mail autolinks, along with footnotes,
definition lists and YAML front matter (see [below](#footnotes-definition-lists-and-front-matter)). Headings get GitHub-style
ids, so `[see below](#heading-text)` links work in the PDF too. The parser runs in linear time on hostile input
(deep nesting, unclosed brackets, long delimiter runs). See [Limitations](/docs/limitations/) for what is not supported.

## Footnotes, definition lists and front matter {new 1.14.0}

Footnotes use GitHub's syntax and are numbered in the order they are first referenced. `MarkdownToPdf` puts each note
at the bottom of the page that references it, with the CSS `float: footnote` engine, so this also works with your own
`StyleSheet`; `MarkdownToHtml` lists the notes at the end with links back to the text, as GitHub does.

```markdown
PdfPecker has no dependencies.[^bcl]

[^bcl]: Only the .NET base class library.
```

A definition list is a term on its own line followed by one or more lines starting with `: `, as in PHP Markdown Extra
and markdown-it. Front matter between `---` lines at the very start of the file is not shown; its `title` becomes the
document's title (the PDF title, and `<title>` in HTML) unless `MarkdownOptions.Title` is set.

```markdown
---
title: Release notes
---

Subset
: Only the glyphs a document uses are embedded.
```

All three are GitHub extensions, so `GitHubExtensions = false` turns them off along with tables and strikethrough.
