# Compacting PDFs {new 1.15.0}

`PdfCompactor` makes an existing PDF smaller, any PDF, not only those PdfPecker made. By default nothing visible
changes: the pages, bookmarks, links, forms, tags, attachments and PDF/A and PDF/UA conformance are kept, and every
image keeps its exact pixels.

```csharp
// Lossless: the same pages, in fewer bytes.
byte[] smaller = PdfCompactor.Compact(File.ReadAllBytes("merged.pdf"));

// Smaller still: images above 150 dpi downsampled, and photos recompressed as JPEG at quality 75.
byte[] smallest = PdfCompactor.Compact(pdf, new PdfCompactOptions { MaxImageDpi = 150, ImageQuality = 75 });

// Streams in and out; nothing is written when the input cannot be compacted.
PdfCompactor.Compact(inputStream, outputStream);
```

## What it does

The document is written out again with only the objects its pages and catalog still use, so earlier revisions kept by
incremental updates and orphaned objects go. Identical objects are stored once, such as the same font or image embedded
many times, which merging documents often leaves behind. Streams with lossless filters are recompressed at the
strongest Flate level, with PNG predictors for images, whenever that is smaller; JPEG, JPEG 2000, JBIG2 and CCITT
images keep their data. Objects are written in minimal syntax and packed into compressed object streams.

The result depends only on the input and the options, so the same PDF always gives the same bytes. When rewriting does
not make the file smaller, the input comes back unchanged.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `ImageQuality` | null | Re-encodes 8-bit greyscale and RGB images as JPEG at this quality (1 to 100) where that makes them smaller. 75 to 85 suits most documents. This is lossy, also for images that were not JPEGs, such as screenshots and logos. |
| `MaxImageDpi` | null | Downsamples 8-bit greyscale and RGB images drawn at a higher resolution than this, judged by the largest size each image is drawn at on any page. A downsampled JPEG is re-encoded as JPEG (at `ImageQuality`, or 85); other images stay lossless unless `ImageQuality` is set. 150 suits the screen, 300 print. |
| `RemoveMetadata` | false | Removes the document information (title, author, dates) and XMP metadata. They are kept when the PDF claims PDF/A or PDF/UA, which require them. |
| `RemoveApplicationData` | true | Removes page thumbnails, which viewers draw themselves, and the private data editing applications keep in the file (`/PieceInfo`, such as Illustrator's editable copy), which no viewer shows. |
| `UseObjectStreams` | true | Packs objects into compressed object streams with a cross-reference stream (PDF 1.5, which every current reader supports). Turn it off for readers from before 2003. PDF/A-1 files never use them, as PDF/A-1 does not allow them. |

An overload takes a `CancellationToken`, which stops the work between objects.

## Signed and encrypted PDFs

Digitally signed PDFs are refused with `ArgumentException`, because rewriting them breaks the signatures. Compact
before signing instead. Encrypted PDFs are refused too, since a rewrite would drop their protection: decrypt with
`PdfProtector.Decrypt`, compact, and encrypt the result again with `PdfProtector.Encrypt` (see
[PDF/A, passwords and watermarks](/docs/pdfa-and-passwords/)). A file that is not a readable PDF throws
`InvalidDataException`.
