# E-invoices

## Invoice XML from invoice data {new 1.15.0}

`InvoiceData` describes an invoice by the European e-invoicing standard EN 16931: the seller and buyer, the lines,
allowances and charges, payment and references. PdfPecker calculates the totals and the VAT breakdown from the lines
and writes the invoice as XML, so you do not need a separate e-invoicing library:

```csharp
var invoice = new InvoiceData
{
    Number = "INV-2026-0042",
    IssueDate = new DateOnly(2026, 10, 13),
    DueDate = new DateOnly(2026, 11, 12),
    BuyerReference = "04011000-12345-34",
    Seller = new InvoiceParty
    {
        Name = "Example Seller GmbH",
        VatId = "DE123456789",
        Address = new InvoiceAddress { Line1 = "Musterstraße 1", City = "Berlin", PostalCode = "10115", CountryCode = "DE" },
        ElectronicAddress = "DE123456789", ElectronicAddressScheme = "9930",
    },
    Buyer = new InvoiceParty
    {
        Name = "Example Buyer AG",
        Address = new InvoiceAddress { Line1 = "Beispielweg 2", City = "München", PostalCode = "80331", CountryCode = "DE" },
        ElectronicAddress = "04011000-12345-34", ElectronicAddressScheme = "0204",
    },
    Payment = new InvoicePayment { Iban = "DE02 1203 0000 0000 2020 51", Reference = "INV-2026-0042" },
};
invoice.Lines.Add(new InvoiceLine { Name = "Consulting", Quantity = 10, UnitCode = "HUR", NetPrice = 100, VatRate = 19 });

byte[] facturX   = invoice.ToCii();                            // Factur-X / ZUGFeRD EN 16931
byte[] xrechnung = invoice.ToCii(EInvoiceProfile.XRechnung);   // XRechnung 3.0 CII
byte[] peppol    = invoice.ToUbl();                            // Peppol BIS Billing 3.0 UBL
byte[] pdf = HtmlToPdf.Convert(invoiceHtml, new PdfOptions { EInvoice = invoice.ToEInvoice() });  // Factur-X PDF
```

- `ToCii()` writes Factur-X / ZUGFeRD EN 16931 CII, and `ToCii(EInvoiceProfile.XRechnung)` XRechnung 3.0 CII.
- `ToUbl()` writes Peppol BIS Billing 3.0 UBL, an Invoice or, for `InvoiceType.CreditNote`, a CreditNote;
  `ToUbl(UblFormat.XRechnung)` writes XRechnung 3.0 UBL. Attach the PDF with `UblInvoice.AttachPdf` (see below). Peppol
  needs real participant IDs as electronic addresses, with an EAS scheme such as 0184, 0088 or 9930; an email address
  (EM) is not accepted.
- `ToEInvoice()` returns a `PdfEInvoice` for `PdfOptions.EInvoice`, so one conversion makes the Factur-X PDF.
- `CalculateTotals()` returns the `InvoiceTotals`: line total, allowances, charges, net total, the VAT breakdown, grand
  total and amount due. Money is rounded to two decimals, half away from zero, as EN 16931 expects.
- `Validate()` (with an `EInvoiceProfile` or a `UblFormat`) lists the problems with their EN 16931 rule numbers, plus
  XRechnung's BR-DE and the Peppol rules for those formats, or an empty list. `ToCii`, `ToUbl` and `ToEInvoice` throw
  `ArgumentException` with every problem in the message. The checks cover the fields the model has; they do not
  replace the receiver's own validator.
- VAT categories are standard (S), zero rated (Z), exempt (E, which needs a reason in `VatExemptionReasons`), reverse
  charge (AE), intra-community supply (K), export (G), outside scope (O), and the Canary Islands (L) and Ceuta and
  Melilla (M) taxes. Reverse charge, intra-community supply, export and outside scope get the standard EU wording and
  VATEX code when no reason is given.
- The same invoice always gives the same bytes. Only the EN 16931 and XRechnung profiles are written; MINIMUM,
  BASIC WL, BASIC and EXTENDED throw.

The XML passes the Mustang validator (CII and UBL, with XRechnung) and the Peppol BIS 3.0 schematrons.

## Ready-made invoice template {new 1.15.0}

`InvoiceTemplate` turns an `InvoiceData` into a print-ready A4 invoice, with the Factur-X EN 16931 XML embedded by
default (which makes the file PDF/A-3b):

```csharp
byte[] pdf = InvoiceTemplate.ToPdf(invoice, new InvoiceTemplateOptions
{
    Logo = File.ReadAllBytes("logo.png"),
    AccentColor = "#0b6e4f",
    Labels = InvoiceLabels.German,
});

string html = InvoiceTemplate.ToHtml(invoice);   // the HTML, to adapt and convert yourself
```

| Option | Default | What it does |
| --- | --- | --- |
| `Logo` | null | Your logo as PNG, JPEG, GIF, WebP, BMP or SVG bytes, drawn at most 180 by 64 pixels. |
| `LogoUri` | null | The logo as a data URI, or a URL your `ResourceResolver` loads; used when `Logo` is null. |
| `AccentColor` | `#1f4e79` | The colour of the title, headings and table header, as CSS. |
| `Labels` | `InvoiceLabels.English` | The texts, number and date formats: start from `English`, `German` or `Danish` and change any text, the decimal and group separators, the date format and the unit names. |
| `Css` | null | Extra CSS after the template's own, to change fonts, spacing or anything else. |
| `PaymentQrCode` | true | Prints an EPC payment QR code (GiroCode) next to the payment details for euro invoices paid to an IBAN. |
| `EInvoice` | `EInvoiceProfile.En16931` | The e-invoice `ToPdf` embeds: `En16931`, `XRechnung`, or null for a plain PDF. |
| `PdfOptions` | null | The PDF settings to start from, such as fonts, metadata or a signature. They are copied, not changed; page size and margins come from the template's CSS. |

Long invoices continue on more pages with the table header repeated. The labels need no `CultureInfo`, so the template
also works in apps that run with invariant globalization.

## Factur-X and ZUGFeRD {changed 1.15.0}

Pass the invoice's CII XML (from your invoicing system, or from `InvoiceData.ToCii()`) and PdfPecker attaches it to the
PDF, making a Factur-X / ZUGFeRD e-invoice: the pages are the human-readable invoice and the XML is what accounting
software reads.

```csharp
var options = new PdfOptions
{
    EInvoice = new PdfEInvoice(File.ReadAllBytes("invoice.xml")),
};
File.WriteAllBytes("invoice.pdf", HtmlToPdf.Convert(invoiceHtml, options));
```

The file is PDF/A-3b, so `Conformance` is raised to `PdfA3b` when it is left at `None`; `PdfA3u` and `PdfA4f` (PDF/A-4
with attachments) work too, while the other levels and `Security` throw. Factur-X and ZUGFeRD specify PDF/A-3, so
keep the default unless the receiver asks for PDF/A-4f.
The XML is embedded unchanged as `factur-x.xml` (`xrechnung.xml` for XRechnung), listed as an associated file, and the
XMP metadata gets the Factur-X extension schema with the document type, version and profile. The profile (MINIMUM,
BASIC WL, BASIC, EN 16931, EXTENDED or XRECHNUNG) is read from the XML's guideline ID; pass it as the second constructor
argument to set it yourself. The relationship to the pages defaults to `Data` for MINIMUM and BASIC WL and `Alternative`
otherwise; set `Relationship` to change it. PdfPecker checks that the XML is a well-formed Cross Industry Invoice (UBL is
not allowed in Factur-X) but does not validate XML you pass in yourself: make sure the visible pages show the same
invoice. XML from `InvoiceData` is checked before it is written. The output passes the Mustang validator (PDF/A-3b via veraPDF, and the XML's schematron).
Other files can be attached next to the invoice with `Attachments` (see [Attachments](/docs/attachments/)).

## Reading the invoice from a received PDF {new 1.10.0}

`PdfEInvoice.Read` gets the XML back out of a Factur-X, ZUGFeRD 2.x or XRechnung PDF, from PdfPecker or any other
producer, so the accounting side can read what the pages show:

```csharp
PdfEInvoice? invoice = PdfEInvoice.Read(File.ReadAllBytes("received.pdf"));
if (invoice is not null)
{
    File.WriteAllBytes("invoice.xml", invoice.Xml);
    Console.WriteLine(invoice.Profile);   // e.g. En16931
}
```

The invoice is the attachment the XMP metadata names, else one called `factur-x.xml`, `zugferd-invoice.xml` or
`xrechnung.xml`, else any other attached Cross Industry Invoice. The XML comes back unchanged with its `Profile` (from
the XML's guideline, else the XMP conformance level) and `Relationship`; PdfPecker does not validate it. The result is
null when the PDF carries no invoice. ZUGFeRD 1.0 uses an older schema and is not found, but
[PdfAttachments.List](/docs/attachments/) still returns its file. Pass `password` for an encrypted PDF.

## PDF attachments in UBL e-invoices (Peppol, OIOUBL)

Peppol BIS Billing 3.0, OIOUBL, EHF, XRechnung UBL and other UBL e-invoices are XML only: the XML is the invoice, and
the PDF travels inside it as an attachment. `UblInvoice.AttachPdf` adds one to the invoice or credit note your
invoicing system made:

```csharp
byte[] pdf = HtmlToPdf.Convert(invoiceHtml);
byte[] xml = UblInvoice.AttachPdf(File.ReadAllBytes("invoice.xml"), pdf, "INV-1001.pdf");
```

The PDF goes in as an `AdditionalDocumentReference` with `EmbeddedDocumentBinaryObject` (`mimeCode="application/pdf"`
and the file name), after any attachments already there and where the UBL schema expects it. The rest of the XML,
including its indentation, encoding and declaration, is kept as it was. The reference ID defaults to the file name; pass
`id` and `description` to set them. For OIOUBL 2.1 (UBL 2.0) the description is written as the `DocumentType` OIOUBL
requires, `PDF` by default. The output passes the UBL schemas, the Peppol BIS 3.0 and EN 16931 schematrons, and the
OIOUBL 2.1 schematron. PdfPecker does not validate the rest of an invoice you pass in; to build the UBL itself, use
`InvoiceData.ToUbl()` (see above).
