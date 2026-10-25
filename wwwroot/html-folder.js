// The folder converter (/pdf-tools/html-folder/): every .html file in a folder the visitor picks is converted with
// /api/convert, one request at a time, and the PDFs are packed into a zip in the browser with the folder's layout.
// The server never reads files, so images and stylesheets the HTML refers to by relative path are put into the HTML
// here first: stylesheets as <style> and images, fonts and other files as data: URLs.
(() => {
  "use strict";
  const MaxFiles = 500;
  const MaxHtmlBytes = 5 * 1024 * 1024;
  const $ = id => document.getElementById(id);
  const statusEl = $("status");
  const list = $("results");
  const progress = $("progress");
  let entries = [];       // { path, file } for every file in the folder
  let running = false, stopRequested = false, zipUrl = null;

  function status(text, error) {
    statusEl.textContent = text;
    statusEl.classList.toggle("error", !!error);
  }

  function size(bytes) {
    if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  }

  const isHtml = path => /\.html?$/i.test(path);

  // ---------- Reading the folder ----------
  $("folder").addEventListener("change", e => {
    const files = Array.from(e.target.files);
    use(files.map(file => ({ path: file.webkitRelativePath || file.name, file })));
    e.target.value = "";
  });
  $("files").addEventListener("change", e => {
    use(Array.from(e.target.files).map(file => ({ path: file.name, file })));
    e.target.value = "";
  });

  // A dropped folder is walked with the entries API, which every current browser has.
  let dragDepth = 0;
  const hasFiles = e => e.dataTransfer && Array.from(e.dataTransfer.types).includes("Files");
  document.addEventListener("dragenter", e => { if (hasFiles(e)) { dragDepth++; document.body.classList.add("dragging"); } });
  document.addEventListener("dragleave", e => { if (hasFiles(e) && --dragDepth <= 0) { dragDepth = 0; document.body.classList.remove("dragging"); } });
  document.addEventListener("dragover", e => { if (hasFiles(e)) e.preventDefault(); });
  document.addEventListener("drop", async e => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth = 0;
    document.body.classList.remove("dragging");
    if (running) return;
    const roots = Array.from(e.dataTransfer.items).map(item => item.webkitGetAsEntry && item.webkitGetAsEntry()).filter(Boolean);
    if (roots.length === 0) { use(Array.from(e.dataTransfer.files).map(file => ({ path: file.name, file }))); return; }
    status("Reading the folder…");
    const found = [];
    for (const root of roots) await walk(root, "", found);
    use(found);
  });

  async function walk(entry, prefix, found) {
    if (found.length > 5000) return;
    if (entry.isFile) {
      const file = await new Promise((resolve, reject) => entry.file(resolve, reject)).catch(() => null);
      if (file) found.push({ path: prefix + entry.name, file });
      return;
    }
    const reader = entry.createReader();
    for (;;) {
      const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject)).catch(() => []);
      if (batch.length === 0) break;
      for (const child of batch) await walk(child, prefix + entry.name + "/", found);
    }
  }

  function use(files) {
    if (running) return;
    entries = files.filter(f => !/(^|\/)\./.test(f.path)); // hidden files and folders, such as .git
    const html = entries.filter(f => isHtml(f.path)).sort((a, b) => a.path.localeCompare(b.path));
    if (html.length === 0) {
      status(files.length ? "There are no .html files in it." : "", !!files.length);
      $("job").hidden = true;
      return;
    }
    const others = entries.length - html.length;
    $("summary").textContent = html.length + (html.length === 1 ? " HTML file" : " HTML files")
      + (others ? ", and " + others + (others === 1 ? " other file" : " other files") + " they can use (images, stylesheets, fonts)" : "") + ".";
    if (html.length > MaxFiles) {
      status("At most " + MaxFiles + " HTML files at a time; the first " + MaxFiles + " will be converted.", true);
    } else {
      status("");
    }
    list.replaceChildren();
    for (const item of html.slice(0, MaxFiles)) {
      const li = document.createElement("li");
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = item.path;
      const state = document.createElement("span");
      state.className = "state";
      state.textContent = "Waiting";
      li.append(name, state);
      list.append(li);
      item.row = li;
    }
    $("job").hidden = false;
    $("drop").classList.add("compact");
    progress.value = 0;
    progress.max = Math.min(html.length, MaxFiles);
    $("run").hidden = false;
    $("stop").hidden = true;
  }

  // ---------- Putting local files into the HTML ----------
  function resolve(base, ref) {
    // base is the folder of the referring file ("" or "a/b/"); ref is relative, such as "../img/logo.png".
    const parts = (base + ref.split(/[?#]/)[0]).split("/");
    const out = [];
    for (const part of parts) {
      if (part === "..") out.pop();
      else if (part !== "." && part !== "") out.push(part);
    }
    try { return out.map(decodeURIComponent).join("/"); } catch { return out.join("/"); }
  }

  const isLocal = ref => ref && !/^([a-z][a-z0-9+.-]*:|\/\/|#|\/)/i.test(ref.trim());
  const folderOf = path => path.slice(0, path.lastIndexOf("/") + 1);

  function readDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  const mime = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
    bmp: "image/bmp", ttf: "font/ttf", otf: "font/otf", woff: "font/woff", woff2: "font/woff2", css: "text/css" };

  async function dataUrl(path, byPath, cache) {
    if (cache.has(path)) return cache.get(path);
    const entry = byPath.get(path) || byPath.get(path.toLowerCase());
    let url = null;
    if (entry) {
      const ext = path.split(".").pop().toLowerCase();
      url = await readDataUrl(mime[ext] ? new File([entry.file], entry.file.name, { type: mime[ext] }) : entry.file);
    }
    cache.set(path, url);
    return url;
  }

  async function replaceAsync(text, regex, fn) {
    const jobs = [];
    text.replace(regex, (...m) => { jobs.push(fn(...m)); return m[0]; });
    const results = await Promise.all(jobs);
    let i = 0;
    return text.replace(regex, () => results[i++]);
  }

  // url(...) in CSS, resolved against the folder the CSS lives in.
  function inlineCssUrls(css, base, byPath, cache) {
    return replaceAsync(css, /url\(\s*(["']?)([^"')]+)\1\s*\)/gi, async (m, q, ref) => {
      if (!isLocal(ref)) return m;
      const url = await dataUrl(resolve(base, ref), byPath, cache);
      return url ? 'url("' + url + '")' : m;
    });
  }

  async function inline(html, path, byPath, cache) {
    const base = folderOf(path);
    // <link rel="stylesheet" href="local.css"> becomes a <style> with the stylesheet, its url()s inlined in turn.
    html = await replaceAsync(html, /<link\b[^>]*>/gi, async tag => {
      if (!/\brel\s*=\s*["']?[^"'>]*stylesheet/i.test(tag)) return tag;
      const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(tag);
      const ref = href && (href[1] ?? href[2] ?? href[3]);
      if (!isLocal(ref)) return tag;
      const cssPath = resolve(base, ref);
      const entry = byPath.get(cssPath) || byPath.get(cssPath.toLowerCase());
      if (!entry) return tag;
      const media = /\bmedia\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(tag);
      const css = await inlineCssUrls(await entry.file.text(), folderOf(cssPath), byPath, cache);
      return "<style" + (media ? ' media="' + (media[1] ?? media[2]).replace(/"/g, "&quot;") + '"' : "") + ">\n"
        + css.replace(/<\/style/gi, "<\\/style") + "\n</style>";
    });
    // src="..." on images and the like, and xlink:href / href on SVG <image> and <use>.
    html = await replaceAsync(html, /(\s(?:src|xlink:href|poster)\s*=\s*)(["'])([^"']*)\2/gi, async (m, attr, q, ref) => {
      if (!isLocal(ref)) return m;
      const url = await dataUrl(resolve(base, ref), byPath, cache);
      return url ? attr + q + url + q : m;
    });
    // url(...) in <style> blocks and style attributes.
    return inlineCssUrls(html, base, byPath, cache);
  }

  // ---------- Converting ----------
  $("run").addEventListener("click", async () => {
    if (running) return;
    const html = entries.filter(f => f.row);
    if (html.length === 0) return;
    running = true;
    stopRequested = false;
    $("run").hidden = true;
    $("stop").hidden = false;
    $("pickers").inert = true;
    if (zipUrl) { URL.revokeObjectURL(zipUrl); zipUrl = null; }
    const byPath = new Map();
    for (const e of entries) { byPath.set(e.path, e); byPath.set(e.path.toLowerCase(), byPath.get(e.path.toLowerCase()) || e); }
    // A picked folder's paths start with the folder's own name; the zip keeps the layout inside it.
    const top = html[0].path.includes("/") && html.every(f => f.path.startsWith(html[0].path.split("/")[0] + "/")) ? html[0].path.split("/")[0] : "";
    const options = {
      pageSize: $("pageSize").value,
      landscape: $("landscape").checked,
      pageNumbers: $("pageNumbers").checked,
    };
    const zip = new ZipWriter();
    const cache = new Map();
    let done = 0, failed = 0;
    progress.value = 0;
    for (const item of html) {
      if (stopRequested) break;
      const state = item.row.querySelector(".state");
      state.textContent = "Converting…";
      item.row.className = "busy";
      try {
        let source = await item.file.text();
        source = await inline(source, item.path, byPath, cache);
        if (new Blob([source]).size > MaxHtmlBytes) throw new Error("larger than 5 MB with its images");
        const pdf = await convert(source, options, item.path);
        const name = (top ? item.path.slice(top.length + 1) : item.path).replace(/\.html?$/i, ".pdf");
        zip.add(name, new Uint8Array(await pdf.arrayBuffer()));
        state.textContent = size(pdf.size);
        item.row.className = "ok";
        done++;
      } catch (e) {
        state.textContent = e.message;
        item.row.className = "failed";
        failed++;
      }
      progress.value++;
      status("Converted " + done + " of " + html.length + (failed ? ", " + failed + " failed" : "") + "…");
    }
    running = false;
    $("stop").hidden = true;
    $("run").hidden = false;
    $("run").textContent = "Convert again";
    $("pickers").inert = false;
    if (done === 0) { status(stopRequested ? "Stopped." : "No file could be converted.", true); return; }
    const blob = zip.finish();
    zipUrl = URL.createObjectURL(blob);
    const zipName = (top || "html") + "-pdf.zip";
    status((stopRequested ? "Stopped after " : "Converted ") + done + (done === 1 ? " file" : " files")
      + (failed ? " (" + failed + " failed, see the list)" : "") + ": " + size(blob.size) + ". ");
    const a = document.createElement("a");
    a.className = "button small primary";
    a.href = zipUrl;
    a.download = zipName;
    a.textContent = "Download " + zipName;
    statusEl.append(a);
    a.click();
  });

  $("stop").addEventListener("click", () => { stopRequested = true; status("Stopping after this file…"); });

  // One conversion; waits and tries again when the server is busy or the minute's limit is reached.
  async function convert(html, options, path) {
    for (let attempt = 0; ; attempt++) {
      let response;
      try {
        response = await fetch("/api/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html, fileName: path.split("/").pop(), ...options }),
        });
      } catch {
        if (attempt < 3) { await wait(2000); continue; }
        throw new Error("the server could not be reached");
      }
      if (response.ok) return response.blob();
      if ((response.status === 429 || response.status === 503) && attempt < 30 && !stopRequested) {
        const seconds = response.status === 429 ? 10 : 3;
        status("The server asks us to slow down; going on in " + seconds + " seconds…");
        await wait(seconds * 1000);
        continue;
      }
      let detail = "";
      try { detail = (await response.json()).detail || ""; } catch { /* not a problem document */ }
      throw new Error(detail || "failed (" + response.status + ")");
    }
  }

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  // ---------- A zip of stored (uncompressed) entries: PDFs are compressed already ----------
  const crcTable = new Uint32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  class ZipWriter {
    constructor() { this.parts = []; this.central = []; this.offset = 0; this.count = 0; }
    add(name, data) {
      const nameBytes = new TextEncoder().encode(name);
      const crc = crc32(data);
      const now = new Date();
      const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
      const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0x0800, true); // the name is UTF-8
      local.setUint16(8, 0, true);      // stored
      local.setUint16(10, time, true);
      local.setUint16(12, date, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, data.length, true);
      local.setUint32(22, data.length, true);
      local.setUint16(26, nameBytes.length, true);
      const central = new DataView(new ArrayBuffer(46));
      central.setUint32(0, 0x02014b50, true);
      central.setUint16(4, 20, true);
      central.setUint16(6, 20, true);
      central.setUint16(8, 0x0800, true);
      central.setUint16(12, time, true);
      central.setUint16(14, date, true);
      central.setUint32(16, crc, true);
      central.setUint32(20, data.length, true);
      central.setUint32(24, data.length, true);
      central.setUint16(28, nameBytes.length, true);
      central.setUint32(42, this.offset, true);
      this.parts.push(local, nameBytes, data);
      this.central.push(central, nameBytes);
      this.offset += 30 + nameBytes.length + data.length;
      this.count++;
    }
    finish() {
      const centralSize = this.central.reduce((n, p) => n + p.byteLength, 0);
      const end = new DataView(new ArrayBuffer(22));
      end.setUint32(0, 0x06054b50, true);
      end.setUint16(8, this.count, true);
      end.setUint16(10, this.count, true);
      end.setUint32(12, centralSize, true);
      end.setUint32(16, this.offset, true);
      return new Blob([...this.parts, ...this.central, end], { type: "application/zip" });
    }
  }
})();
