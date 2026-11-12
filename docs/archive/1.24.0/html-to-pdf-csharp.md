# HTML to PDF in C#

This guide shows how to convert HTML to PDF in C# with PdfPecker, from a one-line conversion to an invoice built from a
template and served from ASP.NET Core. PdfPecker is a pure C# library: it does not start Chrome or another browser,
needs no native binaries such as wkhtmltopdf, and has no NuGet dependencies, so the same code runs on Windows, Linux,
macOS, in Docker and in serverless functions.

## Install the NuGet package

```
dotnet add package PdfPecker
```

PdfPecker works with .NET 8, .NET 9 and .NET 10 and is free under the MIT license.

## Convert an HTML string to PDF

```csharp
using PdfPecker;

byte[] pdf = HtmlToPdf.Convert("<h1>Hello</h1><p>World</p>");
File.WriteAllBytes("hello.pdf", pdf);
```

`HtmlToPdf.Convert` returns the PDF as a byte array. To write it straight to a file, a `MemoryStream` or an HTTP
response, pass a stream instead:

```csharp
using (var file = File.Create("hello.pdf")) HtmlToPdf.Convert(html, file);
```

## Convert an HTML file to PDF

```csharp
HtmlToPdf.ConvertFile("invoice.html", "invoice.pdf");
```

Relative image and stylesheet paths in the file, such as `<img src="logo.png">` or
`<link rel="stylesheet" href="invoice.css">`, are read from the HTML file's folder. When you convert a string, set
`BaseDirectory` to say where those files are:

```csharp
var options = new PdfOptions { BaseDirectory = "/var/app/templates" };
byte[] pdf = HtmlToPdf.Convert(html, options);
```

## Generate an invoice from a template

Build the HTML with whatever produces a string, such as a Razor view rendered to a string, a template engine, or plain
string interpolation, and convert the result. Encode values that come from users or a database, so that a customer
name with a `<` in it cannot break the page.

```csharp
using System.Net;
using PdfPecker;

record Line(string Description, int Quantity, decimal Price);

static byte[] Invoice(string customer, IEnumerable<Line> lines)
{
    var rows = string.Concat(lines.Select(l =>
        $"<tr><td>{WebUtility.HtmlEncode(l.Description)}</td><td>{l.Quantity}</td><td>{l.Quantity * l.Price:N2}</td></tr>"));
    var total = lines.Sum(l => l.Quantity * l.Price);

    var html = $$"""
        <style>
          body { font-family: Helvetica, sans-serif; font-size: 10pt }
          table { width: 100%; border-collapse: collapse }
          th, td { padding: 6px; border-bottom: 1px solid #ddd; text-align: left }
          td:last-child, th:last-child { text-align: right }
        </style>
        <h1>Invoice</h1>
        <p>To: {{WebUtility.HtmlEncode(customer)}}</p>
        <table>
          <thead><tr><th>Item</th><th>Qty</th><th>Amount</th></tr></thead>
          <tbody>{{rows}}</tbody>
        </table>
        <p style="text-align: right"><b>Total: {{total:N2}}</b></p>
        """;

    return HtmlToPdf.Convert(html, new PdfOptions { Title = "Invoice" });
}
```

Table headers repeat on every page when a table runs over a page break, and flexbox, grid and the rest of
[the CSS PdfPecker supports](/docs/html-and-css/) work in templates as they do in a browser.

## Return a PDF from ASP.NET Core

```csharp
app.MapGet("/invoice/{id}", (int id) =>
{
    byte[] pdf = Invoice("ACME Ltd", LoadLines(id));
    return Results.File(pdf, "application/pdf", $"invoice-{id}.pdf");
});
```

In an MVC controller, `return File(pdf, "application/pdf", "invoice.pdf");` does the same. All PdfPecker methods are
static and thread-safe, so many requests can convert at once, and `HtmlToPdf.ConvertAsync` moves the work off the
calling thread.

## Page size, margins, headers and footers

```csharp
var options = new PdfOptions
{
    PageSize = PageSize.Letter,                          // A4 is the default
    Margins = PageMargins.FromMillimeters(20, 15, 20, 15),
    HeaderText = "ACME Ltd",
    FooterText = "Page {page} of {pages}",
};
byte[] pdf = HtmlToPdf.Convert(html, options);
```

The page can also be set from CSS, which keeps it with the template:

```css
@page {
  size: A4 landscape;
  margin: 20mm 15mm;
  @bottom-right { content: "Page " counter(page) " of " counter(pages) }
}
```

For a header or footer written in HTML, with a logo or a table, see [Paged media](/docs/paged-media/), and for every
setting see [Options](/docs/options/).

## Fonts

Text without a registered font uses the standard PDF fonts Helvetica, Times and Courier. To use your own font, register the TrueType, OpenType, WOFF or WOFF2
file and refer to it by its family name in CSS; only the characters the document uses are embedded.

```csharp
var options = new PdfOptions();
options.Fonts.AddFile("fonts/OpenSans-Regular.ttf");
byte[] pdf = HtmlToPdf.Convert("<p style=\"font-family: 'Open Sans'\">Hello</p>", options);
```

[Fonts](/docs/fonts/) covers `@font-face`, bold and italic files, and what happens when a font is missing.

## Images

`<img>` and CSS backgrounds take PNG, JPEG, GIF, WebP and SVG files, and `data:` URLs. Files are read only from inside
`BaseDirectory`, and PdfPecker never downloads anything by itself: to load `http` or `https` images, hand them over with
`ResourceResolver`.

```csharp
var http = new HttpClient();
var options = new PdfOptions
{
    ResourceResolver = url => url.StartsWith("https://cdn.example.com/")
        ? http.GetByteArrayAsync(url).GetAwaiter().GetResult()
        : null,
};
```

## Common questions

**Does PdfPecker need Chrome, Puppeteer or wkhtmltopdf?** No. It has its own HTML parser, CSS engine, layout engine and
PDF writer, written in C#. There is nothing to install on the server besides the .NET runtime.

**Does it run on Linux, in Docker and in Azure Functions or AWS Lambda?** Yes. It is pure managed code, so it runs
wherever .NET 8 or later runs, on x64 and ARM64.

**Does it run JavaScript?** No. PdfPecker converts the HTML and CSS you give it, which suits templates you control,
such as invoices, reports, payslips and letters. Pages that build themselves with JavaScript need a browser-based
converter; [Compare](/compare/) lists them.

**How fast is it?** A one-page invoice takes about a millisecond once the process is warm. See
[Performance](/docs/performance/) for the measurements.

**Is it free for commercial use?** Yes. PdfPecker is open source under the MIT license.

**Can I also convert Markdown, or make PDF/A?** Yes: `MarkdownToPdf.Convert` takes Markdown (see
[Markdown](/docs/markdown/)), and `PdfOptions.Conformance` makes PDF/A for archiving (see
[PDF/A, passwords and watermarks](/docs/pdfa-and-passwords/)).
