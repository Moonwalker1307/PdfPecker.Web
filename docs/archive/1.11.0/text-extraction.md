# Text extraction {new 1.9.0}

`PdfText` extracts the text of any PDF, not only those PdfPecker made, in reading order: as one string, or page by page
with every line and word and where it is on the page. It reads what the PDF draws, using PdfPecker's own PDF parser and
font engines, so it needs no other package either.

```csharp
// All the text, pages separated by a form feed (\f) as pdftotext does.
string text = PdfText.Extract(pdfBytes);
string report = PdfText.ExtractFile("report.pdf");

// Some pages of an encrypted PDF.
string summary = PdfText.Extract(pdfBytes, new PdfTextOptions { Password = "pw", Pages = PdfPageRange.Parse("1-3") });

// Lines and words with their positions, such as for finding a total on an invoice.
foreach (PdfTextPage page in PdfText.ExtractPages(pdfBytes))
    foreach (PdfTextLine line in page.Lines)
        if (line.Text.StartsWith("Total"))
            Console.WriteLine($"Page {page.PageNumber}, {line.Y:F0} pt from the top: {line.Words[^1].Text}");

PdfTextPage first = PdfText.ExtractPage(pdfBytes, 1);
```

`Extract`, `ExtractPages` and `ExtractPage` also take a `Stream`, and `ExtractPagesFromFile` reads the pages of a file.

## Pages, lines and words

`PdfTextPage.Text` is the page's text, with lines separated by a line feed and paragraphs by an empty line. Its
`Lines` go from top to bottom, and each `PdfTextLine` has its `Text`, its `Words` in reading order and a bounding box
(`X`, `Y`, `Width`, `Height`). Each `PdfTextWord` has its `Text`, its box, its `FontSize` and its `FontName` (such as
`Helvetica-Bold`). Positions are in points from the top-left corner of the page as it is displayed, after its rotation,
with y growing downward, like the [signature box](/docs/signatures/) and the [stamp offsets](/docs/stamping/). Boxes span
the font's usual ascent and descent, so they are close to, not exactly, the inked area. Text that runs up or down the
page gets its own lines, with their `Angle`.

## What is read

The characters come from the fonts' ToUnicode maps, encodings and glyph names, for the standard fonts and for embedded
TrueType, CFF, Type 1 and Type 3 fonts, and `/ActualText` in marked content stands for the glyphs it covers. Where a
PDF draws no space between words but leaves a gap, the gap becomes a space; kerning and letter spacing do not. Ligatures
such as `ﬁ` come out as their letters unless `ExpandLigatures` is false. Right-to-left text such as Arabic and Hebrew
comes out in logical order, and `PdfTextLine.RightToLeft` says when most of a line is. Invisible text, such as the
recognised text layer of a scanned page, is included, and text hidden by optional content (a layer that is off) is not.
The values shown in form fields and the text of stamps are included unless `IncludeAnnotations` is false.

Pages are read in parallel (`MaxDegreeOfParallelism`, default one per processor), `MaxPages` (default 100,000) limits
the work, and inputs are handled as untrusted, as with [merging](/docs/merging/). A damaged file or page throws
`InvalidDataException`, a wrong password `PdfPasswordException`.

Columns side by side are read across, line by line, not one column after the other, and table cells on one row make
one line. Text drawn only as outlines or images has no characters to extract; a scanned page needs OCR first. See
[Limitations](/docs/limitations/#reading-and-changing-existing-pdfs).
