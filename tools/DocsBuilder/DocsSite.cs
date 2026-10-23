using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using PdfPecker;

// One manual: the latest at /docs/, or an archived one at /docs/v<version>/. SinglePage is an old library README,
// whose sidebar lists its sections instead of pages.
record Manual(string Version, string Source, Section[] Sections, string Base, bool Latest = false, bool SinglePage = false)
{
    public Page[] Pages { get; } = Sections.SelectMany(s => s.Pages).ToArray();

    public string Href(Page p) => p.Slug.Length == 0 ? Base : $"{Base}{p.Slug}/";

    public string PdfUrl => Latest ? $"/docs/{DocsPdf.FileName}" : $"/docs/{DocsVersions.Folder}/{DocsVersions.FileName(Version)}";
}

// Writes the pages and search index of one manual. Every manual uses the same templates, so an old manual keeps the
// site's current header, footer and styles, and the version picker on every page lists every manual.
// main, when the library has unreleased commits, adds them to the latest manual's changelog and home page and puts a
// "main (unreleased)" entry, which opens that list, at the top of every manual's version picker.
sealed partial class ManualSite(Manual manual, string? previousVersion, IReadOnlyList<Manual> all, string docsOutput, Unreleased? main = null)
{
    readonly Dictionary<Page, string> titles = [];
    readonly Dictionary<Page, List<(string Href, string Title, bool New)>> changes = [];
    readonly Dictionary<Page, List<(string Id, string Title)>> sectionsOf = [];
    readonly Dictionary<string, bool> sectionTags = [];

    string OutputDir => manual.Latest ? docsOutput : Path.Combine(docsOutput, "v" + manual.Version);

    // Returns the pages for the PDF, which is the manual of the released version and so leaves out main's commits.
    public List<(Page Page, string Body)> Build()
    {
        var pages = manual.Pages;
        var plain = new List<(Page Page, string Body)>();
        var rendered = new List<(Page Page, string Body)>();
        var forPdf = new List<(Page Page, string Body)>();
        foreach (var page in pages)
        {
            var text = File.ReadAllText(Path.Combine(manual.Source, page.File + ".md")).ReplaceLineEndings("\n");
            if (manual.SinglePage) text = DocsVersions.StripImages(text);
            var released = text;
            if (main != null && manual.Latest && page.File == "changelog") text = DocsMain.InsertInto(text, DocsMain.Markdown(main));
            var (markdown, marks) = DocsChanges.Extract(text, page.File);
            titles[page] = manual.SinglePage ? "Manual"
                : Regex.Match(markdown, @"^# (.+)$", RegexOptions.Multiline).Groups[1].Value;
            var body = LocalLinks(Program.Polish(MarkdownToHtml.Convert(markdown)));
            // A few README paragraphs come out as raw HTML blocks, where a mention of <style> would become a real
            // element and hide the rest of the page; the READMEs never meant to embed one.
            if (manual.SinglePage) body = RawElementPattern().Replace(body, m => WebUtility.HtmlEncode(m.Value));
            plain.Add((page, body));
            sectionsOf[page] = H2Pattern().Matches(body).Select(m => (m.Groups[1].Value, PlainHtml(m.Groups[2].Value))).ToList();
            var changed = new List<(string Href, string Title, bool New)>();
            rendered.Add((page, DocsChanges.Apply(body, marks, manual.Version, manual.Href(page), changed, note: !manual.SinglePage)));
            changes[page] = changed;
            if (released == text) forPdf.Add(rendered[^1]);
            else
            {
                var (releasedMarkdown, releasedMarks) = DocsChanges.Extract(released, page.File);
                forPdf.Add((page, DocsChanges.Apply(LocalLinks(Program.Polish(MarkdownToHtml.Convert(releasedMarkdown))),
                    releasedMarks, manual.Version, manual.Href(page), [], note: !manual.SinglePage)));
            }
            if (manual.SinglePage)
            {
                var h2s = H2Pattern().Matches(body);
                foreach (var c in changed)
                {
                    var id = c.Href[(c.Href.IndexOf('#') + 1)..];
                    var at = body.IndexOf($"id=\"{id}\"", StringComparison.Ordinal);
                    var h2 = h2s.LastOrDefault(m => m.Index <= at);
                    if (h2 == null) continue;
                    var h2Id = h2.Groups[1].Value;
                    sectionTags[h2Id] = (h2Id == id && c.New) || (sectionTags.TryGetValue(h2Id, out var n) && n);
                }
            }
        }
        // The manual's home page lists everything that changed since the version before it. On a one-page manual that
        // list is the only note, since a line under the title as well would repeat it.
        var summary = DocsChanges.Summary(manual.Version, previousVersion, pages.Select(p => (p, changes[p])), manual.SinglePage);
        forPdf[0] = (forPdf[0].Page, DocsChanges.InsertAfterTitle(forPdf[0].Body, summary));
        if (main != null && manual.Latest) summary = DocsChanges.Summary(manual.Version, previousVersion, pages.Select(p => (p, changes[p])), manual.SinglePage,
            DocsMain.HomeLine(main));
        rendered[0] = (rendered[0].Page, DocsChanges.InsertAfterTitle(rendered[0].Body, summary));

        for (int i = 0; i < pages.Length; i++)
        {
            var page = pages[i];
            var html = Render(page, titles[page], rendered[i].Body, i > 0 ? pages[i - 1] : null, i < pages.Length - 1 ? pages[i + 1] : null);
            var dir = page.Slug.Length == 0 ? OutputDir : Path.Combine(OutputDir, page.Slug);
            Directory.CreateDirectory(dir);
            File.WriteAllText(Path.Combine(dir, "index.html"), html, new UTF8Encoding(false));
        }
        // The search index is built from the pages without the change marks, so "New in" does not match every search.
        File.WriteAllText(Path.Combine(OutputDir, "search.json"), DocsSearch.BuildIndex(plain, manual.Href), new UTF8Encoding(false));
        return forPdf;
    }

    // Links between docs pages in an archived manual stay in that manual when it has the page; others go to the latest.
    string LocalLinks(string html) => manual.Latest ? html : DocsLinkPattern().Replace(html, m =>
    {
        var slug = m.Groups[1].Value;
        return manual.Pages.Any(p => p.Slug == slug) ? $"href=\"{manual.Base}{(slug.Length == 0 ? "" : slug + "/")}{m.Groups[2].Value}\"" : m.Value;
    });

    string Render(Page page, string title, string body, Page? previous, Page? next)
    {
        var url = "https://pdfpecker.net" + manual.Href(page);
        var fullTitle = Encode(title) + (manual.Latest ? " · PdfPecker docs" : $" · PdfPecker {manual.Version} docs");
        var latest = all[0];
        var sb = new StringBuilder();
        sb.Append($"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>{fullTitle}</title>
            <meta name="description" content="{Encode(page.Description)}">
            <link rel="canonical" href="{url}">

            """);
        // Old manuals stay out of search results, which should send people to the current one.
        if (!manual.Latest) sb.Append("<meta name=\"robots\" content=\"noindex\">\n");
        sb.Append($"""
            <meta property="og:type" content="article">
            <meta property="og:site_name" content="PdfPecker">
            <meta property="og:title" content="{fullTitle}">
            <meta property="og:description" content="{Encode(page.Description)}">
            <meta property="og:url" content="{url}">
            <meta property="og:image" content="https://pdfpecker.net/og-image.png">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="630">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="theme-color" content="#0b0b0f">
            <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
            <link rel="apple-touch-icon" href="/apple-touch-icon.png">
            <link rel="stylesheet" href="/site.css">
            <script src="/nav.js" defer></script>
            </head>
            <body class="home docs-page">
            <!-- Generated by tools/DocsBuilder from {(manual.Latest ? "docs" : "docs/" + DocsVersions.SourceFolder + "/" + manual.Version)}/{page.File}.md; edit that file instead. -->
            <a class="skip" href="#main">Skip to content</a>
            {Program.Header}

            <div class="wrap docs-layout">
              <details class="docs-menu">
                <summary>Docs{(manual.Latest ? "" : " " + manual.Version)}: {Encode(manual.SinglePage ? "Contents" : page.Title)}</summary>
            {Toc(page, "    ")}
              </details>
              <aside class="docs-side" aria-label="Documentation">
            {Toc(page, "    ")}
              </aside>
              <main id="main" class="docs-body">
                <div class="docs-tools">
                  <form class="docs-search" role="search" data-index="{manual.Base}search.json">
                    <label class="sr" for="docs-q">Search the docs</label>
                    <input id="docs-q" type="search" placeholder="Search the {(manual.Latest ? "" : manual.Version + " ")}docs" autocomplete="off" spellcheck="false"
                      aria-controls="docs-results" aria-expanded="false" aria-autocomplete="list">
                    <kbd aria-hidden="true">/</kbd>
                    <ul id="docs-results" class="docs-results" role="listbox" hidden></ul>
                  </form>
                  <div class="docs-download">
                    <label class="sr" for="docs-version">PdfPecker version</label>
                    <select id="docs-version" class="docs-version" autocomplete="off" data-slug="{page.Slug}">
            {VersionOptions("          ")}
                    </select>
                    <a class="button docs-pdf" href="{manual.PdfUrl}" download="{DocsVersions.DownloadName(manual.Version)}">Download PDF</a>
                    <a class="docs-changelog" href="/docs/changelog/">Changelog</a>
                  </div>
                </div>

            """);
        if (!manual.Latest)
        {
            var same = latest.Pages.FirstOrDefault(p => p.Slug == page.Slug);
            sb.Append($"""
                    <p class="docs-old">This is the manual for PdfPecker {manual.Version}. <a href="{(same == null ? latest.Base : latest.Href(same))}">Read it for the latest version, {latest.Version}</a>.</p>

                """);
        }
        sb.Append("""
                <article class="prose">

            """);
        sb.Append(body.TrimEnd()).Append('\n');
        sb.Append("""
                  </article>
                  <nav class="docs-pager" aria-label="Previous and next">

            """);
        if (previous != null) sb.Append($"        <a class=\"prev\" href=\"{manual.Href(previous)}\"><small>Previous</small>{Encode(previous.Title)}</a>\n");
        if (next != null) sb.Append($"        <a class=\"next\" href=\"{manual.Href(next)}\"><small>Next</small>{Encode(next.Title)}</a>\n");
        sb.Append("    </nav>\n");
        if (manual.Latest)
            sb.Append($"    <p class=\"docs-edit\"><a href=\"https://github.com/Moonwalker1307/PdfPecker.Web/blob/main/docs/{page.File}.md\">Edit this page on GitHub</a></p>\n");
        sb.Append($"""
                </main>
              </div>

              {Program.Footer}
              <script src="/docs-search.js"></script>
              </body>
              </html>

              """);
        return sb.ToString();
    }

    // One option per manual, newest first. Choosing one opens the same page in that manual, or its first page when it
    // has no such page (docs-search.js); data-pages lists the pages each manual has.
    string VersionOptions(string indent) => (main == null || main.Groups.Count == 0 ? "" :
        $"{indent}<option value=\"/docs/changelog/#{DocsMain.Anchor}\">main (unreleased)</option>\n") + string.Join("\n", all.Select(m =>
        $"{indent}<option value=\"{m.Base}\" data-pages=\"{string.Join(' ', m.Pages.Select(p => p.Slug).Where(s => s.Length > 0))}\"" +
        $"{(m == manual ? " selected" : "")}>{m.Version}{(m.Latest ? " (latest)" : "")}</option>"));

    string Toc(Page current, string indent)
    {
        var sb = new StringBuilder();
        sb.Append(indent).Append("<nav class=\"docs-toc\">\n");
        if (manual.SinglePage)
        {
            // An old README is one long page, so its sidebar is its sections.
            sb.Append(indent).Append($"  <p>PdfPecker {manual.Version}</p>\n");
            sb.Append(indent).Append("  <ul>\n");
            foreach (var (id, title) in sectionsOf[current])
                sb.Append(indent).Append($"    <li><a href=\"#{id}\">{Encode(title)}{SectionTag(id)}</a></li>\n");
            sb.Append(indent).Append("  </ul>\n");
        }
        else
        {
            foreach (var section in manual.Sections)
            {
                sb.Append(indent).Append("  <p>").Append(Encode(section.Title)).Append("</p>\n");
                sb.Append(indent).Append("  <ul>\n");
                foreach (var p in section.Pages)
                {
                    var currentAttr = p == current ? " aria-current=\"page\"" : "";
                    sb.Append(indent).Append($"    <li><a href=\"{manual.Href(p)}\"{currentAttr}>{Encode(p.Title)}{PageTag(p)}</a></li>\n");
                }
                sb.Append(indent).Append("  </ul>\n");
            }
        }
        sb.Append(indent).Append("</nav>");
        return sb.ToString();
    }

    // A small tag in the sidebar on pages that are new or changed in this manual's version.
    string PageTag(Page p)
    {
        var list = changes[p];
        if (list.Count == 0) return "";
        var isNew = list.Any(c => c.Title.Length == 0);
        return $" <span class=\"change{(isNew ? " new" : "")}\" title=\"{(isNew ? "New" : "Changed")} in {manual.Version}\">{(isNew ? "New" : "Changed")}</span>";
    }

    // The same tag on a section of a one-page manual. Its sidebar lists only the "## " headings, so a new "### "
    // section shows as a change to the "## " section around it.
    string SectionTag(string id) => sectionTags.TryGetValue(id, out var isNew)
        ? $" <span class=\"change{(isNew ? " new" : "")}\" title=\"{(isNew ? "New" : "Changed")} in {manual.Version}\">{(isNew ? "New" : "Changed")}</span>"
        : "";

    static string Encode(string s) => WebUtility.HtmlEncode(s);

    static string PlainHtml(string html) => WebUtility.HtmlDecode(Regex.Replace(html, "<[^>]+>", "")).Trim();

    [GeneratedRegex("<(style|script|textarea|title)\\b[^>]*>")]
    private static partial Regex RawElementPattern();

    [GeneratedRegex("""<h2 id="([^"]+)">(.*?)</h2>""", RegexOptions.Singleline)]
    private static partial Regex H2Pattern();

    [GeneratedRegex("href=\"/docs/([a-z0-9-]*)/?((?:#[^\"]*)?)\"")]
    private static partial Regex DocsLinkPattern();
}
