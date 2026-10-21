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

## Indic, Thai and Lao scripts {new 1.12.0}

Devanagari, Bengali, Gurmukhi, Gujarati, Oriya, Tamil, Telugu, Kannada and Malayalam are shaped as HarfBuzz shapes
them, from a port of its Indic shaper: conjuncts and half forms join, reph moves above its cluster and pre-base vowel
signs are drawn before their consonant. Thai and Lao vowels and tone marks stack correctly, and combining marks in
Latin, Greek and Cyrillic text are placed on their letters, or replaced by the font's precomposed letter. Register a
font that has the script, such as one of the Noto fonts:

```csharp
var options = new PdfOptions();
options.Fonts.AddFile("fonts/NotoSansDevanagari-Regular.ttf");
byte[] pdf = HtmlToPdf.Convert("<p lang='hi' style=\"font-family: 'Noto Sans Devanagari'\">कुल राशि: ₹1,250</p>", options);
```

Khmer, Myanmar, Sinhala, Tibetan, Mongolian, Javanese, Adlam and Syriac are not shaped yet (see
[Limitations](/docs/limitations/#text-and-fonts)).

## Chinese, Japanese and Korean line breaking {changed 1.17.0}

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
any other text. A justified Chinese or Japanese line is spread between its characters and punctuation, as in Chrome,
and `text-justify` chooses where the space goes (see
[Text wrapping and justification](/docs/html-and-css/#text-wrapping-and-justification)).

## CJK punctuation trimming {new 1.17.0}

Fullwidth CJK punctuation such as `（`, `」` and `。` is drawn with blank space on one side. `text-spacing-trim` trims
that blank half where it would look too wide, as Chrome does. The default, `normal`, trims it where two punctuation
marks meet (`）。`, `：「`, `。」`), and a closing bracket or quote at the end of a line also loses its blank half when
that lets it fit. `space-first` also trims the opening bracket that starts each wrapped line, `trim-start` the one that
starts any line, and `space-all` turns trimming off and keeps the spacing of PdfPecker 1.16 and earlier.

Trimming needs a font with the OpenType `halt` feature, which Noto Sans CJK, Source Han and most Chinese and Japanese
fonts have. The font decides whether dots, colons and quotes count as opening or closing (Simplified Chinese fonts draw
`，。：` on the left, Traditional Chinese ones centre them), and `font-feature-settings` that set punctuation widths
themselves (`palt`, `halt`, `pwid` and the like) turn trimming off, as in Chrome.

## Hyphenation {changed 1.14.1}

`hyphens: auto` hyphenates words with the TeX hyphenation patterns (Liang's algorithm) of the text's language: the
nearest `lang` attribute, else `PdfOptions.Language`. As in Chrome, a word is hyphenated only where it does not fit on
its line, and a hyphen (or the `hyphenate-character`) is shown at the break. Words shorter than five letters, words with
digits or other non-letters inside, URLs and e-mail addresses, and capitalized English words are not hyphenated, and a
word with `&shy;` breaks only there. French and Italian also hyphenate words with an elided article or pronoun, such as
*l'ordinateur* in French or *l'informazione* in Italian, with a straight or typographic apostrophe.

`hyphenate-limit-chars` sets the shortest word that is hyphenated and the fewest letters before and after a hyphen: up
to three values, each `auto` or a whole number, such as `hyphenate-limit-chars: 8 3 3`. One value sets only the word
length; with two, the letters after a hyphen are the same as before it. It is inherited, so it can be set on the whole
document or on a single element. `auto` keeps the defaults above: words of at least five letters, and the patterns' own
minimums around a hyphen (two letters before and three after in English, as in Chrome). Larger values make hyphenation
more selective; smaller values do not go below the patterns' own minimums, as in Chrome.

Patterns for these languages are built in and loaded on first use, for every tag of the language (`fr-CA`, `pt-BR`,
`es-MX` and so on):

| Language | Tags |
| --- | --- |
| English (US patterns) | `en` |
| Danish | `da` |
| German (reformed spelling) | `de` |
| Dutch | `nl` |
| Norwegian | `nb`, `nn`, `no` |
| Swedish | `sv` |
| Spanish | `es` |
| French | `fr` |
| Italian | `it` |
| Portuguese | `pt` |
| Polish | `pl` |

Others can be supplied as TeX pattern files, such as those of the
[hyph-utf8](https://github.com/hyphenation/tex-hyphen) project:

```csharp
var options = new PdfOptions
{
    // Your own patterns for a language (they take precedence over the built-in ones).
    Hyphenation = new Dictionary<string, HyphenationPatterns>
    {
        ["fi"] = new HyphenationPatterns(File.ReadAllText("hyph-fi.tex"), leftMin: 2, rightMin: 2),
    },
};
byte[] pdf = HtmlToPdf.Convert("""
    <html lang="da"><body style="hyphens: auto; text-align: justify">
      <p>Arbejdsmarkedsbidraget betales af lønmodtageren.</p>
      <p lang="fi">Tavutus omilla tavutussäännöillä.</p>
    </body></html>
    """, options);
```
