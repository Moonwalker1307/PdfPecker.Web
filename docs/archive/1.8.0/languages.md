# Right-to-left text and hyphenation

## Right-to-left text: Arabic and Hebrew {changed 1.7.0}

Arabic and Hebrew are laid out right to left and shaped like browsers do, with PdfPecker's own implementation of the
Unicode Bidirectional Algorithm (UAX #9, passing all of Unicode's conformance tests) and of OpenType shaping (GSUB and
GPOS, following HarfBuzz). Arabic letters join, lam-alef and other ligatures form, and harakat and Hebrew points are
placed on their letters by the font's mark positioning. Mixed text (an English product name or a number inside an
Arabic sentence) is put in the right order, and brackets are mirrored. Register a font that has the script, then set
the direction with the `dir` attribute or CSS `direction`:

```csharp
var options = new PdfOptions();
options.Fonts.AddFile("fonts/NotoNaskhArabic-Regular.ttf");
byte[] pdf = HtmlToPdf.Convert("""
    <html dir="rtl" lang="ar"><body style="font-family: 'Noto Naskh Arabic'">
      <h1>فاتورة رقم ٢٠٢٦/١٥</h1>
      <p>المبلغ الإجمالي: 1,250.00 DKK</p>
    </body></html>
    """, options);
```

In a right-to-left block, text aligns right (`text-align: start`), and table columns, flex rows, grid columns and list
markers run from the right. `dir="auto"`, `<bdi>` and `<bdo>` work as in browsers, and so do `unicode-bidi`,
`text-align: start`/`end` and the logical margin and padding properties (`margin-inline-start`, `padding-inline-end`,
...). `text-overflow: ellipsis` and `line-clamp` cut right-to-left lines at their left end. SVG `<text>` is reordered
and shaped too, with `direction` deciding which way a text chunk runs from its `x`. Copied or extracted text gives back
the original characters in logical order. A font without OpenType Arabic
features is shaped with the Unicode presentation forms instead.

## Hyphenation {new 1.7.0}

`hyphens: auto` hyphenates words with the TeX hyphenation patterns (Liang's algorithm) of the text's language: the
nearest `lang` attribute, else `PdfOptions.Language`. As in Chrome, a word is hyphenated only where it does not fit on
its line, and a hyphen (or the `hyphenate-character`) is shown at the break. Words shorter than five letters, words with
digits or other non-letters inside, URLs and e-mail addresses, and capitalized English words are not hyphenated, and a
word with `&shy;` breaks only there. Patterns for English (US patterns for every `en` tag), Danish, German, Dutch and
Norwegian (`nb`, `nn`, `no`) are built in and loaded on first use; others can be supplied as TeX pattern files, such as
those of the [hyph-utf8](https://github.com/hyphenation/tex-hyphen) project:

```csharp
var options = new PdfOptions
{
    // Your own patterns for a language (they take precedence over the built-in ones).
    Hyphenation = new Dictionary<string, HyphenationPatterns>
    {
        ["sv"] = new HyphenationPatterns(File.ReadAllText("hyph-sv.tex"), leftMin: 2, rightMin: 2),
    },
};
byte[] pdf = HtmlToPdf.Convert("""
    <html lang="da"><body style="hyphens: auto; text-align: justify">
      <p>Arbejdsmarkedsbidraget betales af lønmodtageren.</p>
      <p lang="sv">Avstavning med egna mönster.</p>
    </body></html>
    """, options);
```
