# Fillable forms

Form controls become fillable PDF form fields (AcroForm), drawn as Chrome prints them and filled with their current
values. Adobe Reader, Preview, Chrome, Firefox and other viewers let the reader fill them in and save the result. The
fields of an existing PDF can be [read, filled and flattened](#filling-and-flattening-existing-pdfs) too.

```csharp
var html = """
    <p>Name <input name="name" value="Jane Doe" required></p>
    <p><label><input type="checkbox" name="newsletter" checked> Send me the newsletter</label></p>
    <p><input type="radio" name="size" value="S"> S <input type="radio" name="size" value="M" checked> M</p>
    <p><select name="country"><option value="dk">Denmark</option><option value="se">Sweden</option></select></p>
    <p><textarea name="comments" rows="4" cols="40"></textarea></p>
    """;
byte[] pdf = HtmlToPdf.Convert(html);

// Or print the controls as they are, without form fields:
byte[] flat = HtmlToPdf.Convert(html, new PdfOptions { FormFields = false });
```

| HTML | PDF field |
|------|-----------|
| `<input>` of type `text`, `email`, `tel`, `url`, `search`, `number`, `date` and the like | Text field (`maxlength` sets the maximum length) |
| `<input type="password">` | Password text field; the value is drawn as dots and not stored |
| `<textarea>` | Multi-line text field |
| `<input type="checkbox">` | Check box; its `value` is the export value (default `Yes`) |
| `<input type="radio">` | Radio buttons: those with the same `name` are one field, and each `value` is a choice |
| `<select>` | Drop-down list (combo box); with `multiple` or `size` > 1 a list box, multi-select with `multiple` |
| `<button>`, `<input type="submit">`, `reset`, `button` | Drawn only: a PDF has nothing to submit |

## Field names and behaviour

Fields are named after the `name` attribute (a period becomes `_`, since PDF uses it to nest fields; a repeated name
gets `_2`, `_3`, ...; a control without a name gets `text1`, `checkbox1`, ...). `readonly` and `required` set the
field's flags, `title`, `aria-label` or its `<label>` becomes its tooltip, and a `placeholder` is drawn in grey while the field is
empty. Disabled controls (or controls in a disabled `<fieldset>`) are drawn but not fillable, and hidden inputs are
left out. Each field has its own appearance, so the PDF looks right before anyone touches it and in viewers that never
redraw fields; while a field is edited, the viewer draws its text in Helvetica, Courier or Times at the control's size
and colour. Forms work with `Security` (the values are encrypted with the rest), `Conformance` (veraPDF passes the
fields as PDF/A-2b and 3b), `Accessibility` (each widget sits in a `Form` element described by its label, title
or name, and veraPDF passes PDF/UA-1), `Signature` (the signature field joins the form) and `PdfMerger` (repeated names are
renamed).

## Filling and flattening existing PDFs {new 1.9.0}

`PdfForm` reads, fills and flattens the form fields of any PDF, not only those PdfPecker made, such as a government
form or a contract template from another tool:

```csharp
// The fields, by fully qualified name ("address.city" for a nested one).
foreach (PdfFormField field in PdfForm.GetFields(pdf))
    Console.WriteLine($"{field.Name} ({field.Type}) = {field.Value}, choices: {string.Join(", ", field.Options)}");

var values = new Dictionary<string, string>
{
    ["name"] = "Jane Doe",
    ["address.city"] = "Copenhagen",
    ["newsletter"] = "true",       // a check box: its on state, or true/yes/on/1; Off/false/no/0/"" clears it
    ["size"] = "M",                // a radio button group: the state name of one button
    ["country"] = "dk",            // a combo box or list box: a choice's value or its text
};
byte[] filled = PdfForm.Fill(pdf, values);

// Fill and flatten in one go, so the values can no longer be changed; or flatten a PDF as it is.
byte[] final = PdfForm.Fill(pdf, values, new PdfFormFillOptions { Flatten = true });
byte[] flat = PdfForm.Flatten(filled);
PdfForm.FillFile("application.pdf", "application-filled.pdf", values);
```

`PdfFormField` gives each field's `Type` (`Text`, `CheckBox`, `RadioButton`, `ComboBox`, `ListBox`, `PushButton` or
`Signature`), its `Value` (and `Values` for a list box with several choices), the `Options` it accepts, its flags
(`ReadOnly`, `Required`, `Multiline`, `MaxLength`, ...), its tooltip and the page it is on. A name that is no field, a
choice the field does not have, or text longer than `MaxLength` throws `ArgumentException`; set `IgnoreUnknownFields`
to skip names the PDF does not have. Push buttons and signature fields cannot be filled (sign the latter with
[`PdfSigner`](/docs/signatures/#signing-into-an-existing-field)).

Every filled field gets a new appearance in the field's own font, size, colour and alignment, with automatic font size,
multi-line text and comb fields laid out, and the box and background of its old appearance kept, so the values show in
every viewer and in [`PdfToImage`](/docs/pdf-to-image/). When the field's font cannot show a value, a subset of
`PdfFormFillOptions.Font` (by default the bundled Liberation Sans, which covers Latin, Greek and Cyrillic) is embedded
for it. XFA form data, which would override the filled fields in some viewers, is removed.

A signed or encrypted PDF is filled with an incremental update: the original bytes stay as they were, so the signatures
stay valid (when their permissions allow form filling) and the encryption is kept; pass the password in
`PdfFormFillOptions.Password`. Other PDFs are written out in full, without the old values in earlier revisions.
Flattening draws each field into its page and removes it, keeping links, comments and other annotations; it changes the
pages, so a signed PDF is refused with `InvalidOperationException`.
