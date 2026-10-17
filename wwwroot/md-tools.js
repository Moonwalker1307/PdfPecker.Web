// The Markdown page's tools around the editor: autosave, share links, live preview, view modes, the outline, word
// count, the export menu and the help dialog. md-editor.js does the editing itself; converter.js the converting.
// This file loads first so the converter can start with a shared or saved document instead of an example; the rest
// is wired up once every script has run.
const DRAFT_KEY = "pdfpecker.markdownDraft";

// base64url, so the text fits in a link without escaping.
const toBase64Url = bytes => {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromBase64Url = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));

async function pipeThrough(bytes, stream) {
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
}

// A share link carries the whole document in the part after #, which browsers never send to a server: nothing is
// stored anywhere. It is deflated where the browser can (z=), plain UTF-8 otherwise (t=).
async function shareLink(text, name) {
  const bytes = new TextEncoder().encode(text);
  const params = new URLSearchParams();
  if (name && name !== "document") params.set("name", name);
  if (typeof CompressionStream === "function") params.set("z", toBase64Url(await pipeThrough(bytes, new CompressionStream("deflate-raw"))));
  else params.set("t", toBase64Url(bytes));
  return location.origin + location.pathname + "#" + params;
}

async function readShareLink() {
  const params = new URLSearchParams(location.hash.slice(1));
  const z = params.get("z"), t = params.get("t");
  if (!z && !t) return null;
  const bytes = z ? await pipeThrough(fromBase64Url(z), new DecompressionStream("deflate-raw")) : fromBase64Url(t);
  return { text: new TextDecoder().decode(bytes), name: params.get("name") || "shared" };
}

function readDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
    return d && typeof d.text === "string" ? { text: d.text, name: d.name || "document", message: "Restored your document from last time." } : null;
  } catch {
    return null;
  }
}

// The document the page starts with: a shared link wins over this browser's saved draft; with neither, the converter
// loads the first example.
const initialDocument = (async () => {
  try {
    const shared = await readShareLink();
    if (shared) {
      shared.message = "Opened a shared document.";
      // The link's job is done once the document is open: later edits autosave, and a reload should keep them.
      history.replaceState(null, "", location.pathname + location.search);
      return shared;
    }
  } catch {
    setTimeout(() => setStatus("That share link is damaged, so the example is shown instead.", true));
  }
  return readDraft();
})();

document.addEventListener("DOMContentLoaded", () => {
  const source = $("source"), visual = $("visual"), panes = $("panes"), example = $("example");
  const isExample = text => Object.values(examples.markdown).includes(text);

  // ---------- Autosave ----------

  let saveTimer = 0;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        if (isExample(source.value)) localStorage.removeItem(DRAFT_KEY);
        else localStorage.setItem(DRAFT_KEY, JSON.stringify({ text: source.value, name: fileName, saved: Date.now() }));
      } catch {
        // Storage can be full (large images) or turned off; the document is still on the page.
      }
    }, 400);
  }

  // The example list shows "Your document" while what is in the editor is not one of the examples.
  function syncExample() {
    if (!isExample(source.value)) example.value = "mine";
  }

  // Choosing an example replaces your own document, which autosave would then forget: ask first.
  // It listens on the document, before the event reaches the converter's own listener on the list.
  document.addEventListener("change", e => {
    if (e.target === example && !isExample(source.value) && source.value.trim() && !confirm("Replace your document with the example? Your document is not saved anywhere else.")) {
      e.stopPropagation();
      example.value = "mine";
    }
  }, { capture: true });

  // ---------- Live preview ----------

  const live = $("live");
  try { live.checked = localStorage.getItem("pdfpecker.livePreview") !== "0"; } catch {}
  live.addEventListener("change", () => {
    try { localStorage.setItem("pdfpecker.livePreview", live.checked ? "1" : "0"); } catch {}
    if (live.checked) convert();
  });
  let liveTimer = 0;
  function liveConvert() {
    clearTimeout(liveTimer);
    // PNG and TIFF output make a request per page, too many to repeat while you type.
    if (!live.checked || output() === "png" || output() === "tiff" || panes.dataset.view === "editor") return;
    liveTimer = setTimeout(() => { if (source.value !== convertedInput) convert(); }, 900);
  }

  // ---------- Word count ----------

  const stats = $("stats");
  function updateStats() {
    const text = source.value
      .replace(/^\[[^\]]+\]:\s*data:\S+/gm, "") // embedded image data
      .replace(/!\[([^\]]*)\]\([^)]*\)|!\[([^\]]*)\]\[[^\]]*\]/g, "$1$2")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/<[^>]+>/g, " ")
      .replace(/^ {0,3}(`{3,}|~{3,}).*$/gm, "")
      .replace(/[#>*_~`|\\-]+/g, " ");
    const words = (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,-]*/gu) ?? []).length;
    const minutes = Math.max(1, Math.round(words / 230));
    stats.textContent = words === 0 ? "" : `${words.toLocaleString("en")} ${words === 1 ? "word" : "words"} · ${minutes} min read`;
    stats.title = `${source.value.length.toLocaleString("en")} characters`;
  }

  function changed() {
    save();
    syncExample();
    updateStats();
    liveConvert();
  }
  // Typing in the Markdown, examples and opened files come as input events; visual edits as markdownchange.
  source.addEventListener("input", changed);
  source.addEventListener("markdownchange", changed);

  // ---------- View: editor, both, or preview ----------

  const viewButtons = [...document.querySelectorAll("[data-view]")];
  function setView(view, remember) {
    panes.dataset.view = view;
    for (const b of viewButtons) b.setAttribute("aria-pressed", b.dataset.view === view);
    if (remember) try { localStorage.setItem("pdfpecker.markdownView", view); } catch {}
    // Coming back to the preview after editing without one: bring it up to date.
    if (view !== "editor" && remember && live.checked && output() !== "png" && output() !== "tiff" && source.value !== convertedInput) convert();
  }
  for (const b of viewButtons) b.addEventListener("click", () => setView(b.dataset.view, true));
  // Convert in the editor-only view brings the result into view.
  $("convert").addEventListener("click", () => { if (panes.dataset.view === "editor") setView("split", true); });
  let view = "split";
  try { view = localStorage.getItem("pdfpecker.markdownView") ?? "split"; } catch {}
  setView(["editor", "split", "preview"].includes(view) ? view : "split", false);

  // ---------- Outline ----------

  const outline = $("outline"), outlineList = $("outlineList");

  // The headings of the Markdown, skipping lines in code blocks, with where each starts.
  function headings() {
    const out = [];
    let fence = null, offset = 0;
    const lines = source.value.split("\n");
    lines.forEach((line, i) => {
      const f = line.match(/^ {0,3}(`{3,}|~{3,})/);
      if (f) {
        if (!fence) fence = f[1];
        else if (f[1][0] === fence[0] && f[1].length >= fence.length) fence = null;
      } else if (!fence) {
        const h = line.match(/^ {0,3}(#{1,6})\s+(.*?)(\s+#+)?\s*$/);
        const setext = !h && i > 0 && lines[i - 1].trim() && !/^ {0,3}([#>\-*+]|\d+[.)])/.test(lines[i - 1]) && line.match(/^ {0,3}(=+|-+)\s*$/);
        if (h && h[2]) out.push({ level: h[1].length, text: h[2], offset });
        else if (setext) out.push({ level: setext[1][0] === "=" ? 1 : 2, text: lines[i - 1].trim(), offset: offset - lines[i - 1].length - 1 });
      }
      offset += line.length + 1;
    });
    return out.map(h => ({ ...h, text: h.text.replace(/[*_`~]|\\(?=\S)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") }));
  }

  // Scrolls the Markdown editor so the line at offset is near the top, measuring wrapped lines with a mirror element.
  function scrollSourceTo(offset) {
    const style = getComputedStyle(source);
    const mirror = document.createElement("div");
    for (const p of ["font", "lineHeight", "letterSpacing", "tabSize", "paddingLeft", "paddingRight", "paddingTop", "borderLeftWidth", "borderRightWidth", "boxSizing"]) mirror.style[p] = style[p];
    Object.assign(mirror.style, { position: "absolute", visibility: "hidden", whiteSpace: "pre-wrap", overflowWrap: "break-word", width: source.clientWidth + "px", top: "0", left: "-9999px" });
    mirror.textContent = source.value.slice(0, offset) || " ";
    document.body.append(mirror);
    const top = mirror.scrollHeight - parseFloat(style.lineHeight || "20");
    mirror.remove();
    source.focus({ preventScroll: true });
    source.setSelectionRange(offset, offset);
    source.scrollTop = Math.max(0, top - 24);
  }

  function jumpTo(index, h) {
    outline.open = false;
    if (!visual.hidden) {
      const el = visual.querySelectorAll("h1, h2, h3, h4, h5, h6")[index];
      if (!el) return;
      el.scrollIntoView({ block: "start" });
      visual.focus({ preventScroll: true });
      const r = document.createRange();
      r.selectNodeContents(el);
      r.collapse(true);
      getSelection().removeAllRanges();
      getSelection().addRange(r);
    } else {
      scrollSourceTo(h.offset);
    }
  }

  outline.addEventListener("toggle", () => {
    if (!outline.open) return;
    const list = headings();
    outlineList.replaceChildren(...(list.length ? list.map((h, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = h.text;
      b.style.paddingLeft = 10 + (h.level - 1) * 14 + "px";
      b.className = "h" + h.level;
      b.addEventListener("click", () => jumpTo(i, h));
      return b;
    }) : [Object.assign(document.createElement("p"), { textContent: "No headings yet. Start a line with # to add one." })]));
    outlineList.querySelector("button")?.focus();
  });

  // ---------- Export ----------

  const exportMenu = $("exportMenu");
  function flash(button, text) {
    const old = button.dataset.label ??= button.textContent;
    button.textContent = text;
    setTimeout(() => { button.textContent = old; }, 1600);
  }

  function download(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function renderedHtml() {
    const res = await fetch("/api/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markdown: source.value, output: "html", fileName, options: settings() }),
    });
    if (!res.ok) throw await problem(res);
    return res.text();
  }

  // The body of the HTML document, for pasting into another editor.
  const bodyOf = html => new DOMParser().parseFromString(html, "text/html").body.innerHTML.trim();

  const exportActions = {
    md: () => download(new Blob([source.value], { type: "text/markdown;charset=utf-8" }), fileName + ".md"),
    html: async () => download(new Blob([await renderedHtml()], { type: "text/html;charset=utf-8" }), fileName + ".html"),
    copyMd: () => navigator.clipboard.writeText(source.value),
    copyHtml: async () => navigator.clipboard.writeText(bodyOf(await renderedHtml())),
    // Formatted text pastes into Word, Google Docs or an email as headings, lists and tables.
    copyRich: async () => {
      const html = bodyOf(await renderedHtml());
      const plain = new DOMParser().parseFromString(html, "text/html").body.innerText;
      await navigator.clipboard.write([new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plain], { type: "text/plain" }),
      })]);
    },
    share: async () => {
      const link = await shareLink(source.value, fileName);
      await navigator.clipboard.writeText(link);
      const kb = Math.round(link.length / 1024);
      setStatus(link.length > 64 * 1024
        ? `Share link copied, but it is ${kb} KB long (images make links long), and many apps cut long links.`
        : "Share link copied. The document is inside the link: nothing is stored on the server.", link.length > 64 * 1024);
    },
  };
  exportMenu.addEventListener("click", async e => {
    const b = e.target.closest("button[data-export]");
    if (!b) return;
    try {
      await exportActions[b.dataset.export]();
      if (b.dataset.export.startsWith("copy") || b.dataset.export === "share") flash(b, "Copied!");
      else exportMenu.closest("details").open = false;
    } catch (err) {
      setStatus(err.message || "That did not work.", true);
    }
  });

  // Menus close when you click elsewhere or press Escape.
  const menus = [...document.querySelectorAll("details.menu")];
  document.addEventListener("click", e => { for (const m of menus) if (m.open && !m.contains(e.target)) m.open = false; });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    for (const m of menus) if (m.open) { m.open = false; m.querySelector("summary").focus(); }
  });

  // ---------- Help ----------

  const help = $("help");
  $("helpButton").addEventListener("click", () => help.showModal());
  $("closeHelp").addEventListener("click", () => help.close());
  help.addEventListener("click", e => { if (e.target === help) help.close(); });
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "/") { e.preventDefault(); help.open ? help.close() : help.showModal(); }
  });

  // ---------- HTML preview ----------

  // The HTML preview keeps its place when live preview replaces it, and follows the editor as you scroll it. The frame
  // has no allow-scripts, so the document's own scripts stay inert while the page reads the frame's scroll position.
  const preview = $("preview");
  let previewScroll = 0;
  const previewDoc = () => { try { return preview.getAttribute("srcdoc") !== null ? preview.contentDocument : null; } catch { return null; } };
  preview.addEventListener("load", () => {
    const d = previewDoc();
    if (!d?.scrollingElement) return;
    d.scrollingElement.scrollTop = previewScroll;
    d.addEventListener("scroll", () => { previewScroll = d.scrollingElement.scrollTop; }, { passive: true });
  });
  // Another document starts at the top.
  example.addEventListener("change", () => { previewScroll = 0; });
  $("file").addEventListener("change", () => { previewScroll = 0; });
  function follow(el) {
    const d = previewDoc();
    if (!d?.scrollingElement || output() !== "html" || panes.dataset.view !== "split") return;
    const ratio = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
    const s = d.scrollingElement;
    s.scrollTop = ratio * (s.scrollHeight - s.clientHeight);
  }
  source.addEventListener("scroll", () => follow(source), { passive: true });
  visual.addEventListener("scroll", () => follow(visual), { passive: true });

  initialDocument.then(() => {
    updateStats();
    syncExample();
  });
});
