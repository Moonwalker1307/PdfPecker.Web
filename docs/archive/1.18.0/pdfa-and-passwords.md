# PDF/A, passwords and watermarks

## Watermarks and passwords {changed 1.8.0}

```csharp
var options = new PdfOptions
{
    // A diagonal stamp on every page. Also: Image (PNG, JPEG, GIF, WebP, BMP, TIFF or SVG bytes; SVG stays vector), FontSize, LetterSpacing, Angle, Opacity, Bold, Behind.
    Watermark = new PdfWatermark { Text = "WATERMARK", Color = "#c00000", Opacity = 0.25f },

    // AES-256 encryption (PDF 2.0 / Acrobat X and later). Without an OwnerPassword a random one is used,
    // so the permissions cannot be lifted.
    Security = new PdfSecurity
    {
        UserPassword = "1234",                                   // needed to open the file; null = opens freely
        OwnerPassword = "owner-secret",                          // full access
        Permissions = PdfPermissions.Print | PdfPermissions.Copy,
    },
};
```

## PDF/A {changed 1.7.0}

For archiving, set `Conformance = PdfConformance.PdfA2b` (or another level below): the PDF gets XMP metadata, an sRGB
output intent and a file ID, and CMYK JPEGs are converted to RGB. All fonts are embedded: text without a registered font
uses the bundled Liberation fonts (see [Fonts](/docs/fonts/)). PDF/A does not allow encryption, so combining `Conformance` with
`Security` throws an `ArgumentException`.

```csharp
var options = new PdfOptions { Conformance = PdfConformance.PdfA4 };
```

| Level | Standard | File | Use it for |
|---|---|---|---|
| `PdfA2b`, `PdfA3b` | ISO 19005-2/-3, level B | PDF 1.7 | the usual archive format; part 3 also allows attachments (e-invoices) |
| `PdfA2u`, `PdfA3u` | ISO 19005-2/-3, level U | PDF 1.7 | as level B, plus a Unicode mapping for every character, so text can be searched and copied |
| `PdfA4` | ISO 19005-4:2020 | PDF 2.0 | the current part; identified in the XMP only (`pdfaid:rev` 2020, no conformance letter), no document information dictionary |
| `PdfA4f` | ISO 19005-4:2020, with files | PDF 2.0 | PDF/A-4 with attachments: only with `EInvoice` (it throws without one) |

Every font is embedded with a ToUnicode map, and a character no font has is left out as blank space rather than drawn as
`.notdef` (in SVG text too), so levels U cost nothing over B. A PDF 2.0 file keeps the title, author, keywords and custom
properties in its XMP metadata, since PDF 2.0 deprecates the information dictionary. Every level, on its own and with
PDF/UA, passes veraPDF 1.28 (flavours 2b, 2u, 3b, 3u, 4 and 4f) on documents with text, tables, lists, images, links,
form fields, SVG and Markdown. AES-256 keys come from a password hash that is slow on purpose, which adds
about 3 ms to a conversion.

## Passwords on existing PDFs {new 1.7.0}

To add, change or remove the password of a PDF you already have (from any producer, not only PdfPecker), use
`PdfProtector`:

```csharp
// Encrypt any PDF with AES-256
byte[] locked = PdfProtector.Encrypt(pdf, new PdfSecurity { UserPassword = "1234", Permissions = PdfPermissions.Print });

// Change the passwords or permissions of an encrypted PDF (give its current user or owner password)
byte[] relocked = PdfProtector.Encrypt(locked, new PdfSecurity { UserPassword = "5678" }, password: "1234");

// Remove the encryption, and with it the permission restrictions
byte[] open = PdfProtector.Decrypt(locked, "1234");

// Stream overloads, and a check
PdfProtector.Encrypt(inputStream, outputStream, security);
bool encrypted = PdfProtector.IsEncrypted(pdf);
```

Encrypted inputs can use RC4 (40 to 128 bit), AES-128 or AES-256; the output of `Encrypt` is always AES-256. Like
other PDF tools, `PdfProtector` accepts the user password as well as the owner password (or none, for a file that only
restricts permissions), so anyone who can open a document can also lift its permissions. A wrong password throws
`PdfPasswordException`. The document is rewritten as a whole and keeps its pages, bookmarks, links, form fields and
values, tags, metadata, page labels and attachments; earlier revisions from incremental updates are dropped. Signed
PDFs are refused with an `ArgumentException` (rewriting them would break the signatures; sign after encrypting
instead), as is encrypting a PDF/A file, or a PDF/UA file without `PdfPermissions.ExtractForAccessibility`.
`Decrypt` returns a PDF that is not encrypted unchanged.

`Watermark` applies while converting HTML; to stamp a PDF you already have, see [Stamping PDFs](/docs/stamping/).
