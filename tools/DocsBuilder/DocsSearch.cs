using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;

// The search index for wwwroot/docs-search.js: one entry per section (a page's introduction and each of its h2
// sections) with its heading, link and plain text. The site has no server-side search, so the browser downloads
// this file once and searches it itself.
static partial class DocsSearch
{
    public static string BuildIndex(IEnumerable<(Page Page, string Body)> pages, Func<Page, string> href)
    {
        var entries = new List<Entry>();
        foreach (var (page, body) in pages)
        {
            // Split before every h1 and h2, so each part starts with its heading.
            foreach (var part in Regex.Split(body, "(?=<h[12] )"))
            {
                var heading = HeadingPattern().Match(part);
                if (!heading.Success) continue;
                var id = heading.Groups[2].Value;
                var title = PlainText(heading.Groups[3].Value);
                var text = PlainText(part[(heading.Index + heading.Length)..]);
                var url = heading.Groups[1].Value == "1" ? href(page) : href(page) + "#" + id;
                entries.Add(new Entry(page.Title, heading.Groups[1].Value == "1" ? "" : title, url, text));
            }
        }
        return JsonSerializer.Serialize(entries, DocsJson.Default.ListEntry);
    }

    static string PlainText(string html)
    {
        // Block tags separate words; inline tags such as code and links sit inside them.
        var text = WebUtility.HtmlDecode(TagPattern().Replace(html, m => BlockTagPattern().IsMatch(m.Value) ? " " : ""));
        return SpacePattern().Replace(text, " ").Trim();
    }

    [GeneratedRegex("""^<h([12]) id="([^"]+)">(.*?)</h[12]>""", RegexOptions.Singleline)]
    private static partial Regex HeadingPattern();

    [GeneratedRegex("<[^>]+>")]
    private static partial Regex TagPattern();

    [GeneratedRegex(@"^</?(p|li|ul|ol|h\d|pre|table|thead|tbody|tr|td|th|div|blockquote|br|hr)\b")]
    private static partial Regex BlockTagPattern();

    [GeneratedRegex(@"\s+")]
    private static partial Regex SpacePattern();
}

// p: the page title, h: the section heading (empty for the page's introduction), u: the link, x: the section's text.
record Entry(
    [property: System.Text.Json.Serialization.JsonPropertyName("p")] string Page,
    [property: System.Text.Json.Serialization.JsonPropertyName("h")] string Heading,
    [property: System.Text.Json.Serialization.JsonPropertyName("u")] string Url,
    [property: System.Text.Json.Serialization.JsonPropertyName("x")] string Text);

[System.Text.Json.Serialization.JsonSerializable(typeof(List<Entry>))]
partial class DocsJson : System.Text.Json.Serialization.JsonSerializerContext;
