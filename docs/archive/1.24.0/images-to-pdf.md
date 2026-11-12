# Images to PDF {new 1.13.0}

`ImageToPdf` puts images into a PDF, one per page, such as scanned receipts, photos or drawings for an archive. It
reads PNG, JPEG, GIF, WebP, BMP and TIFF (the first frame of an animated GIF or a multi-page TIFF).

```csharp
// Each page the size of its image
byte[] pdf = ImageToPdf.Convert(new[] { File.ReadAllBytes("scan-1.jpg"), File.ReadAllBytes("scan-2.png") });

// Files in, file out
ImageToPdf.ConvertFiles(new[] { "receipt-1.jpg", "receipt-2.jpg" }, "receipts.pdf");

// A4 pages with margins, each image centred and scaled down to fit, as PDF/A for archiving
byte[] archive = ImageToPdf.Convert(scans,
    new PdfOptions { PageSize = PageSize.A4, Conformance = PdfConformance.PdfA2b, Title = "Receipts 2026" },
    new ImageToPdfOptions { FitPageToImage = false });
```

## Page size

By default every page is exactly the size of its image, with no margins. `ImageToPdfOptions.Dpi` (default 96, one
image pixel per CSS pixel) sets the printed size: a scan 2,480 pixels wide at 300 dpi becomes an A4-wide page.

With `FitPageToImage = false` every page has the `PdfOptions` page size and margins. Each image is centred, and scaled
down to fit when it is larger than the space inside the margins; smaller images keep their size.

## Output settings

The `PdfOptions` work as for [HTML to PDF](/docs/options/): metadata, [PDF/A, passwords and
watermarks](/docs/pdfa-and-passwords/), and a fixed `CreationDate` for byte-identical output. JPEG images
are embedded as they are, without re-encoding.

## Errors

An empty list or more than `ImageToPdf.MaxImages` (10,000) images throws `ArgumentException`, as does a `Dpi` that is
not a positive number. An image that is not in a supported format or is damaged throws `InvalidDataException` naming
its position ("Image 2 ..."), and more images than `PdfOptions.MaxPages` throws `PdfLimitException`. An overload takes
a cancellation token.
