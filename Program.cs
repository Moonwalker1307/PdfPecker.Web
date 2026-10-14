using System.Diagnostics;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using PdfPecker;

const long MaxHtmlBytes = 5 * 1024 * 1024;
// Untrusted documents: a long one is refused instead of filling memory (a few bytes of CSS can ask for millions of pages).
const int MaxPages = 1000;
var conversionTimeout = TimeSpan.FromSeconds(15);
// Conversions are CPU and memory heavy: run a few at a time and turn the rest away quickly, so a burst of hostile
// documents cannot exhaust the server. A large document can need about 512 MB while it is laid out, so the memory the
// runtime may use (the container's memory limit, when one is set) caps the count as well as the CPU count does.
long memoryLimit = GC.GetGCMemoryInfo().TotalAvailableMemoryBytes;
var conversions = new SemaphoreSlim((int)Math.Clamp(memoryLimit / (512L << 20), 1, Math.Max(2, Environment.ProcessorCount)));
var queueTimeout = TimeSpan.FromSeconds(10);

var builder = WebApplication.CreateSlimBuilder(args);
builder.WebHost.ConfigureKestrel(k =>
{
    k.Limits.MaxRequestBodySize = MaxHtmlBytes;
    k.AddServerHeader = false;
});
// An HTML form field may be as large as the body allows (the default 4 MB limit would fail with a server error).
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(o => o.ValueLengthLimit = (int)MaxHtmlBytes);
builder.Services.ConfigureHttpJsonOptions(o => o.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonContext.Default));
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy("convert", ctx => RateLimitPartition.GetFixedWindowLimiter(
        ClientKey(ctx.Connection.RemoteIpAddress),
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 120, Window = TimeSpan.FromMinutes(1) }));
});

// Behind a reverse proxy or CDN every request comes from the proxy's address, so the rate limit would be shared by
// everyone. The TrustedProxies setting (or environment variable) lists the proxies' addresses or networks, e.g.
// "10.0.0.0/8,172.16.0.0/12"; X-Forwarded-For is believed only from those. Empty: the connection address is used.
var trustedProxies = (builder.Configuration["TrustedProxies"] ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
if (trustedProxies.Length > 0)
{
    builder.Services.Configure<Microsoft.AspNetCore.Builder.ForwardedHeadersOptions>(o =>
    {
        o.ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto;
        o.KnownIPNetworks.Clear();
        o.KnownProxies.Clear();
        foreach (var p in trustedProxies)
            o.KnownIPNetworks.Add(System.Net.IPNetwork.Parse(p.Contains('/') ? p : p + (p.Contains(':') ? "/128" : "/32")));
    });
}

// The page loads its script and stylesheet from this site; previews are blob: frames. Safari shows a PDF in a frame
// with its PDF plugin, which the frame's inherited policy checks against object-src, so blob: is allowed there too.
// Inline styles stay allowed for the Markdown-to-HTML preview, which inherits this policy; inline script does not.
// On pdfpecker.net Cloudflare serves the page itself with the headers in wwwroot/_headers; keep them in step.
const string SiteCsp = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; "
    + "connect-src 'self'; frame-src blob:; object-src blob:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";
// API responses are documents, never pages that load anything.
const string ApiCsp = "default-src 'none'; frame-ancestors 'none'";

var app = builder.Build();
if (trustedProxies.Length > 0) app.UseForwardedHeaders();
app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["Referrer-Policy"] = "no-referrer";
    headers["Content-Security-Policy"] = context.Request.Path.StartsWithSegments("/api") ? ApiCsp : SiteCsp;
    headers["Cross-Origin-Opener-Policy"] = "same-origin";
    headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    try
    {
        await next(context);
    }
    catch (BadHttpRequestException ex) when (!context.Response.HasStarted)
    {
        // Too large, malformed or too slowly sent request bodies: the client's fault, not a server error.
        context.Response.Clear();
        context.Response.StatusCode = ex.StatusCode;
    }
});
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRateLimiter();

app.MapGet("/health", () => Results.Text("ok"));

// POST /api/convert
//   multipart/form-data: an uploaded HTML or Markdown (.md) file in the "file" field; options as form fields or query string
//   application/json:    { "html": "...", "pageSize": "A4", "landscape": false, "marginMm": 12.7, "pageNumbers": true,
//                          "watermark": "DRAFT", "password": "secret", "pdfa": false }
//                        or { "markdown": "# Title", "output": "html" }
//   anything else:       the raw HTML or Markdown as the body, options in the query string
//                        (?pageSize=Letter&landscape=true&marginMm=10&pageNumbers=true&format=markdown&output=pdf)
// The input is Markdown when it comes as "markdown", from a .md/.markdown file, with Content-Type text/markdown, or with format=markdown.
// Returns application/pdf, or text/html for output=html (Markdown input only).
app.MapPost("/api/convert", async (HttpRequest request, CancellationToken ct) =>
{
    ConvertRequest? req;
    if (request.HasJsonContentType())
    {
        try
        {
            req = await request.ReadFromJsonAsync(AppJsonContext.Default.ConvertRequest, ct);
        }
        catch (System.Text.Json.JsonException)
        {
            return Results.Problem("The JSON body is not valid.", statusCode: StatusCodes.Status400BadRequest);
        }
    }
    else if (request.HasFormContentType)
    {
        var form = await request.ReadFormAsync(ct);
        var file = form.Files["file"] ?? form.Files.FirstOrDefault();
        string html = "";
        string? markdown = null;
        if (file != null)
        {
            using var fileReader = new StreamReader(file.OpenReadStream());
            var text = await fileReader.ReadToEndAsync(ct);
            if (IsMarkdownFile(file.FileName, file.ContentType)) markdown = text;
            else html = text;
        }
        else if (form.ContainsKey("markdown")) markdown = form["markdown"].ToString();
        else html = form["html"].ToString();
        string? Field(string name) => form.TryGetValue(name, out var v) ? v.ToString() : request.Query[name].ToString();
        req = new ConvertRequest
        {
            Html = html,
            Markdown = markdown,
            Format = Field("format"),
            Output = Field("output"),
            FileName = file?.FileName,
            PageSize = Field("pageSize"),
            Landscape = bool.TryParse(Field("landscape"), out var fl) && fl,
            MarginMm = float.TryParse(Field("marginMm"), System.Globalization.CultureInfo.InvariantCulture, out var fm) ? fm : null,
            PageNumbers = bool.TryParse(Field("pageNumbers"), out var fp) && fp,
            Watermark = Field("watermark"),
            Password = Field("password"),
            PdfA = bool.TryParse(Field("pdfa"), out var fa) && fa,
        };
    }
    else
    {
        using var reader = new StreamReader(request.Body);
        var q = request.Query;
        var body = await reader.ReadToEndAsync(ct);
        bool isMarkdown = IsMarkdownFile(null, request.ContentType);
        req = new ConvertRequest
        {
            Html = isMarkdown ? "" : body,
            Markdown = isMarkdown ? body : null,
            Format = q["format"],
            Output = q["output"],
            PageSize = q["pageSize"],
            Landscape = bool.TryParse(q["landscape"], out var l) && l,
            MarginMm = float.TryParse(q["marginMm"], System.Globalization.CultureInfo.InvariantCulture, out var m) ? m : null,
            PageNumbers = bool.TryParse(q["pageNumbers"], out var p) && p,
            Watermark = q["watermark"],
            Password = q["password"],
            PdfA = bool.TryParse(q["pdfa"], out var a) && a,
        };
    }
    if (req is null)
        return Results.Problem("Send some HTML or Markdown to convert.", statusCode: StatusCodes.Status400BadRequest);

    // Markdown arrives in "markdown", or in "html" when format=markdown says so.
    bool markdownInput = req.Markdown != null || IsMarkdownFormat(req.Format);
    var input = req.Markdown ?? req.Html ?? "";
    if (string.IsNullOrWhiteSpace(input))
        return Results.Problem("Send some HTML or Markdown to convert.", statusCode: StatusCodes.Status400BadRequest);

    var output = (req.Output ?? "").Trim().ToLowerInvariant();
    bool htmlOutput = output == "html";
    if (output is not ("" or "pdf" or "html"))
        return Results.Problem("output must be \"pdf\" or \"html\".", statusCode: StatusCodes.Status400BadRequest);
    if (htmlOutput && !markdownInput)
        return Results.Problem("HTML output is for Markdown input; send Markdown or ask for a PDF.", statusCode: StatusCodes.Status400BadRequest);

    PdfOptions options;
    try
    {
        options = BuildOptions(req);
    }
    catch (ArgumentException ex)
    {
        // Every option is checked before any work starts; the message says which one is wrong.
        return Results.Problem(ex.Message, statusCode: StatusCodes.Status400BadRequest);
    }
    if (!await TryStartConversion(conversions, queueTimeout, ct))
        return Results.Problem("The server is busy; try again shortly.", statusCode: StatusCodes.Status503ServiceUnavailable);
    var sw = Stopwatch.StartNew();
    byte[] result;
    // The token reaches into the converter, so a document that runs over the time limit really stops using the CPU.
    using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
    timeout.CancelAfter(conversionTimeout);
    try
    {
        result = await Task.Run(() =>
        {
            if (!markdownInput) return HtmlToPdf.Convert(input, options, timeout.Token);
            var html = MarkdownToHtml.ConvertDocument(input);
            return htmlOutput ? System.Text.Encoding.UTF8.GetBytes(html) : HtmlToPdf.Convert(html, options, timeout.Token);
        }, timeout.Token);
    }
    catch (OperationCanceledException) when (!ct.IsCancellationRequested)
    {
        return Results.Problem("The document took too long to convert.", statusCode: StatusCodes.Status422UnprocessableEntity);
    }
    catch (PdfLimitException ex)
    {
        return Results.Problem(ex.Message, statusCode: StatusCodes.Status422UnprocessableEntity);
    }
    catch (OutOfMemoryException)
    {
        // Past the container's memory limit the runtime fails the allocation, not the process: refuse this document.
        return Results.Problem("The document needs more memory than the server can give it.", statusCode: StatusCodes.Status422UnprocessableEntity);
    }
    catch (ArgumentException ex)
    {
        return Results.Problem(ex.Message, statusCode: StatusCodes.Status400BadRequest);
    }
    finally
    {
        conversions.Release();
    }
    sw.Stop();
    request.HttpContext.Response.Headers["X-Conversion-Ms"] = sw.Elapsed.TotalMilliseconds.ToString("F2", System.Globalization.CultureInfo.InvariantCulture);
    return htmlOutput
        ? Results.File(result, "text/html; charset=utf-8", SafeFileName(req.FileName, ".html"))
        : Results.File(result, "application/pdf", SafeFileName(req.FileName, ".pdf"));
}).RequireRateLimiting("convert").DisableAntiforgery();

// POST /api/pdf-to-image
//   multipart/form-data with the PDF in the "file" field, or the raw PDF as the body.
//   Query (or form) options: page (1-based; omit for all pages), dpi (10-300, default 150), width, height, password.
// Returns image/png for one page, or application/zip with one PNG per page; X-Page-Count says how many pages the PDF has.
app.MapPost("/api/pdf-to-image", async (HttpRequest request, CancellationToken ct) =>
{
    const long MaxPdfBytes = 25 * 1024 * 1024;
    const int MaxPages = 100;
    if (request.HttpContext.Features.Get<Microsoft.AspNetCore.Http.Features.IHttpMaxRequestBodySizeFeature>() is { IsReadOnly: false } limit)
        limit.MaxRequestBodySize = MaxPdfBytes;
    byte[] pdf;
    Microsoft.AspNetCore.Http.IFormCollection? form = null;
    string? fileName = null;
    // Only multipart bodies are forms here: a raw PDF posted without a content type is not url-encoded data.
    if (request.ContentType?.StartsWith("multipart/form-data", StringComparison.OrdinalIgnoreCase) == true)
    {
        form = await request.ReadFormAsync(ct);
        var file = form.Files["file"] ?? form.Files.FirstOrDefault();
        if (file == null) return Results.Problem("Upload a PDF in the \"file\" field.", statusCode: StatusCodes.Status400BadRequest);
        fileName = file.FileName;
        using var ms = new MemoryStream();
        await file.CopyToAsync(ms, ct);
        pdf = ms.ToArray();
    }
    else
    {
        using var ms = new MemoryStream();
        await request.Body.CopyToAsync(ms, ct);
        pdf = ms.ToArray();
    }
    string? Field(string name) => form != null && form.TryGetValue(name, out var v) ? v.ToString() : request.Query[name].ToString();
    static int? Int(string? s) => int.TryParse(s, System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out var v) ? v : null;
    var options = new ImageOptions
    {
        Dpi = Math.Clamp(float.TryParse(Field("dpi"), System.Globalization.CultureInfo.InvariantCulture, out var dpi) ? dpi : 150, 10, 300),
        Width = Int(Field("width")) is int w ? Math.Clamp(w, 1, 6000) : null,
        Height = Int(Field("height")) is int h ? Math.Clamp(h, 1, 6000) : null,
        Password = string.IsNullOrEmpty(Field("password")) ? null : Field("password"),
        MaxDimension = 6000,
        MaxDegreeOfParallelism = 2,
    };
    if (!await TryStartConversion(conversions, queueTimeout, ct))
        return Results.Problem("The server is busy; try again shortly.", statusCode: StatusCodes.Status503ServiceUnavailable);
    using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
    timeout.CancelAfter(TimeSpan.FromSeconds(30));
    try
    {
        // Opening parses the uploaded file, so it runs off the request thread under the same time limit.
        var renderer = await Task.Run(() => PdfRenderer.Open(pdf, options.Password), timeout.Token).WaitAsync(timeout.Token);
        var name = Path.GetFileNameWithoutExtension(SafeFileName(fileName));
        // The site renders one page per request and needs to know how many there are.
        request.HttpContext.Response.Headers["X-Page-Count"] = renderer.PageCount.ToString(System.Globalization.CultureInfo.InvariantCulture);
        if (Int(Field("page")) is int page || renderer.PageCount == 1)
        {
            int index = (Int(Field("page")) ?? 1) - 1;
            if (index < 0 || index >= renderer.PageCount)
                return Results.Problem($"The PDF has {renderer.PageCount} page(s).", statusCode: StatusCodes.Status400BadRequest);
            var png = await Task.Run(() => renderer.RenderPageToPng(index, options, timeout.Token), timeout.Token);
            return Results.File(png, "image/png", $"{name}-{index + 1}.png");
        }
        if (renderer.PageCount > MaxPages)
            return Results.Problem($"At most {MaxPages} pages per request; pass ?page=N for single pages.", statusCode: StatusCodes.Status400BadRequest);
        var pngs = await Task.Run(() => renderer.RenderAllToPng(options, timeout.Token), timeout.Token);
        var zip = new MemoryStream();
        using (var archive = new System.IO.Compression.ZipArchive(zip, System.IO.Compression.ZipArchiveMode.Create, leaveOpen: true))
            for (int i = 0; i < pngs.Length; i++)
            {
                // PNGs are already compressed.
                var entry = archive.CreateEntry($"{name}-{i + 1}.png", System.IO.Compression.CompressionLevel.NoCompression);
                using var es = entry.Open();
                es.Write(pngs[i]);
            }
        return Results.File(zip.ToArray(), "application/zip", name + "-pages.zip");
    }
    catch (PdfPasswordException ex)
    {
        return Results.Problem(ex.Message, statusCode: StatusCodes.Status401Unauthorized);
    }
    catch (Exception ex) when (ex is InvalidDataException or NotSupportedException)
    {
        return Results.Problem(ex.Message, statusCode: StatusCodes.Status422UnprocessableEntity);
    }
    catch (OutOfMemoryException)
    {
        return Results.Problem("The document needs more memory than the server can give it.", statusCode: StatusCodes.Status422UnprocessableEntity);
    }
    catch (OperationCanceledException) when (!ct.IsCancellationRequested)
    {
        return Results.Problem("The document took too long to render.", statusCode: StatusCodes.Status422UnprocessableEntity);
    }
    finally
    {
        conversions.Release();
    }
}).RequireRateLimiting("convert").DisableAntiforgery();

app.Run();

// Builds the options from the simple fields, then applies the full "options" object when the request has one.
// Everything comes from anyone on the internet, so each value is checked or clamped here: no setting can read files or
// fonts from this server, reach the network, or ask for more pages, time or memory than the simple form can.
static PdfOptions BuildOptions(ConvertRequest req)
{
    float margin = Math.Clamp(Finite(req.MarginMm) ?? 12.7f, 0, 50) * 72f / 25.4f;
    var options = new PdfOptions
    {
        PageSize = NamedPageSize(req.PageSize, req.Landscape),
        Margins = new PageMargins(margin),
        FooterText = req.PageNumbers ? "Page {page} of {pages}" : null,
        Watermark = string.IsNullOrWhiteSpace(req.Watermark) ? null : new PdfWatermark { Text = Limit(req.Watermark, 200, "watermark") },
        Security = string.IsNullOrEmpty(req.Password) ? null : new PdfSecurity { UserPassword = Limit(req.Password, 128, "password"), Permissions = PdfPermissions.All },
        Conformance = req.PdfA ? PdfConformance.PdfA2b : PdfConformance.None,
        // The HTML comes from anyone on the internet: never let it read files from this server.
        AllowFileAccess = false,
        MaxPages = MaxPages,
    };
    if (req.Options is { } o) ApplySettings(options, o);
    // Whatever was asked for: no file access, no fonts but the standard ones (and the bundled Liberation copies of
    // them), and at most MaxPages pages.
    options.AllowFileAccess = false;
    options.BaseDirectory = null;
    options.ResourceResolver = null;
    options.UseSystemFonts = false;
    options.Signature = null;
    return options;
}

static void ApplySettings(PdfOptions options, PdfSettings o)
{
    const float Mm = 72f / 25.4f;
    if (o.PageWidthMm is not null || o.PageHeightMm is not null)
    {
        float w = Range(o.PageWidthMm, 50, 2000, "pageWidthMm"), h = Range(o.PageHeightMm, 50, 2000, "pageHeightMm");
        var size = new PageSize(w * Mm, h * Mm);
        options.PageSize = o.Landscape ? size.Landscape : size;
    }
    else if (o.PageSize != null) options.PageSize = NamedPageSize(o.PageSize, o.Landscape);
    else if (o.Landscape) options.PageSize = options.PageSize.Landscape;

    if (o.MarginTopMm is not null || o.MarginRightMm is not null || o.MarginBottomMm is not null || o.MarginLeftMm is not null)
        options.Margins = new PageMargins(
            Range(o.MarginTopMm ?? 0, 0, 100, "marginTopMm") * Mm, Range(o.MarginRightMm ?? 0, 0, 100, "marginRightMm") * Mm,
            Range(o.MarginBottomMm ?? 0, 0, 100, "marginBottomMm") * Mm, Range(o.MarginLeftMm ?? 0, 0, 100, "marginLeftMm") * Mm);
    if (o.Scale is not null) options.Scale = Range(o.Scale, 0.1f, 2f, "scale");
    options.TruncateBandsToWholePoints = o.TruncateBandsToWholePoints;
    options.IgnoreCssPageRules = o.IgnoreCssPageRules;
    options.UserStyleSheet = LimitOrNull(o.UserStyleSheet, 100_000, "userStyleSheet");
    if (o.Bookmarks is bool bm) options.Bookmarks = bm;
    if (o.Compress is bool c) options.Compress = c;
    if (o.CompressionLevel != null)
        options.CompressionLevel = Enum.TryParse<System.IO.Compression.CompressionLevel>(o.CompressionLevel, true, out var cl) && Enum.IsDefined(cl) && !char.IsDigit(o.CompressionLevel[0])
            ? cl : throw new ArgumentException("compressionLevel must be Optimal, Fastest, NoCompression or SmallestSize.");
    if (o.MaxPages is int mp) options.MaxPages = mp is >= 1 and <= MaxPages ? mp : throw new ArgumentException($"maxPages must be between 1 and {MaxPages}.");
    options.EmbedStandardFonts = o.EmbedStandardFonts;

    options.Title = Text(o.Title, 500, "title");
    options.Author = Text(o.Author, 500, "author");
    options.Subject = Text(o.Subject, 500, "subject");
    options.Keywords = Text(o.Keywords, 500, "keywords");
    options.Creator = Text(o.Creator, 500, "creator");
    options.Producer = Text(o.Producer, 500, "producer");
    if (o.CustomProperties is { Count: > 0 } props)
    {
        if (props.Count > 20) throw new ArgumentException("At most 20 custom properties.");
        string[] reserved = ["Title", "Author", "Subject", "Keywords", "Creator", "Producer", "CreationDate", "ModDate", "Trapped"];
        foreach (var (name, value) in props)
        {
            if (!System.Text.RegularExpressions.Regex.IsMatch(name, "^[A-Za-z][A-Za-z0-9_.-]{0,63}$"))
                throw new ArgumentException($"Custom property names use letters, digits, '_', '-' and '.', start with a letter and are at most 64 characters: \"{Limit(name, 64, "name")}\".");
            if (reserved.Contains(name, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException($"\"{name}\" is a standard property; set it with its own field.");
            options.CustomProperties[name] = Text(value, 500, name) ?? "";
        }
    }
    if (o.HeaderText != null) options.HeaderText = Text(o.HeaderText, 300, "headerText");
    if (o.FooterText != null) options.FooterText = Text(o.FooterText, 300, "footerText");

    if (o.Watermark is { } w2)
    {
        bool hasText = !string.IsNullOrWhiteSpace(w2.Text), hasImage = w2.Image is { Length: > 0 };
        if (!hasText && !hasImage) options.Watermark = null;
        else
        {
            if (hasImage && (w2.Image!.Length > 2 * 1024 * 1024 || !IsWatermarkImage(w2.Image)))
                throw new ArgumentException("The watermark image must be a PNG, JPEG, GIF or WebP file of at most 2 MB.");
            options.Watermark = new PdfWatermark
            {
                Text = hasText ? Text(w2.Text, 200, "watermark text") : null,
                Image = hasImage ? w2.Image : null,
                ImageWidth = Range(w2.ImageWidth ?? 0, 0, 2000, "watermark imageWidth"),
                FontSize = Range(w2.FontSize ?? 0, 0, 300, "watermark fontSize"),
                // Only the standard fonts: the generic families map to Helvetica, Times and Courier.
                FontFamily = (w2.FontFamily ?? "").Trim().ToLowerInvariant() switch
                {
                    "" => null,
                    "sans-serif" or "helvetica" => "sans-serif",
                    "serif" or "times" => "serif",
                    "monospace" or "courier" => "monospace",
                    _ => throw new ArgumentException("watermark fontFamily must be sans-serif, serif or monospace."),
                },
                LetterSpacing = Range(w2.LetterSpacing ?? 0, -20, 100, "watermark letterSpacing"),
                Bold = w2.Bold ?? true,
                Color = string.IsNullOrWhiteSpace(w2.Color) ? "#808080"
                    : System.Text.RegularExpressions.Regex.IsMatch(w2.Color.Trim(), @"^(#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,30}|(rgb|rgba|hsl|hsla)\([0-9.,%\s/deg]{1,60}\))$")
                        ? w2.Color.Trim() : throw new ArgumentException("watermark color must be a CSS colour such as #c00000 or red."),
                Opacity = Range(w2.Opacity ?? 0.3f, 0, 1, "watermark opacity"),
                Angle = w2.Angle is null ? null : Range(w2.Angle, -360, 360, "watermark angle"),
                Behind = w2.Behind,
            };
        }
    }

    if (o.Security is { } sec)
    {
        if (string.IsNullOrEmpty(sec.UserPassword) && string.IsNullOrEmpty(sec.OwnerPassword) && sec.Permissions == null) options.Security = null;
        else
        {
            var permissions = PdfPermissions.None;
            foreach (var name in sec.Permissions ?? [])
                permissions |= Enum.TryParse<PdfPermissions>(name, true, out var p) && Enum.IsDefined(p) && !char.IsDigit(name.TrimStart('-')[0]) ? p
                    : throw new ArgumentException($"Unknown permission \"{Limit(name, 40, "permission")}\".");
            options.Security = new PdfSecurity
            {
                UserPassword = string.IsNullOrEmpty(sec.UserPassword) ? null : Limit(sec.UserPassword, 128, "userPassword"),
                OwnerPassword = string.IsNullOrEmpty(sec.OwnerPassword) ? null : Limit(sec.OwnerPassword, 128, "ownerPassword"),
                Permissions = permissions,
            };
        }
    }

    if (o.Conformance != null)
        options.Conformance = (o.Conformance ?? "").Trim().ToLowerInvariant() switch
        {
            "" or "none" => PdfConformance.None,
            "pdfa2b" or "pdf/a-2b" => PdfConformance.PdfA2b,
            "pdfa3b" or "pdf/a-3b" => PdfConformance.PdfA3b,
            _ => throw new ArgumentException("conformance must be None, PdfA2b or PdfA3b."),
        };
    if (options.Security != null && options.Conformance != PdfConformance.None)
        throw new ArgumentException("PDF/A does not allow passwords: choose one or the other.");

    if (!string.IsNullOrWhiteSpace(o.EInvoiceXml))
    {
        var xml = System.Text.Encoding.UTF8.GetBytes(Limit(o.EInvoiceXml, 1024 * 1024, "eInvoiceXml"));
        // The library reads the XML with DTDs prohibited and no resolver, so it cannot reach files or the network.
        options.EInvoice = string.IsNullOrWhiteSpace(o.EInvoiceProfile)
            ? new PdfEInvoice(xml)
            : new PdfEInvoice(xml, Enum.TryParse<EInvoiceProfile>(o.EInvoiceProfile.Replace(" ", ""), true, out var prof) && Enum.IsDefined(prof) && !char.IsDigit(o.EInvoiceProfile[0])
                ? prof : throw new ArgumentException("Unknown e-invoice profile."));
        if (options.Security != null) throw new ArgumentException("E-invoices are PDF/A-3 files, which do not allow passwords.");
    }
}

static PageSize NamedPageSize(string? name, bool landscape)
{
    var size = (name ?? "A4").Trim().ToUpperInvariant() switch
    {
        "A3" => PageSize.A3,
        "A5" => PageSize.A5,
        "LETTER" => PageSize.Letter,
        "LEGAL" => PageSize.Legal,
        _ => PageSize.A4,
    };
    return landscape ? size.Landscape : size;
}

static float? Finite(float? v) => v is float f && float.IsFinite(f) ? f : null;

static float Range(float? value, float min, float max, string name) =>
    Finite(value) is float f && f >= min && f <= max ? f : throw new ArgumentException($"{name} must be between {min} and {max}.");

static string Limit(string value, int max, string name) =>
    value.Length <= max ? value : throw new ArgumentException($"{name} is longer than {max} characters.");

static string? LimitOrNull(string? value, int max, string name) => string.IsNullOrEmpty(value) ? null : Limit(value, max, name);

// Document text: at most max characters, without control characters (line breaks and tabs become spaces).
static string? Text(string? value, int max, string name)
{
    if (string.IsNullOrWhiteSpace(value)) return null;
    Limit(value, max, name);
    return new string(value.Select(c => char.IsControl(c) ? ' ' : c).ToArray()).Trim();
}

static bool IsWatermarkImage(byte[] b) =>
    b.AsSpan().StartsWith((byte[])[0x89, (byte)'P', (byte)'N', (byte)'G'])
    || b.AsSpan().StartsWith((byte[])[0xFF, 0xD8, 0xFF])
    || b.AsSpan().StartsWith("GIF8"u8)
    || (b.Length > 12 && b.AsSpan(0, 4).SequenceEqual("RIFF"u8) && b.AsSpan(8, 4).SequenceEqual("WEBP"u8));

// One rate-limit bucket per IPv4 address or IPv6 /64 network (a single client usually owns a whole /64).
static string ClientKey(System.Net.IPAddress? ip)
{
    if (ip == null) return "unknown";
    if (ip.IsIPv4MappedToIPv6) ip = ip.MapToIPv4();
    if (ip.AddressFamily != System.Net.Sockets.AddressFamily.InterNetworkV6) return ip.ToString();
    var bytes = ip.GetAddressBytes();
    Array.Clear(bytes, 8, 8);
    return new System.Net.IPAddress(bytes) + "/64";
}

// Starts a conversion if a slot is free within the queue time and memory is not nearly used up.
static async Task<bool> TryStartConversion(SemaphoreSlim conversions, TimeSpan queueTimeout, CancellationToken ct)
{
    if (!await conversions.WaitAsync(queueTimeout, ct)) return false;
    var gc = GC.GetGCMemoryInfo();
    if (gc.MemoryLoadBytes < gc.HighMemoryLoadThresholdBytes) return true;
    conversions.Release();
    return false;
}

static string SafeFileName(string? name, string extension = ".pdf")
{
    if (string.IsNullOrWhiteSpace(name)) return "document" + extension;
    var clean = new string(Path.GetFileNameWithoutExtension(name).Where(c => char.IsLetterOrDigit(c) || c is '-' or '_' or ' ').ToArray()).Trim();
    return (clean.Length == 0 ? "document" : clean) + extension;
}

static bool IsMarkdownFormat(string? format) => (format ?? "").Trim().ToLowerInvariant() is "markdown" or "md";

static bool IsMarkdownFile(string? fileName, string? contentType)
{
    var ext = Path.GetExtension(fileName ?? "").ToLowerInvariant();
    if (ext is ".md" or ".markdown" or ".mdown" or ".mkd" or ".mkdn") return true;
    return (contentType ?? "").StartsWith("text/markdown", StringComparison.OrdinalIgnoreCase)
           || (contentType ?? "").StartsWith("text/x-markdown", StringComparison.OrdinalIgnoreCase);
}

public sealed class ConvertRequest
{
    public string Html { get; set; } = "";
    public string? Markdown { get; set; }
    /// <summary>"html" (default) or "markdown": how to read <see cref="Html"/>.</summary>
    public string? Format { get; set; }
    /// <summary>"pdf" (default) or "html" (Markdown input only).</summary>
    public string? Output { get; set; }
    public string? PageSize { get; set; }
    public bool Landscape { get; set; }
    public float? MarginMm { get; set; }
    public bool PageNumbers { get; set; }
    /// <summary>Text stamped diagonally on every page.</summary>
    public string? Watermark { get; set; }
    /// <summary>Password needed to open the PDF (AES-256).</summary>
    public string? Password { get; set; }
    /// <summary>Produce PDF/A-2b for archiving (cannot be combined with a password).</summary>
    public bool PdfA { get; set; }
    public string? FileName { get; set; }
    /// <summary>Every other setting of <see cref="PdfOptions"/> that is safe to take from a visitor; overrides the fields above.</summary>
    public PdfSettings? Options { get; set; }
}

/// <summary>
/// The PdfOptions a visitor may set. Fonts, file access, resource loading and signatures are left out on purpose: the
/// server only uses the standard fonts and never reads its own files for a document.
/// </summary>
public sealed class PdfSettings
{
    public string? PageSize { get; set; }
    public float? PageWidthMm { get; set; }
    public float? PageHeightMm { get; set; }
    public bool Landscape { get; set; }
    public float? MarginTopMm { get; set; }
    public float? MarginRightMm { get; set; }
    public float? MarginBottomMm { get; set; }
    public float? MarginLeftMm { get; set; }
    public float? Scale { get; set; }
    public bool TruncateBandsToWholePoints { get; set; }
    public bool IgnoreCssPageRules { get; set; }
    public string? UserStyleSheet { get; set; }
    public bool? Bookmarks { get; set; }
    public bool? Compress { get; set; }
    public string? CompressionLevel { get; set; }
    public int? MaxPages { get; set; }
    public bool EmbedStandardFonts { get; set; }
    public string? Title { get; set; }
    public string? Author { get; set; }
    public string? Subject { get; set; }
    public string? Keywords { get; set; }
    public string? Creator { get; set; }
    public string? Producer { get; set; }
    public Dictionary<string, string>? CustomProperties { get; set; }
    public string? HeaderText { get; set; }
    public string? FooterText { get; set; }
    public WatermarkSettings? Watermark { get; set; }
    public SecuritySettings? Security { get; set; }
    /// <summary>"None", "PdfA2b" or "PdfA3b".</summary>
    public string? Conformance { get; set; }
    /// <summary>A Factur-X / ZUGFeRD invoice's CII XML to attach.</summary>
    public string? EInvoiceXml { get; set; }
    public string? EInvoiceProfile { get; set; }
}

public sealed class WatermarkSettings
{
    public string? Text { get; set; }
    /// <summary>PNG, JPEG, GIF or WebP bytes (base64 in JSON).</summary>
    public byte[]? Image { get; set; }
    public float? ImageWidth { get; set; }
    public float? FontSize { get; set; }
    /// <summary>"sans-serif", "serif" or "monospace" (Helvetica, Times or Courier).</summary>
    public string? FontFamily { get; set; }
    public float? LetterSpacing { get; set; }
    public bool? Bold { get; set; }
    public string? Color { get; set; }
    public float? Opacity { get; set; }
    public float? Angle { get; set; }
    public bool Behind { get; set; }
}

public sealed class SecuritySettings
{
    public string? UserPassword { get; set; }
    public string? OwnerPassword { get; set; }
    /// <summary>Names of <see cref="PdfPermissions"/> flags, e.g. ["Print", "Copy"].</summary>
    public string[]? Permissions { get; set; }
}

[JsonSerializable(typeof(ConvertRequest))]
[JsonSourceGenerationOptions(PropertyNameCaseInsensitive = true)]
internal partial class AppJsonContext : JsonSerializerContext;
