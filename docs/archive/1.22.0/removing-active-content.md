# Removing active content {new 1.22.0}

PdfPecker never runs the scripts in a PDF, but whoever opens the PDF next might. When you merge, stamp, compact or
pass on PDFs that come from others, `PdfSanitizer` takes out what a viewer could run, and keeps what people read.

```csharp
// Strip JavaScript and other active content from a PDF someone sent you.
byte[] safe = PdfSanitizer.RemoveActiveContent(File.ReadAllBytes("received.pdf"));

// Attachments too: a viewer may open them, and an attachment can be a program.
byte[] safer = PdfSanitizer.RemoveActiveContent(pdf, new PdfSanitizeOptions { RemoveAttachments = true });

// Only ask.
bool risky = PdfSanitizer.HasActiveContent(pdf);
```

## What it removes

- JavaScript: document, page, field and link scripts.
- Actions that launch programs, open other files (including links to a network share), submit or import form data,
  or play media, and the additional actions that run when a page or field is opened or changed.
- XFA forms, and media and 3D annotations.
- Links with `javascript:`, `vbscript:`, `data:` or `file:` addresses.
- With `RemoveAttachments`, the document's attachments, its associated files and file attachment annotations. This
  also removes the XML of an e-invoice (ZUGFeRD, Factur-X).

Pages, text, images, bookmarks, links within the document, web and e-mail links, and form fields with their values
stay.

## The output

The document is written out again with only what its catalog still uses, so earlier revisions and unused objects go
too, and the same input always gives the same bytes. A PDF without active content comes back as a copy. Digital
signatures no longer verify after sanitizing, since the signed bytes change.

Encrypted PDFs are refused with an `ArgumentException`: decrypt them with `PdfProtector.Decrypt`, sanitize, and
encrypt the result again (see [PDF/A, passwords and watermarks](/docs/pdfa-and-passwords/)). `HasActiveContent` takes
a password for encrypted PDFs. There is also an overload with a `CancellationToken`, and one that reads from a stream
and writes to another. The input is treated as untrusted.
