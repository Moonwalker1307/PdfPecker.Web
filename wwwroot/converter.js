// The converter pages (/html-to-pdf/ and /markdown/). The page says which input it takes in <body data-input>.
const $ = id => document.getElementById(id);
const mode = document.body.dataset.input; // "html" or "markdown"
const editor = $("source"), statusEl = $("status"), convertBtn = $("convert");
const MAX_IMAGE_PAGES = 10;
let urls = [], fileName = "document", lastPdf = null, run = 0;

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

async function convert() {
  const thisRun = ++run;
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
        pageSize: $("pageSize").value,
        landscape: $("landscape").checked,
        marginMm: parseFloat($("margin").value) || 0,
        pageNumbers: $("pageNumbers").checked,
        watermark: $("watermark").value,
        password: $("password").value,
        pdfa: $("pdfa").checked,
        fileName,
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
      const pages = await renderImages(blob, thisRun);
      if (thisRun !== run) return;
      summary = pages === 1 ? "1 page" : `${pages} pages`;
      dl.textContent = pages === 1 ? "Download PNG" : "Download all (ZIP)";
    } else {
      const u = blobUrl(blob);
      if (o === "html") {
        // HTML previews are sandboxed: any script in the document stays inert.
        $("preview").setAttribute("sandbox", "");
        $("preview").style.background = "#fff";
        $("htmlSource").textContent = await blob.text();
        $("viewSource").hidden = false;
      } else {
        $("preview").removeAttribute("sandbox");
        $("preview").style.background = "";
      }
      $("preview").src = u;
      showOnly($("viewSource").getAttribute("aria-pressed") === "true" && o === "html" ? "htmlSource" : "preview");
      dl.href = u;
      dl.download = fileName + "." + o;
      dl.textContent = "Download";
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

// Renders the PDF's pages to PNG with the image API, one request per page, and shows them.
async function renderImages(pdf, thisRun) {
  const box = $("images");
  const page = async n => {
    const q = new URLSearchParams({ page: n, dpi: $("dpi").value });
    const form = new FormData();
    form.append("file", pdf, fileName + ".pdf");
    if ($("password").value) form.append("password", $("password").value);
    const res = await fetch("/api/pdf-to-image?" + q, { method: "POST", body: form });
    if (!res.ok) throw await problem(res);
    return { png: await res.blob(), count: parseInt(res.headers.get("X-Page-Count"), 10) || 1 };
  };
  const first = await page(1);
  const shown = Math.min(first.count, MAX_IMAGE_PAGES);
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
    const a = document.createElement("a");
    a.href = u;
    a.download = `${fileName}-${i + 1}.png`;
    a.textContent = `Page ${i + 1} · ${(png.size / 1024).toFixed(0)} KB`;
    cap.append(a);
    fig.append(img, cap);
    return fig;
  }));
  if (first.count > shown) {
    const more = document.createElement("p");
    more.className = "more";
    more.textContent = `Showing the first ${shown} of ${first.count} pages. Download all of them as a ZIP.`;
    box.append(more);
  }
  const dl = $("download");
  dl.removeAttribute("download");
  if (first.count === 1) {
    dl.href = box.querySelector("img").src;
    dl.download = fileName + ".png";
  } else {
    dl.href = "#zip";
  }
  showOnly("images");
  return first.count;
}

// The ZIP of all pages is only made when asked for.
async function downloadZip() {
  setStatus("Making the ZIP…");
  const form = new FormData();
  form.append("file", lastPdf, fileName + ".pdf");
  form.append("dpi", $("dpi").value);
  if ($("password").value) form.append("password", $("password").value);
  try {
    const res = await fetch("/api/pdf-to-image", { method: "POST", body: form });
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
  if (e.key === "Tab" && !e.shiftKey) {
    e.preventDefault();
    editor.setRangeText("  ", editor.selectionStart, editor.selectionEnd, "end");
  }
});
$("file").addEventListener("change", async e => { await openFile(e.target.files[0]); e.target.value = ""; });
// Drop a file anywhere on the page.
document.addEventListener("dragover", e => { e.preventDefault(); document.body.classList.add("dragging"); });
document.addEventListener("dragleave", e => { if (!e.relatedTarget) document.body.classList.remove("dragging"); });
document.addEventListener("drop", e => {
  e.preventDefault();
  document.body.classList.remove("dragging");
  openFile(e.dataTransfer.files[0]);
});
for (const id of ["pageSize", "landscape", "pageNumbers", "watermark", "password", "pdfa", "margin", "dpi"])
  $(id).addEventListener("change", convert);
$("output").addEventListener("change", () => { updateOutputLabels(); convert(); });
// Wide screens show every option; phones fold them away.
if (matchMedia("(min-width: 900px)").matches) $("options").open = true;

const wanted = new URLSearchParams(location.search).get("output");
if (wanted && $("output").querySelector(`option[value="${CSS.escape(wanted)}"]`)) $("output").value = wanted;
updateOutputLabels();
loadExample($("example").value);
convert();
