using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using PdfPecker;

// Turns docs/*.md into the static pages under wwwroot/docs. Cloudflare serves wwwroot as it is, so the pages are
// generated ahead of time and checked in rather than rendered by the web app.
var root = args.Length > 0 ? args[0] : Directory.GetCurrentDirectory();
var source = Path.Combine(root, "docs");
var output = Path.Combine(root, "wwwroot", "docs");
if (!Directory.Exists(source)) { Console.Error.WriteLine($"No docs folder in {root}; run from the repository root."); return 1; }

// The order of the sidebar and of the previous/next links. Slug "" is the docs home page.
Section[] sections =
[
    new("Basics",
    [
        new("", "index", "Getting started", "Install PdfPecker and convert your first HTML to PDF in .NET, with the system requirements."),
        new("options", "options", "Options", "PdfOptions: page size, margins, headers and footers, document properties, file access and limits."),
        new("html-and-css", "html-and-css", "HTML and CSS", "The HTML elements, CSS selectors and properties, SVG and image formats PdfPecker supports."),
        new("paged-media", "paged-media", "Paged media", "@page rules, margin boxes, named pages, running headers and tables of contents with page numbers."),
        new("markdown", "markdown", "Markdown", "Convert CommonMark and GitHub Flavored Markdown to PDF or HTML."),
        new("fonts", "fonts", "Fonts", "Register TrueType, OpenType, WOFF and WOFF2 fonts, use @font-face, and handle missing fonts."),
        new("languages", "languages", "Right-to-left and hyphenation", "Arabic and Hebrew text with bidi and shaping, and automatic hyphenation."),
    ]),
    new("PDF features",
    [
        new("pdfa-and-passwords", "pdfa-and-passwords", "PDF/A, passwords and watermarks", "PDF/A-2, 3 and 4 for archiving, AES-256 passwords and permissions, and watermarks."),
        new("accessibility", "accessibility", "Accessibility", "Tagged PDF, PDF/UA-1 and PDF/UA-2 built from your HTML."),
        new("forms", "forms", "Fillable forms", "HTML inputs, check boxes, radio buttons, selects and text areas as fillable PDF form fields."),
        new("signatures", "signatures", "Digital signatures", "Sign PDFs with PAdES signatures, visible boxes, timestamps and existing signature fields."),
        new("e-invoices", "e-invoices", "E-invoices", "Factur-X and ZUGFeRD PDF/A-3 e-invoices, and PDFs in Peppol and OIOUBL UBL invoices."),
        new("attachments", "attachments", "Attachments", "Embed files in a PDF, read them back, or attach them to an existing PDF."),
    ]),
    new("Existing PDFs",
    [
        new("merging", "merging", "Merging and splitting", "Merge any PDFs, stream them as they arrive, and extract, reorder, rotate and split pages."),
        new("stamping", "stamping", "Stamping", "Put a stamp over or letterhead under the pages of any PDF."),
        new("pdf-to-image", "pdf-to-image", "PDF to image", "Render PDF pages to PNG, JPEG or WebP with PdfPecker's own renderer."),
    ]),
    new("Reference",
    [
        new("limitations", "limitations", "Limitations", "What PdfPecker does not support yet, and what it leaves out by design."),
        new("performance", "performance", "Performance", "PdfPecker's speed and memory compared with Chromium, wkhtmltopdf, iText and other .NET converters."),
        new("how-it-works", "how-it-works", "How it works", "PdfPecker's pipeline from HTML parsing through CSS and layout to the PDF writer and renderer."),
    ]),
];
var pages = sections.SelectMany(s => s.Pages).ToArray();

var unused = Directory.GetFiles(source, "*.md").Select(Path.GetFileNameWithoutExtension)
    .Except(pages.Select(p => p.File)).ToArray();
if (unused.Length > 0) { Console.Error.WriteLine($"Not in the page list: {string.Join(", ", unused)}"); return 1; }

if (Directory.Exists(output)) Directory.Delete(output, recursive: true);
var rendered = new List<(Page Page, string Body)>();
for (int i = 0; i < pages.Length; i++)
{
    var page = pages[i];
    var markdown = File.ReadAllText(Path.Combine(source, page.File + ".md")).ReplaceLineEndings("\n");
    var title = Regex.Match(markdown, @"^# (.+)$", RegexOptions.Multiline).Groups[1].Value;
    var body = Polish(MarkdownToHtml.Convert(markdown));
    rendered.Add((page, body));
    var html = Render(page, title, body, i > 0 ? pages[i - 1] : null, i < pages.Length - 1 ? pages[i + 1] : null);
    var dir = page.Slug.Length == 0 ? output : Path.Combine(output, page.Slug);
    Directory.CreateDirectory(dir);
    File.WriteAllText(Path.Combine(dir, "index.html"), html, new UTF8Encoding(false));
}
File.WriteAllText(Path.Combine(output, "search.json"), DocsSearch.BuildIndex(rendered, Href), new UTF8Encoding(false));
Console.WriteLine($"Wrote {pages.Length} pages and the search index to {output}");

// The PDF is not checked in: every PDF gets a random file ID, so it would never match a committed copy. The Deploy
// workflow runs this program before uploading wwwroot, and it is ignored by git.
var pdf = DocsPdf.Build(rendered, Path.Combine(root, "wwwroot"));
File.WriteAllBytes(Path.Combine(output, DocsPdf.FileName), pdf);
Console.WriteLine($"Wrote {DocsPdf.FileName} ({pdf.Length / 1024} KB)");
return 0;

// Wide tables scroll inside their own box on phones, and C# examples get the same colours as the home page.
static string Polish(string html)
{
    html = html.Replace("<table>", "<div class=\"table-scroll\"><table>").Replace("</table>", "</table></div>");
    html = Regex.Replace(html, "<pre><code class=\"language-(csharp|cs)\">(.*?)</code></pre>",
        m => "<pre class=\"cs\"><code>" + CSharp.Highlight(WebUtility.HtmlDecode(m.Groups[2].Value)) + "</code></pre>",
        RegexOptions.Singleline);
    return html;
}

string Render(Page page, string title, string body, Page? previous, Page? next)
{
    var url = "https://pdfpecker.net/docs/" + (page.Slug.Length == 0 ? "" : page.Slug + "/");
    var sb = new StringBuilder();
    sb.Append($"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{Encode(title)} · PdfPecker docs</title>
        <meta name="description" content="{Encode(page.Description)}">
        <link rel="canonical" href="{url}">
        <meta name="theme-color" content="#0b0b0f">
        <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="stylesheet" href="/site.css">
        </head>
        <body class="home docs-page">
        <!-- Generated by tools/DocsBuilder from docs/{page.File}.md; edit that file instead. -->
        <a class="skip" href="#main">Skip to content</a>
        {Header}

        <div class="wrap docs-layout">
          <details class="docs-menu">
            <summary>Docs: {Encode(page.Title)}</summary>
        {Toc(page, "    ")}
          </details>
          <aside class="docs-side" aria-label="Documentation">
        {Toc(page, "    ")}
          </aside>
          <main id="main" class="docs-body">
            <div class="docs-tools">
              <form class="docs-search" role="search">
                <label class="sr" for="docs-q">Search the docs</label>
                <input id="docs-q" type="search" placeholder="Search the docs" autocomplete="off" spellcheck="false"
                  aria-controls="docs-results" aria-expanded="false" aria-autocomplete="list">
                <kbd aria-hidden="true">/</kbd>
                <ul id="docs-results" class="docs-results" role="listbox" hidden></ul>
              </form>
              <a class="button docs-pdf" href="/docs/{DocsPdf.FileName}" download>Download PDF</a>
            </div>
            <article class="prose">

        """);
    sb.Append(body.TrimEnd()).Append('\n');
    sb.Append("""
              </article>
              <nav class="docs-pager" aria-label="Previous and next">

        """);
    if (previous != null) sb.Append($"        <a class=\"prev\" href=\"{Href(previous)}\"><small>Previous</small>{Encode(previous.Title)}</a>\n");
    if (next != null) sb.Append($"        <a class=\"next\" href=\"{Href(next)}\"><small>Next</small>{Encode(next.Title)}</a>\n");
    sb.Append($"""
              </nav>
              <p class="docs-edit"><a href="https://github.com/Moonwalker1307/PdfPecker.Web/blob/main/docs/{page.File}.md">Edit this page on GitHub</a></p>
            </main>
          </div>

          {Footer}
          <script src="/docs-search.js"></script>
          </body>
          </html>

          """);
    return sb.ToString();
}

string Toc(Page current, string indent)
{
    var sb = new StringBuilder();
    sb.Append(indent).Append("<nav class=\"docs-toc\">\n");
    foreach (var section in sections)
    {
        sb.Append(indent).Append("  <p>").Append(Encode(section.Title)).Append("</p>\n");
        sb.Append(indent).Append("  <ul>\n");
        foreach (var p in section.Pages)
        {
            var currentAttr = p == current ? " aria-current=\"page\"" : "";
            sb.Append(indent).Append($"    <li><a href=\"{Href(p)}\"{currentAttr}>{Encode(p.Title)}</a></li>\n");
        }
        sb.Append(indent).Append("  </ul>\n");
    }
    sb.Append(indent).Append("</nav>");
    return sb.ToString();
}

static string Href(Page p) => p.Slug.Length == 0 ? "/docs/" : $"/docs/{p.Slug}/";
static string Encode(string s) => WebUtility.HtmlEncode(s);

partial class Program
{
    // The site header and footer, as on the hand-written pages, with Docs as the current page.
    const string Header = """
        <header class="site-header">
          <a class="brand" href="/" aria-label="PdfPecker home"><img src="/logo.png" alt="" width="32" height="32"><b>Pdf<span>Pecker</span></b></a>
          <nav aria-label="Main">
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

    const string Footer = """
        <footer class="site-footer">
          <div class="wrap">
            <span>PdfPecker is open source under the MIT license; its bundled fonts keep their own open licenses.</span>
            <nav aria-label="Footer">
              <a href="https://github.com/Moonwalker1307/PdfPecker">GitHub</a>
              <a href="https://www.nuget.org/packages/PdfPecker">NuGet</a>
              <a href="https://github.com/Moonwalker1307/PdfPecker/blob/main/THIRD-PARTY-NOTICES.md">License</a>
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
