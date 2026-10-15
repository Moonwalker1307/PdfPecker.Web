# PDF to image

`PdfToImage` and `PdfRenderer` render PDF pages to PNG, JPEG or WebP (or raw RGBA pixels). This works for any PDF,
not only PdfPecker's own output, and also uses no third-party packages: the PDF parser, font engines, JPEG and fax
decoders, rasterizer and the PNG, JPEG and WebP encoders are all part of the library.

```csharp
// Every page as PNG bytes (rendered in parallel), or one page (0-based index)
byte[][] pages = PdfToImage.Convert(pdfBytes, new ImageOptions { Dpi = 150 });
byte[] first = PdfToImage.ConvertPage(pdfBytes, 0);

// report.pdf -> out/report-1.png, out/report-2.png, ...
PdfToImage.ConvertFile("report.pdf", "out");

// JPEG or lossless WebP: report.pdf -> out/report-1.jpg, ... (or .webp)
PdfToImage.ConvertFile("report.pdf", "out", new ImageOptions { Format = PdfImageFormat.Jpeg, Quality = 90 });
byte[][] webps = PdfToImage.Convert(pdfBytes, new ImageOptions { Format = PdfImageFormat.WebP });

// Open once, render many pages; RenderedImage also exposes the RGBA pixels
var renderer = PdfRenderer.Open(pdfBytes, password: null);
RenderedImage image = renderer.RenderPage(2, new ImageOptions { Width = 800 });
image.SavePng("page3.png");
File.WriteAllBytes("page3.jpg", image.ToJpeg(quality: 85));
File.WriteAllBytes("page3.webp", image.ToWebP());
```

## Output formats

Output formats (`ImageOptions.Format`, default `Png`; `RenderedImage.Encode()`/`Save()` use it too):

- **PNG**: lossless, RGB for opaque pages and RGBA otherwise.
- **JPEG**: baseline JFIF with the standard (IJG) quantisation tables scaled by `Quality` (1 to 100, default 85) and
  Huffman tables optimised per image. Below quality 90 colour is subsampled 4:2:0; from 90 it keeps full resolution
  (4:4:4), which keeps coloured text sharp. JPEG has no transparency, so a `Transparent` render is flattened onto
  `BackgroundColor` (white by default). At quality 90 a 150 DPI text page decodes at about 45 dB PSNR.
- **WebP**: always lossless (VP8L), alpha included, decoding to exactly the PNG's pixels and usually 50% to 70%
  smaller. Pages with up to 256 colours use a palette (packed 2, 4 or 8 pixels per byte when small); others use
  subtract-green and per-tile prediction, then LZ77, a colour cache and canonical prefix codes. Here `Quality` is the
  compression effort: higher spends more time searching for a smaller file and never changes a pixel. Lossy WebP is
  not written. WebP is limited to 16,384 pixels per side (JPEG to 65,535); larger images throw `NotSupportedException`.

## Options

`ImageOptions` sets `Dpi` (default 150) or a target `Width`/`Height` in pixels, `BackgroundColor` or `Transparent`,
`RenderAnnotations`, `Password`, `MaxDegreeOfParallelism`, `PngCompression`, `Format` and `Quality` (an
`ArgumentOutOfRangeException` outside 1 to 100). A `PdfRenderer` is thread-safe and
shares decoded fonts and images between pages. Encrypted files open with the user or owner password
(`PdfPasswordException` otherwise); unreadable files throw `InvalidDataException`, as does a page that needs more than
20 million drawing operations (nested forms can multiply a few bytes into billions). Pass a cancellation token to
bound the time a page may take.

## What the renderer supports


- **Files**: cross-reference tables and streams, object streams, incremental updates, damaged files (rebuilt by
  scanning), RC4 and AES-128/256 encryption, all standard filters (Flate, LZW, ASCII85, ASCIIHex, RunLength, predictors).
- **Graphics**: paths, fills (non-zero and even-odd), strokes with joins, caps and dashes, clipping, anti-aliasing,
  all blend modes, constant alpha, soft masks, transparency groups, axial, radial, function and mesh shadings
  (types 1 to 7), tiling patterns, form XObjects, optional content (layers) and annotation appearances.
- **Text**: embedded TrueType, OpenType, CFF and Type 1 fonts, Type 3 fonts, CID fonts with CMaps, vertical text,
  all text rendering modes. The 14 standard fonts and non-embedded fonts are drawn with built-in Liberation and
  DejaVu-derived faces stretched to the document's widths.
- **Images**: every bit depth and colour space (Gray, RGB, CMYK, Lab, ICC-based, Indexed, Separation, DeviceN),
  baseline and progressive JPEG, JPEG 2000 (`JPXDecode`, including embedded alpha), JBIG2 (generic, text, symbol,
  refinement and halftone regions, with `JBIG2Globals`), CCITT fax, stencil masks, colour-key masks and soft masks.

For what the renderer does not support yet, see [Limitations](/docs/limitations/).
