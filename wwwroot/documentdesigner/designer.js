// The document designer: GrapesJS for drag and drop, a code view of the whole HTML document, and a live PDF preview
// from /api/convert. The document lives in the browser only (localStorage); the API stores nothing.
const $ = id => document.getElementById(id);
const STORE_KEY = "pdfpecker.designer.v1";
const PX_PER_MM = 96 / 25.4;
const PAGE_SIZES = { A4: [210, 297], Letter: [215.9, 279.4], Legal: [215.9, 355.6], A5: [148, 210], A3: [297, 420] };
const PREVIEW_DELAY = 900;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// Safari and every browser on iOS show a framed PDF badly or not at all, so they get PNG pages instead (as on the
// converter pages).
const ua = navigator.userAgent;
const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isSafari = /^((?!chrome|chromium|crios|fxios|edg|android).)*safari/i.test(ua);
const pdfAsImages = isIOS || isSafari || navigator.pdfViewerEnabled === false;
// Each PNG page is a request of its own, and every request counts towards the API's 120 a minute, so live previews
// there show the first two pages and wait a little longer.
const PNG_PAGES = 2;

// What the designer keeps outside GrapesJS: the page, the CSS it must not rewrite, and the document's title.
const VERBATIM_HINT = "/* CSS written here is kept exactly as it is: @font-face, @page :first, margin boxes. */";
const DEFAULT_MARGIN = 12.7; // PdfOptions' default, used when a document has no @page
const page = { size: "A4", landscape: false, margins: [20, 20, 20, 20], custom: null, extra: "" };
let verbatimCss = "";
let codeDirty = false;

// ---------- CSS as written ----------

// GrapesJS reads CSS through the browser by default, which rewrites it: shorthands become long lists of longhands,
// colours become rgb(), and properties the browser does not know (some PdfPecker supports) disappear. This small
// parser hands GrapesJS the declarations exactly as written, in the shape its own browser parser returns.

// Splits CSS into top-level pieces: { prelude, body } for a block, { prelude } for a statement such as @import.
// Comments are dropped; strings and parentheses may hold any of ; { }. A statement the CSS ends without a ";" is
// marked last, so that writing the pieces out again does not add a ";" on every round trip.
function cssBlocks(css) {
  const out = [];
  let i = 0, start = 0;
  const n = css.length;
  // As in CSS itself, a string the line ends without closing stops there instead of swallowing the rest.
  const skipString = q => { i++; while (i < n && css[i] !== q && css[i] !== "\n") { if (css[i] === "\\") i++; i++; } };
  let prelude = "";
  while (i < n) {
    const ch = css[i];
    if (ch === "/" && css[i + 1] === "*") { const end = css.indexOf("*/", i + 2); prelude += css.slice(start, i); i = end < 0 ? n : end + 2; start = i; continue; }
    if (ch === "\"" || ch === "'") { skipString(ch); i++; continue; }
    if (ch === "(") { let depth = 0; for (; i < n; i++) { if (css[i] === "\"" || css[i] === "'") skipString(css[i]); else if (css[i] === "(") depth++; else if (css[i] === ")" && --depth === 0) break; } i++; continue; }
    if (ch === ";") { prelude += css.slice(start, i); if (prelude.trim()) out.push({ prelude: prelude.trim() }); prelude = ""; i++; start = i; continue; }
    if (ch === "{") {
      prelude += css.slice(start, i);
      let depth = 1, j = i + 1;
      const bodyStart = j;
      let body = "";
      let segStart = j;
      while (j < n && depth > 0) {
        const c = css[j];
        if (c === "/" && css[j + 1] === "*") { const end = css.indexOf("*/", j + 2); body += css.slice(segStart, j); j = end < 0 ? n : end + 2; segStart = j; continue; }
        if (c === "\"" || c === "'") { j++; while (j < n && css[j] !== c && css[j] !== "\n") { if (css[j] === "\\") j++; j++; } j++; continue; }
        if (c === "{") depth++;
        else if (c === "}") depth--;
        j++;
      }
      body += css.slice(segStart, depth === 0 ? j - 1 : j);
      out.push({ prelude: prelude.trim(), body, bodyStart });
      prelude = "";
      i = j;
      start = i;
      continue;
    }
    i++;
  }
  // The last declaration of a block often has no ";".
  prelude += css.slice(start);
  if (prelude.trim()) out.push({ prelude: prelude.trim(), last: true });
  return out;
}

// "color: red; margin: 0 0 6pt !important" → { color: "red", margin: "0 0 6pt !important" }. Nested blocks are left out.
function cssDeclarations(body) {
  const style = {};
  for (const piece of cssBlocks(body)) {
    if (piece.body !== undefined) continue;
    const colon = piece.prelude.indexOf(":");
    if (colon < 1) continue;
    const name = piece.prelude.slice(0, colon).trim();
    let value = piece.prelude.slice(colon + 1).trim();
    // Broken CSS such as "url(x;;" leaves semicolons at the end, and GrapesJS adds one more each time it is written.
    let end = value.length;
    while (end > 0 && value[end - 1] === ";") end--;
    value = value.slice(0, end).trimEnd();
    // A regular expression with \s* before the "!" would take quadratic time on long runs of spaces.
    const bang = value.lastIndexOf("!");
    if (bang >= 0 && /^!\s*important$/i.test(value.slice(bang))) value = value.slice(0, bang).trimEnd() + " !important";
    if (/^[-\w\u0080-\uffff]+$/.test(name) && value && balanced(value)) style[name.startsWith("--") ? name : name.toLowerCase()] = value;
  }
  return style;
}

// Browsers drop a declaration with an unclosed string or bracket; kept, it would swallow the declarations after it
// each time the CSS is written and read again.
function balanced(value) {
  let depth = 0;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === "\\") i++;
    else if (ch === "\"" || ch === "'") {
      i++;
      while (i < value.length && value[i] !== ch) { if (value[i] === "\n") return false; if (value[i] === "\\") i++; i++; }
      if (i >= value.length) return false;
    }
    else if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") { if (--depth < 0) return false; }
    else if (ch === "{" || ch === "}") return false;
  }
  return depth === 0;
}

// Class and id selectors become GrapesJS selectors the style panel can edit; anything else stays a plain selector.
function parseSelectorList(text) {
  const add = [], result = [];
  const checkForClass = /^(\.[\w\-]+)+((:{1,2}[\w\-]+)(\([^)]*\))?)*$/;
  const checkForId = /^#[\w\-]+((:{1,2}[\w\-]+)(\([^)]*\))?)*$/;
  for (const raw of text.split(",")) {
    const sel = raw.trim();
    if (checkForClass.test(sel) || checkForId.test(sel)) result.push(splitClasses(sel));
    else add.push(sel);
  }
  return { result, add };
}

// ".a.b:not(.c)" → ["a", "b:not(.c)"]: dots inside parentheses do not split.
function splitClasses(sel) {
  const parts = [];
  let depth = 0, start = 0;
  for (let i = 0; i < sel.length; i++) {
    const ch = sel[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === "." && depth === 0) { if (i > start) parts.push(sel.slice(start, i)); start = i + 1; }
  }
  if (sel.length > start) parts.push(sel.slice(start));
  return parts;
}

const GROUPING_AT_RULES = new Set(["media", "supports", "container", "layer"]);

function parseCss(css, inAtRule) {
  const rules = [];
  for (const block of cssBlocks(css)) {
    if (block.body === undefined) continue;
    const at = /^@([\w-]+)\s*(.*)$/s.exec(block.prelude);
    if (at) {
      const name = at[1].toLowerCase();
      // importDocument keeps other at-rules, and at-rules inside at-rules (GrapesJS holds one level), verbatim.
      if (inAtRule || !GROUPING_AT_RULES.has(name)) continue;
      for (const r of parseCss(block.body, true)) {
        r.atRuleType = name;
        if (at[2].trim()) r.mediaText = at[2].trim();
        rules.push(r);
      }
      continue;
    }
    const style = cssDeclarations(block.body);
    const { result, add } = parseSelectorList(block.prelude);
    let last = null;
    for (const selectors of result) {
      const node = { selectors: [...selectors], style };
      const lastSel = selectors[selectors.length - 1];
      const state = lastSel.split(/:(.+)/);
      if (state[1]) { node.selectors[node.selectors.length - 1] = state[0]; node.state = state[1]; }
      rules.push(node);
      last = node;
    }
    if (add.length) {
      if (last) last.selectorsAdd = add.join(", ");
      else rules.push({ selectors: [], selectorsAdd: add.join(", "), style });
    }
  }
  return rules;
}

// Takes the at-rules GrapesJS cannot hold (@page, @font-face, @keyframes and the like) out of the style panel's CSS,
// to be kept verbatim instead.
function splitAtRules(css) {
  let keep = "", verbatim = "";
  for (const block of cssBlocks(css)) {
    const text = block.body === undefined ? block.prelude + (block.last ? "" : ";") : `${block.prelude} {${block.body}}`;
    const at = /^@([\w-]+)/.exec(block.prelude);
    // GrapesJS holds one level of @media; nested at-rules would lose their inner condition.
    const nested = at && block.body !== undefined && cssBlocks(block.body).some(b => b.body !== undefined && b.prelude.startsWith("@"));
    if (at && (nested || !GROUPING_AT_RULES.has(at[1].toLowerCase()))) verbatim += text + "\n";
    else keep += text + "\n";
  }
  return { keep, verbatim };
}

// ---------- The editor ----------

const textProps = [
  { property: "font-family", type: "select", default: "Helvetica, Arial, sans-serif", options: [
    { id: "Helvetica, Arial, sans-serif", label: "Helvetica" },
    { id: "\"Times New Roman\", Times, serif", label: "Times" },
    { id: "\"Courier New\", Courier, monospace", label: "Courier" },
  ] },
  { extend: "font-size", units: ["pt", "px", "em", "%"], default: "10pt" },
  "font-weight",
  { property: "font-style", type: "select", default: "normal", options: [{ id: "normal" }, { id: "italic" }] },
  "color",
  { extend: "line-height", units: ["", "pt", "em"], default: "1.45" },
  { extend: "letter-spacing", units: ["pt", "px", "em"] },
  "text-align",
  { property: "text-transform", type: "select", default: "none", options: [{ id: "none" }, { id: "uppercase" }, { id: "lowercase" }, { id: "capitalize" }] },
  { property: "text-decoration", type: "select", default: "none", options: [{ id: "none" }, { id: "underline" }, { id: "line-through" }] },
  { property: "vertical-align", type: "select", default: "baseline", options: [{ id: "baseline" }, { id: "top" }, { id: "middle" }, { id: "bottom" }] },
  { property: "white-space", type: "select", default: "normal", options: [{ id: "normal" }, { id: "nowrap" }, { id: "pre-wrap" }] },
];
const sizeUnits = ["mm", "pt", "px", "%", "em"];

const editor = grapesjs.init({
  container: "#gjs",
  height: "100%",
  width: "auto",
  fromElement: false,
  storageManager: false,
  // GrapesJS would otherwise load Font Awesome from a CDN and report usage to its makers; the site's
  // Content-Security-Policy blocks both, and the page needs neither.
  cssIcons: "",
  telemetry: false,
  panels: { defaults: [] },
  // GrapesJS's own reset (box-sizing and body margin) would end up in the downloaded HTML and make the PDF differ
  // from it; the canvas gets the page look from pageStyle() instead.
  protectedCss: "",
  // Canvas-only styles: running headers and footers are labelled, because in the PDF they leave the flow and repeat
  // on every page.
  canvasCss: `.gjs-dashed *[data-gjs-highlightable] { outline-offset: -1px; }
    [data-sticky-pdf-header], [data-sticky-pdf-footer] { outline: 1px dashed rgba(224, 37, 43, .6); position: relative; }
    [data-sticky-pdf-header]::before, [data-sticky-pdf-footer]::before { position: absolute; right: 0; top: -15px;
      font: 600 9px/13px Helvetica, Arial, sans-serif; color: #fff; background: rgba(224, 37, 43, .85); padding: 0 5px; border-radius: 3px 3px 0 0; }
    [data-sticky-pdf-header]::before { content: "Header on every page"; }
    [data-sticky-pdf-footer]::before { content: "Footer on every page"; }`,
  // widthMedia "" keeps style edits out of an @media (max-width) rule tied to the canvas width.
  deviceManager: { devices: [{ id: "page", name: "Page", width: "794px", widthMedia: "" }] },
  // CSS for classes no element has yet (status-{{invoice.status}}, say) is part of the template, not clutter.
  keepUnusedStyles: true,
  blockManager: { appendTo: "#blocks", blocks },
  layerManager: { appendTo: "#layers" },
  // Rendered into #selectors once the editor has loaded: with appendTo GrapesJS 0.23 renders it twice.
  selectorManager: { custom: false },
  traitManager: { appendTo: "#traits" },
  styleManager: {
    appendTo: "#styles",
    sectors: [
      { name: "Text", open: true, properties: textProps },
      { name: "Size and spacing", open: false, properties: [
        { extend: "width", units: sizeUnits }, { extend: "max-width", units: sizeUnits }, { extend: "height", units: sizeUnits },
        "margin", "padding"] },
      { name: "Layout", open: false, properties: [
        "display", "flex-direction", "flex-wrap", "justify-content", "align-items",
        { property: "gap", type: "number", units: ["pt", "mm", "px"], default: "0", min: 0 },
        { extend: "flex-grow" }, "float"] },
      { name: "Background and border", open: false, properties: ["background-color", "border", "border-radius", "opacity"] },
      { name: "Pages", open: false, properties: [
        { property: "break-before", type: "select", default: "auto", options: [{ id: "auto" }, { id: "page" }, { id: "avoid" }] },
        { property: "break-after", type: "select", default: "auto", options: [{ id: "auto" }, { id: "page" }, { id: "avoid" }] },
        { property: "break-inside", type: "select", default: "auto", options: [{ id: "auto" }, { id: "avoid" }] },
      ] },
    ],
  },
  assetManager: {
    upload: false,
    // Images are kept in the document as data: URLs: the API never fetches anything, so a link would stay empty.
    uploadFile: e => {
      const files = [...((e.dataTransfer || e.target).files || [])];
      for (const f of files) {
        if (!f.type.startsWith("image/")) continue;
        if (f.size > MAX_IMAGE_BYTES) { setStatus(`${f.name} is larger than 2 MB.`, true); continue; }
        const reader = new FileReader();
        reader.onload = () => editor.AssetManager.add({ src: reader.result, name: f.name });
        reader.readAsDataURL(f);
      }
    },
  },
  parser: { optionsHtml: { allowScripts: false, allowUnsafeAttr: false }, parserCss: css => parseCss(css) },
  undoManager: { trackSelection: false },
});

// ---------- The canvas looks like a page ----------

function pageMm() {
  if (page.size === "Custom" && page.custom) return page.custom;
  const [w, h] = PAGE_SIZES[page.size] || PAGE_SIZES.A4;
  return page.landscape ? [h, w] : [w, h];
}

// The frame gets the page's width, its margins as padding, and a faint line where each page should end. The lines
// are a guide only: PdfPecker decides the breaks, and running headers and footers take room from every page.
function pageStyle() {
  const [w, h] = pageMm();
  const [t, r, b, l] = page.margins;
  const contentPx = (h - t - b) * PX_PER_MM;
  const lines = $("showBreaks").checked && contentPx > 20
    ? `background-image: repeating-linear-gradient(to bottom, transparent 0 ${contentPx - 1}px, rgba(224, 37, 43, .55) ${contentPx - 1}px ${contentPx}px);
       background-origin: content-box; background-repeat: repeat-y;`
    : "";
  return `html { background-color: #fff; padding: ${t}mm ${r}mm 0 ${l}mm; min-height: ${h}mm; box-sizing: border-box; ${lines} }
body { min-height: ${(h - t - b) * 0.9}mm; }
::selection { background: rgba(224, 37, 43, .25); }`;
}

function frameDoc() {
  return editor.Canvas.getDocument();
}

// Styles of our own inside the canvas: the page look, and the verbatim CSS before GrapesJS's rules so the cascade
// matches the exported document.
function updateCanvas() {
  const d = frameDoc();
  if (!d || !d.head) return;
  let v = d.getElementById("pp-verbatim");
  if (!v) {
    v = d.createElement("style");
    v.id = "pp-verbatim";
    d.head.prepend(v);
  }
  v.textContent = verbatimCss;
  let p = d.getElementById("pp-page");
  if (!p) {
    p = d.createElement("style");
    p.id = "pp-page";
    d.head.append(p);
  }
  p.textContent = pageStyle();
  const width = Math.round(pageMm()[0] * PX_PER_MM) + "px";
  const device = editor.Devices.get("page");
  if (device.get("width") !== width) {
    device.set("width", width);
    editor.setDevice("page");
  }
  $("pageSummary").textContent = page.size === "Custom" && page.custom ? `${fmt(page.custom[0])} × ${fmt(page.custom[1])} mm`
    : page.size + (page.landscape ? " landscape" : "");
  fitCanvas();
}

// Zooms the page out until it fits the pane, so the whole width is always in view.
function fitCanvas() {
  const pane = $("gjs");
  if (!pane.clientWidth) return;
  const pagePx = pageMm()[0] * PX_PER_MM;
  const zoom = Math.min(100, Math.floor((pane.clientWidth - 48) / pagePx * 100));
  if (zoom <= 10) return;
  if (editor.Canvas.getZoom() !== zoom) editor.Canvas.setZoom(zoom);
  // GrapesJS scales the frames' container around its centre; widen it by the zoom so that, scaled, it still covers
  // the pane and the page sits in the middle.
  const frames = document.querySelector(".gjs-cv-canvas__frames");
  if (frames) {
    const z = zoom / 100, w = pane.clientWidth, h = pane.clientHeight;
    Object.assign(frames.style, { width: w / z + "px", height: h / z + "px", left: (w - w / z) / 2 + "px", top: (h - h / z) / 2 + "px" });
  }
}
new ResizeObserver(() => fitCanvas()).observe($("gjs"));

// ---------- The document as HTML ----------

const fmt = n => String(Math.round(n * 100) / 100);

function pageRule() {
  const m = page.margins;
  const margin = m.every(x => x === m[0]) ? `${fmt(m[0])}mm`
    : m[0] === m[2] && m[1] === m[3] ? `${fmt(m[0])}mm ${fmt(m[1])}mm`
    : m.map(x => fmt(x) + "mm").join(" ");
  const size = page.size === "Custom" && page.custom ? `${fmt(page.custom[0])}mm ${fmt(page.custom[1])}mm`
    : page.size + (page.landscape ? " landscape" : "");
  return `@page { size: ${size}; margin: ${margin}${page.extra ? "; " + page.extra : ""} }`;
}

function toMm(v) {
  const x = /^(-?[\d.]+)(mm|cm|in|pt|px|q)?$/i.exec(v);
  if (!x) return null;
  const n = parseFloat(x[1]);
  return { cm: n * 10, in: n * 25.4, pt: n * 25.4 / 72, px: n / PX_PER_MM, q: n / 4 }[(x[2] || "mm").toLowerCase()] ?? n;
}

// Reads size and margins from the first plain @page rule. With keepExtra, whatever else that rule holds (background,
// margin boxes) is kept in page.extra, and the CSS around the rule is returned to be kept verbatim. Returns null when
// there is no @page rule.
function readPageRule(css, keepExtra) {
  const blocks = cssBlocks(css);
  const rule = blocks.find(b => b.body !== undefined && /^@page$/i.test(b.prelude));
  if (!rule) return null;
  const decl = cssDeclarations(rule.body);
  if (decl.size) {
    const words = decl.size.trim().split(/\s+/);
    const named = Object.keys(PAGE_SIZES).find(k => words.some(w => w.toLowerCase() === k.toLowerCase()));
    const lengths = words.map(toMm).filter(x => x !== null && x > 0);
    page.landscape = words.some(w => w.toLowerCase() === "landscape");
    if (named) { page.size = named; page.custom = null; }
    else if (lengths.length) {
      page.size = "Custom";
      page.custom = [lengths[0], lengths[1] ?? lengths[0]].map(x => Math.round(x * 10) / 10);
      page.landscape = false;
    }
  }
  if (decl.margin) {
    const v = decl.margin.trim().split(/\s+/).map(x => toMm(x) ?? 0);
    const [t, r = t, b = t, l = r] = v;
    page.margins = [t, r, b, l].map(x => Math.min(100, Math.max(0, Math.round(x * 10) / 10)));
  }
  if (!keepExtra) return "";
  const extra = [];
  for (const piece of cssBlocks(rule.body)) {
    if (piece.body !== undefined) extra.push(`${piece.prelude} {${piece.body}}`);
    else if (!/^(size|margin)\s*:/i.test(piece.prelude)) extra.push(piece.prelude + (piece.last ? "" : ";"));
  }
  page.extra = extra.join(" ").replace(/;$/, "");
  return blocks.filter(b => b !== rule).map(b => b.body === undefined ? b.prelude + (b.last ? "" : ";") : `${b.prelude} {${b.body}}`).join("\n");
}

function elementsCss() {
  return editor.getCss({ avoidProtected: true }) || "";
}

function bodyHtml() {
  const html = editor.getHtml();
  // GrapesJS wraps the content in <body>; only what is inside it belongs in the document's body.
  const d = new DOMParser().parseFromString(html, "text/html");
  return d.body.innerHTML;
}

function exportDocument() {
  const title = $("docTitle").value.trim() || "Document";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeText(title)}</title>
<style>
${verbatimCss.trim() || VERBATIM_HINT}
</style>
<style data-designer="page">
${pageRule()}
</style>
<style data-designer="elements">
${prettyCss(elementsCss())}
</style>
</head>
<body>
${prettyHtml(bodyHtml())}
</body>
</html>
`;
}

// Loads a whole HTML document. <style data-designer="elements"> goes to the style panel; any other <style> is kept
// exactly as written, because GrapesJS's CSS parser drops what browsers do not know, such as @page margin boxes.
function importDocument(html) {
  const d = new DOMParser().parseFromString(html, "text/html");
  let elements = "", verbatim = [];
  let hasPage = false;
  // A document without an @page rule gets PdfPecker's defaults, not the previous document's page.
  Object.assign(page, { size: "A4", landscape: false, margins: Array(4).fill(DEFAULT_MARGIN), custom: null, extra: "" });
  for (const s of d.querySelectorAll("style")) {
    const kind = s.getAttribute("data-designer");
    const rest = kind === "page" && !hasPage ? readPageRule(s.textContent, true) : null;
    if (rest !== null) {
      hasPage = true;
      if (rest.trim()) verbatim.push(rest.trim());
    } else if (kind === "elements") elements += s.textContent + "\n";
    else verbatim.push(s.textContent.trim());
    s.remove();
  }
  // A document from elsewhere may set its page in its own CSS; show that in the page settings too.
  if (!hasPage) readPageRule(verbatim.join("\n"), false);
  // Inline styles become rules of their own here: GrapesJS would do the same, but its reader splits values such as
  // url(data:image/png;base64,...) at the ";".
  for (const el of d.body.querySelectorAll("[style]")) {
    const style = el.getAttribute("style").trim();
    el.removeAttribute("style");
    if (!style) continue;
    if (!el.id) {
      do el.id = "s" + Math.random().toString(36).slice(2, 8);
      while (d.querySelectorAll("#" + el.id).length > 1);
    }
    elements += `#${CSS.escape(el.id)} { ${style} }\n`;
  }
  const split = splitAtRules(elements);
  elements = split.keep;
  if (split.verbatim.trim()) verbatim.push(split.verbatim.trim());
  verbatimCss = verbatim.filter(t => t && t !== VERBATIM_HINT).join("\n\n");
  for (const el of d.querySelectorAll("script, link[rel=stylesheet]")) el.remove();
  replaceInvalidNames(d.body);
  $("docTitle").value = d.title || "";
  editor.setComponents(d.body.innerHTML);
  editor.setStyle(elements);
  editor.UndoManager.clear();
  editor.Layers.setOpen(editor.getWrapper(), true);
  syncPageForm();
  updateCanvas();
}

// The HTML parser accepts tag and attribute names such as <t!d> or a"b that document.createElement and setAttribute
// refuse, and GrapesJS would stop halfway through building the canvas on them. Such elements become <span>s and such
// attributes are dropped.
const validNames = new Map();
function isValidName(name, attribute) {
  const key = (attribute ? "@" : "") + name;
  let ok = validNames.get(key);
  if (ok === undefined) {
    try { if (attribute) document.createElement("i").setAttribute(name, ""); else document.createElement(name); ok = true; }
    catch { ok = false; }
    validNames.set(key, ok);
  }
  return ok;
}

function replaceInvalidNames(root) {
  for (const el of [...root.querySelectorAll("*")]) {
    for (const a of [...el.attributes]) if (!isValidName(a.name, true)) el.removeAttributeNode(a);
    if (!isValidName(el.localName, false)) {
      const span = el.ownerDocument.createElement("span");
      for (const a of el.attributes) span.setAttribute(a.name, a.value);
      span.append(...el.childNodes);
      el.replaceWith(span);
    }
  }
}

function escapeText(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------- Readable HTML and CSS for the code view ----------

const BLOCK_TAGS = new Set(["html", "head", "body", "div", "section", "article", "aside", "header", "footer", "main", "nav",
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "dl", "dt", "dd", "table", "thead", "tbody", "tfoot", "tr",
  "td", "th", "caption", "colgroup", "col", "figure", "figcaption", "blockquote", "hr", "form", "fieldset", "details",
  "summary", "address", "svg", "style"]);
const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

function openTag(el) {
  const shallow = el.cloneNode(false).outerHTML;
  const tag = el.tagName.toLowerCase();
  return VOID_TAGS.has(tag) ? shallow : shallow.slice(0, shallow.length - tag.length - 3);
}

// An element holding only block elements gets one line per child; anything holding text or inline elements is
// written exactly as it is, so no space, line break or non-breaking space in the text changes.
const blankText = /^[ \t\n\r\f]*$/;
function prettyNode(node, depth, out) {
  const pad = "  ".repeat(depth);
  if (node.nodeType === Node.TEXT_NODE) {
    if (!blankText.test(node.data)) out.push(pad + escapeText(node.data));
    return;
  }
  if (node.nodeType === Node.COMMENT_NODE) { out.push(pad + `<!--${node.data}-->`); return; }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const tag = node.tagName.toLowerCase();
  const kids = [...node.childNodes];
  const onlyBlocks = kids.some(c => c.nodeType === Node.ELEMENT_NODE)
    && kids.every(c => c.nodeType === Node.COMMENT_NODE
      || (c.nodeType === Node.TEXT_NODE && blankText.test(c.data))
      || (c.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has(c.tagName.toLowerCase())));
  if (!onlyBlocks || tag === "pre" || tag === "textarea" || tag === "svg") {
    out.push(pad + node.outerHTML);
    return;
  }
  out.push(pad + openTag(node));
  for (const c of kids) prettyNode(c, depth + 1, out);
  out.push(pad + `</${tag}>`);
}

function prettyHtml(html) {
  const body = new DOMParser().parseFromString(`<!DOCTYPE html><body>${html}`, "text/html").body;
  const kids = [...body.childNodes];
  if (kids.some(c => c.nodeType === Node.TEXT_NODE && !blankText.test(c.data)
    || c.nodeType === Node.ELEMENT_NODE && !BLOCK_TAGS.has(c.tagName.toLowerCase()))) return body.innerHTML.trim();
  const out = [];
  for (const c of kids) prettyNode(c, 0, out);
  return out.join("\n");
}

// Puts each rule and declaration on its own line, minding strings and url(...) values that hold ; or }.
function prettyCss(css) {
  let out = "", depth = 0, quote = null, parens = 0, line = "";
  // Indentation stops growing at 16 levels, so deeply nested input cannot make the text quadratically long.
  const pad = () => "  ".repeat(Math.min(depth, 16));
  const flush = () => { const t = line.trim(); if (t) out += pad() + t + "\n"; line = ""; };
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (quote && (ch === "\n" || ch === "\r")) { quote = null; line += " "; continue; }
    if (quote) { line += ch; if (ch === "\\") line += css[++i] ?? ""; else if (ch === quote) quote = null; continue; }
    if (ch === "\"" || ch === "'") { quote = ch; line += ch; continue; }
    if (ch === "(") parens++;
    if (ch === ")") parens = Math.max(0, parens - 1);
    if (parens > 0) { line += ch; continue; }
    if (ch === "{") { line = line.trim() + " {"; flush(); depth++; }
    else if (ch === ";") { line = line.replace(/^\s*([\w-]+)\s*:\s*/, "$1: ") + ";"; flush(); }
    else if (ch === "}") { flush(); depth = Math.max(0, depth - 1); out += pad() + "}\n"; }
    else if (ch === "\n" || ch === "\r") line += " ";
    else line += ch;
  }
  flush();
  return out.trim();
}

// ---------- Sample data ----------

function readData() {
  const text = $("data").value.trim();
  if (!text) return {};
  return JSON.parse(text);
}

function lookup(path, scopes) {
  const parts = path.split(".");
  for (let i = scopes.length - 1; i >= 0; i--) {
    let v = scopes[i];
    if (v === null || typeof v !== "object" || !Object.prototype.hasOwnProperty.call(v, parts[0])) continue;
    // Only the data's own properties: {{a.constructor}} must not reach into Object.prototype.
    for (const p of parts) {
      if (v === null || typeof v !== "object" || !Object.prototype.hasOwnProperty.call(v, p)) return undefined;
      v = v[p];
    }
    return v;
  }
  return undefined;
}

const FILTERS = {
  money: v => isNaN(+v) ? v : (+v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
  number: v => isNaN(+v) ? v : String(Math.round(+v)).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
  upper: v => String(v).toUpperCase(),
  lower: v => String(v).toLowerCase(),
};

// {{path}} and {{path | filter}}. Unknown names stay as they are, so a typo shows in the PDF.
function substitute(text, scopes) {
  return text.replace(/\{\{\s*([$\w.]+)\s*(?:\|\s*(\w+)\s*)?\}\}/g, (m, path, filter) => {
    const v = lookup(path, scopes);
    if (v === undefined || v === null || typeof v === "object") return m;
    return FILTERS[filter] ? FILTERS[filter](v) : String(v);
  });
}

// Repeats nested in repeats multiply, so a small template and a little data could otherwise make millions of
// elements and freeze the page (on every reload too, since the document is saved).
const MAX_FILLED_ELEMENTS = 100000;

function fillNode(node, scopes, budget) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (node.data.includes("{{")) node.data = substitute(node.data, scopes);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const tag = node.tagName.toLowerCase();
  if (tag === "style" || tag === "script") return;
  const repeat = node.getAttribute("data-repeat");
  if (repeat !== null) {
    const list = lookup(repeat.trim(), scopes);
    if (Array.isArray(list)) {
      node.removeAttribute("data-repeat");
      list.forEach((item, i) => {
        budget.left -= node.getElementsByTagName("*").length + 1;
        if (budget.left < 0) throw new RangeError(`The sample data repeats to more than ${MAX_FILLED_ELEMENTS.toLocaleString("en")} elements.`);
        const copy = node.cloneNode(true);
        node.before(copy);
        const scope = item !== null && typeof item === "object" ? { ...item } : {};
        scope.$item = item;
        scope.$number = i + 1;
        fillNode(copy, [...scopes, scope], budget);
      });
      node.remove();
      return;
    }
  }
  for (const a of [...node.attributes]) if (a.value.includes("{{")) a.value = substitute(a.value, scopes);
  for (const c of [...node.childNodes]) fillNode(c, scopes, budget);
}

function fill(html, data) {
  const d = new DOMParser().parseFromString(html, "text/html");
  fillNode(d.documentElement, [data], { left: MAX_FILLED_ELEMENTS });
  return "<!DOCTYPE html>\n" + d.documentElement.outerHTML;
}

// ---------- Preview ----------

const statusEl = $("status");
function setStatus(text, isError) {
  statusEl.textContent = text;
  statusEl.classList.toggle("error", !!isError);
}

let previewTimer = 0, inFlight = false, again = false, againForce = false, lastSent = null, lastPdf = null, lastUrl = null;
let pngUrls = [];

// The HTML the PDF is made from: the code view while it has edits that are not applied yet, the design otherwise.
function currentHtml() {
  return codeDirty ? $("code").value : exportDocument();
}

let fillProblem = "";
function previewHtml() {
  fillProblem = "";
  const html = currentHtml();
  if (!$("fillData").checked) return html;
  try {
    return fill(html, readData());
  } catch (e) {
    // The data panel reports a JSON error itself.
    if (e instanceof RangeError) fillProblem = e.message + " The PDF shows the template unfilled.";
    return html;
  }
}

function requestBody(html) {
  const body = { html, fileName: fileName() };
  if ($("embedFonts").checked) body.options = { embedStandardFonts: true };
  return JSON.stringify(body);
}

function fileName() {
  const t = $("docTitle").value.trim().replace(/\{\{[^}]*\}\}/g, "").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-");
  return (t || "document").toLowerCase();
}

function schedulePreview() {
  save();
  if (!$("live").checked) return;
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => preview(false), pdfAsImages ? 2 * PREVIEW_DELAY : PREVIEW_DELAY);
}

async function problem(res) {
  let message = res.status === 429 ? "Too many requests, wait a moment."
    : res.status === 413 ? "The document is larger than the 5 MB the converter takes; use smaller images."
    : "Conversion failed (" + res.status + ").";
  try { const p = await res.json(); if (p.detail) message = p.detail; } catch {}
  return new Error(message);
}

// One request at a time: changes made while a PDF is being made are sent when it is done, so a busy editor never
// has more than one conversion running.
async function preview(force) {
  if (inFlight) { again = true; againForce ||= force; return; }
  const body = requestBody(previewHtml());
  if (!force && body === lastSent) return;
  inFlight = true;
  lastSent = body;
  setStatus("Making the PDF…");
  const started = performance.now();
  try {
    const res = await fetch("/api/convert", { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (!res.ok) {
      if (res.status === 429) lastSent = null;
      throw await problem(res);
    }
    const blob = await res.blob();
    const serverMs = parseFloat(res.headers.get("X-Conversion-Ms"));
    lastPdf = blob;
    await show(blob);
    const size = (blob.size / 1024).toFixed(1) + " KB";
    if (fillProblem) setStatus(fillProblem, true);
    else setStatus(isNaN(serverMs) ? size : `${size} · ${serverMs.toFixed(0)} ms (round trip ${Math.round(performance.now() - started)} ms)`);
  } catch (e) {
    setStatus(e.message, true);
  } finally {
    inFlight = false;
    if (again) { const f = againForce; again = againForce = false; preview(f); }
  }
}

async function show(pdf) {
  $("empty").hidden = true;
  if (!pdfAsImages) {
    const url = URL.createObjectURL(pdf);
    $("preview").src = url + "#navpanes=0";
    $("preview").hidden = false;
    if (lastUrl) setTimeout(u => URL.revokeObjectURL(u), 5000, lastUrl);
    lastUrl = url;
    return;
  }
  const box = $("images");
  const pageImage = async n => {
    const form = new FormData();
    form.append("file", pdf, "document.pdf");
    const res = await fetch("/api/pdf-to-image?" + new URLSearchParams({ page: n, dpi: 110 }), { method: "POST", body: form });
    if (!res.ok) throw await problem(res);
    return { png: await res.blob(), count: parseInt(res.headers.get("X-Page-Count"), 10) || 1 };
  };
  const first = await pageImage(1);
  const pngs = [first.png];
  for (let n = 2; n <= Math.min(first.count, PNG_PAGES); n++) pngs.push((await pageImage(n)).png);
  for (const u of pngUrls) URL.revokeObjectURL(u);
  pngUrls = pngs.map(p => URL.createObjectURL(p));
  box.replaceChildren(...pngUrls.map((u, i) => {
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    img.src = u;
    img.alt = `Page ${i + 1}`;
    const cap = document.createElement("figcaption");
    cap.textContent = `Page ${i + 1}`;
    fig.append(img, cap);
    return fig;
  }));
  if (first.count > PNG_PAGES) {
    const more = document.createElement("p");
    more.className = "more";
    more.textContent = `Showing the first ${PNG_PAGES} of ${first.count} pages. Download the PDF for all of them.`;
    box.append(more);
  }
  box.hidden = false;
}

// ---------- Saving in the browser ----------

let saveTimer = 0, saveFailed = false;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        html: exportDocument(), data: $("data").value, fill: $("fillData").checked,
        live: $("live").checked, breaks: $("showBreaks").checked, embedFonts: $("embedFonts").checked,
        code: codeDirty ? $("code").value : null,
      }));
      saveFailed = false;
    } catch {
      if (!saveFailed) setStatus("This browser could not keep a copy: the document is too large for its storage. Download the HTML to keep it.", true);
      saveFailed = true;
    }
  }, 400);
}

function restore() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORE_KEY);
    const s = JSON.parse(raw || "null");
    if (!s || typeof s.html !== "string") return false;
    $("data").value = s.data || "";
    $("fillData").checked = s.fill !== false;
    $("live").checked = s.live !== false;
    $("showBreaks").checked = s.breaks !== false;
    $("embedFonts").checked = !!s.embedFonts;
    importDocument(s.html);
    if (typeof s.code === "string") {
      $("code").value = s.code;
      codeDirty = true;
      setCodeState("Not applied yet; the PDF already shows it.");
    }
    return true;
  } catch {
    // Keep what could not be read, rather than let the starting template overwrite it.
    try { if (raw) localStorage.setItem(STORE_KEY + ".unreadable", raw); } catch {}
    return false;
  }
}

function loadTemplate(name) {
  const t = templates[name];
  $("data").value = JSON.stringify(t.data, null, 2);
  checkData();
  importDocument(t.html);
  if (!$("docTitle").value) $("docTitle").value = "Document";
  codeDirty = false;
  refreshCode();
  schedulePreview();
}

// ---------- Page settings ----------

const marginInputs = ["marginTop", "marginRight", "marginBottom", "marginLeft"].map($);
function syncPageForm() {
  const custom = page.size === "Custom";
  $("pageSize").value = page.size;
  for (const el of document.querySelectorAll(".custom-size")) el.hidden = !custom;
  $("landscape").disabled = custom;
  if (custom && page.custom) [$("customWidth").value, $("customHeight").value] = page.custom;
  $("landscape").checked = page.landscape;
  marginInputs.forEach((el, i) => { el.value = page.margins[i]; });
}

function readPageForm() {
  const size = $("pageSize").value, landscape = $("landscape").checked;
  const margins = marginInputs.map(el => {
    const v = parseFloat(el.value);
    return isNaN(v) ? 0 : Math.min(100, Math.max(0, v));
  });
  const custom = [$("customWidth"), $("customHeight")].map(el => Math.min(2000, Math.max(50, parseFloat(el.value) || 210)));
  // Unapplied code edits are applied first, so they are neither lost nor allowed to undo this change.
  if (codeDirty) applyCode();
  Object.assign(page, { size, landscape, margins, custom: size === "Custom" ? custom : null });
  syncPageForm();
  updateCanvas();
  refreshCode();
  schedulePreview();
}

// ---------- Code view ----------

function refreshCode() {
  if (codeDirty) return;
  $("code").value = exportDocument();
  setCodeState("");
}

function setCodeState(text) {
  $("codeStatus").textContent = text;
  $("codeStatus").classList.toggle("changed", codeDirty);
  $("applyCode").disabled = !codeDirty;
  $("revertCode").disabled = !codeDirty;
}

function applyCode() {
  if (!codeDirty) return;
  const html = $("code").value;
  try {
    importDocument(html);
  } catch (e) {
    setCodeState("Could not apply: " + e.message);
    return;
  }
  codeDirty = false;
  refreshCode();
  setCodeState("Applied.");
  schedulePreview();
}

function revertCode() {
  codeDirty = false;
  refreshCode();
  schedulePreview();
}

// ---------- Downloads ----------

function downloadBlob(blob, name) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

async function downloadPdf() {
  setStatus("Making the PDF…");
  try {
    const res = await fetch("/api/convert", { method: "POST", headers: { "Content-Type": "application/json" }, body: requestBody(previewHtml()) });
    if (!res.ok) throw await problem(res);
    downloadBlob(await res.blob(), fileName() + ".pdf");
    setStatus("PDF downloaded.");
  } catch (e) {
    setStatus(e.message, true);
  }
}

function csharp() {
  return `// The page size and margins are in the HTML's @page rule. Fill in the {{placeholders}} with your own
// template engine (or string.Replace) before converting.
using PdfPecker;

string html = File.ReadAllText("${fileName()}.html");
var options = new PdfOptions${$("embedFonts").checked ? " { EmbedStandardFonts = true }" : "()"};
byte[] pdf = HtmlToPdf.Convert(html, options);
File.WriteAllBytes("${fileName()}.pdf", pdf);
`;
}

// ---------- Wiring ----------

function setView(view) {
  if (codeDirty && view === "design") applyCode();
  document.body.dataset.view = view;
  for (const b of document.querySelectorAll(".view-tabs button")) b.setAttribute("aria-selected", b.dataset.view === view);
  if (view === "code") refreshCode();
  if (view === "design") editor.refresh();
}
for (const b of document.querySelectorAll(".view-tabs button")) b.addEventListener("click", () => setView(b.dataset.view));

for (const b of document.querySelectorAll(".side-tabs button")) {
  b.addEventListener("click", () => {
    for (const o of document.querySelectorAll(".side-tabs button")) {
      o.setAttribute("aria-selected", o === b);
      $("panel-" + o.dataset.panel).hidden = o !== b;
    }
  });
}

$("pageSize").addEventListener("change", readPageForm);
$("landscape").addEventListener("change", readPageForm);
for (const el of marginInputs) el.addEventListener("change", readPageForm);
$("showBreaks").addEventListener("change", () => { updateCanvas(); save(); });
$("embedFonts").addEventListener("change", schedulePreview);
$("docTitle").addEventListener("input", () => {
  if (codeDirty) {
    const title = $("docTitle").value;
    applyCode();
    $("docTitle").value = title;
  }
  refreshCode();
  schedulePreview();
});
for (const el of [$("customWidth"), $("customHeight")]) el.addEventListener("change", readPageForm);

// Menus close when something outside them is clicked.
document.addEventListener("click", e => {
  for (const m of document.querySelectorAll("details.menu[open]")) if (!m.contains(e.target)) m.open = false;
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") for (const m of document.querySelectorAll("details.menu[open]")) m.open = false;
});

$("template").addEventListener("change", e => {
  const name = e.target.value;
  e.target.value = "";
  if (!name) return;
  if (!confirm("Replace the current document with this template? The current one is not kept.")) return;
  loadTemplate(name);
});

$("undo").addEventListener("click", () => editor.UndoManager.undo());
$("redo").addEventListener("click", () => editor.UndoManager.redo());

$("file").addEventListener("change", async e => {
  const f = e.target.files[0];
  e.target.value = "";
  if (!f) return;
  if (f.size > 4 * 1024 * 1024) { setStatus("That file is larger than 4 MB.", true); return; }
  codeDirty = false;
  importDocument(await f.text());
  if (!$("docTitle").value) $("docTitle").value = f.name.replace(/\.[^.]+$/, "");
  refreshCode();
  schedulePreview();
});

$("downloadPdf").addEventListener("click", () => { $("downloadMenu").open = false; downloadPdf(); });
$("downloadHtml").addEventListener("click", () => {
  $("downloadMenu").open = false;
  downloadBlob(new Blob([currentHtml()], { type: "text/html" }), fileName() + ".html");
});
$("downloadFilled").addEventListener("click", () => {
  $("downloadMenu").open = false;
  try {
    downloadBlob(new Blob([fill(currentHtml(), readData())], { type: "text/html" }), fileName() + "-filled.html");
  } catch (e) {
    setStatus(e instanceof RangeError ? e.message : "The sample data is not valid JSON.", true);
  }
});
$("copyCode").addEventListener("click", async () => {
  const b = $("copyCode");
  try {
    await navigator.clipboard.writeText(csharp());
    b.textContent = "Copied!";
  } catch {
    b.textContent = "Copy failed";
  }
  setTimeout(() => { b.textContent = "Copy C# code"; $("downloadMenu").open = false; }, 1200);
});

const code = $("code");
code.addEventListener("input", () => {
  codeDirty = true;
  setCodeState("Not applied yet; the PDF already shows it.");
  schedulePreview();
});
code.addEventListener("keydown", e => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); applyCode(); return; }
  // Tab indents; Escape then Tab leaves the editor, so keyboard users are never trapped.
  if (e.key === "Escape") code.dataset.tabOut = "1";
  else if (e.key === "Tab" && !e.shiftKey && !code.dataset.tabOut) {
    e.preventDefault();
    code.setRangeText("  ", code.selectionStart, code.selectionEnd, "end");
    code.dispatchEvent(new Event("input"));
  }
});
code.addEventListener("blur", () => { delete code.dataset.tabOut; });
$("applyCode").addEventListener("click", applyCode);
$("revertCode").addEventListener("click", revertCode);

function checkData() {
  try {
    readData();
    $("dataStatus").textContent = "";
    $("dataStatus").classList.remove("error");
    return true;
  } catch (e) {
    $("dataStatus").textContent = "Not valid JSON: " + e.message;
    $("dataStatus").classList.add("error");
    return false;
  }
}
$("data").addEventListener("input", () => { if (checkData()) schedulePreview(); else save(); });
$("fillData").addEventListener("change", schedulePreview);
$("live").addEventListener("change", () => { save(); if ($("live").checked) preview(false); });
$("refresh").addEventListener("click", () => preview(true));

// Every change in the design: keep the code view and the saved copy current and update the PDF.
editor.on("update", () => {
  if (!codeDirty) refreshCode();
  schedulePreview();
});
editor.on("canvas:frame:load", updateCanvas);
editor.on("component:selected", c => {
  $("styleHelp").hidden = true;
  // Any element can be repeated for each entry of a list in the sample data.
  if (!c.getTrait("data-repeat")) c.addTrait({ name: "data-repeat", label: "Repeat for each" }, { at: 99 });
});
editor.on("component:deselected", () => { $("styleHelp").hidden = !!editor.getSelected(); });

editor.on("load", () => {
  $("selectors").append(editor.SelectorManager.render());
  editor.setDevice("page");
  if (!restore()) loadTemplate("invoice");
  if (!$("data").value) $("data").value = "{}";
  checkData();
  updateCanvas();
  refreshCode();
  preview(true);
});
