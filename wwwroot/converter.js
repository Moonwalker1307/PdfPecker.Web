// The converter pages (/html-to-pdf/ and /markdown/). The page says which input it takes in <body data-input>.
const $ = id => document.getElementById(id);
const mode = document.body.dataset.input; // "html" or "markdown"
const editor = $("source"), statusEl = $("status"), convertBtn = $("convert"), form = $("settingsForm");
const MAX_IMAGE_PAGES = 10;
// Safari (and every browser on iOS) leaves a PDF in a frame blank or shows only its first page, and Android has no
// built-in PDF viewer, so there the PDF preview shows the pages as images from the image API instead.
const ua = navigator.userAgent;
const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isSafari = /^((?!chrome|chromium|crios|fxios|edg|android).)*safari/i.test(ua);
const pdfAsImages = isIOS || isSafari || navigator.pdfViewerEnabled === false;
const PDF_PREVIEW_PAGES = 5;
let urls = [], fileName = "document", lastPdf = null, run = 0;
let wmImage = null, eInvoiceXml = null; // files picked in the settings

function setStatus(text, isError) {
  statusEl.textContent = text;
  statusEl.classList.toggle("error", !!isError);
}

function revokeAll() {
  for (const u of urls) URL.revokeObjectURL(u);
  urls = [];
}

function blobUrl(blob) {
  const u = URL.createObjectURL(blob);
  urls.push(u);
  return u;
}

function output() { return $("output").value; }

function updateOutputLabels() {
  const o = output();
  const name = { pdf: "PDF", html: "HTML", png: "PNG images" }[o];
  $("outputLabel").textContent = name;
  $("empty").textContent = `Your ${name} will appear here.`;
  $("dpiLabel").hidden = o !== "png";
}

async function problem(res) {
  let message = res.status === 429 ? "Too many requests, wait a moment." : "Conversion failed (" + res.status + ").";
  try { const p = await res.json(); if (p.detail) message = p.detail; } catch {}
  return new Error(message);
}

function showOnly(id) {
  for (const el of ["empty", "preview", "images", "htmlSource"]) $(el).hidden = el !== id;
}

// ---------- Settings ----------

const field = name => form.elements[name];
const num = name => { const v = parseFloat(field(name).value); return isNaN(v) ? null : v; };
const text = name => field(name).value.trim() || null;

// The settings as the API's "options" object (the server checks every value again).
function settings() {
  const custom = {};
  for (const line of field("customProperties").value.split("\n")) {
    const i = line.indexOf("=");
    if (i > 0) custom[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  const isCustom = field("pageSize").value === "custom";
  const userPassword = field("userPassword").value, ownerPassword = field("ownerPassword").value;
  return {
    pageSize: isCustom ? null : field("pageSize").value,
    pageWidthMm: isCustom ? num("pageWidthMm") : null,
    pageHeightMm: isCustom ? num("pageHeightMm") : null,
    landscape: field("landscape").checked,
    marginTopMm: num("marginTopMm") ?? 0,
    marginRightMm: num("marginRightMm") ?? 0,
    marginBottomMm: num("marginBottomMm") ?? 0,
    marginLeftMm: num("marginLeftMm") ?? 0,
    scale: num("scale") ?? 1,
    ignoreCssPageRules: field("ignoreCssPageRules").checked,
    truncateBandsToWholePoints: field("truncateBandsToWholePoints").checked,
    headerText: text("headerText") ?? "",
    footerText: text("footerText") ?? "",
    embedStandardFonts: field("embedStandardFonts").checked,
    userStyleSheet: field("userStyleSheet").value || null,
    watermark: text("wmText") || wmImage ? {
      text: text("wmText"),
      image: wmImage ? wmImage.base64 : null,
      imageWidth: num("wmImageWidth") ?? 0,
      fontFamily: field("wmFontFamily").value,
      fontSize: num("wmFontSize") ?? 0,
      letterSpacing: num("wmLetterSpacing") ?? 0,
      bold: field("wmBold").checked,
      color: field("wmColor").value,
      opacity: num("wmOpacity") ?? 0.3,
      angle: num("wmAngle"),
      behind: field("wmBehind").checked,
    } : null,
    security: userPassword || ownerPassword ? {
      userPassword: userPassword || null,
      ownerPassword: ownerPassword || null,
      permissions: [...form.querySelectorAll("input[name=perm]:checked")].map(c => c.value),
    } : null,
    conformance: field("conformance").value,
    eInvoiceXml: eInvoiceXml ? eInvoiceXml.text : null,
    eInvoiceProfile: eInvoiceXml ? field("eInvoiceProfile").value || null : null,
    title: text("title"), author: text("author"), subject: text("subject"),
    keywords: text("keywords"), creator: text("creator"), producer: text("producer"),
    customProperties: custom,
    bookmarks: field("bookmarks").checked,
    compress: field("compress").checked,
    compressionLevel: field("compressionLevel").value,
    maxPages: num("maxPages") ?? 1000,
  };
}

// The settings as C# code, leaving out what is still the default.
function csharp() {
  const s = settings();
  const str = v => JSON.stringify(v);
  const f = v => (Number.isInteger(v) ? v : +v.toFixed(4)) + "f";
  const lines = [];
  const named = { A4: "A4", Letter: "Letter", Legal: "Legal", A3: "A3", A5: "A5" };
  let size = s.pageSize ? "PageSize." + named[s.pageSize] : `PageSize.FromMillimeters(${f(s.pageWidthMm ?? 210)}, ${f(s.pageHeightMm ?? 297)})`;
  if (s.landscape) size += ".Landscape";
  if (size !== "PageSize.A4") lines.push(`PageSize = ${size},`);
  const m = [s.marginTopMm, s.marginRightMm, s.marginBottomMm, s.marginLeftMm];
  lines.push(`Margins = PageMargins.FromMillimeters(${m.map(f).join(", ")}),`);
  if (s.scale !== 1) lines.push(`Scale = ${f(s.scale)},`);
  if (s.ignoreCssPageRules) lines.push("IgnoreCssPageRules = true,");
  if (s.truncateBandsToWholePoints) lines.push("TruncateBandsToWholePoints = true,");
  if (s.headerText) lines.push(`HeaderText = ${str(s.headerText)},`);
  if (s.footerText) lines.push(`FooterText = ${str(s.footerText)},`);
  if (s.embedStandardFonts) lines.push("EmbedStandardFonts = true,");
  if (s.userStyleSheet) lines.push(`UserStyleSheet = ${str(s.userStyleSheet)},`);
  if (s.watermark) {
    const w = s.watermark, p = [];
    if (w.text) p.push(`Text = ${str(w.text)}`);
    if (w.image) p.push(`Image = File.ReadAllBytes(${str(wmImage.name)})`);
    if (w.image && w.imageWidth) p.push(`ImageWidth = ${f(w.imageWidth)}`);
    if (w.fontFamily !== "sans-serif") p.push(`FontFamily = ${str(w.fontFamily)}`);
    if (w.fontSize) p.push(`FontSize = ${f(w.fontSize)}`);
    if (w.letterSpacing) p.push(`LetterSpacing = ${f(w.letterSpacing)}`);
    if (!w.bold) p.push("Bold = false");
    if (w.color !== "#808080") p.push(`Color = ${str(w.color)}`);
    if (w.opacity !== 0.3) p.push(`Opacity = ${f(w.opacity)}`);
    if (w.angle !== null) p.push(`Angle = ${f(w.angle)}`);
    if (w.behind) p.push("Behind = true");
    lines.push(`Watermark = new PdfWatermark { ${p.join(", ")} },`);
  }
  if (s.security) {
    const sec = s.security, p = [];
    if (sec.userPassword) p.push(`UserPassword = ${str(sec.userPassword)}`);
    if (sec.ownerPassword) p.push(`OwnerPassword = ${str(sec.ownerPassword)}`);
    p.push(`Permissions = ${sec.permissions.length ? sec.permissions.map(x => "PdfPermissions." + x).join(" | ") : "PdfPermissions.None"}`);
    lines.push(`Security = new PdfSecurity { ${p.join(", ")} },`);
  }
  if (s.conformance !== "None") lines.push(`Conformance = PdfConformance.${s.conformance},`);
  if (s.eInvoiceXml) lines.push(`EInvoice = new PdfEInvoice(File.ReadAllBytes(${str(eInvoiceXml.name)})${s.eInvoiceProfile ? ", EInvoiceProfile." + s.eInvoiceProfile : ""}),`);
  for (const k of ["title", "author", "subject", "keywords", "creator", "producer"])
    if (s[k]) lines.push(`${k[0].toUpperCase() + k.slice(1)} = ${str(s[k])},`);
  const props = Object.entries(s.customProperties);
  if (props.length) lines.push(`CustomProperties = { ${props.map(([k, v]) => `[${str(k)}] = ${str(v)}`).join(", ")} },`);
  if (!s.bookmarks) lines.push("Bookmarks = false,");
  if (!s.compress) lines.push("Compress = false,");
  if (s.compressionLevel !== "Fastest") lines.push(`CompressionLevel = System.IO.Compression.CompressionLevel.${s.compressionLevel},`);
  if (s.maxPages !== 100000) lines.push(`MaxPages = ${s.maxPages},`);
  const convert = mode === "markdown" ? "MarkdownToPdf.Convert(markdown, options)" : "HtmlToPdf.Convert(html, options)";
  return `var options = new PdfOptions\n{\n${lines.map(l => "    " + l).join("\n")}\n};\nbyte[] pdf = ${convert};\n`;
}

// Counts the settings that differ from the page's defaults, for the badge on the settings button.
const defaults = new Map();
function snapshot() {
  const map = new Map();
  for (const el of form.elements) {
    if (!el.name) continue;
    map.set(el.name + (el.type === "checkbox" ? ":" + el.value : ""), el.type === "checkbox" ? el.checked : el.value);
  }
  return map;
}
function updateBadge() {
  let n = (wmImage ? 1 : 0) + (eInvoiceXml ? 1 : 0);
  for (const [k, v] of snapshot()) if (defaults.get(k) !== v) n++;
  $("changedCount").textContent = n;
  $("changedCount").hidden = n === 0;
  $("changedCount").setAttribute("aria-label", `${n} changed`);
}

function syncSettingsUi() {
  const custom = field("pageSize").value === "custom";
  for (const el of form.querySelectorAll(".custom-size")) el.hidden = !custom;
  $("wmOpacityOut").textContent = field("wmOpacity").value;
  const pdfa = field("conformance").value !== "None" || !!eInvoiceXml;
  const pw = !!(field("userPassword").value || field("ownerPassword").value);
  field("userPassword").setCustomValidity(pdfa && pw ? "PDF/A and e-invoices cannot have a password." : "");
  updateBadge();
}

function toggleSettings(open) {
  const panel = $("settings");
  panel.hidden = !open;
  $("settingsToggle").setAttribute("aria-expanded", open);
  $("panes").classList.toggle("with-settings", open);
  try { localStorage.setItem("pdfpecker.settingsOpen", open ? "1" : "0"); } catch {}
  if (open && matchMedia("(max-width: 900px)").matches) $("closeSettings").focus();
  if (!open) $("settingsToggle").focus({ preventScroll: true });
}

async function readFile(input, kind) {
  const f = input.files[0];
  if (!f) return null;
  if (kind === "image") {
    if (f.size > 2 * 1024 * 1024) { setStatus("The watermark image is larger than 2 MB.", true); input.value = ""; return null; }
    const bytes = new Uint8Array(await f.arrayBuffer());
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return { name: f.name, base64: btoa(bin) };
  }
  if (f.size > 1024 * 1024) { setStatus("The e-invoice XML is larger than 1 MB.", true); input.value = ""; return null; }
  return { name: f.name, text: await f.text() };
}

// ---------- Converting ----------

async function convert() {
  const thisRun = ++run;
  if (!form.checkValidity()) {
    form.reportValidity();
    setStatus("Check the highlighted setting.", true);
    return;
  }
  convertBtn.disabled = true;
  setStatus("Converting…");
  const started = performance.now();
  const o = output();
  try {
    const res = await fetch("/api/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [mode]: editor.value,
        output: o === "html" ? "html" : "pdf",
        fileName,
        options: settings(),
      }),
    });
    if (!res.ok) throw await problem(res);
    const blob = await res.blob();
    const serverMs = parseFloat(res.headers.get("X-Conversion-Ms"));
    if (thisRun !== run) return;
    revokeAll();
    const dl = $("download");
    dl.hidden = false;
    let summary;
    if (o === "png") {
      lastPdf = blob;
      const pages = await renderImages(blob, thisRun, MAX_IMAGE_PAGES, $("dpi").value, true);
      if (thisRun !== run) return;
      summary = pages === 1 ? "1 page" : `${pages} pages`;
      dl.removeAttribute("download");
      if (pages === 1) {
        dl.href = $("images").querySelector("img").src;
        dl.download = fileName + ".png";
      } else {
        dl.href = "#zip";
      }
      dl.textContent = pages === 1 ? "Download PNG" : "Download all (ZIP)";
    } else {
      const u = blobUrl(blob);
      if (o === "html") {
        // HTML previews are sandboxed: any script in the document stays inert.
        $("preview").setAttribute("sandbox", "");
        $("preview").style.background = "#fff";
        $("htmlSource").textContent = await blob.text();
        $("viewSource").hidden = false;
        $("preview").src = u;
        showOnly($("viewSource").getAttribute("aria-pressed") === "true" ? "htmlSource" : "preview");
      } else if (pdfAsImages) {
        const pages = await renderImages(blob, thisRun, PDF_PREVIEW_PAGES, 150, false);
        if (thisRun !== run) return;
        if (pages > PDF_PREVIEW_PAGES) $("images").lastChild.textContent = `Showing the first ${PDF_PREVIEW_PAGES} of ${pages} pages. Download the PDF for all of them.`;
      } else {
        $("preview").removeAttribute("sandbox");
        $("preview").style.background = "";
        $("preview").src = u;
        showOnly("preview");
      }
      dl.href = u;
      dl.download = fileName + "." + o;
      dl.textContent = o === "pdf" ? "Download PDF" : "Download";
      summary = (blob.size / 1024).toFixed(1) + " KB";
    }
    if (o !== "html") $("viewSource").hidden = true;
    setStatus(isNaN(serverMs)
      ? summary
      : `${summary} · converted in ${serverMs.toFixed(1)} ms (round trip ${Math.round(performance.now() - started)} ms)`);
  } catch (e) {
    if (thisRun === run) setStatus(e.message, true);
  } finally {
    if (thisRun === run) convertBtn.disabled = false;
  }
}

function imageForm(pdf) {
  const body = new FormData();
  body.append("file", pdf, fileName + ".pdf");
  const pw = field("userPassword").value || field("ownerPassword").value;
  if (pw) body.append("password", pw);
  return body;
}

// Renders up to limit pages of the PDF to PNG with the image API, one request per page, and shows them. Returns the
// PDF's page count. pageLinks adds a download link under each page.
async function renderImages(pdf, thisRun, limit, dpi, pageLinks) {
  const box = $("images");
  const page = async n => {
    const q = new URLSearchParams({ page: n, dpi });
    const res = await fetch("/api/pdf-to-image?" + q, { method: "POST", body: imageForm(pdf) });
    if (!res.ok) throw await problem(res);
    return { png: await res.blob(), count: parseInt(res.headers.get("X-Page-Count"), 10) || 1 };
  };
  const first = await page(1);
  const shown = Math.min(first.count, limit);
  const pngs = [first.png];
  for (let n = 2; n <= shown && thisRun === run; n++) pngs.push((await page(n)).png);
  if (thisRun !== run) return first.count;
  box.replaceChildren(...pngs.map((png, i) => {
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    const u = blobUrl(png);
    img.src = u;
    img.alt = `Page ${i + 1}`;
    const cap = document.createElement("figcaption");
    if (pageLinks) {
      const a = document.createElement("a");
      a.href = u;
      a.download = `${fileName}-${i + 1}.png`;
      a.textContent = `Page ${i + 1} · ${(png.size / 1024).toFixed(0)} KB`;
      cap.append(a);
    } else {
      cap.textContent = `Page ${i + 1}`;
    }
    fig.append(img, cap);
    return fig;
  }));
  if (first.count > shown) {
    const more = document.createElement("p");
    more.className = "more";
    more.textContent = `Showing the first ${shown} of ${first.count} pages. Download all of them as a ZIP.`;
    box.append(more);
  }
  showOnly("images");
  return first.count;
}

// The ZIP of all pages is only made when asked for.
async function downloadZip() {
  setStatus("Making the ZIP…");
  const body = imageForm(lastPdf);
  body.append("dpi", $("dpi").value);
  try {
    const res = await fetch("/api/pdf-to-image", { method: "POST", body });
    if (!res.ok) throw await problem(res);
    const a = document.createElement("a");
    a.href = blobUrl(await res.blob());
    a.download = fileName + "-pages.zip";
    a.click();
    setStatus("ZIP downloaded.");
  } catch (e) {
    setStatus(e.message, true);
  }
}

function loadExample(name) {
  editor.value = examples[mode][name];
  fileName = name === "blank" ? "document" : name;
}

async function openFile(f) {
  if (!f) return;
  const isMd = /\.(md|markdown|mdown|mkdn?)$/i.test(f.name);
  if (isMd !== (mode === "markdown")) {
    setStatus(isMd ? "That is a Markdown file: open it on the Markdown page." : "That is not a Markdown file: open it on the HTML to PDF page.", true);
    return;
  }
  editor.value = await f.text();
  fileName = f.name.replace(/\.[^.]+$/, "") || "document";
  convert();
}

// ---------- Wiring ----------

$("download").addEventListener("click", e => {
  if ($("download").getAttribute("href") === "#zip") { e.preventDefault(); downloadZip(); }
});
$("viewSource").addEventListener("click", () => {
  const b = $("viewSource");
  const on = b.getAttribute("aria-pressed") !== "true";
  b.setAttribute("aria-pressed", on);
  b.textContent = on ? "Show page" : "Show code";
  showOnly(on ? "htmlSource" : "preview");
});
$("example").addEventListener("change", e => { loadExample(e.target.value); convert(); });
convertBtn.addEventListener("click", convert);
editor.addEventListener("keydown", e => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); convert(); }
  // Tab indents; Escape then Tab leaves the editor, so keyboard users are never trapped.
  if (e.key === "Escape") editor.dataset.tabOut = "1";
  else if (e.key === "Tab" && !e.shiftKey && !editor.dataset.tabOut) {
    e.preventDefault();
    editor.setRangeText("  ", editor.selectionStart, editor.selectionEnd, "end");
  }
});
editor.addEventListener("blur", () => { delete editor.dataset.tabOut; });
$("file").addEventListener("change", async e => { await openFile(e.target.files[0]); e.target.value = ""; });
// Drop a file anywhere on the page.
document.addEventListener("dragover", e => { e.preventDefault(); document.body.classList.add("dragging"); });
document.addEventListener("dragleave", e => { if (!e.relatedTarget) document.body.classList.remove("dragging"); });
document.addEventListener("drop", e => {
  e.preventDefault();
  document.body.classList.remove("dragging");
  if (e.target.closest && e.target.closest("#settings")) return;
  openFile(e.dataTransfer.files[0]);
});
$("dpi").addEventListener("change", convert);
$("output").addEventListener("change", () => { updateOutputLabels(); convert(); });

$("settingsToggle").addEventListener("click", () => toggleSettings($("settings").hidden));
$("closeSettings").addEventListener("click", () => toggleSettings(false));
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !$("settings").hidden && document.activeElement !== editor) toggleSettings(false);
});
// Settings convert as soon as they change; text fields when you leave them or press Enter.
form.addEventListener("input", syncSettingsUi);
form.addEventListener("change", e => {
  if (e.target.type === "file") return;
  syncSettingsUi();
  convert();
});
form.addEventListener("submit", e => { e.preventDefault(); convert(); });
$("wmImage").addEventListener("change", async e => { wmImage = await readFile(e.target, "image"); syncSettingsUi(); convert(); });
$("eInvoiceFile").addEventListener("change", async e => { eInvoiceXml = await readFile(e.target, "xml"); syncSettingsUi(); convert(); });
$("applySettings").addEventListener("click", () => {
  // On phones the settings cover the page: close them so the result is in view.
  if (matchMedia("(max-width: 900px)").matches) toggleSettings(false);
  convert();
});
$("resetSettings").addEventListener("click", () => {
  form.reset();
  wmImage = eInvoiceXml = null;
  syncSettingsUi();
  convert();
});
$("copyCode").addEventListener("click", async () => {
  const b = $("copyCode");
  try {
    await navigator.clipboard.writeText(csharp());
    b.textContent = "Copied!";
  } catch {
    b.textContent = "Copy failed";
  }
  setTimeout(() => { b.textContent = "Copy as C#"; }, 1600);
});

for (const [k, v] of snapshot()) defaults.set(k, v);
syncSettingsUi();
let open = matchMedia("(min-width: 1200px)").matches;
try { const saved = localStorage.getItem("pdfpecker.settingsOpen"); if (saved !== null) open = saved === "1" && matchMedia("(min-width: 901px)").matches; } catch {}
if (open) {
  $("settings").hidden = false;
  $("settingsToggle").setAttribute("aria-expanded", "true");
  $("panes").classList.add("with-settings");
}

const wanted = new URLSearchParams(location.search).get("output");
if (wanted && $("output").querySelector(`option[value="${CSS.escape(wanted)}"]`)) $("output").value = wanted;
updateOutputLabels();
loadExample($("example").value);
convert();
