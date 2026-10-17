# Digital signatures

Sign the PDF with a certificate (a `.pfx` file or one from the certificate store). Adobe Reader then shows who signed
it and whether the file was changed afterwards. The key can also stay in an HSM, smart card or cloud key vault ([external
signers](#external-signers-hsms-smart-cards-and-key-vaults)), and the signatures of any PDF can be
[verified](#verifying-signatures) and made [verifiable for years](#long-term-validation).

```csharp
var cert = X509CertificateLoader.LoadPkcs12FromFile("signer.pfx", "pfx-password");
var options = new PdfOptions
{
    Signature = new PdfSignatureOptions(cert)
    {
        Reason = "Approved",
        Location = "Copenhagen",
        // Optional: a visible box (points from the top-left corner; Page = -1 is the last page).
        Appearance = new PdfSignatureAppearance { Page = -1, X = 340, Y = 720, Width = 220, Height = 70 },
        // Optional: a trusted RFC 3161 timestamp (PAdES B-T). The only option that uses the network.
        TimestampUrl = "http://timestamp.digicert.com",
    },
};

// Or sign any existing PDF; earlier signatures stay valid.
byte[] signed = PdfSigner.Sign(File.ReadAllBytes("in.pdf"), new PdfSignatureOptions(cert));

// A contract template with empty signature fields: sign into one by name, at its place on the page.
byte[] countersigned = PdfSigner.Sign(contract, new PdfSignatureOptions(cert) { FieldName = "Buyer" });
```

## Signing into an existing field

When `FieldName` names an empty signature field the PDF already has (`"Parties.Buyer"` for a nested one), the signature
goes into it and the box fills the field's rectangle; signing a field of another type or one that is already signed
throws `PdfSignatureException`. Any other name adds a new field.

## Formats and compatibility

Signatures are PAdES baseline (`ETSI.CAdES.detached`) by default, or classic `adbe.pkcs7.detached` with
`Format = PdfSignatureFormat.Pkcs7Detached`; RSA and ECDSA keys with SHA-256/384/512. The signature is appended as an
incremental update, and it works together with `Security` (encrypted files) and `Conformance` (PDF/A: the visible box is
drawn as outlines, so it needs no unembedded font). The CMS structure is built with .NET's own `System.Formats.Asn1` and
`System.Security.Cryptography`; no extra package is needed. Signing adds a few milliseconds (the RSA or ECDSA operation
and re-reading the file); conversions without a signature are unaffected.

## External signers: HSMs, smart cards and key vaults {new 1.9.0}

When the private key cannot leave its hardware security module, smart card, PKCS#11 token or cloud key vault, pass a
`PdfExternalSigner` with the certificate. PdfPecker builds the PDF and the CMS structure, and asks your callback only
for the raw signature value. The certificate needs only its public part. The callback gets a `PdfSignatureRequest` with
`Digest` for "sign hash" APIs (Azure Key Vault `SignAsync`, AWS KMS `Sign` with `MessageType.DIGEST`,
`RSA.SignHash`) and `Data` for APIs that hash themselves; both give the same signature.

```csharp
// The certificate without its private key; the key stays in Azure Key Vault.
var cert = X509CertificateLoader.LoadCertificateFromFile("signer.cer");
var keyVault = new CryptographyClient(keyId, new DefaultAzureCredential());

var signer = new PdfExternalSigner(PdfSignatureAlgorithm.RsaPkcs1, async (request, ct) =>
    (await keyVault.SignAsync(SignatureAlgorithm.RS256, request.Digest.ToArray(), ct)).Signature);
byte[] signed = await PdfSigner.SignAsync(pdf, new PdfSignatureOptions(cert, signer) { Reason = "Approved" });

// A synchronous callback, here with a key .NET can use directly (such as one from a PKCS#11 wrapper).
var local = new PdfExternalSigner(PdfSignatureAlgorithm.RsaPss,
    request => rsa.SignHash(request.Digest.ToArray(), request.HashAlgorithm, RSASignaturePadding.Pss));
byte[] signed2 = PdfSigner.Sign(pdf, new PdfSignatureOptions(cert, local));
```

`PdfSignatureAlgorithm` is `RsaPkcs1` (RS256 and the like), `RsaPss` (PS256, with a salt as long as the hash) or
`Ecdsa` (ES256, DER-encoded or raw r||s); the hash is `PdfSignatureOptions.HashAlgorithm`, SHA-256 by default. The
returned signature is checked against the certificate before it goes into the PDF, so a wrong key or padding throws
`PdfSignatureException` instead of producing a broken file. The callback is normally called once per signature (twice
in the rare case the signature does not fit the space reserved for it). `PdfSigner.SignAsync` awaits an asynchronous
callback and the timestamp server instead of blocking a thread; `PdfSigner.Sign` and signing during `HtmlToPdf.Convert`
with `PdfOptions.Signature` wait for it. Everything else, visible boxes, timestamps and existing fields, works as with a
certificate's own key.

## Verifying signatures {new 1.9.0}

`PdfSignatureVerifier` checks the signatures and document timestamps of any PDF, oldest first, and reports what it
finds rather than throwing for a broken signature:

```csharp
foreach (PdfSignatureVerification s in PdfSignatureVerifier.Verify(pdf))
{
    Console.WriteLine($"{s.FieldName}: signed by {s.SignerName} at {s.TimestampTime ?? s.SigningTime}");
    Console.WriteLine($"  valid: {s.Valid}, intact: {s.IsIntact}, covers the whole file: {s.CoversWholeDocument}");
    foreach (string problem in s.Problems) Console.WriteLine("  " + problem);
}

// Trust only your own CA instead of the operating system's roots, and check revocation online.
var results = PdfSignatureVerifier.VerifyFile("contract.pdf", new PdfSignatureVerificationOptions
{
    TrustedRoots = new X509Certificate2Collection(companyRootCert),
    RevocationMode = X509RevocationMode.Online,
});
```

`IsIntact` means the signed bytes are unchanged (`DigestMatches`), the byte range is well formed (`ByteRangeValid`), the
signature value verifies with the signer's certificate (`SignatureValid`) and an embedded timestamp, if any, is sound
(`TimestampValid`). `Valid` adds that the certificate chains to a trusted root at the time of the timestamp, else the
claimed signing time (`ChainTrusted`, with `ChainErrors` saying why not). Chains are built from the certificates in the
signature, the PDF's Document Security Store and `ExtraCertificates`. Verification is offline by default:
`RevocationMode` is `NoCheck` unless you set it, and `VerificationTime` checks the chain at another time.

A signature followed by later changes stays valid, because that is how a second signature or validation data is added:
`UpdatesAfterSigning` counts the incremental updates after it, and `CoversWholeDocument` is false. What those updates
change is not analysed (see [Limitations](/docs/limitations/#reading-and-changing-existing-pdfs)), so check
`CoversWholeDocument` on the last signature when nothing may follow it. PAdES, `adbe.pkcs7.detached`,
`adbe.pkcs7.sha1` and document timestamps (`ETSI.RFC3161`, `IsDocumentTimestamp`) are read, from PDFs made by any tool.

## Long-term validation {new 1.9.0}

A signature can normally be checked only while its certificates are valid and their CA answers. `PdfSigner.AddValidationData`
makes it checkable for years: it adds a Document Security Store with every certificate in the chains of the PDF's
signatures and timestamps, and the OCSP responses and CRLs that show none was revoked (PAdES B-LT). With `TimestampUrl` a
document timestamp follows, which seals the signatures and the validation data with a trusted time (PAdES B-LTA).
Both are incremental updates, so the signatures stay valid.

```csharp
byte[] signed = PdfSigner.Sign(pdf, new PdfSignatureOptions(cert) { TimestampUrl = "http://timestamp.digicert.com" });

byte[] ltv = PdfSigner.AddValidationData(signed, new PdfLtvOptions
{
    FetchRevocationData = true,                       // ask each certificate's OCSP responder, else its CRL
    TimestampUrl = "http://timestamp.digicert.com",   // PAdES B-LTA
});

// Offline: only the chains, completed with your own certificates and revocation data.
byte[] offline = PdfSigner.AddValidationData(signed, new PdfLtvOptions
{
    Certificates = [intermediateCert, rootCert],
    OcspResponses = [ocspResponseDer],
});
```

Without `FetchRevocationData` or `TimestampUrl` nothing goes over the network; OCSP and CRL requests use only the
http and https addresses in the certificates, through `HttpClient` if you set one. To make the document timestamp itself
long-term verifiable, call `AddValidationData` again later without a `TimestampUrl`. A PDF without signatures throws `PdfSignatureException`.
