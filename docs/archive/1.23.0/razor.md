# Razor components {new 1.23.0}

PdfPecker.Razor turns Razor components (`.razor` files) into PDFs. Write a document template as a component, with
typed parameters, `@foreach`, child components, layouts and dependency injection, and get a PDF from it in one call.
The component is rendered to HTML with Microsoft's `HtmlRenderer`, the static renderer ASP.NET Core uses for
server-side rendering, and PdfPecker converts the HTML. There is no browser, no ASP.NET Core host and no JavaScript,
so it works the same in a console app, a background worker or a web app.

```
dotnet add package PdfPecker.Razor
```

The package is released with PdfPecker under the same version. It depends on PdfPecker and on
`Microsoft.AspNetCore.Components.Web` of the app's .NET version (8, 9 or 10), which holds `HtmlRenderer`. The project
with the `.razor` files uses the Razor SDK, `<Project Sdk="Microsoft.NET.Sdk.Razor">`, so they compile to C# classes.

## A template

`Invoice.razor`:

```razor
@using System.Globalization

<!DOCTYPE html>
<html>
<head>
    <style>
        @@page { size: A4; margin: 20mm; }
        td.amount { text-align: right; }
    </style>
</head>
<body>
    <h1>Invoice @Data.Number</h1>
    <table>
        @foreach (var line in Data.Lines)
        {
            <tr><td>@line.Description</td><td class="amount">@line.Amount.ToString("N2", CultureInfo.InvariantCulture)</td></tr>
        }
    </table>
</body>
</html>

@code {
    [Parameter, EditorRequired] public InvoiceModel Data { get; set; } = default!;
}
```

and the code that turns it into a PDF:

```csharp
using PdfPecker;
using PdfPecker.Razor;

var parameters = new Dictionary<string, object?> { [nameof(Invoice.Data)] = invoice };
byte[] pdf = await RazorToPdf.ConvertAsync<Invoice>(parameters);

// Every PdfPecker option works: page size, fonts, PDF/A, signatures, e-invoices.
byte[] archived = await RazorToPdf.ConvertAsync<Invoice>(parameters, new PdfOptions { Conformance = PdfConformance.PdfA2b });

// Straight to an ASP.NET Core response, with the request's services for components that @inject them.
app.MapGet("/invoice/{id}", async (int id, HttpContext context, InvoiceStore store) =>
{
    var parameters = new Dictionary<string, object?> { ["Data"] = await store.LoadAsync(id) };
    context.Response.ContentType = "application/pdf";
    await RazorToPdf.ConvertAsync<Invoice>(context.Response.Body, parameters, services: context.RequestServices,
        cancellationToken: context.RequestAborted);
});

// The HTML the component renders to, to open in a browser while working on the template.
string html = await RazorToPdf.RenderHtmlAsync<Invoice>(parameters);
```

A complete example, with a layout and a child component for the line table, is in
[samples/PdfPecker.Razor.Sample](https://github.com/Moonwalker1307/PdfPecker/tree/main/samples/PdfPecker.Razor.Sample).

## What works

- **Typed templates.** Parameters are C# properties, so a misspelt field or a wrong type is a compile error. A
  parameter name without a `[Parameter]` property fails with `InvalidOperationException`.
- **Child components and layouts.** Split a document into components and pass data down with parameters or
  `CascadingValue`. A layout is a component with `ChildContent`, or a `LayoutComponentBase` used through `LayoutView`.
- **Dependency injection.** `@inject` and constructor injection take services from the `IServiceProvider` given as
  `services`, such as `RequestServices`. Without it there are none, and a component that injects one fails with a
  message that names it.
- **Asynchronous data.** `OnInitializedAsync` and `OnParametersSetAsync` are awaited before the HTML is taken.
- **Everything PdfPecker does.** The HTML goes to `HtmlToPdf`, so [CSS](/docs/html-and-css/),
  [paged media](/docs/paged-media/), fonts and every [option](/docs/options/) apply. Relative image paths resolve
  against `PdfOptions.BaseDirectory`.
- **Same output.** `ConvertAsync` gives byte for byte the PDF that `HtmlToPdf.ConvertAsync` gives for the HTML of
  `RenderHtmlAsync`, so a fixed `CreationDate` makes the output reproducible.

## Safety

Razor encodes every value it writes into the markup, so names, addresses and other caller data cannot become HTML.
Only a `MarkupString` inserts HTML as it is; use it only for markup you trust.

Each call renders in an `HtmlRenderer` of its own, disposed when the call returns, so nothing is kept between
conversions and parallel calls are safe. Components render once and statically, as in static server-side rendering:
event handlers, timers and JavaScript interop do not run. The cancellation token stops the PDF conversion; pass it to
the component as a parameter when the component does slow work of its own.

## Trimming and Native AOT

PdfPecker.Razor is trimmable and AOT-compatible. Microsoft's `Microsoft.AspNetCore.Components` reports trim warnings
from its own code, folded into one `IL2104` warning when you publish trimmed or with Native AOT; the sample's project
file shows how to ignore only that assembly's warning. `@layout` and `LayoutView` set a layout's type by reflection,
which the trim analyzer warns about in your project; a layout written as a component with `ChildContent` avoids it.

Rendering the sample's 20-line invoice component takes about 0.03 ms, against about 0.5 ms for converting its HTML.
The package adds about 1.4 MB of Microsoft assemblies to an app without ASP.NET Core; an ASP.NET Core app already has
them in its shared framework.
