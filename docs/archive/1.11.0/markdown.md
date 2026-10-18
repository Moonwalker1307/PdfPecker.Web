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
see `MarkdownToHtml.DefaultStyleSheet`) or sets the title (default: the first heading). `MarkdownToPdf` takes
`PdfOptions` and `MarkdownOptions` side by side.

## What is supported

[CommonMark 0.31](https://spec.commonmark.org/0.31.2/) (651 of the 652 spec examples pass; the one
miss is an exotic HTML5 entity name) plus the GitHub Flavored Markdown extensions: tables with column alignment,
`~~strikethrough~~`, task list items (`- [x]`) and bare `www.`/`https://`/e-mail autolinks. Headings get GitHub-style
ids, so `[see below](#heading-text)` links work in the PDF too. The parser runs in linear time on hostile input
(deep nesting, unclosed brackets, long delimiter runs). See [Limitations](/docs/limitations/) for what is not supported.
