# Barcodes {new 1.13.0}

`Barcode` draws QR codes, EPC payment QR codes, Code 128 and EAN-13 barcodes as SVG markup for your HTML template.
The SVG stays vector graphics in the PDF, so the code scans at any print size. Like the rest of PdfPecker it needs no
other package.

```csharp
// Inline SVG in the template
string qr = Barcode.QrCode("https://example.com/invoice/1042");
string html = $"<p>Scan to pay online:</p>{qr}";

// Or as an image, a CSS background or a Markdown image
string src = Barcode.ToDataUri(Barcode.Ean13("590123412345"));
string img = $"<img src=\"{src}\" style=\"width:40mm\">";

// Code 128 for order numbers, shipping labels and other ASCII text
string label = Barcode.Code128("ORDER-2026-1042", new BarcodeOptions { Height = 40, ShowText = false });
```

## QR codes

`Barcode.QrCode` picks the smallest QR code (versions 1 to 40) that holds the text at the chosen error correction.
Digits only and upper-case alphanumeric text are packed densely, and anything else is stored as UTF-8, up to 2,953
bytes at the lowest level. `BarcodeOptions.ErrorCorrection` is `Low` (about 7 percent of the code may be damaged),
`Medium` (15 percent, the default), `Quartile` (25 percent) or `High` (30 percent, for codes printed small or with a
logo on top). Text that does not fit throws `ArgumentException`.

## EPC payment QR codes

`Barcode.EpcQrCode` draws the European Payments Council's QR code for a euro credit transfer, also called GiroCode,
which banking apps read to fill in the payment. Set `Name` and `Iban` on an `EpcPayment`; the rest is optional.

```csharp
string pay = Barcode.EpcQrCode(new EpcPayment
{
    Name = "Example Ltd",
    Iban = "DE89 3704 0044 0532 0130 00",
    Amount = 129.95m,
    Text = "Invoice 1042",
});
```

The payment follows guideline EPC069-12 (version 002, UTF-8) and is checked before drawing: the IBAN's check digits,
an 8 or 11 character `Bic`, an `Amount` from 0.01 to 999,999,999.99 with at most two decimals (or null to let the
payer enter it), a four-letter `Purpose` code, and either a structured creditor `Reference` (ISO 11649, "RF...") or a
`Text` of up to 140 characters, not both. `Information` is a note shown to the payer. A field that is missing, too
long or invalid throws `ArgumentException`. The code always uses error correction level M, as the guideline requires.
`ToPayload()` returns the text the code holds.

## Code 128 and EAN-13

`Barcode.Code128` takes 1 to 1,000 ASCII characters and packs runs of digits two to a symbol. `Barcode.Ean13` takes
12 digits and adds the check digit, or 13 digits with a correct check digit, and draws the retail barcode with its
guard bars. Both print the text below the bars unless `ShowText` is false.

## Options

`BarcodeOptions` sets:

- `ModuleSize`: the width of the narrowest bar or one QR square in CSS pixels, which sets the SVG's size. The default
  is 3 for QR codes and 1.5 for barcodes. CSS `width` on the SVG or image scales it too.
- `Height`: the bar height of Code 128 and EAN-13 in CSS pixels; the default is 60 modules.
- `QuietZone`: the blank margin scanners need around the code (4 modules for QR, 10 for Code 128, 11 and 7 for
  EAN-13). On by default; turn it off only when the layout leaves that space.
- `Color` and `Background`: CSS colours, `#000` on `#fff` by default. Set `Background` to null for none, but keep the
  code dark on light, since scanners need the contrast.
