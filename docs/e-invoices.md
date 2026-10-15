# E-invoices

## Factur-X and ZUGFeRD

Pass the invoice's CII XML (from your invoicing system) and PdfPecker attaches it to the PDF, making a Factur-X /
ZUGFeRD e-invoice: the pages are the human-readable invoice and the XML is what accounting software reads.

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
not allowed in Factur-X) but does not validate its content or build it from invoice data: make sure the visible pages
show the same invoice. The output passes the Mustang validator (PDF/A-3b via veraPDF, and the XML's schematron).
Other files can be attached next to the invoice with `Attachments` (see [Attachments](/docs/attachments/)).

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
OIOUBL 2.1 schematron. PdfPecker does not build or validate the rest of the invoice.
