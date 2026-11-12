# How it works

The source paths below are in the [PdfPecker repository](https://github.com/Moonwalker1307/PdfPecker) under `src/PdfPecker/`.

Markdown is first turned into HTML: `Markdown/BlockParser` finds the block structure line by line, following the
CommonMark reference algorithm, `Markdown/InlineParser` handles emphasis (delimiter stack) and links (bracket stack),
and `Markdown/HtmlRenderer` writes the HTML, which then takes the same path as any other document:

1. `Html/HtmlParser` builds a DOM in a single pass, applying the browser rules for implied end tags.
2. `Css/StyleResolver` cascades a user-agent stylesheet, presentational attributes, document stylesheets and inline
   styles. Rules are indexed by id, class and tag, and elements with identical inputs share one computed style.
   For a tagged PDF, `Pdf/StructureTree` then maps the elements to structure types and gives every text node, image and
   list marker a slot in that tree.
3. `Layout/LayoutEngine` lays out blocks, inline text (line breaking, justification), lists and tables
   (automatic column widths), paginating as it goes, and produces a flat list of draw operations. Inline content with
   right-to-left text gets its embedding levels from `Text/Bidi` (UAX #9), and each line is put in visual order after
   it is broken. `Fonts/ComplexShaper` shapes Arabic and Hebrew runs with the font's GSUB and GPOS tables
   (`Fonts/OpenTypeLayout`).
4. `Pdf/PdfDocumentWriter` writes PDF 1.4: content streams, fonts, image XObjects, link annotations,
   the bookmark outline and the cross-reference table. A tagged PDF's content is wrapped in marked-content sequences
   for its slots (or as artifacts), and the structure tree and its parent tree are written last. `Fonts/FontSubsetter` and `Fonts/CffSubsetter` cut embedded
   fonts down to the glyphs used (with their composite components and the CFF subroutines they call).

The renderer (`Rendering/`) works the other way round: `Parsing/PdfFile` reads the object graph, `PageRenderer`
interprets content streams, `Fonts/` turns glyphs into outlines (cached as anti-aliased bitmaps), `Images/` decodes
images, and `Graphics/Rasterizer` fills paths with exact area coverage before `PngEncoder`, `JpegEncoder` or
`WebPEncoder` writes the result.

The third-party fonts, font data and code built into the library are listed, with their licenses, in
[THIRD-PARTY-NOTICES.md](https://github.com/Moonwalker1307/PdfPecker/blob/main/THIRD-PARTY-NOTICES.md).
