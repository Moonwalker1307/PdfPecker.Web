# Redaction {new 1.24.0}

`PdfRedactor` removes what the pages of any PDF draw in given areas, from the file itself rather than only from sight,
and then draws a box over each area. Text in an area leaves the content streams, so neither text extraction nor copying
finds it, the pixels of images under an area are overwritten, and shapes, links and form fields in an area go.

```csharp
// Every personal ID number, wherever it appears.
byte[] redacted = PdfRedactor.RedactText(File.ReadAllBytes("contract.pdf"), new Regex(@"\b\d{6}-\d{4}\b"));

// A phrase, compared without regard to case.
byte[] noName = PdfRedactor.RedactText(pdf, "Example Customer Ltd.", comparison: StringComparison.OrdinalIgnoreCase);

// An area of a page, in points from its top-left corner, with no box drawn over it.
byte[] cut = PdfRedactor.Redact(pdf, new[] { new PdfRedactionArea(pageNumber: 1, x: 72, y: 100, width: 200, height: 40) },
                                new PdfRedactOptions { FillColor = null });
```

## Reviewing before redacting

`FindText` returns the areas `RedactText` would remove, one per word, so they can be checked or shown first. Each line
is searched as its words separated by single spaces, so a phrase matches across words but not across lines, and a match
inside a word (an account number in "No.12345") takes the whole word. `PdfRedactionArea.Of` makes an area from a word
that [text extraction](/docs/text-extraction/) found, in the same coordinates.

```csharp
IReadOnlyList<PdfRedactionArea> found = PdfRedactor.FindText(pdf, new Regex(@"IBAN \w+"));
byte[] result = PdfRedactor.Redact(pdf, found.Where(a => a.PageNumber > 1));
```

## What is removed

- A glyph goes when an area covers a fifth or more of its width and height. The text around it keeps its place.
- A shape goes when it lies wholly inside an area. A shape that only crosses one, such as a table border, stays and is
  covered by the box.
- An image partly under an area is written again with its pixels there painted over, and one wholly under an area is
  removed. The originals of redacted images leave the file unless a page still shows them elsewhere.
- Links, form fields and other annotations that touch an area go.
- Forms (XObjects) drawn on several pages are redacted in a copy, so the other pages do not change.
- Replacement and alternative texts (`/ActualText`, `/Alt`) that held removed text are removed, so they cannot name
  what was there, and redacted pages lose their thumbnail.

The document is written out again with only what its catalog still uses, so earlier revisions, where an incremental
update could keep the old page, and unused objects are gone, and the same input always gives the same bytes. Digital
signatures no longer verify.

Text the document keeps elsewhere, such as its title and metadata, bookmarks and attachments, is not looked at:
[remove active content](/docs/removing-active-content/) and attachments separately. Encrypted PDFs are refused with an
`ArgumentException`: decrypt them with `PdfProtector.Decrypt`, redact, and encrypt the result again. There are
overloads that read from a stream and write to another, and every call takes a `CancellationToken`. The input is
treated as untrusted.
