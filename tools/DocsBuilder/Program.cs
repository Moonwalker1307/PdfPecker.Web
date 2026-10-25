using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using PdfPecker;

// Turns docs/*.md into the static pages under wwwroot/docs. Cloudflare serves wwwroot as it is, so the pages are
// generated ahead of time and checked in rather than rendered by the web app.
//
//   dotnet run --project tools/DocsBuilder                 builds the pages, the search indexes and the PDF
//   dotnet run --project tools/DocsBuilder -- archive      also keeps this version's manual: its Markdown and page list
//                                                          in docs/archive/<version> and its PDF in wwwroot/docs/versions
//   dotnet run --project tools/DocsBuilder -- --main <clone>   also opens the changelog with the commits a clone of the
//                                                          library has after this version (see DocsMain.cs)
//   dotnet run --project tools/DocsBuilder -- release <clone>  after a release, before the PackageReference bump: turns
//                                                          the unreleased list into the release's section of docs/changelog.md
//
// The latest manual is at /docs/; every earlier one is built from docs/archive/<version> to /docs/v<version>/, so the
// version picker can show the manual for the version a reader uses. Versions before 1.7.0 had their manual in the
// library's README, so their archive folder holds that README and they are one page.
var root = Directory.GetCurrentDirectory();
var source = Path.Combine(root, "docs");
var output = Path.Combine(root, "wwwroot", "docs");
var pdfArchive = Path.Combine(output, DocsVersions.Folder);
var mdArchive = Path.Combine(source, DocsVersions.SourceFolder);
if (!Directory.Exists(source)) { Console.Error.WriteLine($"No docs folder in {root}; run from the repository root."); return 1; }

// The version of the PdfPecker package the site (and this tool) uses is the version the docs describe.
var assemblyVersion = typeof(HtmlToPdf).Assembly.GetName().Version!;
var version = $"{assemblyVersion.Major}.{assemblyVersion.Minor}.{assemblyVersion.Build}";
var archive = false;
string? mainClone = null;
string? releaseClone = null;
for (int i = 0; i < args.Length; i++)
{
    if (args[i] == "archive") archive = true;
    else if (args[i] == "release" && i + 1 < args.Length) releaseClone = args[++i];
    else if (args[i] == "--main" && i + 1 < args.Length) mainClone = args[++i];
    else { Console.Error.WriteLine($"Unknown arguments: {string.Join(' ', args)}"); return 1; }
}

if (releaseClone != null)
{
    var changelog = Path.Combine(source, "changelog.md");
    var text = File.ReadAllText(changelog).ReplaceLineEndings("\n");
    string notes;
    try { notes = DocsMain.ReleaseSections(releaseClone, DocsMain.Read(releaseClone, version)); }
    catch (InvalidOperationException e) { Console.Error.WriteLine(e.Message); return 1; }
    File.WriteAllText(changelog, DocsMain.InsertInto(text, notes), new UTF8Encoding(false));
    Console.WriteLine($"Wrote the release notes after {version} into docs/changelog.md; now archive the {version} manual and bump the PackageReference.");
    return 0;
}

// The order of the sidebar and of the previous/next links. Slug "" is the docs home page.
Section[] sections =
[
    new("Basics",
    [
        new("", "index", "Getting started", "Install PdfPecker and convert your first HTML to PDF in .NET, with the system requirements."),
        new("html-to-pdf-csharp", "html-to-pdf-csharp", "HTML to PDF in C#", "How to convert HTML to PDF in C# and ASP.NET Core with PdfPecker: invoices from templates, headers and footers, fonts and images."),
        new("options", "options", "Options", "PdfOptions: page size, margins, headers and footers, document properties, file access and limits."),
        new("html-and-css", "html-and-css", "HTML and CSS", "The HTML elements, CSS selectors and properties, SVG and image formats PdfPecker supports."),
        new("paged-media", "paged-media", "Paged media", "@page rules, margin boxes, named pages, running headers and tables of contents with page numbers."),
        new("markdown", "markdown", "Markdown", "Convert CommonMark and GitHub Flavored Markdown to PDF or HTML."),
        new("fluent-api", "fluent-api", "Fluent C# API", "PdfPecker.Fluent: build PDFs from C# code in the style of QuestPDF, rendered by PdfPecker with no browser or native binaries."),
        new("images-to-pdf", "images-to-pdf", "Images to PDF", "Put PNG, JPEG, GIF, WebP, BMP or TIFF images into a PDF, one per page, at their own size or fitted to a page."),
        new("fonts", "fonts", "Fonts", "Register TrueType, OpenType, WOFF and WOFF2 fonts, use @font-face, and handle missing fonts."),
        new("languages", "languages", "Right-to-left, CJK and hyphenation", "Arabic and Hebrew text with bidi and shaping, Chinese, Japanese and Korean line breaking, and automatic hyphenation."),
    ]),
    new("PDF features",
    [
        new("pdfa-and-passwords", "pdfa-and-passwords", "PDF/A, passwords and watermarks", "PDF/A-2, 3 and 4 for archiving, AES-256 passwords and permissions, and watermarks."),
        new("accessibility", "accessibility", "Accessibility", "Tagged PDF, PDF/UA-1 and PDF/UA-2 built from your HTML."),
        new("forms", "forms", "Fillable forms", "HTML inputs, check boxes, radio buttons, selects and text areas as fillable PDF form fields, and filling and flattening the forms of existing PDFs."),
        new("signatures", "signatures", "Digital signatures", "Sign PDFs with PAdES signatures, visible boxes, timestamps, existing fields and external signers, verify signatures, and add long-term validation data."),
        new("e-invoices", "e-invoices", "E-invoices", "Factur-X, ZUGFeRD, XRechnung and Peppol invoice XML from invoice data, a ready-made invoice template, Factur-X PDF/A-3 e-invoices, and PDFs in UBL invoices."),
        new("barcodes", "barcodes", "Barcodes", "QR codes, EPC payment QR codes (GiroCode), Code 128 and EAN-13 barcodes as vector SVG for your templates."),
        new("attachments", "attachments", "Attachments", "Embed files in a PDF, read them back, or attach them to an existing PDF."),
    ]),
    new("Existing PDFs",
    [
        new("merging", "merging", "Merging and splitting", "Merge any PDFs, stream them as they arrive, and extract, reorder, rotate and split pages."),
        new("stamping", "stamping", "Stamping", "Put a stamp over or letterhead under the pages of any PDF."),
        new("compacting", "compacting", "Compacting", "Make any PDF smaller, losslessly or with images downsampled and recompressed, keeping bookmarks, forms, tags and PDF/A."),
        new("text-extraction", "text-extraction", "Text extraction", "Extract the text of any PDF in reading order with the position of every line and word, its images and its document properties."),
        new("pdf-to-image", "pdf-to-image", "PDF to image", "Render PDF pages to PNG, JPEG, WebP or TIFF with PdfPecker's own renderer, or HTML straight to images."),
        new("pdf-to-html", "pdf-to-html", "PDF to HTML", "Turn any PDF into one self-contained HTML page: page images with selectable, searchable text and working links."),
    ]),
    new("Switching",
    [
        new("wkhtmltopdf-alternative", "wkhtmltopdf-alternative", "From wkhtmltopdf", "A wkhtmltopdf alternative for .NET: replace DinkToPdf, Rotativa or the wkhtmltopdf command line with PdfPecker, option by option."),
        new("htmlrenderer-pdfsharp-alternative", "htmlrenderer-pdfsharp-alternative", "From HtmlRenderer.PdfSharp", "An HtmlRenderer.PdfSharp alternative now that PDFsharp 6.5 is AGPL: MIT-licensed, managed HTML to PDF with modern CSS."),
        new("ironpdf-alternative", "ironpdf-alternative", "From IronPDF", "A free, MIT-licensed IronPDF alternative without Chrome: replace ChromePdfRenderer with PdfPecker and match its output."),
        new("puppeteer-alternative", "puppeteer-alternative", "From PuppeteerSharp or Playwright", "Make PDFs from HTML in .NET without Chrome: replace PuppeteerSharp or Playwright page.pdf() with PdfPecker."),
    ]),
    new("Reference",
    [
        new("changelog", "changelog", "Changelog", "What changed in each PdfPecker release, from 1.0.0 to the latest."),
        new("limitations", "limitations", "Limitations", "What PdfPecker does not support yet, and what it leaves out by design."),
        new("pdf-features", "pdf-features", "PDF feature checklist", "Every PDF feature, from encryption and signatures to layers and PDF/X, marked as supported, partly supported or missing in PdfPecker."),
        new("performance", "performance", "Performance", "PdfPecker's speed and memory compared with Chromium, wkhtmltopdf, iText and other .NET converters."),
        new("how-it-works", "how-it-works", "How it works", "PdfPecker's pipeline from HTML parsing through CSS and layout to the PDF writer and renderer."),
    ]),
];
var pages = sections.SelectMany(s => s.Pages).ToArray();
var unused = Directory.GetFiles(source, "*.md").Select(Path.GetFileNameWithoutExtension)
    .Except(pages.Select(p => p.File)).ToArray();
if (unused.Length > 0) { Console.Error.WriteLine($"Not in the page list: {string.Join(", ", unused)}"); return 1; }

// When the site moves to a new PdfPecker version, the manual of the version it leaves must be kept first, because it
// can no longer be built once the package is newer.
var archivedPdfs = DocsVersions.Archived(pdfArchive);
var archivedSources = DocsVersions.ArchivedSources(mdArchive);
var previous = DocsVersions.ReadLatest(output);
if (previous != null && previous != version && !(archivedPdfs.Contains(previous) && archivedSources.Contains(previous)))
{
    Console.Error.WriteLine($"The docs were last built for PdfPecker {previous}, now {version}. Keep the {previous} manual first: " +
        $"with the PackageReference still on {previous}, run 'dotnet run --project tools/DocsBuilder -- archive' and commit " +
        $"docs/{DocsVersions.SourceFolder}/{previous} and wwwroot/docs/{DocsVersions.Folder}/{DocsVersions.FileName(previous)}.");
    return 1;
}
var older = archivedPdfs.Where(v => Version.Parse(v) < Version.Parse(version)).OrderByDescending(Version.Parse).ToList();
var newer = archivedPdfs.Concat(archivedSources).Where(v => Version.Parse(v) > Version.Parse(version)).Distinct().ToList();
if (newer.Count > 0) { Console.Error.WriteLine($"Archived manuals newer than {version}: {string.Join(", ", newer)}"); return 1; }
var mismatch = older.Except(archivedSources).Concat(archivedSources.Where(v => v != version).Except(older)).ToList();
if (mismatch.Count > 0) { Console.Error.WriteLine($"Each archived version needs both its PDF and its Markdown: {string.Join(", ", mismatch)}"); return 1; }

// Every manual, newest first. Each is built with the same templates, so old manuals keep the site's current look.
var manuals = new List<Manual> { new(version, source, sections, "/docs/", Latest: true) };
foreach (var v in older) manuals.Add(DocsVersions.LoadArchived(v, Path.Combine(mdArchive, v)));

// Everything in wwwroot/docs is generated except the archived PDFs.
if (Directory.Exists(output))
{
    foreach (var dir in Directory.GetDirectories(output).Where(d => Path.GetFileName(d) != DocsVersions.Folder)) Directory.Delete(dir, recursive: true);
    foreach (var file in Directory.GetFiles(output)) File.Delete(file);
}

var main = mainClone == null ? null : DocsMain.Read(mainClone, version);
List<(Page Page, string Body)> latest = [];
for (int i = 0; i < manuals.Count; i++)
{
    var site = new ManualSite(manuals[i], i + 1 < manuals.Count ? manuals[i + 1].Version : null, manuals, output, main);
    var rendered = site.Build();
    if (i == 0) latest = rendered;
}
File.WriteAllText(Path.Combine(output, DocsVersions.ListFile), DocsVersions.List(version, older), new UTF8Encoding(false));
Console.WriteLine($"Wrote {manuals.Count} manuals ({pages.Length} pages for {version}) to {output}");
if (main != null)
{
    File.WriteAllText(Path.Combine(output, DocsMain.FileName), DocsMain.Json(main), new UTF8Encoding(false));
    Console.WriteLine($"The changelog lists {main.Groups.Sum(g => g.Commits.Count)} library commits after {version}");
}

// The PDF is not checked in: every PDF gets a random file ID, so it would never match a committed copy. The Deploy
// workflow runs this program before uploading wwwroot, and it is ignored by git. Archived manuals are the exception:
// they are made once, when the site leaves their version, and never change after that.
var pdf = DocsPdf.Build(latest, Path.Combine(root, "wwwroot"), version);
File.WriteAllBytes(Path.Combine(output, DocsPdf.FileName), pdf);
Console.WriteLine($"Wrote {DocsPdf.FileName} ({pdf.Length / 1024} KB)");
if (archive)
{
    Directory.CreateDirectory(pdfArchive);
    File.WriteAllBytes(Path.Combine(pdfArchive, DocsVersions.FileName(version)), pdf);
    DocsVersions.ArchiveSources(source, Path.Combine(mdArchive, version), sections);
    Console.WriteLine($"Kept the {version} manual in docs/{DocsVersions.SourceFolder}/{version} and {DocsVersions.Folder}/{DocsVersions.FileName(version)}");
}
return 0;

partial class Program
{
    // Wide tables scroll inside their own box on phones, C# examples get the same colours as the home page, and the
    // marks of the feature checklist (a cell starting with ✓, ½ or ✕) get the compare page's green, amber and grey.
    public static string Polish(string html)
    {
        html = html.Replace("<table>", "<div class=\"table-scroll\"><table>").Replace("</table>", "</table></div>");
        html = html.Replace("<td>✓ ", "<td class=\"mark y\">✓ ").Replace("<td>½ ", "<td class=\"mark p\">½ ").Replace("<td>✕ ", "<td class=\"mark n\">✕ ");
        html = Regex.Replace(html, "<pre><code class=\"language-(csharp|cs)\">(.*?)</code></pre>",
            m => "<pre class=\"cs\"><code>" + CSharp.Highlight(WebUtility.HtmlDecode(m.Groups[2].Value)) + "</code></pre>",
            RegexOptions.Singleline);
        return html;
    }
}

partial class Program
{
    // The site header and footer, as on the hand-written pages, with Docs as the current page.
    internal const string Header = """
        <header class="site-header">
          <a class="brand" href="/" aria-label="PdfPecker home"><img src="/logo.png" alt="" width="32" height="32"><b>Pdf<span>Pecker</span></b></a>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="Menu"><svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><path class="bars" d="M4 7h16M4 12h16M4 17h16"/><path class="cross" d="M6 6l12 12M18 6 6 18"/></svg></button>
          <nav id="main-nav" aria-label="Main">
            <a href="/">Home</a>
            <a href="/html-to-pdf/">HTML to PDF</a>
            <a href="/markdown/">Markdown</a>
            <a href="/compare/">Compare</a>
            <a href="/docs/" aria-current="page">Docs</a>
            <a class="ext" href="https://github.com/Moonwalker1307/PdfPecker"><svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg><span class="ext-label">GitHub</span></a>
            <a class="ext" href="https://www.nuget.org/packages/PdfPecker"><svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" d="M8 1.5 14 4.75v6.5L8 14.5 2 11.25v-6.5L8 1.5ZM2 4.75 8 8l6-3.25M8 8v6.5"/></svg><span class="ext-label">NuGet</span></a>
          </nav>
        </header>
        """;

    internal const string Footer = """
        <footer class="site-footer">
          <div class="wrap">
            <span>© 2026 PdfPecker. Open source under the MIT license; its bundled fonts keep their own open licenses.</span>
            <nav aria-label="Footer">
              <a href="https://github.com/Moonwalker1307/PdfPecker">GitHub</a>
              <a href="https://www.nuget.org/packages/PdfPecker">NuGet</a>
              <a href="https://github.com/Moonwalker1307/PdfPecker/blob/main/THIRD-PARTY-NOTICES.md">License</a>
              <a href="/privacy/">Privacy</a>
            </nav>
          </div>
        </footer>
        """;
}

record Section(string Title, Page[] Pages);
record Page(string Slug, string File, string Title, string Description);

// A small C# colourizer for the examples: keywords, strings, comments, numbers and type names, using the classes of
// the home page's code cards. It only needs to be right for the code in these docs, not for every C# program.
static class CSharp
{
    static readonly HashSet<string> Keywords =
    [
        "abstract", "as", "async", "await", "base", "bool", "break", "byte", "case", "catch", "char", "class", "const",
        "continue", "default", "do", "double", "else", "enum", "false", "finally", "float", "for", "foreach", "if", "in",
        "int", "is", "long", "namespace", "new", "null", "object", "out", "override", "private", "public", "readonly",
        "record", "ref", "return", "static", "string", "struct", "switch", "this", "throw", "true", "try", "typeof",
        "uint", "using", "var", "void", "while", "yield",
    ];

    static readonly Regex Token = new(
        """
        (?<c>//[^\n]*)
        |(?<s>\$?\"\"\"[\s\S]*?\"\"\"|\$?@?"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])')
        |(?<n>\b\d[\d_]*(?:\.\d+)?[fFdDmMlL]?\b)
        |(?<w>@?[A-Za-z_][A-Za-z0-9_]*)
        """, RegexOptions.IgnorePatternWhitespace);

    public static string Highlight(string code)
    {
        var sb = new StringBuilder();
        int at = 0;
        foreach (Match m in Token.Matches(code))
        {
            sb.Append(WebUtility.HtmlEncode(code[at..m.Index]));
            at = m.Index + m.Length;
            var text = WebUtility.HtmlEncode(m.Value);
            string? cls = m.Groups["c"].Success ? "c" : m.Groups["s"].Success ? "s" : m.Groups["n"].Success ? "n"
                : Keywords.Contains(m.Value) ? "k"
                // A capitalized name that is not called is a type: PdfOptions, PageSize, but not Convert(...).
                : char.IsUpper(m.Value[0]) && !IsCall(code, at) && !IsMember(code, m.Index) && !IsAssigned(code, at) ? "t"
                : null;
            sb.Append(cls == null ? text : $"<span class=\"{cls}\">{text}</span>");
        }
        sb.Append(WebUtility.HtmlEncode(code[at..]));
        return sb.ToString();
    }

    static bool IsCall(string code, int after) => after < code.Length && code[after] == '(';

    // Property names in object initializers (PageSize = ...) are not types either.
    static bool IsAssigned(string code, int after)
    {
        while (after < code.Length && code[after] == ' ') after++;
        return after + 1 < code.Length && code[after] == '=' && code[after + 1] != '=' && code[after + 1] != '>';
    }

    // Members after a dot (options.Fonts, PageSize.Letter) are properties or fields, not types.
    static bool IsMember(string code, int start) => start > 0 && code[start - 1] == '.';
}
