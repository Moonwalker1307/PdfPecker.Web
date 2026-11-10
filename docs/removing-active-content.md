# Removing active content {changed 1.24.0}

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

## What it removes {changed 1.24.0}

- JavaScript: document, page, field and link scripts.
- Actions that launch programs, open other files (including links to a network share), submit or import form data,
  or play media, and the additional actions that run when a page or field is opened or changed.
- XFA forms, and media and 3D annotations.
- Links to anything but absolute `http`, `https`, `mailto` and `tel` addresses: `javascript:`, `file:` and `data:`
  addresses, network paths and `smb:` addresses (which can send the reader's Windows credentials to the named server),
  protocol handlers such as `search-ms:` and `ms-msdt:`, and relative addresses, which the document's base address
  could turn into any of these.
- With `RemoveAttachments`, the document's attachments, its associated files and file attachment annotations. This
  also removes the XML of an e-invoice (ZUGFeRD, Factur-X).

Pages, text, images, bookmarks, links within the document, web and e-mail links, and form fields with their values
stay.

## The output {changed 1.24.0}

The document is written out again with only what its catalog still uses, so earlier revisions and unused objects go
too, and the same input always gives the same bytes. A PDF without active content comes back as a copy, unless its cross-reference table was damaged and had to be
rebuilt: a viewer repairs such a file its own way and might find what PdfPecker did not, so it is written out again
from what PdfPecker read and checked. Digital
signatures no longer verify after sanitizing, since the signed bytes change.

Encrypted PDFs are refused with an `ArgumentException`: decrypt them with `PdfProtector.Decrypt`, sanitize, and
encrypt the result again (see [PDF/A, passwords and watermarks](/docs/pdfa-and-passwords/)). `HasActiveContent` takes
a password for encrypted PDFs. There is also an overload with a `CancellationToken`, and one that reads from a stream
and writes to another. The input is treated as untrusted.
