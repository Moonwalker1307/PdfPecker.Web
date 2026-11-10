# PDF to Markdown {new 1.23.0}

`PdfToMarkdown` turns any PDF into GitHub Flavored Markdown: headings, paragraphs, bulleted and numbered lists, bold
and italic text, links and pipe tables. It works for PDFs from any tool, not only those PdfPecker makes, and is
meant for search indexes, language models and anything else that reads text.

```csharp
// The whole document as one Markdown string.
string markdown = PdfToMarkdown.Convert(File.ReadAllBytes("statement.pdf"));

// Mark where each page starts, so a passage can be traced back to its page.
string withPages = PdfToMarkdown.Convert(pdf, new PdfMarkdownOptions { IncludePageComments = true });

// File to file, or into a stream.
PdfToMarkdown.ConvertFile("report.pdf", "report.md");
```

## What it finds

The structure is the same one the [structured PDF to HTML](/docs/pdf-to-html/#structured-html) finds. A tagged PDF,
such as one written for PDF/UA, is read from its structure tree, and other PDFs from their layout: headings from
larger or bolder text, lists from their bullets and numbers, and tables from the borders and rules the PDF draws and
from text that lines up in columns.

- Several header rows of a table are joined column by column, and a spanned cell's text is in its first row and
  column.
- Line breaks the PDF made on purpose, such as in an address, stay as line breaks.
- Text that would read as Markdown, such as a leading `#` or `*`, is escaped, so the output reads back as the same
  text.

## Options

| `PdfMarkdownOptions` | Default | What it does |
|---|---|---|
| `Pages` | every page | The pages to convert, such as `PdfPageRange.Parse("1-3")` |
| `Password` | none | The user or owner password of an encrypted PDF |
| `IncludeLinks` | true | Text that links to a web or e-mail address becomes a Markdown link |
| `RenderAnnotations` | true | The text of annotations, such as form field values, is included |
| `IncludeImages` | false | Pictures, such as a logo, as `data:` images where they sit in the text |
| `IncludePageComments` | false | Each page starts with `<!-- page 3 -->` |
| `MaxPages` | 10,000 | More pages throw `PdfLimitException` |
| `MaxDegreeOfParallelism` | processor count | Pages converted at the same time |

Pictures in table cells, pictures that fill most of a page and pictures too small to see are left out even with
`IncludeImages`. Many Markdown viewers do not show `data:` images, and they make the text much longer, so they are off
by default.

## What it is not

It reads the text a PDF holds; a scanned page without a text layer gives no text, since PdfPecker does no OCR. The
order and structure are a reading of the page, so an unusual layout can come out in another order than a person would
read it.
