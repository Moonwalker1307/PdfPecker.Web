# Stamping PDFs

`PdfStamper` puts a page of one PDF on top of the pages of another, such as a "PAID" or "COPY" stamp, or underneath
them, such as company letterhead. Any PDF can be stamped, not only those PdfPecker made:

```csharp
// A one-page stamp PDF, fitted and centred on every page, half transparent.
byte[] paid = PdfStamper.Stamp(invoicePdf, paidStampPdf, new PdfStampOptions { Opacity = 0.5f });

// Letterhead under the content: the stamp's first page on page 1, its second page on all the others.
byte[] letter = PdfStamper.Stamp(letterPdf, letterheadPdf, new PdfStampOptions { Underlay = true, MatchPages = true });

// Actual size in the top right corner, 20 pt in from each edge, on the first page only.
byte[] copy = PdfStamper.Stamp(pdf, copyStampPdf, new PdfStampOptions
{
    Position = PdfStampPosition.TopRight, Scale = 1, OffsetX = -20, OffsetY = 20, Pages = i => i == 0,
});

// The stamp as HTML, rendered at each page's size with no margins.
byte[] stamped = PdfStamper.StampHtml(pdf,
    "<div style='position:absolute; right:30pt; top:30pt; border:3pt solid #c00; color:#c00; font:bold 28pt sans-serif'>PAID</div>");

PdfStamper.StampFile("in.pdf", "stamp.pdf", "out.pdf");
PdfStamper.Stamp(inputStream, stampStream, outputStream);
```

## Placement

`StampPage` picks the stamp PDF's page (0-based), `Pages` the pages to stamp (by 0-based index), `Scale` the size (0,
the default, fits the stamp page on the page keeping its aspect ratio; 1 is its own size), and `Position`, `OffsetX`
(right) and `OffsetY` (down) where it goes. The stamp is placed as the page is displayed, so it is upright on rotated
pages and sits in the crop box. The stamp page is copied in once as a form XObject, so its text stays text and its
graphics stay sharp, however many pages show it. The page's own content is wrapped so a graphics state it leaves
behind cannot shift or recolour an overlay. Underlays are hidden by pages that paint an opaque background, and
annotations (links, form fields) are always drawn above the page content, overlays included.

## What is kept

Everything else in the document is kept: annotations, form fields and their values, bookmarks, named destinations,
attachments, metadata, page labels and the structure tree of a tagged PDF, in which the stamp is marked as an
artifact (a PDF/UA-1 document stamped this way still passes veraPDF, as does a PDF/A-2b one when the stamp has embedded
fonts). The stamp page's own annotations, form fields and tags are not copied. The result is written out in full, not
as an incremental update. A signed PDF is refused with `InvalidOperationException`, since stamping would break the
signatures; set `InvalidateSignatures = true` to stamp it anyway, or stamp before signing. Encrypted inputs open with
`Password` (and `StampPassword` for the stamp); the result is not encrypted unless `Security` is set. Both inputs are
handled as untrusted, like merge inputs: damaged files are repaired where possible, decoding is limited, and an
unreadable file or one without pages throws `InvalidDataException`.
