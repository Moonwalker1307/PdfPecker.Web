# Right-to-left text, CJK and hyphenation

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

## Chinese, Japanese and Korean line breaking {new 1.9.0}

Chinese and Japanese are written without spaces, so a line may break between almost any two characters. PdfPecker
finds those breaks with the Unicode Line Breaking Algorithm (UAX #14) and the Japanese kinsoku rules, as browsers do:
a line never starts with closing punctuation such as `。`, `、` or `」`, or with an iteration mark such as `々`, and never
ends with an opening bracket or quotation mark. Nothing is drawn at these breaks, and Latin words, numbers and emoji
sequences inside the text stay whole. Text in other scripts breaks at spaces and hyphens, as before. The standard and
bundled fonts have no CJK characters, so register a font that has them:

```csharp
var options = new PdfOptions();
options.Fonts.AddFile("fonts/NotoSansJP-Regular.ttf");
byte[] pdf = HtmlToPdf.Convert("""
    <html lang="ja"><body style="font-family: 'Noto Sans JP'; line-break: strict">
      <p>請求書は月末までにお支払いください。ご不明な点がございましたら、お気軽にお問い合わせください。</p>
    </body></html>
    """, options);
```

CSS `line-break` sets how strict the rules are, as in Chrome:

- `auto` (the default) and `strict` keep small kana (`ゃ`, `ッ`, ...) and the prolonged sound mark `ー` off the start of
  a line.
- `normal` lets small kana and `ー` start a line, and allows a break before the hyphens `‐`, `–`, `〜` and `゠`.
- `loose` also allows a break before an iteration mark or centred punctuation such as `・` and `：`, and on both sides of
  an ellipsis.
- `anywhere` breaks between any two characters and ignores the punctuation rules, in every script.

Korean text breaks between its syllables by default, as in Chrome. `word-break: keep-all` breaks CJK text only at
spaces and punctuation instead, which suits Korean, written with spaces between words. `word-break: break-all` and `white-space: nowrap` work as for
any other text. A justified line is stretched only at its spaces, so a Chinese or Japanese line without spaces is not
justified (see [Limitations](/docs/limitations/#text-and-fonts)).

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
