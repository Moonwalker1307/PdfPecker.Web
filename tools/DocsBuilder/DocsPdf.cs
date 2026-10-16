using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using PdfPecker;

// The whole manual as one PDF, made by PdfPecker itself: a cover, a table of contents with page numbers
// (target-counter and leader), every docs page as a chapter, running headers, bookmarks and PDF/UA tags.
static partial class DocsPdf
{
    public const string FileName = "pdfpecker-docs.pdf";

    // An old library README (the manual before 1.7.0) as one chapter, with the same cover, contents and styles.
    public static byte[] BuildReadme(string body, string versionText, string wwwroot) =>
        Build([(new Page("readme", "README", $"PdfPecker {versionText}", ""), body)], wwwroot, versionText);

    public static byte[] Build(IReadOnlyList<(Page Page, string Body)> pages, string wwwroot, string versionText)
    {

        var toc = new StringBuilder();
        var chapters = new StringBuilder();
        foreach (var (page, body) in pages)
        {
            var prefix = Prefix(page.Slug);
            // Ids are unique within a page but not across pages (several pages have an "Options" section), so each
            // page's ids get the page as a prefix, and links between pages become links inside the PDF.
            var html = IdPattern().Replace(body, m => $" id=\"{prefix}--{m.Groups[1].Value}\"");
            html = DocsLinkPattern().Replace(html, m =>
            {
                var target = Prefix(m.Groups[1].Value.TrimEnd('/'));
                var anchor = m.Groups[2].Success ? m.Groups[2].Value : null;
                if (anchor == null) return $"href=\"#{target}\"";
                return $"href=\"#{target}--{anchor}\"";
            });
            html = LocalAnchorPattern().Replace(html, m => $"href=\"#{prefix}--{m.Groups[1].Value}\"");
            html = html.Replace("<div class=\"table-scroll\">", "<div>");
            chapters.Append($"<section class=\"chapter\" id=\"{prefix}\">\n").Append(html).Append("</section>\n");

            var pageTag = html.Contains("<p class=\"changes\"><b>New in") ? " <span class=\"change new\">New</span>" : "";
            toc.Append($"<li class=\"toc-page\"><a href=\"#{prefix}\">{WebUtility.HtmlEncode(page.Title)}</a>{pageTag}</li>\n");
            foreach (Match h in H2Pattern().Matches(html))
                toc.Append($"<li class=\"toc-section\"><a href=\"#{h.Groups[1].Value}\">{ChangePattern().Replace(h.Groups[2].Value, "")}</a>{ChangeTag(h.Groups[2].Value)}</li>\n");
        }

        var document = $$"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="utf-8">
            <title>PdfPecker manual</title>
            <style>{{Style}}</style>
            </head>
            <body>
            <section class="cover">
              <img src="logo.png" alt="PdfPecker logo" width="180" height="180">
              <h1 class="cover-title">PdfPecker manual</h1>
              <p class="cover-sub">Fast HTML and Markdown to PDF for .NET, with no dependencies.</p>
              <p class="cover-version">For PdfPecker {{versionText}} · pdfpecker.net/docs</p>
            </section>
            <nav class="toc" aria-label="Contents">
              <h1 class="toc-title">Contents</h1>
              <ul>
            {{toc}}  </ul>
            </nav>
            {{chapters}}</body>
            </html>
            """;

        var options = new PdfOptions
        {
            BaseDirectory = wwwroot,
            Title = "PdfPecker manual",
            Author = "PdfPecker",
            Subject = $"The PdfPecker {versionText} documentation from pdfpecker.net/docs",
            Language = "en",
            Accessibility = PdfAccessibility.PdfUA1,
            EmbedStandardFonts = true,
            // A few examples show Arabic, Hebrew or other scripts the bundled fonts lack; DejaVu, which most Linux
            // machines (and the GitHub runners) have, covers them.
            UseSystemFonts = true,
        };
        return HtmlToPdf.Convert(document, options);
    }

    static string Prefix(string slug) => slug.Length == 0 ? "start" : slug.Replace('/', '-');

    // In the contents, a changed section's badge goes after the page number rather than inside the link, which ends in
    // the leader and the number.
    static string ChangeTag(string heading)
    {
        var m = ChangePattern().Match(heading);
        return m.Success ? m.Value : "";
    }

    [GeneratedRegex(""" ?<span class="change[^"]*">[^<]*</span>""")]
    private static partial Regex ChangePattern();

    [GeneratedRegex(""" id="([^"]+)"(?=>)""")]
    private static partial Regex IdPattern();

    [GeneratedRegex("href=\"/docs/([a-z0-9-]*/?)(?:#([^\"]+))?\"")]
    private static partial Regex DocsLinkPattern();

    [GeneratedRegex("href=\"#([^\"]+)\"")]
    private static partial Regex LocalAnchorPattern();

    [GeneratedRegex("""<h2 id="([^"]+)">(.*?)</h2>""", RegexOptions.Singleline)]
    private static partial Regex H2Pattern();

    // Print styles: the site's red and black on white paper, code on a light grey background.
    const string Style = """
        @page { size: A4; margin: 22mm 18mm 20mm;
          @top-left { content: string(chapter); font: 8.5pt Helvetica, sans-serif; color: #777 }
          @top-right { content: "PdfPecker manual"; font: bold 8.5pt Helvetica, sans-serif; color: #e0252b }
          @bottom-right { content: counter(page) " / " counter(pages); font: 8.5pt Helvetica, sans-serif; color: #777 } }
        @page :first { @top-left { content: none } @top-right { content: none } @bottom-right { content: none } }
        body { font: 10.5pt/1.5 Helvetica, Arial, sans-serif; color: #16161d; }
        a { color: #c41d23; text-decoration: none; }
        .cover { text-align: center; padding-top: 55mm; }
        .cover img { display: block; margin: 0 auto 14mm; }
        .cover-title { font-size: 34pt; margin: 0 0 6mm; letter-spacing: -0.5pt; }
        .cover-sub { font-size: 14pt; color: #5b5d6b; margin: 0 0 30mm; }
        .cover-version { font: 10pt "Liberation Mono", "DejaVu Sans Mono", monospace; color: #e0252b; }
        .toc { break-before: page; }
        .toc-title { font-size: 24pt; margin: 0 0 8mm; }
        .toc ul { list-style: none; margin: 0; padding: 0; }
        .toc li { margin: 0; }
        .toc a { color: #16161d; }
        .toc a::after { content: leader(dotted) " " target-counter(attr(href), page); }
        .toc-page { font-weight: bold; margin-top: 3.5mm !important; break-after: avoid; }
        .toc-section { padding-left: 6mm; font-size: 9.5pt; color: #333; }
        .chapter { break-before: page; }
        h1 { font-size: 24pt; line-height: 1.15; margin: 0 0 6mm; padding-bottom: 3mm; border-bottom: 2.5pt solid #e0252b;
          string-set: chapter content(); }
        h2 { font-size: 14.5pt; margin: 8mm 0 2.5mm; }
        h3 { font-size: 12pt; margin: 6mm 0 2mm; }
        p, ul, ol { margin: 0 0 3mm; }
        li { margin-bottom: 1mm; }
        code { font: 0.88em "Liberation Mono", "DejaVu Sans Mono", monospace; background: #f1f1f5; padding: 0 2pt; border-radius: 2pt;
          overflow-wrap: anywhere; }
        pre { background: #f6f6f8; border: 0.75pt solid #dcdce4; border-left: 3pt solid #e0252b; border-radius: 3pt;
          padding: 3mm 4mm; margin: 0 0 4mm; white-space: pre-wrap; overflow-wrap: anywhere; break-inside: avoid;
          font: 8pt/1.4 "Liberation Mono", "DejaVu Sans Mono", monospace; }
        pre code { background: none; padding: 0; font: inherit; }
        .cs .k { color: #c41d23; } .cs .s { color: #1f7a3a; } .cs .c { color: #7a7c8c; font-style: italic; }
        .cs .t { color: #1f5fa8; } .cs .n { color: #a05a00; }
        table { width: 100%; border-collapse: collapse; margin: 0 0 4mm; font-size: 8.5pt; line-height: 1.4; }
        th, td { border: 0.75pt solid #dcdce4; padding: 1.5mm 2mm; text-align: left; vertical-align: top; }
        thead th { background: #f1f1f5; }
        thead { display: table-header-group; }
        tr { break-inside: avoid; }
        .change { font: bold 7pt Helvetica, sans-serif; color: #fff; background: #5b5d6b; border-radius: 2pt;
          padding: 0.5pt 3pt; vertical-align: middle; white-space: nowrap; }
        .change.new { background: #e0252b; }
        .toc .change { margin-left: 2mm; }
        .changes { border-left: 3pt solid #e0252b; background: #fdf1f1; padding: 2mm 4mm; margin: 0 0 4mm; }
        .changes p { margin: 0 0 1.5mm; }
        .changes ul { margin: 0; padding-left: 5mm; }
        blockquote { margin: 0 0 3mm; padding-left: 4mm; border-left: 3pt solid #e0252b; color: #5b5d6b; }
        """;
}
