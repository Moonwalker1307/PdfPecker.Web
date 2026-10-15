# Fonts

Register TrueType or OpenType fonts and use them by name in CSS. Only the glyphs a document uses are embedded, and
text can use any Unicode character the fonts have (Greek, Cyrillic, Central European, CJK, ...):

```csharp
var options = new PdfOptions();
options.Fonts.AddFile("fonts/OpenSans-Regular.ttf")
             .AddFile("fonts/OpenSans-Bold.ttf");             // family, weight and style are read from the files
options.Fonts.Add(bytes, familyName: "sans-serif");           // or override a generic family
options.Fonts.AddDirectory(@"C:\Windows\Fonts");               // read once, loaded only when used
byte[] pdf = HtmlToPdf.Convert("<p style=\"font-family: 'Open Sans'\">Łódź, Ελλάδα, Москва</p>", options);
```

## @font-face

Documents can bring their own fonts with `@font-face` (files, `data:` URIs or `ResourceResolver` URLs; `local()`
refers to registered fonts):

```css
@font-face { font-family: Brand; src: url(fonts/brand.woff2) format("woff2"); font-weight: 400; }
@font-face { font-family: Brand; src: url(fonts/brand-bold.ttf); font-weight: 700; unicode-range: U+0000-024F; }
```

A `FontCollection` can be shared between options and parallel conversions. Formats: `.ttf`, `.otf`, `.ttc`
collections, WOFF and WOFF2 (including WOFF2 collections; decoded with .NET's built-in Brotli). Fonts are matched like browsers do: by family, then style, then the nearest
weight; a missing bold or italic face is synthesized. A character that the chosen font lacks is drawn with the next
font in the `font-family` list that has it, then the standard font, then any other registered font.

## Standard fonts

Text without a registered font uses the standard PDF fonts (Helvetica, Times, Courier), which viewers supply
themselves, so files stay small but are limited to Western European characters. Set `EmbedStandardFonts = true` to
embed the bundled Liberation fonts in their place instead: they have the same widths, so the layout does not change,
the text looks the same in every viewer, and any character they cover (Latin, Greek, Cyrillic, ...) works. PDF/A
always does this. It adds a subset of each font used to the file (typically 10-25 KB per font).

## Missing fonts and characters

A family that no font provides falls back silently, like in a browser. To notice, set `MissingFont`: it is called
once per conversion for each family that had to be substituted, and throwing from it fails the conversion. To use the
fonts installed on the machine for families you have not registered, set `UseSystemFonts = true` (off by default, so
the output does not depend on the machine):

```csharp
options.MissingFont = family => logger.LogWarning("Font {Family} is not available", family);
options.UseSystemFonts = true;   // looks in C:\Windows\Fonts, /Library/Fonts, /usr/share/fonts, ...
```

Likewise, a character that no font has is drawn as an empty box (blank space in PDF/A). `MissingCharacter` is called
once for each such character before anything is written, so a test can make sure a template's fonts cover its data:

```csharp
options.MissingCharacter = ch => throw new InvalidOperationException($"No font has U+{char.ConvertToUtf32(ch, 0):X4}");
```

## How fonts are embedded

Registered and `@font-face` TrueType/OpenType fonts are embedded as subsets (Type0/CIDFontType2 for
TrueType outlines, CIDFontType0 with an OpenType program for CFF outlines) with a ToUnicode map, so text can be
searched and copied. Without them, the PDF standard fonts are used: `font-family` maps to Helvetica (sans-serif,
Arial, Verdana, ...), Times (serif, Georgia, ...) or Courier (monospace, Consolas, ...), each in regular, bold,
italic and bold italic. With `EmbedStandardFonts` or PDF/A, these are replaced by embedded subsets of the bundled,
metric-compatible Liberation Sans, Serif and Mono.
