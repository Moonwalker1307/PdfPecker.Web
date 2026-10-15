# Accessibility: tagged PDF and PDF/UA

```csharp
var options = new PdfOptions
{
    Accessibility = PdfAccessibility.PdfUA1,   // or PdfUA2, or Tagged: the same structure without the PDF/UA claim
    Language = "da",                           // default: <html lang="...">; for PDF/UA without either, "en"
    Conformance = PdfConformance.PdfA2b,       // optional: PDF/UA-1 combines with PDF/A-2 and 3, PDF/UA-2 with PDF/A-4
};
```

## Tagged PDF

`Tagged` gives the PDF a structure tree built from the HTML, so screen readers, reflow and text extraction follow the
document rather than the page layout: headings (`H1` to `H6`), paragraphs, lists with their labels, tables with header
scopes and spans, figures with their alt text, links (tied to their clickable areas), block quotes, code and sections,
all in document order, with `lang` attributes as the language of the element. Text outside a paragraph (straight in a
`div`, say) gets one. Backgrounds, borders, running headers and footers, `HeaderText`/`FooterText`, watermarks, repeated
table headers, fixed boxes and decorative images are artifacts that assistive technology skips.

## PDF/UA-1

`PdfUA1` adds what ISO 14289-1 asks beyond the tags: every font embedded (the bundled Liberation fonts stand in for the
standard ones), the title shown in the viewer's title bar and the PDF/UA identification in the XMP metadata. The output
passes veraPDF's PDF/UA-1 checks, on its own and together with PDF/A-2b or PDF/A-3b (e-invoices included). It needs a
title: `Title`, the `<title>` element or else the first heading; without one, conversion throws `ArgumentException`, as
it does when `Security` leaves out `PdfPermissions.ExtractForAccessibility`.

## PDF/UA-2

`PdfUA2` (ISO 14289-2:2024) is the PDF 2.0 successor: the file is written as PDF 2.0, its tags are in the PDF 2.0
structure namespace (block quotes, quotes and code, which PDF 2.0 dropped, keep their PDF 1.7 type and are role mapped
to `Div` and `Span`), links and bookmarks go to structure destinations (the element they point at, not only its page),
lists state their numbering and form fields describe themselves, and the XMP says `pdfuaid:part` 2 with `pdfuaid:rev`
2024. It has the same title and language requirements as `PdfUA1` and passes veraPDF's PDF/UA-2 checks, on its own and
with `PdfA4`. PDF/UA-1 and PDF/A-2 and 3 are based on PDF 1.7, PDF/UA-2 and PDF/A-4 on PDF 2.0, so `PdfUA2` with
`PdfA2b` (or any PDF/A-2 or 3 level) and `PdfUA1` with `PdfA4` throw `ArgumentException`.

## What your HTML needs

What the tags can't fix is up to the HTML: give images an `alt` (an image without `alt`, `aria-label` or `title`, or an
`<svg>` without a `<title>`, counts as decorative), use real headings, lists and `th` cells, and mark purely visual
content `aria-hidden="true"`. Heading levels that skip one (`h1` then `h3`) are tagged one level below the previous
heading, as PDF/UA does not allow gaps.
