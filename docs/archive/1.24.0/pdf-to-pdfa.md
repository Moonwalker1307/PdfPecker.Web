# PDF to PDF/A {new 1.23.0}

`PdfToPdfA` turns a PDF you already have, made by any tool, into PDF/A-2 or PDF/A-3 for long-term archiving. It fixes
what it can, keeps the pages as they are (text stays text, nothing is rasterized), and tells you what it changed and
what it could not fix. To make new documents as PDF/A, set `Conformance` instead (see
[PDF/A, passwords and watermarks](/docs/pdfa-and-passwords/)).

```csharp
var result = PdfToPdfA.Convert(File.ReadAllBytes("received.pdf"));
File.WriteAllBytes("archived.pdf", result.Pdf);

// What still breaks the PDF/A rules, one sentence each; empty when IsConformant is true.
if (!result.IsConformant)
    foreach (var problem in result.Problems) Console.WriteLine(problem);

// What the conversion changed, one sentence each, such as "Embedded 7 fonts that were not
// embedded, with glyphs from PdfPecker's bundled fonts at the document's widths (...)."
foreach (var change in result.Changes) Console.WriteLine(change);

// Another level, from one stream to another, with a cancellation token.
var options = new PdfAConversionOptions { Conformance = PdfConformance.PdfA3u };
PdfToPdfA.Convert(input, output, options, cancellationToken);
```

| Level | Use it for |
|---|---|
| `PdfA2b` (the default) | the usual archive format |
| `PdfA2u` | as 2b, plus the Unicode text of every character, so the text can be searched and copied |
| `PdfA3b`, `PdfA3u` | as 2b and 2u, keeping every attachment |

## What it fixes

- **Fonts.** Fonts that are not embedded get glyphs from PdfPecker's bundled Liberation and DejaVu fonts at the
  document's own character widths, so the text keeps its place. Embedded TrueType fonts whose glyphs, widths or
  character maps disagree with the PDF are rewritten so that viewers keep drawing the glyphs they drew, and CFF fonts
  stored as TrueType move to where PDF/A expects them. Text drawn with a font the page does not define gets Helvetica,
  which Chrome draws it with. Level U adds the Unicode text of every character it can work out.
- **Colour.** An sRGB output intent is added. CMYK and grey colours get ICC profiles that keep the colours viewers
  showed, and spot colours get the colorant entries PDF/A requires.
- **Metadata.** XMP metadata with the document's properties and the PDF/A identification.
- **Active content.** JavaScript and the other actions PDF/A forbids, XFA forms, and the annotation types it forbids,
  such as sound, movie and 3D, are removed.
- **Annotations and forms.** Every annotation is set to print and gets an appearance of its own: drawn for highlights,
  notes, shapes and ink, empty for the rest. A form that asks viewers to draw its fields gets them drawn by PdfPecker's
  form filler.
- **Attachments.** PDF/A-3 keeps every attachment and gives it a MIME type and its relationship to the document.
  PDF/A-2 allows only PDF/A files as attachments, so attached PDFs are converted to PDF/A-2b too (two levels deep) and
  other files are removed.
- **The rest.** Transfer functions, alternate images, external streams, operators PDF does not define, numbers PDF/A
  does not allow, layer settings, page boxes and other details PDF/A is strict about.

A change that alters how the document looks or behaves, such as a removed script or attachment, says so in its sentence.

## What it cannot fix

The conversion checks the file it wrote against the same rules, so `Problems` lists only what is still wrong. The PDF
claims the PDF/A level asked for even then, so check `IsConformant` before you archive it as PDF/A. These are reported
and not fixed:

- Text in a font that is not embedded and whose glyphs the bundled fonts do not have: Chinese, Japanese and Korean
  fonts, and Symbol or Dingbats fonts used for Latin letters.
- At level U, characters whose Unicode cannot be worked out, such as those of Type 1 subsets with glyph names like
  `g123`. Level B accepts them.
- A file without pages.

A validator such as veraPDF gives the final word. In PdfPecker's CI, veraPDF 1.28 checks the converted output of PDFs
from Chrome, LibreOffice, Ghostscript, ReportLab, cairo, qpdf and PdfPecker itself at all four levels.

## Encrypted and signed PDFs

PDF/A forbids encryption, so an encrypted PDF throws `ArgumentException`: decrypt it with `PdfProtector.Decrypt` first.
A signed PDF throws too, since converting it would break its signatures; convert first, then
[sign](/docs/signatures/) the PDF/A file. A file that is not a readable PDF throws `InvalidDataException`.

The input is treated as untrusted: decoding is bounded by the file's size, and the overloads with a `CancellationToken`
stop between objects. The same input always gives the same bytes. The conversion makes PDF/A-2 and PDF/A-3 at levels B
and U; it does not make PDF/A-1, PDF/A-4 or level A.
