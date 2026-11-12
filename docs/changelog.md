# Changelog

What changed in each PdfPecker release on [NuGet](https://www.nuget.org/packages/PdfPecker), newest first. The
manual for any of these versions can be downloaded as a PDF with the version picker next to Download PDF; the source
of every change is in the [PdfPecker repository](https://github.com/Moonwalker1307/PdfPecker).

## 1.25.0

Released 12 November 2026.

- Announce 1.25.0 as the last release for .NET 8 and 9 ([#739](https://github.com/Moonwalker1307/PdfPecker/pull/739))
- Bound the stops premultiplied gradient interpolation adds ([#740](https://github.com/Moonwalker1307/PdfPecker/pull/740))
- Solid text decorations as thick and placed as in Chrome ([#738](https://github.com/Moonwalker1307/PdfPecker/pull/738))
- font-variant-alternates and @font-feature-values ([#736](https://github.com/Moonwalker1307/PdfPecker/pull/736))
- text-autospace between ideographs and Latin letters or digits ([#734](https://github.com/Moonwalker1307/PdfPecker/pull/734))
- Interpolate translucent CSS gradient stops premultiplied ([#737](https://github.com/Moonwalker1307/PdfPecker/pull/737))
- font-palette and @font-palette-values for colour fonts ([#735](https://github.com/Moonwalker1307/PdfPecker/pull/735))
- Ruby annotations above their base text ([#733](https://github.com/Moonwalker1307/PdfPecker/pull/733))
- A flex row with an object-fit: cover image moves whole to the next page ([#732](https://github.com/Moonwalker1307/PdfPecker/pull/732))
- Images keep a given height when min-width or max-width limits their width ([#731](https://github.com/Moonwalker1307/PdfPecker/pull/731))
- Table rows with cells that span rows break across pages ([#718](https://github.com/Moonwalker1307/PdfPecker/pull/718))
- Count positioned boxes carried up through captures against the relayout budget ([#729](https://github.com/Moonwalker1307/PdfPecker/pull/729))
- Tables count against the relayout budget ([#728](https://github.com/Moonwalker1307/PdfPecker/pull/728))
- Target .NET 11 ([#725](https://github.com/Moonwalker1307/PdfPecker/pull/725))
- PDF/A-2a and PDF/A-3a ([#715](https://github.com/Moonwalker1307/PdfPecker/pull/715))
- Look at most 64 characters for a cluster one font should draw ([#724](https://github.com/Moonwalker1307/PdfPecker/pull/724))
- Charge the renderer's budget for the pixel rows that paths cross ([#723](https://github.com/Moonwalker1307/PdfPecker/pull/723))
- Upright CJK, text-combine-upright and upright images in vertical text ([#719](https://github.com/Moonwalker1307/PdfPecker/pull/719))
- Draw annotations that have no appearance stream ([#722](https://github.com/Moonwalker1307/PdfPecker/pull/722))
- Shape Khmer, Myanmar, Sinhala and Tibetan as HarfBuzz does ([#721](https://github.com/Moonwalker1307/PdfPecker/pull/721))
- PDF/X-4 output for print shops ([#720](https://github.com/Moonwalker1307/PdfPecker/pull/720))
- CMYK colours with device-cmyk() ([#717](https://github.com/Moonwalker1307/PdfPecker/pull/717))
- Percentage heights in flex items with a definite flexed or stretched height ([#716](https://github.com/Moonwalker1307/PdfPecker/pull/716))
- SVG filters count the pixels their content fills ([#714](https://github.com/Moonwalker1307/PdfPecker/pull/714))
- Skip substituting declarations that a later one of the property overrides ([#713](https://github.com/Moonwalker1307/PdfPecker/pull/713))

## 1.24.0

Released 10 November 2026.

- Look up named character references without building a dictionary ([#711](https://github.com/Moonwalker1307/PdfPecker/pull/711))
- Decode images to pixels and render into a caller's buffer ([#709](https://github.com/Moonwalker1307/PdfPecker/pull/709))
- Compare redaction boxes only with the areas near them ([#710](https://github.com/Moonwalker1307/PdfPecker/pull/710))
- A clip path with a point at infinity no longer fails text extraction ([1c75deb](https://github.com/Moonwalker1307/PdfPecker/commit/1c75deb2d5ce7e49705fda1cfb27c1437e4d501a))
- Faster text extraction, Markdown and structured HTML from PDFs ([#706](https://github.com/Moonwalker1307/PdfPecker/pull/706))
- Prepare AES-256 passwords with SASLprep ([#692](https://github.com/Moonwalker1307/PdfPecker/pull/692))
- Grid items spanning flexible columns share their width by the fr ([#697](https://github.com/Moonwalker1307/PdfPecker/pull/697))
- SVG symbols are clipped to the viewport their use gives them ([#696](https://github.com/Moonwalker1307/PdfPecker/pull/696))
- Transparency groups and CSS masks get a bounding box round what they paint ([#707](https://github.com/Moonwalker1307/PdfPecker/pull/707))
- Table border spacing in whole pixels, as Chrome keeps it ([#702](https://github.com/Moonwalker1307/PdfPecker/pull/702))
- A letter's date and signature are read in their place ([#704](https://github.com/Moonwalker1307/PdfPecker/pull/704))
- Backgrounds inside a nonzero clip of nested boxes are kept ([#705](https://github.com/Moonwalker1307/PdfPecker/pull/705))
- Tables with wider border spacing, and lists counted in letters ([#703](https://github.com/Moonwalker1307/PdfPecker/pull/703))
- Object streams are decoded on the file's budget, not the page's ([#701](https://github.com/Moonwalker1307/PdfPecker/pull/701))
- Table headers and footers across page breaks as Chrome places them ([#700](https://github.com/Moonwalker1307/PdfPecker/pull/700))
- Variation sequences from cmap format 14 ([#698](https://github.com/Moonwalker1307/PdfPecker/pull/698))
- Non-isolated transparency groups blend with what is below them ([#699](https://github.com/Moonwalker1307/PdfPecker/pull/699))
- Letter spacing skips hidden characters, as Chrome does ([#695](https://github.com/Moonwalker1307/PdfPecker/pull/695))
- Grid fr rows of indefinite height share the size of one fr ([#694](https://github.com/Moonwalker1307/PdfPecker/pull/694))
- SVG text inherits through use, text positions take units, CSS overflow auto is visible ([#693](https://github.com/Moonwalker1307/PdfPecker/pull/693))
- Check that a signature's gap is its own /Contents in encrypted files too ([#691](https://github.com/Moonwalker1307/PdfPecker/pull/691))
- Long runs of combining marks keep their order, as in HarfBuzz ([#690](https://github.com/Moonwalker1307/PdfPecker/pull/690))
- Redaction carries the text state into forms ([#689](https://github.com/Moonwalker1307/PdfPecker/pull/689))
- Thai, Indic and Arabic text on an SVG path copies as the letters written ([#688](https://github.com/Moonwalker1307/PdfPecker/pull/688))
- Watch renders again when an input's name starts with the output's ([#687](https://github.com/Moonwalker1307/PdfPecker/pull/687))
- Bound the total Unicode mappings of a CMap ([#686](https://github.com/Moonwalker1307/PdfPecker/pull/686))
- Thai, Indic and Arabic text copies and extracts as the letters written ([#677](https://github.com/Moonwalker1307/PdfPecker/pull/677))
- Unicode normalization from the library's own tables, the same with or without ICU ([#675](https://github.com/Moonwalker1307/PdfPecker/pull/675))
- Find tables whose cells draw their own borders ([#674](https://github.com/Moonwalker1307/PdfPecker/pull/674))
- Bound the work of tagged tables on a page ([#673](https://github.com/Moonwalker1307/PdfPecker/pull/673))
- Variable font instances and feature variants no longer run out over a process's life ([#676](https://github.com/Moonwalker1307/PdfPecker/pull/676))
- Repeated table header after border spacing that crosses a page break ([#671](https://github.com/Moonwalker1307/PdfPecker/pull/671))
- Numbers in right-to-left lines keep their separators and signs ([#670](https://github.com/Moonwalker1307/PdfPecker/pull/670))
- Intrinsic widths that keep min-width, and the automatic minimum of grid and flex items ([#672](https://github.com/Moonwalker1307/PdfPecker/pull/672))
- A column that starts higher than the first is read after it ([#668](https://github.com/Moonwalker1307/PdfPecker/pull/668))
- Lines of skewed scans stay in order in text extraction ([#669](https://github.com/Moonwalker1307/PdfPecker/pull/669))
- Deferred fonts and hyphenation patterns ([#655](https://github.com/Moonwalker1307/PdfPecker/pull/655))
- Transparency groups and soft masks cost the area they draw ([#667](https://github.com/Moonwalker1307/PdfPecker/pull/667))
- Smaller subsets of CFF fonts that keep data before their subroutines ([#652](https://github.com/Moonwalker1307/PdfPecker/pull/652))
- Fluent page slots align their content, border calls merge, band Markdown keeps braces ([#665](https://github.com/Moonwalker1307/PdfPecker/pull/665))
- Verify signatures by the revision they signed ([#666](https://github.com/Moonwalker1307/PdfPecker/pull/666))
- Redaction removes the originals of what it replaces ([#664](https://github.com/Moonwalker1307/PdfPecker/pull/664))
- Column flex box with a min-height grows instead of pushing centred content up ([#663](https://github.com/Moonwalker1307/PdfPecker/pull/663))
- revert and revert-layer on every property, and invalid var() makes the property unset ([#662](https://github.com/Moonwalker1307/PdfPecker/pull/662))
- Barcode reader for images and PDF pages ([#661](https://github.com/Moonwalker1307/PdfPecker/pull/661))
- SVG currentColor where a use draws, lengths with units and nested svg viewports ([#660](https://github.com/Moonwalker1307/PdfPecker/pull/660))
- Invisible characters are no longer drawn as ? or boxes ([#659](https://github.com/Moonwalker1307/PdfPecker/pull/659))
- Parse each colour space once, and pages that do not depend on render order ([#658](https://github.com/Moonwalker1307/PdfPecker/pull/658))
- Bound colour space, function, ToUnicode and inline image sizes taken from the file ([#656](https://github.com/Moonwalker1307/PdfPecker/pull/656))
- Read references to freed objects as null instead of rebuilding the xref table ([#657](https://github.com/Moonwalker1307/PdfPecker/pull/657))
- HTML character references as browsers decode them ([#654](https://github.com/Moonwalker1307/PdfPecker/pull/654))
- CLI keeps whole-file options and page numbers when it joins several inputs ([#653](https://github.com/Moonwalker1307/PdfPecker/pull/653))
- Type 3 text honours invisible and clipping render modes ([#651](https://github.com/Moonwalker1307/PdfPecker/pull/651))
- Link annotations for links inside transformed elements ([#650](https://github.com/Moonwalker1307/PdfPecker/pull/650))
- Faster table search for text reading order, Markdown and structured HTML ([#648](https://github.com/Moonwalker1307/PdfPecker/pull/648))
- Snapshot comparison finds the stream keyword only after the dictionary ([#649](https://github.com/Moonwalker1307/PdfPecker/pull/649))
- PDF redaction: remove what pages draw in given areas ([#647](https://github.com/Moonwalker1307/PdfPecker/pull/647))
- Install the pdfpecker tool as Native AOT on .NET 10 SDKs ([#645](https://github.com/Moonwalker1307/PdfPecker/pull/645))
- Lone surrogates in a ToUnicode map draw no glyph ([#646](https://github.com/Moonwalker1307/PdfPecker/pull/646))
- Faster JPEG decoding, CMYK images and upright image drawing ([#642](https://github.com/Moonwalker1307/PdfPecker/pull/642))
- Faster JPEG encoding of flat blocks, sparse blocks and plain rows ([#639](https://github.com/Moonwalker1307/PdfPecker/pull/639))
- Reuse page pixel buffers in multi-page conversions ([#638](https://github.com/Moonwalker1307/PdfPecker/pull/638))
- Sanitizer keeps only web, e-mail and phone links, and rewrites damaged files ([#640](https://github.com/Moonwalker1307/PdfPecker/pull/640))
- LTV fetches without a proxy, piped HTML without the current folder, and password -env options ([#641](https://github.com/Moonwalker1307/PdfPecker/pull/641))
- Faster TIFF encoding ([#637](https://github.com/Moonwalker1307/PdfPecker/pull/637))
- Faster WebP encoding with pooled buffers ([#636](https://github.com/Moonwalker1307/PdfPecker/pull/636))
- Faster PNG encoding ([#635](https://github.com/Moonwalker1307/PdfPecker/pull/635))
- Fewer allocations and no lock waits in text extraction ([#631](https://github.com/Moonwalker1307/PdfPecker/pull/631))
- Inset box shadows on inline boxes ([#633](https://github.com/Moonwalker1307/PdfPecker/pull/633))
- object-view-box ([#632](https://github.com/Moonwalker1307/PdfPecker/pull/632))
- contrast-color() ([#630](https://github.com/Moonwalker1307/PdfPecker/pull/630))
- if() with media(), supports() and style() ([#629](https://github.com/Moonwalker1307/PdfPecker/pull/629))
- sibling-index() and sibling-count() ([#628](https://github.com/Moonwalker1307/PdfPecker/pull/628))
- @page :nth() and page groups ([#627](https://github.com/Moonwalker1307/PdfPecker/pull/627))
- Bleed and crop marks on @page ([#626](https://github.com/Moonwalker1307/PdfPecker/pull/626))
- Columns inside columns split a clipped shape only where the clip shows it ([#625](https://github.com/Moonwalker1307/PdfPecker/pull/625))
- Stretched flex items laid out again only within the relayout budget ([#624](https://github.com/Moonwalker1307/PdfPecker/pull/624))
- Nested SVG foreignObject content laid out within the relayout budget ([#623](https://github.com/Moonwalker1307/PdfPecker/pull/623))
- Markdown and structured HTML read unequal columns as PdfText does ([#622](https://github.com/Moonwalker1307/PdfPecker/pull/622))
- Read vertical writing drawn letter by letter down its columns ([#621](https://github.com/Moonwalker1307/PdfPecker/pull/621))
- Arabic words stay whole when letters are joined by cursive attachment ([#620](https://github.com/Moonwalker1307/PdfPecker/pull/620))
- Right-to-left text columns read from the right ([#619](https://github.com/Moonwalker1307/PdfPecker/pull/619))
- Read pages turned with /Rotate as their text runs ([#618](https://github.com/Moonwalker1307/PdfPecker/pull/618))
- Columns of unequal length in text extraction reading order ([#617](https://github.com/Moonwalker1307/PdfPecker/pull/617))
- Filter budget counts the shapes and clips a blurred box fills ([#616](https://github.com/Moonwalker1307/PdfPecker/pull/616))
- Table rows and columns with visibility: collapse leave the table ([#614](https://github.com/Moonwalker1307/PdfPecker/pull/614))
- Spanning cells no longer run past the page end ([#615](https://github.com/Moonwalker1307/PdfPecker/pull/615))
- Collapsed borders from col and colgroup ([#613](https://github.com/Moonwalker1307/PdfPecker/pull/613))
- SVG foreign objects drawn again by use elements count against the drawing budget ([#612](https://github.com/Moonwalker1307/PdfPecker/pull/612))
- Contextual alternates by default, as Chrome applies them ([#584](https://github.com/Moonwalker1307/PdfPecker/pull/584))
- Reading order in text extraction ([#609](https://github.com/Moonwalker1307/PdfPecker/pull/609))

## 1.23.0

Released 4 November 2026.

- SignatureField in PdfPecker.Fluent ([#608](https://github.com/Moonwalker1307/PdfPecker/pull/608))
- Empty signature fields from HTML ([#605](https://github.com/Moonwalker1307/PdfPecker/pull/605))
- Character references that overflow decode as U+FFFD ([#607](https://github.com/Moonwalker1307/PdfPecker/pull/607))
- Convert existing PDFs to PDF/A ([#604](https://github.com/Moonwalker1307/PdfPecker/pull/604))
- Page number formats in Fluent ([#606](https://github.com/Moonwalker1307/PdfPecker/pull/606))
- Formula, index, table of contents and list label semantics in Fluent ([#603](https://github.com/Moonwalker1307/PdfPecker/pull/603))
- Counter styles for page numbers in running headers and footers ([#602](https://github.com/Moonwalker1307/PdfPecker/pull/602))
- Tag formulas, indexes, tables of contents and hand-made list labels ([#601](https://github.com/Moonwalker1307/PdfPecker/pull/601))
- Shared images and image compression in PdfPecker.Fluent ([#599](https://github.com/Moonwalker1307/PdfPecker/pull/599))
- DocumentOperation in PdfPecker.Fluent ([#596](https://github.com/Moonwalker1307/PdfPecker/pull/596))
- PdfPecker.Razor: Razor components to PDF ([#593](https://github.com/Moonwalker1307/PdfPecker/pull/593))
- Typed attr() in any property ([#586](https://github.com/Moonwalker1307/PdfPecker/pull/586))
- Fluent Data Matrix calls and the Swiss QR-bill payment part ([#600](https://github.com/Moonwalker1307/PdfPecker/pull/600))
- PdfPecker.Cli: the pdfpecker command-line tool ([#594](https://github.com/Moonwalker1307/PdfPecker/pull/594))
- PDF to Markdown ([#590](https://github.com/Moonwalker1307/PdfPecker/pull/590))
- Swiss QR-bill codes ([#598](https://github.com/Moonwalker1307/PdfPecker/pull/598))
- Page background and foreground in PdfPecker.Fluent ([#597](https://github.com/Moonwalker1307/PdfPecker/pull/597))
- Data Matrix and GS1 Data Matrix barcodes ([#595](https://github.com/Moonwalker1307/PdfPecker/pull/595))
- Image quality and maximum resolution properties for smaller PDFs ([#592](https://github.com/Moonwalker1307/PdfPecker/pull/592))
- Linearize existing PDFs together with encryption ([#589](https://github.com/Moonwalker1307/PdfPecker/pull/589))
- Fixed boxes paint over the running headers and footers ([#591](https://github.com/Moonwalker1307/PdfPecker/pull/591))
- PdfPecker.Testing: snapshot tests for PDFs ([#587](https://github.com/Moonwalker1307/PdfPecker/pull/587))
- QuestPDF text, direction and semantic calls in Fluent ([#588](https://github.com/Moonwalker1307/PdfPecker/pull/588))
- Gap decorations in grid and flex containers ([#583](https://github.com/Moonwalker1307/PdfPecker/pull/583))
- size-adjust and the metric overrides in @font-face ([#582](https://github.com/Moonwalker1307/PdfPecker/pull/582))
- target-counters() in generated content ([#585](https://github.com/Moonwalker1307/PdfPecker/pull/585))
- box-decoration-break: clone for block boxes split across pages ([#580](https://github.com/Moonwalker1307/PdfPecker/pull/580))
- vector-effect non-scaling-stroke and transform-box for SVG elements ([#579](https://github.com/Moonwalker1307/PdfPecker/pull/579))
- Selectors :in-range and :out-of-range ([#581](https://github.com/Moonwalker1307/PdfPecker/pull/581))
- SVG geometry and gradient stop properties from style sheets ([#577](https://github.com/Moonwalker1307/PdfPecker/pull/577))
- hyphenate-limit-lines ([#578](https://github.com/Moonwalker1307/PdfPecker/pull/578))
- white-space-collapse ([#576](https://github.com/Moonwalker1307/PdfPecker/pull/576))
- Leave out SVG foreign objects inside patterns, masks and filter images ([#575](https://github.com/Moonwalker1307/PdfPecker/pull/575))
- Remove active annotations and actions in one pass ([#574](https://github.com/Moonwalker1307/PdfPecker/pull/574))
- Find @scope limits in one walk ([#573](https://github.com/Moonwalker1307/PdfPecker/pull/573))
- Float bands look only at the floats that can reach them ([#572](https://github.com/Moonwalker1307/PdfPecker/pull/572))
- Repeat in PdfPecker.Fluent ([#570](https://github.com/Moonwalker1307/PdfPecker/pull/570))
- accent-color and appearance: none for check boxes and radio buttons ([#571](https://github.com/Moonwalker1307/PdfPecker/pull/571))
- ContinuousSize in PdfPecker.Fluent ([#569](https://github.com/Moonwalker1307/PdfPecker/pull/569))
- StopPaging in PdfPecker.Fluent ([#567](https://github.com/Moonwalker1307/PdfPecker/pull/567))
- image-rendering: pixelated and crisp-edges keep enlarged images sharp ([#568](https://github.com/Moonwalker1307/PdfPecker/pull/568))
- Markdown content in PdfPecker.Fluent ([#557](https://github.com/Moonwalker1307/PdfPecker/pull/557))
- -pdfpecker-repeat: each-page draws a box again on its parent's later pages ([#564](https://github.com/Moonwalker1307/PdfPecker/pull/564))
- Write the SVG viewBox scale with six decimals ([#562](https://github.com/Moonwalker1307/PdfPecker/pull/562))
- ExtendLastCellsToTableBottom in PdfPecker.Fluent ([#565](https://github.com/Moonwalker1307/PdfPecker/pull/565))
- Pages as tall as their content with @page size: 80mm auto ([#561](https://github.com/Moonwalker1307/PdfPecker/pull/561))
- Table of contents from headings in PdfPecker.Fluent ([#556](https://github.com/Moonwalker1307/PdfPecker/pull/556))
- continue: discard keeps a box to its first fragment ([#560](https://github.com/Moonwalker1307/PdfPecker/pull/560))
- Shapes drawn by an SVG use element inherit from the use element ([#566](https://github.com/Moonwalker1307/PdfPecker/pull/566))
- Gradients and opacity in PdfPecker.Fluent ([#554](https://github.com/Moonwalker1307/PdfPecker/pull/554))
- CSS @scope ([#563](https://github.com/Moonwalker1307/PdfPecker/pull/563))
- Document.Merge in PdfPecker.Fluent ([#558](https://github.com/Moonwalker1307/PdfPecker/pull/558))
- Running elements in page-margin boxes ([#559](https://github.com/Moonwalker1307/PdfPecker/pull/559))
- CSS zoom ([#552](https://github.com/Moonwalker1307/PdfPecker/pull/552))
- Section pages over several named pages ([#555](https://github.com/Moonwalker1307/PdfPecker/pull/555))
- Hyphenate on text styles and Language per container in PdfPecker.Fluent ([#553](https://github.com/Moonwalker1307/PdfPecker/pull/553))
- Hand on a line's footnotes in linear time ([#550](https://github.com/Moonwalker1307/PdfPecker/pull/550))
- EvenPageHeader and EvenPageFooter in PdfPecker.Fluent ([#549](https://github.com/Moonwalker1307/PdfPecker/pull/549))
- Charts in PdfPecker.Fluent ([#548](https://github.com/Moonwalker1307/PdfPecker/pull/548))
- Leaders in PdfPecker.Fluent text ([#546](https://github.com/Moonwalker1307/PdfPecker/pull/546))
- Even-page headers and footers ([#547](https://github.com/Moonwalker1307/PdfPecker/pull/547))

## 1.22.0

Released 1 November 2026.

- The page within a section needs no id ([#544](https://github.com/Moonwalker1307/PdfPecker/pull/544))
- A forced break before a box's first child breaks before the box ([#543](https://github.com/Moonwalker1307/PdfPecker/pull/543))
- SVG backgrounds without a viewBox scale to background-size ([#542](https://github.com/Moonwalker1307/PdfPecker/pull/542))
- Icons from a hidden SVG sprite drawn as in Chrome ([#541](https://github.com/Moonwalker1307/PdfPecker/pull/541))
- Images and inline-blocks aligned to text-top and text-bottom as in Chrome ([#539](https://github.com/Moonwalker1307/PdfPecker/pull/539))
- The stretch sizing keyword and -webkit-fill-available ([#538](https://github.com/Moonwalker1307/PdfPecker/pull/538))
- Position paginated grid rows in one pass over the items ([#536](https://github.com/Moonwalker1307/PdfPecker/pull/536))
- Split table rows add no breaks past the page limit ([#535](https://github.com/Moonwalker1307/PdfPecker/pull/535))
- Bound the renderer's cache of pattern tiles ([#534](https://github.com/Moonwalker1307/PdfPecker/pull/534))
- Move inline layout out of LayoutEngine into its own class ([#533](https://github.com/Moonwalker1307/PdfPecker/pull/533))
- Keep rasterizer edges within their cells and coordinates finite ([#532](https://github.com/Moonwalker1307/PdfPecker/pull/532))
- Share the PNG filters, one PDF dictionary copy and the renderer's matrix ([#531](https://github.com/Moonwalker1307/PdfPecker/pull/531))
- Record the bug-type exceptions the library swallows ([#530](https://github.com/Moonwalker1307/PdfPecker/pull/530))
- One page-tree reader for the renderer, writers and signers ([#529](https://github.com/Moonwalker1307/PdfPecker/pull/529))
- One conversion context for the limits of an HTML conversion ([#528](https://github.com/Moonwalker1307/PdfPecker/pull/528))
- One cmap reader for HTML to PDF and the renderer ([#527](https://github.com/Moonwalker1307/PdfPecker/pull/527))
- Public PdfOptions.Clone, which the fluent package now uses ([#525](https://github.com/Moonwalker1307/PdfPecker/pull/525))
- Bound PDF stream decoding when no render scope is open ([#526](https://github.com/Moonwalker1307/PdfPecker/pull/526))
- corner-shape ([#523](https://github.com/Moonwalker1307/PdfPecker/pull/523))
- overflow-clip-margin ([#522](https://github.com/Moonwalker1307/PdfPecker/pull/522))
- text-box, text-box-trim and text-box-edge, as Chrome trims lines ([#521](https://github.com/Moonwalker1307/PdfPecker/pull/521))
- clip-path and shape-outside rect() and xywh() ([#520](https://github.com/Moonwalker1307/PdfPecker/pull/520))
- Keep number widths in border-image in standards mode ([#519](https://github.com/Moonwalker1307/PdfPecker/pull/519))
- Flex rows break inside their items at a page's end ([#518](https://github.com/Moonwalker1307/PdfPecker/pull/518))
- Section page numbers in the fluent package ([#517](https://github.com/Moonwalker1307/PdfPecker/pull/517))
- PdfSanitizer removes JavaScript and other active content ([#516](https://github.com/Moonwalker1307/PdfPecker/pull/516))
- First and last page of a section, and page numbers within it ([#515](https://github.com/Moonwalker1307/PdfPecker/pull/515))
- Page numbers in the content in PdfPecker.Fluent ([#508](https://github.com/Moonwalker1307/PdfPecker/pull/508))
- Inflate into pooled segments instead of a growing buffer ([#513](https://github.com/Moonwalker1307/PdfPecker/pull/513))
- Long-term validation fetches only from public addresses by default ([#511](https://github.com/Moonwalker1307/PdfPecker/pull/511))
- SHA-1 signatures are not valid unless the caller allows them ([#507](https://github.com/Moonwalker1307/PdfPecker/pull/507))
- Rarely set style properties in shared groups ([#514](https://github.com/Moonwalker1307/PdfPecker/pull/514))
- Legacy body margin attributes, as in Chrome ([#512](https://github.com/Moonwalker1307/PdfPecker/pull/512))
- The page count anywhere in the content ([#506](https://github.com/Moonwalker1307/PdfPecker/pull/506))
- Table cell content fills the row in any call order ([#505](https://github.com/Moonwalker1307/PdfPecker/pull/505))
- Percentage heights in table cells that span rows ([#504](https://github.com/Moonwalker1307/PdfPecker/pull/504))
- Auto margins on a float count as zero ([#509](https://github.com/Moonwalker1307/PdfPecker/pull/509))
- Columns nested in table cells keep their whole content between balancing passes ([#510](https://github.com/Moonwalker1307/PdfPecker/pull/510))
- Rarely used element fields in a side object ([#501](https://github.com/Moonwalker1307/PdfPecker/pull/501))
- Catch shadow attacks and dropped /Perms after a certification ([#503](https://github.com/Moonwalker1307/PdfPecker/pull/503))
- Total budget for decoded object streams ([#502](https://github.com/Moonwalker1307/PdfPecker/pull/502))
- Square dots for thin dotted borders, as in Chrome ([#496](https://github.com/Moonwalker1307/PdfPecker/pull/496))
- Keep OpenType feature keys between lookups ([#500](https://github.com/Moonwalker1307/PdfPecker/pull/500))
- Quirks-mode line heights like Chrome ([#495](https://github.com/Moonwalker1307/PdfPecker/pull/495))
- Make the cluster test's closure only for clusters in font chains ([#498](https://github.com/Moonwalker1307/PdfPecker/pull/498))
- Margins of a lowered icon no longer deepen its line ([#499](https://github.com/Moonwalker1307/PdfPecker/pull/499))
- Percentage lengths in inline SVG ([#493](https://github.com/Moonwalker1307/PdfPecker/pull/493))
- Drop a whole shorthand when one part has a unitless length ([#492](https://github.com/Moonwalker1307/PdfPecker/pull/492))
- A heading stays put before a box kept whole that is taller than a page ([#494](https://github.com/Moonwalker1307/PdfPecker/pull/494))
- Background on ::first-line ([#481](https://github.com/Moonwalker1307/PdfPecker/pull/481))
- Boxes with footnote calls count toward the relayout budget ([#490](https://github.com/Moonwalker1307/PdfPecker/pull/490))
- text-emphasis: marks over or under each character, as Chrome draws them ([#487](https://github.com/Moonwalker1307/PdfPecker/pull/487))
- Grid items kept whole go to the next page without a trial layout ([#491](https://github.com/Moonwalker1307/PdfPecker/pull/491))
- Draw image-set() in backgrounds, list markers and generated content ([#479](https://github.com/Moonwalker1307/PdfPecker/pull/479))
- text-indent with hanging, each-line and percentages ([#475](https://github.com/Moonwalker1307/PdfPecker/pull/475))
- ::marker direction orders the marker's own text ([#484](https://github.com/Moonwalker1307/PdfPecker/pull/484))
- counter(list-item) in ::marker and ::before content ([#480](https://github.com/Moonwalker1307/PdfPecker/pull/480))
- Match form patterns without a timeout when they cannot backtrack ([#489](https://github.com/Moonwalker1307/PdfPecker/pull/489))
- A marker image taller than its line moves the line down ([#488](https://github.com/Moonwalker1307/PdfPecker/pull/488))
- JPEG scans stop where their data ends, and an oversized frame keeps the old size ([#482](https://github.com/Moonwalker1307/PdfPecker/pull/482))
- Take font-width as the name of font-stretch ([#486](https://github.com/Moonwalker1307/PdfPecker/pull/486))
- Match :valid, :invalid and :open ([#485](https://github.com/Moonwalker1307/PdfPecker/pull/485))
- ::marker { content: none } removes the marker ([#477](https://github.com/Moonwalker1307/PdfPecker/pull/477))
- Expand the grid shorthand ([#474](https://github.com/Moonwalker1307/PdfPecker/pull/474))
- Border, padding and background images on the @page box ([#478](https://github.com/Moonwalker1307/PdfPecker/pull/478))
- A larger ::marker font makes its line taller ([#476](https://github.com/Moonwalker1307/PdfPecker/pull/476))

## 1.21.0

Released 28 October 2026.

- Limit the colour paints a document draws ([#472](https://github.com/Moonwalker1307/PdfPecker/pull/472))
- Charge images in ::before and ::after content to the generated-content budget ([#471](https://github.com/Moonwalker1307/PdfPecker/pull/471))
- Table rows break inside at a page's end as in Chrome ([#470](https://github.com/Moonwalker1307/PdfPecker/pull/470))
- SVG context-fill and context-stroke ([#449](https://github.com/Moonwalker1307/PdfPecker/pull/449))
- Fixed background images placed on the paper ([#467](https://github.com/Moonwalker1307/PdfPecker/pull/467))
- Fixed boxes paint by their z-index among the flow ([#459](https://github.com/Moonwalker1307/PdfPecker/pull/459))
- Bottom margins truncated at page breaks ([#469](https://github.com/Moonwalker1307/PdfPecker/pull/469))
- Unitless lengths only in quirks mode, as in browsers ([#465](https://github.com/Moonwalker1307/PdfPecker/pull/465))
- A stray \</p\> makes an empty paragraph, as in browsers ([#460](https://github.com/Moonwalker1307/PdfPecker/pull/460))
- Border sides of different colours meet in mitred corners ([#464](https://github.com/Moonwalker1307/PdfPecker/pull/464))
- Empty CSS tables keep their size, and tables in CSS tables are content ([#468](https://github.com/Moonwalker1307/PdfPecker/pull/468))
- Escapes in selector names and attribute values ([#466](https://github.com/Moonwalker1307/PdfPecker/pull/466))
- CSS error recovery as in browsers ([#463](https://github.com/Moonwalker1307/PdfPecker/pull/463))
- Margins collapse as one set of positive and negative margins ([#462](https://github.com/Moonwalker1307/PdfPecker/pull/462))
- Stylesheets in data: URLs ([#457](https://github.com/Moonwalker1307/PdfPecker/pull/457))
- Outline of a wrapped inline as one shape around all its lines ([#461](https://github.com/Moonwalker1307/PdfPecker/pull/461))
- 3D border shades as Chrome 153 draws them ([#458](https://github.com/Moonwalker1307/PdfPecker/pull/458))
- Outline and dashed border corners drawn like Chrome ([#452](https://github.com/Moonwalker1307/PdfPecker/pull/452))
- Left-to-right line order in vertical-lr ([#448](https://github.com/Moonwalker1307/PdfPecker/pull/448))
- break-all and overflow-wrap: anywhere shrink table cells ([#437](https://github.com/Moonwalker1307/PdfPecker/pull/437))
- Stretched images in flex and grid layouts, as in Chrome ([#456](https://github.com/Moonwalker1307/PdfPecker/pull/456))
- Percentage table columns fill the table as in Chrome ([#450](https://github.com/Moonwalker1307/PdfPecker/pull/450))
- Smaller default size for bare monospace text, as in browsers ([#454](https://github.com/Moonwalker1307/PdfPecker/pull/454))
- Repeat table headers and footers around a row split across pages ([#453](https://github.com/Moonwalker1307/PdfPecker/pull/453))
- Badges in empty inline wrappers, struts of empty inlines and cloned edges at wraps ([#455](https://github.com/Moonwalker1307/PdfPecker/pull/455))
- Boxes kept whole but taller than a page start on the next page ([#451](https://github.com/Moonwalker1307/PdfPecker/pull/451))
- Forced page breaks between flex lines ([#447](https://github.com/Moonwalker1307/PdfPecker/pull/447))
- HTML inside SVG foreignObject ([#446](https://github.com/Moonwalker1307/PdfPecker/pull/446))
- Percentage columns fill a table with a width ([#445](https://github.com/Moonwalker1307/PdfPecker/pull/445))
- Old -webkit- syntax: prefixed properties, the legacy box and gradients ([#444](https://github.com/Moonwalker1307/PdfPecker/pull/444))
- Floats and sized boxes in vertical writing modes ([#443](https://github.com/Moonwalker1307/PdfPecker/pull/443))
- Pictures in embed and object elements ([#442](https://github.com/Moonwalker1307/PdfPecker/pull/442))
- Charts.css charts: @property syntax checks and column flex item sizes ([#441](https://github.com/Moonwalker1307/PdfPecker/pull/441))
- Forced page breaks between table rows ([#440](https://github.com/Moonwalker1307/PdfPecker/pull/440))
- Absolutely positioned boxes inside positioned inline elements ([#439](https://github.com/Moonwalker1307/PdfPecker/pull/439))
- COLR colour fonts, versions 0 and 1 ([#438](https://github.com/Moonwalker1307/PdfPecker/pull/438))
- Faster QR code mask choice ([#435](https://github.com/Moonwalker1307/PdfPecker/pull/435))
- Form fields and footnotes in PdfPecker.Fluent ([#436](https://github.com/Moonwalker1307/PdfPecker/pull/436))
- Fluent page sets as named pages of one document ([#434](https://github.com/Moonwalker1307/PdfPecker/pull/434))
- Headers and footers of their own for named pages ([#433](https://github.com/Moonwalker1307/PdfPecker/pull/433))
- ScaleToFit, ShowOnce and SkipOnce in PdfPecker.Fluent ([#432](https://github.com/Moonwalker1307/PdfPecker/pull/432))
- Images and gradients in ::before and ::after content ([#431](https://github.com/Moonwalker1307/PdfPecker/pull/431))
- Custom ellipsis for clamped text (block-ellipsis) ([#428](https://github.com/Moonwalker1307/PdfPecker/pull/428))
- Gradient list markers ([#430](https://github.com/Moonwalker1307/PdfPecker/pull/430))
- Bookmarks from CSS (bookmark-level, bookmark-label, bookmark-state) ([#429](https://github.com/Moonwalker1307/PdfPecker/pull/429))
- Legacy clip: rect() on absolutely positioned boxes ([#427](https://github.com/Moonwalker1307/PdfPecker/pull/427))
- Underlines from the font or below the descenders (text-underline-position) ([#426](https://github.com/Moonwalker1307/PdfPecker/pull/426))
- Photos turned upright by their EXIF orientation (image-orientation) ([#425](https://github.com/Moonwalker1307/PdfPecker/pull/425))
- Images on whole CSS pixels, like their borders ([#424](https://github.com/Moonwalker1307/PdfPecker/pull/424))
- srcset, sizes and the picture element ([#422](https://github.com/Moonwalker1307/PdfPecker/pull/422))
- Gradient colour interpolation methods (in oklch, hsl longer hue, ...) ([#423](https://github.com/Moonwalker1307/PdfPecker/pull/423))
- Styles and images in structured PDF to HTML ([#421](https://github.com/Moonwalker1307/PdfPecker/pull/421))
- Stretched grid and flex items show their full height without a background ([#420](https://github.com/Moonwalker1307/PdfPecker/pull/420))
- Keep table row groups and group header rows together across pages ([#419](https://github.com/Moonwalker1307/PdfPecker/pull/419))
- Columns from broken row lines and indented row labels in structured PDF to HTML ([#413](https://github.com/Moonwalker1307/PdfPecker/pull/413))
- Collapsed tables close on every page they break across ([#417](https://github.com/Moonwalker1307/PdfPecker/pull/417))
- Read tagged PDFs from their structure tree in structured PDF to HTML ([#411](https://github.com/Moonwalker1307/PdfPecker/pull/411))
- Structured PDF to HTML with flowing text and real tables ([#410](https://github.com/Moonwalker1307/PdfPecker/pull/410))
- Keep small lines beside a large heading apart in text extraction ([#409](https://github.com/Moonwalker1307/PdfPecker/pull/409))
- Row backgrounds no longer cover collapsed table borders ([#412](https://github.com/Moonwalker1307/PdfPecker/pull/412))
- Headers and footers number only their own boxes for layer order ([#408](https://github.com/Moonwalker1307/PdfPecker/pull/408))

## 1.20.0

Released 25 October 2026.

- Keep-with-next chains move to the next page only within the relayout budget ([#405](https://github.com/Moonwalker1307/PdfPecker/pull/405))
- Option to strip metadata from embedded JPEGs ([#403](https://github.com/Moonwalker1307/PdfPecker/pull/403))
- Extract images from existing PDFs ([#402](https://github.com/Moonwalker1307/PdfPecker/pull/402))
- Isolated soft mask for blurred box shadows ([#401](https://github.com/Moonwalker1307/PdfPecker/pull/401))
- Browser find matches phrases in the PdfToHtml text layer ([#400](https://github.com/Moonwalker1307/PdfPecker/pull/400))
- Lay out nested flex rows on the pages a constant number of times ([#399](https://github.com/Moonwalker1307/PdfPecker/pull/399))
- Cap the pixels of a filter region far longer than it is wide ([#398](https://github.com/Moonwalker1307/PdfPecker/pull/398))
- Layouts of one document share the base of the relayout budget ([#397](https://github.com/Moonwalker1307/PdfPecker/pull/397))
- Bound CID width and vertical metric ranges ([#396](https://github.com/Moonwalker1307/PdfPecker/pull/396))
- Linearized output for Fast Web View ([#386](https://github.com/Moonwalker1307/PdfPecker/pull/386))
- Bound the layout of running headers and footers with page numbers ([#394](https://github.com/Moonwalker1307/PdfPecker/pull/394))
- Count boxes beside floats towards the depth keep-with-next chains move to ([#395](https://github.com/Moonwalker1307/PdfPecker/pull/395))
- Charge the JPEG 2000 budget before building code-blocks ([#393](https://github.com/Moonwalker1307/PdfPecker/pull/393))
- Charge the SVG drawing budget before the depth limit ([#392](https://github.com/Moonwalker1307/PdfPecker/pull/392))
- Count background gradients in the work budget of filters ([#391](https://github.com/Moonwalker1307/PdfPecker/pull/391))
- Charge JBIG2 bitmap rows to the work budget ([#389](https://github.com/Moonwalker1307/PdfPecker/pull/389))
- Keep surrogate pairs whole when hyphenating a decomposed word ([#387](https://github.com/Moonwalker1307/PdfPecker/pull/387))
- Fonts of SVG text in deeply nested groups ([#388](https://github.com/Moonwalker1307/PdfPecker/pull/388))
- Viewer settings and page labels ([#381](https://github.com/Moonwalker1307/PdfPecker/pull/381))
- Lay out a running header without page numbers once ([#385](https://github.com/Moonwalker1307/PdfPecker/pull/385))
- Check link schemes before System.Uri parses them ([#384](https://github.com/Moonwalker1307/PdfPecker/pull/384))
- Certification (DocMDP) signatures ([#383](https://github.com/Moonwalker1307/PdfPecker/pull/383))
- Read document properties of existing PDFs ([#382](https://github.com/Moonwalker1307/PdfPecker/pull/382))
- Grid row probes put the anchors they move back ([#378](https://github.com/Moonwalker1307/PdfPecker/pull/378))
- Columns count as depth dependent only when they lay a box out again ([#377](https://github.com/Moonwalker1307/PdfPecker/pull/377))

## 1.19.0

Released 22 October 2026.

- [PdfPecker.Fluent](/docs/fluent-api/), a fluent C# API in the style of QuestPDF, is on nuget.org. It builds pages,
  headers, footers, columns, rows, tables, text, images and barcodes in code and renders them with PdfPecker. It is
  released with every PdfPecker release, with the same version.
- [A header and footer of their own on the first page](/docs/paged-media/#running-header-and-footer-from-html):
  `data-sticky-pdf-first-header` and `data-sticky-pdf-first-footer` replace the running bands on page one, or remove
  them when left empty.
- [Scale content to fit a box](/docs/html-and-css/#scale-content-to-fit-a-box): `-pdfpecker-scale-to-fit: shrink` draws
  a box's content smaller until it fits the box's height, for labels, badges and certificates.
- Faster repeated conversions: documents made from one template reuse their fonts and font subsets, parsed CSS and the
  PDF writer's buffers, so an invoice converts about 10% faster than with 1.18.0, and documents with web fonts gain
  the most. The output is byte-identical.
- [PDF to image](/docs/pdf-to-image/#output-formats) and [PDF to HTML](/docs/pdf-to-html/#options): lossless WebP
  encodes faster, and its default effort is now 29 instead of 85, which is about 44% faster for files about 1% larger;
  `Quality = 85` gives the old bytes. Masks finer than their image keep their resolution, the words of Type 3 fonts drawn
  at their own scale stay whole, and mesh-shaded fills need far less memory.
- Fixes, all closer to Chrome: positioned boxes paint in document order; an absolutely positioned child of a flex
  container is aligned by `justify-content` and `align-self`, and one with `grid-row` or `grid-column` is placed in its
  grid area; `vertical-align: top` and `bottom` move a span's images and inline-blocks with its text; a `<br>` directly
  in a flex or grid container breaks the line instead of splitting the text into two items; and a word that may break
  no longer leaves its last letter on a line of its own in a box as wide as its content.
- Hostile input: deeply nested columns, flex boxes, tables and backdrop filters, and long runs of combining marks, now
  convert within bounded time and memory.
- Pages with overlapping positioned boxes, positioned children of flex and grid boxes, `vertical-align: top` or
  `bottom` spans holding other boxes and `<br>` in flex containers look different from 1.18.0, and WebP images at the
  default quality have different bytes but the same pixels.

## 1.18.0

Released 21 October 2026.

- [Shrink to fit](/docs/paged-media/#shrink-to-fit): a page whose content sticks out past the right edge (a wide table
  or image, a long URL, `nowrap` text, a Bootstrap `.row` without a container) is laid out wider and drawn smaller,
  as Chrome prints it, up to 1.5 times. It is on by default; `ShrinkToFit = false` keeps the 1.17.0 layout. An image
  wider than the page now shrinks the page instead of being squeezed on its own.
- [Fallback fonts](/docs/fonts/#missing-fonts-and-characters): characters none of the document's fonts has are drawn
  with built-in fonts, as browsers use system fonts: Central European, Greek and Cyrillic letters with the bundled
  Liberation fonts (no more `?` with the standard fonts), and arrows, check marks, stars, dingbats, math and box
  drawing with PdfPecker Symbols, a DejaVu Sans subset. Documents that need no fallback come out byte-identical.
- Positioning: absolutely positioned children of flex and grid containers (corner ribbons, sale badges) take no room
  and are placed by their offsets, a `position: relative` table cell holds its positioned content, and outlines on
  cells of a collapsed table are drawn.
- [Logical border properties](/docs/html-and-css/#css-properties) (`border-inline`, `border-block-start` and the rest,
  and the logical radii), and logical margins, paddings and insets now follow `writing-mode` too.
- Fractions with `diagonal-fractions` or `font-feature-settings: "frac"` are formed as in Chrome.
- Fixes, all closer to Chrome: an empty clearfix `div` and `<br clear=all>` clear floats; `vertical-align: top`,
  `middle` and `text-top` work on smaller inline text; auto margins on inline-blocks count as 0; a flex or grid item
  keeps its first and last child's margins; percentage columns that crowd out other columns give way and a cell's
  `max-width` caps its column (with an ellipsis where asked); an image with a percentage width no longer widens a
  table; a box shadow never adds a blank page; `backdrop-filter` works at every box size; the default `<hr>` has
  Chrome's lighter shading, `<hr size>`, `color` and `noshade` work, and a margin on a vertical inline-block no
  longer counts twice.
- About 10% faster on invoices, feature tours and reports than 1.17.0, with byte-identical output.
- Pages with content wider than the page area, clearfix divs, floats, tables with percentage columns or capped cells,
  inline-blocks with auto margins and default `<hr>` rules look different from 1.17.0.

## 1.17.0

Released 21 October 2026.

- [PDF to HTML](/docs/pdf-to-html/): `PdfToHtml` turns any PDF into one self-contained HTML page, with the page images,
  an invisible text layer that can be selected, searched and read aloud, and working links.
- [Float shapes](/docs/html-and-css/#float-shapes) (`shape-outside`, `shape-margin`, `shape-image-threshold`),
  [drop caps](/docs/html-and-css/#drop-caps) with `initial-letter`, [masks and `backdrop-filter`](/docs/html-and-css/#masks-and-backdrop-filter)
  on HTML elements, [`display: contents`](/docs/html-and-css/#display-contents),
  [3D transforms](/docs/html-and-css/#3d-transforms) drawn flat, and [vertical text](/docs/html-and-css/#vertical-text)
  with `writing-mode`.
- [Text wrapping and justification](/docs/html-and-css/#text-wrapping-and-justification): `text-wrap: balance` and
  `pretty`, and `text-justify`; justified Chinese and Japanese text is spread between characters, as in Chrome.
- [CJK punctuation trimming](/docs/languages/#cjk-punctuation-trimming) with `text-spacing-trim`. CJK text with
  adjacent punctuation is narrower than before and can break into lines differently; `text-spacing-trim: space-all`
  keeps the old spacing.
- Text: underlines and overlines skip descenders (`text-decoration-skip-ink`), dashed, dotted, double and wavy lines
  are drawn as Chrome draws them, outlined text with `-webkit-text-stroke` and `paint-order`, nested superscripts, and
  [font properties](/docs/fonts/#font-properties) `font-kerning`, `font-synthesis`, `font-size-adjust`,
  `font-variant-position` and `font-variant-east-asian`, with the font's own small capitals and the `@font-face`
  `font-stretch` descriptor.
- Units measured from the font (`ex`, `ch`, `cap`, `ic`, `lh` and the root versions), the viewport units `vi`, `vb`,
  `svh`, `dvh` and the rest, `q`, and the logical `inset-inline`, `inset-block`, `inline-size` and `block-size`.
- `width: min-content`, `max-content` and `fit-content`, wrapping column flex boxes, `min-width: 0` on flex items,
  capped grid `fit-content()` tracks, and flex items taller than their row staying in place (Bootstrap progress bars).
- [Tables](/docs/html-and-css/#tables): CSS tables on any element with anonymous table boxes, `inline-table`, row group
  and column backgrounds, `caption-side`, `empty-cells`, cell `min-width` and `max-width`, column widths under spanning
  cells and percentages over 100% shared out as in Chrome, long words widening a table instead of overflowing, and
  collapsed borders resolved as in Chrome, on rows and row groups too.
- HTML: `<details>`, `<progress>` and `<meter>`, `list-style-position: inside`, old attributes (`img align`, `hspace`,
  `table bordercolor` and `rules`, list `type`, `reversed`, `align=center`), and the `html`, `head` and `body`
  elements a fragment leaves out (an implied body has no default margin, so fragments keep their layout).
- Images: a missing image prints its alt text, inline images draw their border, padding, background and shadow, take
  vertical margins in the line, and resolve percentage widths against the containing block, as in Chrome.
- Selectors and the cascade: `:dir()`, `::placeholder`, the `quotes` property (also `auto` by language), the `all`
  property and CSS-wide keywords on shorthands; `vertical-align` lengths and percentages.
- SVG: `use` of a symbol from another inline SVG, symbol `viewBox` fitting, group `opacity`, and `text-decoration` on
  SVG text. Gradients and background tiles turn and scale with transformed boxes.
- Despite the new features, warm conversions are within a few percent of 1.16.0's speed. Bounded work for nested columns,
  tables, generated content and backdrop filters on hostile input.
- Tables with colspans, percentages, long words or collapsed borders, lines with superscripts, decorated text,
  inline images and justified CJK text look different from 1.16.0, closer to Chrome.

## 1.16.0

Released 20 October 2026.

- [Borders on inline elements](/docs/html-and-css/#css-properties): badges, keyboard keys and dotted underlines drawn
  with `border` on a `<span>` are painted, with `box-decoration-break` deciding how a border split over several lines
  is drawn.
- [SVG](/docs/html-and-css/#svg) dashed strokes with `stroke-dasharray`, `stroke-dashoffset` and `pathLength`, and text
  along a path with `textPath`.
- [Grid rows break across pages](/docs/html-and-css/#pagination) where they start instead of moving whole and leaving a
  gap, and a margin that runs past the end of a page is dropped, as in Chrome. A box's top and bottom borders stay on
  the page with its content, and a paragraph that ends just past the page keeps its widows.
- A `<fieldset>`'s legend sits on its top border, and groove and ridge borders have Chrome's two shades.
- Form controls are sized as in Chrome: text fields in tables, textarea rows, drop-downs, date fields and check boxes,
  and controls the page gives its own border have Chrome's plain square look.
- Text can break before and after inline-blocks, images and form controls, so a label no longer wraps a word down
  next to its input.
- Line heights are rounded to Chrome's layout units, and line breaking counts the kerning next to spaces, so lines
  break where Chrome breaks them more often.
- Text extraction reads the standard Symbol and ZapfDingbats fonts (αβγ, ✓✔) instead of returning their raw codes.
- Bounded layout time for deeply nested flex, grid, tables, columns and keep-with-next chains found by fuzzing.
- Line positions, page breaks, forms, fieldsets and SVG dashes look different from 1.15.0; most documents move by a
  pixel or less.

## 1.15.0

Released 19 October 2026.

- [Invoice XML from invoice data](/docs/e-invoices/#invoice-xml-from-invoice-data): `InvoiceData` writes Factur-X /
  ZUGFeRD EN 16931 and XRechnung CII, and Peppol BIS 3.0 and XRechnung UBL, with the totals and VAT breakdown
  calculated and the EN 16931 rules checked.
- [A ready-made invoice template](/docs/e-invoices/#ready-made-invoice-template): `InvoiceTemplate.ToPdf` renders an
  A4 invoice with your logo and colour in English, German or Danish, with an EPC payment QR code and the Factur-X XML
  embedded.
- [Compacting](/docs/compacting/): `PdfCompactor` makes any PDF smaller, losslessly by default, or with images
  downsampled and recompressed as JPEG.
- A cell's `rowspan` stops at the end of its table header, body or footer, as in HTML, instead of throwing
  `NullReferenceException`.
- Deeply nested `break-inside: avoid` boxes in columns are laid out in bounded time; the output is unchanged.
- `PdfSignatureVerifier` reports a signature whose signer key cannot be read instead of throwing `OverflowException`
  (Windows, .NET 8 and 9).
- No other output changes: PDFs from 1.14.2 templates are byte-identical.

## 1.14.2

Released 18 October 2026.

- A table whose first row does not fit on the rest of a page starts on the next page, instead of leaving its header
  row behind at the bottom of the page. Chrome does the same.
- In tables with automatic layout, columns with a `width` keep it next to columns of long text, as in Chrome. Tables
  without column widths are laid out as before.

## 1.14.1

Released 18 October 2026.

- Collapsed table borders stay visible over cell backgrounds: shaded header and footer rows keep their vertical lines,
  and striped rows keep the line above them, as in Chrome. Tables with `border-collapse` and cell backgrounds look
  different from 1.14.0.

## 1.14.0

Released 18 October 2026.

- [Backgrounds on inline elements](/docs/html-and-css/#css-properties): `<span>`, `<mark>`, `<code>` and badges get
  images, gradients, `border-radius` and clipping to text, not just a colour, and `box-decoration-break` decides how a
  background split over several lines is drawn.
- [Markdown footnotes, definition lists and front matter](/docs/markdown/#footnotes-definition-lists-and-front-matter),
  with footnotes at the bottom of the page in a PDF.
- [`hyphenate-limit-chars`](/docs/languages/#hyphenation) for the shortest hyphenated word and the fewest letters around
  a hyphen.
- Rows of collapsed tables with lines only under or over each row now have Chrome's height, and balanced columns keep
  `break-inside: avoid` boxes whole without growing taller than needed.
- Bounded work for repeating gradients and deeply nested decorated inline elements on hostile input. Tables with
  collapsed row lines, rounded inline badges and some multi-column layouts look different from 1.13.0.

## 1.13.0

Released 18 October 2026.

- [Barcodes](/docs/barcodes/): QR codes (versions 1 to 40, error correction L to H), Code 128 and EAN-13 as vector SVG
  for your templates, and `Barcode.ToDataUri` for an `<img>`, a CSS background or a Markdown image.
- [EPC payment QR codes](/docs/barcodes/#epc-payment-qr-codes) (GiroCode) for euro transfers, with the IBAN, BIC,
  amount and field lengths checked.
- [Images to PDF](/docs/images-to-pdf/): PNG, JPEG, GIF, WebP, BMP and TIFF images one per page, at their own size or
  fitted to a page size with margins.
- [HTML to images](/docs/pdf-to-image/#html-to-images) in one call with `HtmlToImage`.
- No output changes: PDFs from 1.12.0 templates are byte-identical.

## 1.12.0

Released 18 October 2026.

- [Indic, Thai and Lao shaping](/docs/languages/#indic-thai-and-lao-scripts): Devanagari, Bengali, Gurmukhi, Gujarati,
  Oriya, Tamil, Telugu, Kannada and Malayalam, Thai and Lao are shaped as HarfBuzz shapes them, and combining marks in
  Latin, Greek and Cyrillic are placed on their letters.
- `background-clip: text` (also as `-webkit-background-clip`).
- [Tables across pages](/docs/html-and-css/#pagination): `<tfoot>` repeats at the bottom of every page, and tables
  inside flex and grid items break across pages instead of moving whole.
- [Reproducible output](/docs/options/#reproducible-output): with `CreationDate` or `SOURCE_DATE_EPOCH` the same input
  gives a byte-identical PDF, also for merging, page tools, stamping and form filling.
- [Cancellable signing](/docs/signatures/#long-term-validation), `AddValidationDataAsync`, and cancellation-token and
  `Stream` overloads across the API.
- [`PdfPeckerException`](/docs/options/#errors-cancellation-and-output-files) as the base of the library's own
  exceptions, and file output that leaves an existing file untouched when a conversion fails.
- [`StampHtml`](/docs/stamping/#placement) ignores the footer, header, watermark and other document-level options.
- `text-transform: uppercase` turns ß into SS and handles Turkish dotted and dotless i; `hyphens: auto` hyphenates
  decomposed words; CSS integers are read correctly on servers with an Arabic or Persian culture.
- Bounded work on malformed JPEG 2000, JBIG2, e-invoices, attachments and CSS, and less memory for JPEG and WebP
  output. Tables with a `<tfoot>`, tables in flex and grid, and Indic and Thai text look different from 1.11.0 on
  purpose.

## 1.11.0

Released 18 October 2026.

- [Subgrid](/docs/html-and-css/#subgrid) (CSS Grid Level 2): `grid-template-columns` and `grid-template-rows: subgrid`
  line nested grids up with their parent's tracks.
- [Multi-column layout](/docs/html-and-css/#multi-column-layout) splits paragraphs, lists and tables across columns
  and onto later pages, as Chrome does, instead of keeping each child whole in the first columns.
- [Percentage heights](/docs/html-and-css/#percentage-heights) resolve against definite containing blocks, as in
  browsers.
- Blurred box shadows, translucent gradient stops and SVG `stop-opacity` are truly transparent, blending with what is
  behind them instead of with white.
- [Hyphenation](/docs/languages/#hyphenation) in Swedish, Spanish, French, Italian, Portuguese and Polish; French and
  Italian also hyphenate words with elisions such as *l'ordinateur*.
- Correct word widths in paragraphs with an inline-block, and shaping of Arabic Extended-C characters outside the
  Basic Multilingual Plane.
- Bounded work on crafted fonts and malformed PDFs, and linear time for Markdown autolinks, nested inline-blocks and
  headings kept with nested lists, flex rows and tables. No public API changes.

## 1.10.0

Released 18 October 2026.

- [PDF to TIFF](/docs/pdf-to-image/#tiff): a whole PDF as one multi-page TIFF, or single pages, in colour, greyscale
  or black and white with CCITT Group 4, LZW, Deflate or PackBits compression.
- [Read the invoice back](/docs/e-invoices/#reading-the-invoice-from-a-received-pdf) from a received Factur-X,
  ZUGFeRD or XRechnung PDF with `PdfEInvoice.Read`.
- [Trusted timestamps](/docs/signatures/#trusted-timestamps): a timestamp's time is used to check the signer's
  certificate only when its authority is trusted (`TimestampTrusted`), so an untrusted timestamp no longer makes an
  expired certificate pass.
- [`PdfLtvOptions.UrlFilter`](/docs/signatures/#long-term-validation) decides which OCSP and CRL addresses long-term
  validation may contact, and fetching is bounded in URLs, redirects and time.
- `::first-line` styles on small capitals and mixed-direction text no longer lose their style or throw, and Arabic
  text in PDF/A-2u, 3u and PDF/UA maps every glyph back to Unicode.
- Tighter limits for hostile input found by fuzzing (images, SVG filters, soft masks, fonts, signature stores), more
  renderer features (soft-mask Matte, CalRGB and CalGray), and symbol packages with SourceLink on NuGet.

## 1.9.0

Released 16 October 2026.

- [Chinese, Japanese and Korean line breaking](/docs/languages/#chinese-japanese-and-korean-line-breaking) with
  kinsoku rules, CSS `line-break` and `word-break: keep-all`.
- [External signers](/docs/signatures/#external-signers-hsms-smart-cards-and-key-vaults): sign with a key in an HSM,
  smart card or cloud key vault, and `PdfSigner.SignAsync`.
- [Signature verification](/docs/signatures/#verifying-signatures) and
  [long-term validation](/docs/signatures/#long-term-validation) (PAdES B-LT and B-LTA).
- [Text extraction](/docs/text-extraction/) from any PDF, with the position of every line and word.
- [Fill and flatten the forms](/docs/forms/#filling-and-flattening-existing-pdfs) of existing PDFs.
- [Container queries](/docs/html-and-css/#container-queries) and the `cq` units.
- [Footnotes](/docs/paged-media/#footnotes) with `float: footnote`, numbered calls and a styled footnote area.
- Each page laid out at its own width when `:first`, `:left` or `:right` change it, and right-to-left page order.
- Blurred text shadows with a true Gaussian blur, shadows on underlines, and selectable text under `filter: blur()`.
- `aspect-ratio` in shrink-to-fit widths, with `min-`/`max-height` and on tables; `object-fit` for SVG images; and
  complex selectors inside `:is()`, `:where()`, `:not()` and `:has()`.

## 1.8.0

Released 16 October 2026.

- Variable fonts: weight, width, italic and optical size axes, `font-variation-settings`, kerning and CFF2 outlines
  (see [Fonts](/docs/fonts/#variable-fonts)).
- OpenType figures and features: `font-variant-numeric` (tabular, old-style, fractions and more) and
  `font-feature-settings` (see [Fonts](/docs/fonts/#opentype-features)).
- `border-image`, CSS `filter`, `clip-path` on HTML elements, blend modes, 3D border styles, inset box shadows,
  `::first-letter` and `::first-line`, `@counter-style` and relative colours.
- Every SVG filter primitive, with primitive subregions, and text inside filtered SVG stays selectable.
- `<image>` in SVG, SVG watermarks, and BMP and TIFF images.
- `@import`, and `:first`, `:left` and `:right` page margins and sizes.
- The manual moved from the README to [pdfpecker.net/docs](/docs/), and the NuGet package links to it and has an icon.

## 1.7.0

Released 15 October 2026.

- [Stamping](/docs/stamping/): put a page of one PDF over or under the pages of another.
- [Attachments](/docs/attachments/): attach any file to a PDF and read attachments back.
- [Automatic hyphenation](/docs/languages/#hyphenation) with `hyphens: auto`.
- [Add, change or remove passwords](/docs/pdfa-and-passwords/#passwords-on-existing-pdfs) on existing PDFs.
- [Extract, reorder, remove, rotate and split pages](/docs/merging/#extracting-reordering-and-splitting-pages).
- [JPEG and WebP output](/docs/pdf-to-image/#output-formats) from `PdfToImage`.
- [PDF/A](/docs/pdfa-and-passwords/#pdfa)-2u, 3u, 4 and 4f, and [PDF/UA-2](/docs/accessibility/#pdfua-2).
- Right-to-left text in SVG, and right-to-left ellipsis.

## 1.6.0

Released 15 October 2026.

- [Right-to-left text](/docs/languages/) with Arabic and Hebrew shaping.
- Named pages, running headers and footers from HTML, table of contents page numbers with `target-counter()` and
  `leader()`, and `conic-gradient()` (see [Paged media](/docs/paged-media/)).
- Much more of CSS3: modern colour syntax, `calc()` and the other math functions, `@layer`, nesting, `@supports`,
  `@property`, media queries, `:has()` and margin boxes.
- Sign into an existing empty signature field, merging keeps tagging and PDF/UA, and `PdfOptions.MissingCharacter`
  reports characters no font has.

## 1.5.1

Released 14 October 2026.

- Targets .NET 8 and 9 as well as .NET 10.
- Complete third-party licence notices, used as the NuGet package licence. 1.5.0 was never published, because
  nuget.org did not accept its licence expression.

## 1.4.0

Released 14 October 2026.

- [Fillable PDF forms](/docs/forms/) from HTML inputs, check boxes, radio buttons, selects and text areas.

## 1.3.0

Released 14 October 2026.

- [Tagged PDF and PDF/UA-1](/docs/accessibility/) output.
- SVG masks, patterns, markers and filters, clipping in table cells, and double rounded borders.

## 1.2.0

Released 14 October 2026.

- Attach PDFs to [Peppol and OIOUBL (UBL) e-invoices](/docs/e-invoices/).
- Faster HTML to PDF, with half the memory allocations and decoded images reused.

## 1.1.1

Released 13 October 2026.

- The README shows its logo on nuget.org and has a NuGet badge. No changes to the library.

## 1.1.0

Released 13 October 2026.

- [Factur-X and ZUGFeRD e-invoices](/docs/e-invoices/).
- SVG, GIF and WebP images.
- [Streaming PDF merging](/docs/merging/): stream and async overloads with one input in memory at a time.
- `calc()`, `min()`, `max()` and `clamp()`, `:nth-of-type`, `:is()`, `:where()`, `object-fit`, `text-overflow`,
  `outline`, `text-shadow` and `aspect-ratio`.
- Header and footer heights are rounded to whole points, as Chrome does.

## 1.0.0

Released 12 October 2026.

- The first release: HTML and Markdown to PDF and PDF to PNG with its own HTML parser, CSS engine, layout engine, PDF
  writer and renderer, and no dependencies outside the .NET base class library.
