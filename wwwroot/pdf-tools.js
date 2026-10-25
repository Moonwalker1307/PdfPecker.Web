// The PDF tools pages (/pdf-tools/merge/, /organize/ and /compress/): the visitor's PDFs are posted to the API, which
// works on them in memory and sends the result straight back. The page says which tool it is in <body data-tool>.
(() => {
  "use strict";
  const MaxBytes = 25 * 1024 * 1024;
  const $ = id => document.getElementById(id);
  const tool = document.body.dataset.tool;
  const statusEl = $("status");
  const fileInput = $("file");
  const drop = $("drop");
  let downloadUrl = null;

  function size(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(bytes < 10240 ? 1 : 0) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  }

  function status(text, error) {
    statusEl.textContent = text;
    statusEl.classList.toggle("error", !!error);
  }

  // Shows the result with a download link and starts the download.
  function offer(blob, name, text) {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = URL.createObjectURL(blob);
    status(text + " ");
    const a = document.createElement("a");
    a.className = "button small primary";
    a.href = downloadUrl;
    a.download = name;
    a.textContent = "Download " + name;
    statusEl.append(a);
    a.click();
  }

  // Posts a form and returns the response, or throws an Error with the server's explanation.
  async function post(url, form) {
    let response;
    try {
      response = await fetch(url, { method: "POST", body: form });
    } catch {
      throw new Error("The server could not be reached. Check your connection and try again.");
    }
    if (response.ok) return response;
    let detail = "";
    try { detail = (await response.json()).detail || ""; } catch { /* not a problem document */ }
    if (response.status === 413) detail = "The upload is larger than 25 MB.";
    if (response.status === 429) detail = "Too many requests in a minute; wait a moment and try again.";
    const error = new Error(detail || "Something went wrong (" + response.status + ").");
    error.status = response.status;
    throw error;
  }

  function baseName(name) {
    return (name || "document").replace(/\.pdf$/i, "").replace(/[^\p{L}\p{N} _-]/gu, "").trim() || "document";
  }

  function isPdf(file) {
    return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  }

  // Files dropped anywhere on the page go to the tool, as if chosen with the button.
  let dragDepth = 0;
  const hasFiles = e => e.dataTransfer && Array.from(e.dataTransfer.types).includes("Files");
  document.addEventListener("dragenter", e => { if (hasFiles(e)) { dragDepth++; document.body.classList.add("dragging"); } });
  document.addEventListener("dragleave", e => { if (hasFiles(e) && --dragDepth <= 0) { dragDepth = 0; document.body.classList.remove("dragging"); } });
  document.addEventListener("dragover", e => { if (hasFiles(e)) e.preventDefault(); });
  document.addEventListener("drop", e => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth = 0;
    document.body.classList.remove("dragging");
    take(Array.from(e.dataTransfer.files));
  });
  fileInput.addEventListener("change", () => {
    take(Array.from(fileInput.files));
    fileInput.value = "";
  });

  function take(files) {
    const pdfs = files.filter(isPdf);
    if (pdfs.length === 0) {
      if (files.length) status("That is not a PDF.", true);
      return;
    }
    handlers[tool](pdfs);
  }

  // Reordering by dragging: list items carry data-i, their index; move(from, to) puts item from before item to.
  function sortable(list, move) {
    let from = -1;
    list.addEventListener("dragstart", e => {
      const li = e.target.closest("li[data-i]");
      if (!li) return;
      from = +li.dataset.i;
      li.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(from));
    });
    list.addEventListener("dragend", () => {
      from = -1;
      list.querySelectorAll(".dragging, .drop-before").forEach(el => el.classList.remove("dragging", "drop-before"));
    });
    list.addEventListener("dragover", e => {
      if (from < 0) return;
      e.preventDefault();
      const li = e.target.closest("li[data-i]");
      list.querySelectorAll(".drop-before").forEach(el => { if (el !== li) el.classList.remove("drop-before"); });
      if (li) li.classList.add("drop-before");
    });
    list.addEventListener("drop", e => {
      if (from < 0) return;
      e.preventDefault();
      e.stopPropagation();
      const li = e.target.closest("li[data-i]");
      const to = li ? +li.dataset.i : list.children.length;
      const f = from;
      from = -1;
      if (to !== f && to !== f + 1) move(f, to > f ? to - 1 : to);
      else move(f, f);
    });
  }

  function button(text, label, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "small";
    b.textContent = text;
    b.setAttribute("aria-label", label);
    b.title = label;
    b.addEventListener("click", onClick);
    return b;
  }

  function moveItem(array, from, to) {
    const [item] = array.splice(from, 1);
    array.splice(to, 0, item);
  }

  const handlers = {};

  // ---------- Merge ----------
  if (tool === "merge") {
    const list = $("files");
    const items = [];
    let busy = false;

    handlers.merge = files => {
      for (const file of files) {
        if (items.length >= 20) { status("At most 20 PDFs can be merged at once.", true); break; }
        items.push({ file, pages: "" });
      }
      render();
    };

    function render() {
      list.replaceChildren();
      items.forEach((item, i) => {
        const li = document.createElement("li");
        li.dataset.i = i;
        const grip = document.createElement("span");
        grip.className = "grip";
        grip.textContent = "⠿";
        grip.setAttribute("aria-hidden", "true");
        // Only the grip starts a drag, so the page range field can still be selected and edited.
        grip.addEventListener("pointerdown", () => { li.draggable = true; });
        li.addEventListener("dragend", () => { li.draggable = false; });
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = (i + 1) + ". " + item.file.name;
        const small = document.createElement("small");
        small.textContent = size(item.file.size);
        name.append(small);
        const range = document.createElement("label");
        range.className = "range";
        range.textContent = "Pages";
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "all";
        input.value = item.pages;
        input.pattern = "\\s*(\\d+|last)?\\s*(-\\s*(\\d+|last)?\\s*)?(,\\s*(\\d+|last)?\\s*(-\\s*(\\d+|last)?\\s*)?)*";
        input.title = "Pages to take, such as 1-3,5 or 4-last; empty for all";
        input.addEventListener("input", () => { item.pages = input.value; });
        range.append(input);
        const buttons = document.createElement("span");
        buttons.className = "row-buttons";
        buttons.append(
          button("↑", "Move up", () => { if (i > 0) { moveItem(items, i, i - 1); render(); } }),
          button("↓", "Move down", () => { if (i < items.length - 1) { moveItem(items, i, i + 1); render(); } }),
          button("✕", "Remove " + item.file.name, () => { items.splice(i, 1); render(); }));
        li.append(grip, name, range, buttons);
        list.append(li);
      });
      list.hidden = items.length === 0;
      $("actions").hidden = items.length === 0;
      drop.classList.toggle("compact", items.length > 0);
      const total = items.reduce((n, item) => n + item.file.size, 0);
      if (!busy) {
        if (items.length === 1) status("Add at least one more PDF.");
        else if (total > MaxBytes) status("The PDFs add up to " + size(total) + "; at most 25 MB can be merged at once.", true);
        else status(items.length ? items.length + " PDFs, " + size(total) + "." : "");
      }
    }

    sortable(list, (from, to) => { moveItem(items, from, to); render(); });
    $("clear").addEventListener("click", () => { items.length = 0; render(); });
    $("run").addEventListener("click", async () => {
      if (items.length < 2) { status("Add at least two PDFs.", true); return; }
      const bad = list.querySelector("input:invalid");
      if (bad) { bad.focus(); status("Write page ranges like 1-3,5 or 4-last.", true); return; }
      const total = items.reduce((n, item) => n + item.file.size, 0);
      if (total > MaxBytes) { status("At most 25 MB can be merged at once.", true); return; }
      const form = new FormData();
      for (const item of items) {
        form.append("file", item.file, item.file.name);
        form.append("pages", item.pages.trim());
      }
      busy = true;
      $("run").disabled = true;
      status("Merging…");
      try {
        const response = await post("/api/merge", form);
        const blob = await response.blob();
        offer(blob, baseName(items[0].file.name) + "-merged.pdf", "Merged " + items.length + " PDFs into " + size(blob.size) + ".");
      } catch (e) {
        status(e.message, true);
      } finally {
        busy = false;
        $("run").disabled = false;
      }
    });
  }

  // ---------- Organize pages ----------
  if (tool === "organize") {
    const list = $("pages");
    let file = null, password = null, thumbs = [], pageCount = 0, items = [];

    handlers.organize = async files => {
      const chosen = files[0];
      if (chosen.size > MaxBytes) { status("The PDF is " + size(chosen.size) + "; at most 25 MB.", true); return; }
      password = null;
      await load(chosen);
    };

    async function load(chosen) {
      status("Reading the pages…");
      const form = new FormData();
      form.append("file", chosen, chosen.name);
      if (password) form.append("password", password);
      try {
        const data = await (await post("/api/pdf-thumbnails", form)).json();
        file = chosen;
        thumbs = data.pages;
        pageCount = data.pageCount;
        reset();
        $("fileName").textContent = chosen.name + " · " + pageCount + (pageCount === 1 ? " page" : " pages");
        $("actions").hidden = false;
        $("organizeHint").hidden = false;
        drop.classList.add("compact");
        status("");
      } catch (e) {
        if (e.status === 401) {
          const answer = prompt(password ? "That password did not open it. Password:" : "This PDF needs a password to open:");
          if (answer) { password = answer; return load(chosen); }
        }
        status(e.message, true);
      }
    }

    function reset() {
      items = Array.from({ length: pageCount }, (_, i) => ({ page: i + 1, turn: 0 }));
      render();
    }

    function render() {
      list.replaceChildren();
      items.forEach((item, i) => {
        const li = document.createElement("li");
        li.dataset.i = i;
        li.draggable = true;
        const frame = document.createElement("div");
        frame.className = "frame";
        const thumb = thumbs[item.page - 1];
        let picture;
        if (thumb && thumb.image) {
          picture = document.createElement("img");
          picture.src = thumb.image;
          picture.alt = "Page " + item.page;
          picture.draggable = false;
        } else {
          picture = document.createElement("div");
          picture.className = "blank";
          picture.textContent = "Page " + item.page;
        }
        if (item.turn) picture.style.transform = "rotate(" + item.turn + "deg)";
        frame.append(picture);
        const label = document.createElement("span");
        label.className = "label";
        label.textContent = (i + 1) + (item.page !== i + 1 ? " (was " + item.page + ")" : "") + (item.turn ? " · " + item.turn + "°" : "");
        const move = document.createElement("span");
        move.className = "row-buttons";
        move.append(
          button("◀", "Move page " + (i + 1) + " earlier", () => { if (i > 0) { moveItem(items, i, i - 1); render(); focusButton(i - 1, 0); } }),
          button("⟲", "Rotate page " + (i + 1) + " left", () => { item.turn = (item.turn + 270) % 360; render(); focusButton(i, 1); }),
          button("⟳", "Rotate page " + (i + 1) + " right", () => { item.turn = (item.turn + 90) % 360; render(); focusButton(i, 2); }),
          button("▶", "Move page " + (i + 1) + " later", () => { if (i < items.length - 1) { moveItem(items, i, i + 1); render(); focusButton(i + 1, 3); } }));
        const edit = document.createElement("span");
        edit.className = "row-buttons";
        edit.append(
          button("⧉", "Duplicate page " + (i + 1), () => { items.splice(i + 1, 0, { ...item }); render(); focusButton(i, 4); }),
          button("✕", "Delete page " + (i + 1), () => { items.splice(i, 1); render(); focusButton(Math.min(i, items.length - 1), 5); }));
        li.append(frame, label, move, edit);
        list.append(li);
      });
      if (file) status(items.length === 0 ? "Every page is deleted; Reset brings them back." : "");
    }

    function focusButton(index, which) {
      const li = list.children[index];
      if (li) li.querySelectorAll("button")[which].focus();
    }

    sortable(list, (from, to) => { moveItem(items, from, to); render(); });
    $("reset").addEventListener("click", reset);
    $("reverse").addEventListener("click", () => { items.reverse(); render(); });
    $("rotateAll").addEventListener("click", () => { items.forEach(item => { item.turn = (item.turn + 90) % 360; }); render(); });
    $("run").addEventListener("click", async () => {
      if (!file) return;
      if (items.length === 0) { status("Keep at least one page.", true); return; }
      const form = new FormData();
      form.append("file", file, file.name);
      form.append("pages", items.map(item => item.page).join(","));
      if (items.some(item => item.turn)) form.append("rotate", items.map(item => item.turn).join(","));
      if (password) form.append("password", password);
      $("run").disabled = true;
      status("Saving…");
      try {
        const blob = await (await post("/api/pages", form)).blob();
        offer(blob, baseName(file.name) + "-organized.pdf", items.length + (items.length === 1 ? " page, " : " pages, ") + size(blob.size) + ".");
      } catch (e) {
        status(e.message, true);
      } finally {
        $("run").disabled = false;
      }
    });
  }

  // ---------- Compress ----------
  if (tool === "compress") {
    const options = $("options");
    let file = null;

    handlers.compress = files => {
      const chosen = files[0];
      if (chosen.size > MaxBytes) { status("The PDF is " + size(chosen.size) + "; at most 25 MB.", true); return; }
      file = chosen;
      $("fileName").textContent = chosen.name + " · " + size(chosen.size);
      options.hidden = false;
      drop.hidden = true;
      status("");
    };

    options.addEventListener("submit", async e => {
      e.preventDefault();
      if (!file) return;
      const form = new FormData();
      form.append("file", file, file.name);
      form.append("level", options.elements.level.value);
      form.append("removeMetadata", options.elements.removeMetadata.checked ? "true" : "false");
      $("run").disabled = true;
      status("Compressing…");
      try {
        const blob = await (await post("/api/compress", form)).blob();
        const saved = file.size - blob.size;
        if (saved <= 0) {
          status("This PDF is already as small as this level makes it" + (options.elements.level.value === "strong" ? "." : "; try a stronger level."));
          return;
        }
        offer(blob, baseName(file.name) + "-compressed.pdf",
          size(file.size) + " → " + size(blob.size) + " (" + Math.round(saved * 100 / file.size) + "% smaller).");
      } catch (err) {
        status(err.message, true);
      } finally {
        $("run").disabled = false;
      }
    });
  }
})();
