using System.Net;
using System.Text;
using System.Text.RegularExpressions;

// What changed in the docs since the previous PdfPecker version. A heading in docs/*.md ends with {new 1.7.0} or
// {changed 1.7.0} to say its section (or, on the "# " heading, the whole page) is new or changed in that version.
// Only marks for the version the site uses are shown, so the marks for one release disappear by themselves when the
// site moves to the next and only "since last time" is ever highlighted.
static partial class DocsChanges
{
    public static (string Markdown, List<Mark> Marks) Extract(string markdown, string file)
    {
        var marks = new List<Mark>();
        var inFence = false;
        var lines = markdown.Split('\n');
        for (int i = 0; i < lines.Length; i++)
        {
            if (lines[i].StartsWith("```")) inFence = !inFence;
            if (inFence) continue;
            var m = MarkPattern().Match(lines[i]);
            if (!m.Success) continue;
            lines[i] = m.Groups[1].Value + m.Groups[2].Value;
            marks.Add(new Mark(m.Groups[1].Value.Length - 1, PlainMarkdown(m.Groups[2].Value),
                m.Groups[3].Value == "new", m.Groups[4].Value, file));
        }
        return (string.Join('\n', lines), marks);
    }

    // Puts a badge on each marked heading of the current version and a line under the page title naming what changed.
    // Returns the sections that changed, for the list on the docs home page.
    public static string Apply(string html, IReadOnlyList<Mark> marks, string version, string pageHref,
        List<(string Href, string Title, bool New)> changed, bool note = true)
    {
        var current = marks.Where(m => m.Version == version).ToList();
        foreach (var mark in marks.Where(m => !Version.TryParse(m.Version, out _)))
            throw new InvalidOperationException($"{mark.File}.md: '{mark.Version}' is not a version in the mark on '{mark.Heading}'");
        if (current.Count == 0) return html;

        var pageNew = false;
        var sections = new List<(string Id, string Title, bool New)>();
        foreach (var mark in current)
        {
            var found = false;
            html = HeadingPattern().Replace(html, h =>
            {
                if (found || h.Groups[1].Value != mark.Level.ToString() || PlainHtml(h.Groups[3].Value) != mark.Heading)
                    return h.Value;
                found = true;
                if (mark.Level == 1) { pageNew |= mark.New; return h.Value; }
                sections.Add((h.Groups[2].Value, PlainHtml(h.Groups[3].Value), mark.New));
                var badge = $" <span class=\"change{(mark.New ? " new" : "")}\">{(mark.New ? "New" : "Changed")} in {version}</span>";
                return h.Value.Insert(h.Value.Length - 5, badge);
            });
            if (!found) throw new InvalidOperationException($"{mark.File}.md: no heading '{mark.Heading}' for its change mark");
        }

        string line;
        if (pageNew)
        {
            line = $"<p class=\"changes\"><b>New in {version}.</b></p>";
            changed.Add((pageHref, "", true));
        }
        else
        {
            var links = string.Join(", ", sections.Select(s => $"<a href=\"#{s.Id}\">{WebUtility.HtmlEncode(s.Title)}</a>"));
            line = $"<p class=\"changes\"><b>Changed in {version}:</b> {links}.</p>";
            foreach (var s in sections) changed.Add((pageHref + "#" + s.Id, s.Title, s.New));
        }
        if (!note) return html;
        var h1 = H1End().Match(html);
        return h1.Success ? html.Insert(h1.Index + h1.Length, "\n" + line) : line + "\n" + html;
    }

    // The list of everything new or changed in this version, for the top of the docs home page.
    public static string Summary(string version, string? previous, IEnumerable<(Page Page, List<(string Href, string Title, bool New)> Changes)> pages,
        bool singlePage = false, string mainLine = "")
    {
        var sb = new StringBuilder();
        foreach (var (page, changes) in pages)
            foreach (var (href, title, isNew) in changes)
            {
                var name = title.Length == 0 ? page.Title : singlePage ? title : $"{page.Title}: {title}";
                sb.Append($"<li><a href=\"{href}\">{WebUtility.HtmlEncode(name)}</a> <span class=\"change{(isNew ? " new" : "")}\">{(isNew ? "New" : "Changed")}</span></li>\n");
            }
        var more = "<p class=\"changes-more\"><a href=\"/docs/changelog/\">Every release in the changelog</a></p>" +
            (mainLine.Length == 0 ? "" : "\n" + mainLine);
        // A release that changed nothing in the manual (1.1.1 only touched the README's logo) still says so, rather
        // than looking as if its changes were missing.
        if (sb.Length == 0)
            return previous == null ? "" : $"<div class=\"changes changes-list\">\n<p><b>Nothing in the manual changed in PdfPecker {version}</b> (since {previous}).</p>\n{more}\n</div>";
        return $"<div class=\"changes changes-list\">\n<p><b>New and changed in PdfPecker {version}</b>{(previous == null ? "" : $" (since {previous})")}:</p>\n<ul>\n{sb}</ul>\n{more}\n</div>";
    }

    public static string InsertAfterTitle(string html, string block)
    {
        if (block.Length == 0) return html;
        var h1 = H1End().Match(html);
        return h1.Success ? html.Insert(h1.Index + h1.Length, "\n" + block) : block + "\n" + html;
    }

    static string PlainMarkdown(string text) => text.Replace("`", "").Replace("*", "").Trim();

    static string PlainHtml(string html) => WebUtility.HtmlDecode(TagPattern().Replace(html, "")).Trim();

    [GeneratedRegex(@"^(#{1,6} )(.*?)\s*\{(new|changed) ([^}\s]+)\}\s*$")]
    private static partial Regex MarkPattern();

    [GeneratedRegex("""<h([1-6]) id="([^"]*)">(.*?)</h[1-6]>""", RegexOptions.Singleline)]
    private static partial Regex HeadingPattern();

    [GeneratedRegex("</h1>")]
    private static partial Regex H1End();

    [GeneratedRegex("<[^>]+>")]
    private static partial Regex TagPattern();
}

record Mark(int Level, string Heading, bool New, string Version, string File);
