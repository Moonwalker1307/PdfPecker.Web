using System.Text.Json;
using System.Text.RegularExpressions;

// The manuals of earlier PdfPecker versions, kept as PDFs in wwwroot/docs/versions so visitors can download the
// manual that matches the version they use. They are checked in, unlike the current PDF, because they never change.
static partial class DocsVersions
{
    public const string Folder = "versions";
    public const string ListFile = "versions.json";

    // docs/archive/<version> holds the Markdown of each earlier manual: the docs/*.md files and a pages.json with the
    // sidebar as it was, or for versions before 1.7.0 the library README of that release.
    public const string SourceFolder = "archive";

    public static List<string> ArchivedSources(string folder) =>
        !Directory.Exists(folder) ? [] :
        Directory.GetDirectories(folder).Select(Path.GetFileName).Where(n => Version.TryParse(n, out _)).Select(n => n!).ToList();

    public static Manual LoadArchived(string version, string folder)
    {
        var baseUrl = $"/docs/v{version}/";
        var pagesFile = Path.Combine(folder, "pages.json");
        if (File.Exists(pagesFile))
        {
            var sections = JsonSerializer.Deserialize(File.ReadAllText(pagesFile), DocsPagesJson.Default.SectionArray)!;
            return new Manual(version, folder, sections, baseUrl);
        }
        if (!File.Exists(Path.Combine(folder, "README.md")))
            throw new InvalidOperationException($"{folder} has neither pages.json nor README.md");
        Section[] readme = [new($"PdfPecker {version}", [new("", "README", "Manual", $"The PdfPecker {version} manual, from the library's README of that release.")])];
        return new Manual(version, folder, readme, baseUrl, SinglePage: true);
    }

    // Keeps the current Markdown and page list, so the manual for this version can still be built after the site moves
    // on. The changelog is left out: it always covers every release, so only the latest one is shown.
    public static void ArchiveSources(string source, string folder, Section[] sections)
    {
        if (Directory.Exists(folder)) Directory.Delete(folder, recursive: true);
        Directory.CreateDirectory(folder);
        var kept = sections.Select(s => s with { Pages = s.Pages.Where(p => p.File != "changelog").ToArray() })
            .Where(s => s.Pages.Length > 0).ToArray();
        foreach (var page in kept.SelectMany(s => s.Pages))
            File.Copy(Path.Combine(source, page.File + ".md"), Path.Combine(folder, page.File + ".md"));
        File.WriteAllText(Path.Combine(folder, "pages.json"), JsonSerializer.Serialize(kept, DocsPagesJson.Default.SectionArray) + "\n");
    }

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

[System.Text.Json.Serialization.JsonSourceGenerationOptions(
    PropertyNamingPolicy = System.Text.Json.Serialization.JsonKnownNamingPolicy.CamelCase, WriteIndented = true)]
[System.Text.Json.Serialization.JsonSerializable(typeof(Section[]))]
partial class DocsPagesJson : System.Text.Json.Serialization.JsonSerializerContext;
