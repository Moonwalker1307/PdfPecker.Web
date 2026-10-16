using System.Text.Json;
using System.Text.RegularExpressions;

// The manuals of earlier PdfPecker versions, kept as PDFs in wwwroot/docs/versions so visitors can download the
// manual that matches the version they use. They are checked in, unlike the current PDF, because they never change.
static partial class DocsVersions
{
    public const string Folder = "versions";
    public const string ListFile = "versions.json";

    public static string FileName(string version) => $"pdfpecker-docs-{version}.pdf";

    // The name the browser saves a manual under, with its version, so downloads of different versions don't overwrite
    // each other or get mixed up. The latest manual is served as pdfpecker-docs.pdf but saved under this name too.
    public static string DownloadName(string version) => $"pdfpecker-docs-v{version}.pdf";

    public static List<string> Archived(string folder) =>
        !Directory.Exists(folder) ? [] :
        Directory.GetFiles(folder, "pdfpecker-docs-*.pdf")
            .Select(f => ArchivedPattern().Match(Path.GetFileName(f)))
            .Where(m => m.Success).Select(m => m.Groups[1].Value).ToList();

    // versions.json names the version the docs were last built for (and the manuals there are), so a PackageReference
    // bump without keeping the old manual is caught.
    public static string? ReadLatest(string docsFolder)
    {
        var path = Path.Combine(docsFolder, ListFile);
        if (!File.Exists(path)) return null;
        using var json = JsonDocument.Parse(File.ReadAllText(path));
        return json.RootElement.GetProperty("latest").GetString();
    }

    public static string List(string latest, IEnumerable<string> older)
    {
        var entries = new[] { $"    {{ \"version\": \"{latest}\", \"url\": \"/docs/pdfpecker-docs.pdf\" }}" }
            .Concat(older.Select(v => $"    {{ \"version\": \"{v}\", \"url\": \"/docs/{Folder}/{FileName(v)}\" }}"));
        return $"{{\n  \"latest\": \"{latest}\",\n  \"manuals\": [\n{string.Join(",\n", entries)}\n  ]\n}}\n";
    }

    // The old READMEs start with the logo and NuGet badges, which are remote images; the PDF's cover has the logo.
    public static string StripImages(string markdown) =>
        HtmlImagePattern().Replace(MarkdownImagePattern().Replace(markdown, ""), "");

    [GeneratedRegex(@"^pdfpecker-docs-(\d+\.\d+\.\d+)\.pdf$")]
    private static partial Regex ArchivedPattern();

    [GeneratedRegex(@"\[?!\[[^\]]*\]\([^)]*\)(\]\([^)]*\))?")]
    private static partial Regex MarkdownImagePattern();

    [GeneratedRegex(@"<p[^>]*>\s*<img[^>]*>\s*</p>|<img[^>]*>")]
    private static partial Regex HtmlImagePattern();
}
