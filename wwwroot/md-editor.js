// The Markdown page's editor: a visual mode that edits the formatted document, a Markdown mode that edits the text, and
// a formatting toolbar for both. The textarea (#source) stays the source of truth: every visual edit is written back to
// it as Markdown, so Convert, the settings and file opening work the same in both modes.
// Visual mode gets its HTML from the server's own Markdown renderer, so it shows what the PDF will show.
(() => {
  const source = $("source"), visual = $("visual"), bar = $("fmt"), blockSel = $("fmtBlock");
  const modeButtons = [...document.querySelectorAll("[data-editor]")];
  let visualOn = false, renderedFor = null, rendering = 0, savedRange = null;
  // Raw HTML in the Markdown (a centred <div>, <details>, <kbd> ...) shows read-only and goes back out unchanged.
  const raw = new Map();
  let rawId = 0;

  // ---------- Markdown to the visual editor ----------

  const MD_TAGS = {
    P: [], H1: ["id"], H2: ["id"], H3: ["id"], H4: ["id"], H5: ["id"], H6: ["id"], EM: [], STRONG: [], DEL: [], CODE: ["class"],
    PRE: [], A: ["href", "title"], IMG: ["src", "alt", "title"], UL: ["class"], OL: ["start"], LI: ["class"],
    INPUT: ["type", "disabled", "checked"], BLOCKQUOTE: [], TABLE: [], THEAD: [], TBODY: [], TR: [], TH: ["align"],
    TD: ["align"], HR: [], BR: [],
  };
  const BLOCK_TAGS = new Set(["ADDRESS", "ARTICLE", "ASIDE", "BLOCKQUOTE", "CENTER", "DETAILS", "DIV", "DL", "FIELDSET", "FIGURE",
    "FOOTER", "FORM", "H1", "H2", "H3", "H4", "H5", "H6", "HEADER", "HR", "LI", "MAIN", "NAV", "OL", "P", "PRE", "SECTION",
    "SUMMARY", "TABLE", "UL"]);
  const UNSAFE = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "LINK", "META", "BASE", "FORM", "FRAME", "FRAMESET", "TEMPLATE"]);

  // Whether an element is one the Markdown renderer writes, so the editor can turn it back into Markdown.
  function isMarkdownElement(el) {
    const allowed = MD_TAGS[el.tagName];
    if (!allowed || [...el.attributes].some(a => !allowed.includes(a.name))) return false;
    if (el.tagName === "PRE") return el.children.length === 1 && el.firstElementChild.tagName === "CODE";
    if (el.tagName === "INPUT") return el.type === "checkbox";
    if (el.tagName === "TABLE") {
      const head = el.tHead;
      return !!head && head.rows.length === 1 && [...el.querySelectorAll("th, td")].every(c => ![...c.querySelectorAll("*")].some(d => BLOCK_TAGS.has(d.tagName)));
    }
    return true;
  }

  // A copy of raw HTML that is safe to show: no scripts, frames, event handlers or javascript: links.
  function sanitize(node) {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.data);
    if (node.nodeType !== Node.ELEMENT_NODE || UNSAFE.has(node.tagName)) return null;
    const el = document.createElement(node.tagName);
    for (const a of node.attributes) {
      if (/^on/i.test(a.name) || a.name === "srcdoc" || a.name === "contenteditable") continue;
      if (/^(href|src|action|formaction|xlink:href)$/i.test(a.name) && /^\s*(javascript|vbscript|data:text)/i.test(a.value)) continue;
      el.setAttribute(a.name, a.value);
    }
    for (const c of node.childNodes) { const s = sanitize(c); if (s) el.append(s); }
    return el;
  }

  function importNode(node) {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.data);
    if (node.nodeType === Node.COMMENT_NODE) return document.createComment(node.data);
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    if (!isMarkdownElement(node)) {
      const shown = sanitize(node) ?? document.createElement("span");
      shown.dataset.raw = ++rawId;
      raw.set(String(rawId), node.outerHTML);
      shown.contentEditable = "false";
      shown.classList.add("raw");
      shown.title = "HTML: switch to Markdown to edit it";
      return shown;
    }
    const el = document.createElement(node.tagName);
    for (const a of node.attributes) if (a.name !== "id" && a.name !== "disabled") el.setAttribute(a.name, a.value);
    if (node.tagName === "INPUT") { el.contentEditable = "false"; el.checked = node.hasAttribute("checked"); }
    for (const c of node.childNodes) { const i = importNode(c); if (i) el.append(i); }
    return el;
  }

  function ensureParagraph() {
    if (!visual.firstElementChild && !visual.textContent.trim()) visual.innerHTML = "<p><br></p>";
  }

  async function renderVisual() {
    const md = source.value;
    if (md === renderedFor) return true;
    const mine = ++rendering;
    visual.setAttribute("aria-busy", "true");
    visual.contentEditable = "false";
    try {
      let html = "";
      if (md.trim()) {
        const res = await fetch("/api/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown: md, output: "html" }),
        });
        if (!res.ok) throw await problem(res);
        html = await res.text();
      }
      if (mine !== rendering) return false;
      const body = new DOMParser().parseFromString(html, "text/html").body;
      raw.clear();
      visual.replaceChildren(...[...body.childNodes].map(importNode).filter(Boolean));
      ensureParagraph();
      renderedFor = md;
      clearState();
      return true;
    } catch (e) {
      if (mine === rendering) setStatus(e.message, true);
      return false;
    } finally {
      if (mine === rendering) {
        visual.removeAttribute("aria-busy");
        visual.contentEditable = "true";
      }
    }
  }

  // ---------- The visual editor back to Markdown ----------

  const isBlock = n => n.nodeType === Node.ELEMENT_NODE && (BLOCK_TAGS.has(n.tagName) || n.tagName === "TABLE");
  const isRaw = n => n.nodeType === Node.ELEMENT_NODE && n.dataset.raw;

  function escapeText(s) {
    // Line breaks in text are soft breaks, which read as spaces; hard breaks come from <br>.
    return s.replace(/[\u200b\ufeff]/g, "").replace(/[\u00a0\r\n]/g, " ")
      .replace(/[\\`*[\]<~]/g, "\\$&")
      .replace(/&(?=#?\w+;)/g, "\\&")
      .replace(/(^|[^\p{L}\p{N}])_|_(?=$|[^\p{L}\p{N}])/gu, (m, pre) => (pre ?? "") + "\\_");
  }

  // Text that would start a heading, list, quote or rule at the start of a line is escaped.
  function escapeLineStarts(s) {
    return s.split("\n").map(line => line
      .replace(/^(\s*)(\d{1,9})([.)])(?=\s|$)/, "$1$2\\$3")
      .replace(/^(\s*)(#{1,6}(?=\s|$)|>|[-+](?=\s|$)|-{2,}|=+\s*$)/, "$1\\$2")).join("\n");
  }

  // Leading and trailing spaces go outside the delimiters, or the emphasis would not parse.
  function wrap(s, d) {
    const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
    return m[2] ? m[1] + d + m[2] + d + m[3] : s;
  }

  function codeSpan(text) {
    text = text.replace(/[\u200b\ufeff]/g, "").replace(/\u00a0/g, " ");
    if (!text) return "";
    const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map(r => r.length));
    const fence = "`".repeat(longest + 1);
    const pad = /^`|`$/.test(text) || (/^ /.test(text) && / $/.test(text) && text.trim()) ? " " : "";
    return fence + pad + text + pad + fence;
  }

  function destination(url) {
    return /[\s()<>]/.test(url) ? "<" + url.replace(/[<>]/g, encodeURIComponent) + ">" : url;
  }
  const titlePart = t => t ? ` "${t.replace(/["\\]/g, "\\$&")}"` : "";

  function inline(nodes) {
    let out = "";
    for (const n of nodes) {
      if (n.nodeType === Node.TEXT_NODE) { out += escapeText(n.data); continue; }
      if (n.nodeType === Node.COMMENT_NODE) { out += `<!--${n.data}-->`; continue; }
      if (n.nodeType !== Node.ELEMENT_NODE) continue;
      if (isRaw(n)) { out += raw.get(n.dataset.raw) ?? ""; continue; }
      const inner = () => inline(n.childNodes);
      const style = n.getAttribute("style") ?? "";
      switch (n.tagName) {
        case "BR": out += "\\\n"; break;
        case "STRONG": case "B": out += wrap(inner(), "**"); break;
        case "EM": case "I": out += wrap(inner(), "*"); break;
        case "DEL": case "S": case "STRIKE": out += wrap(inner(), "~~"); break;
        case "CODE": out += codeSpan(n.textContent); break;
        case "A": {
          const href = n.getAttribute("href") ?? "", text = inner();
          out += href && text === escapeText(href) && /^https?:\/\//.test(href) && !/[\s<>]/.test(href)
            ? `<${href}>` : `[${text}](${destination(href)}${titlePart(n.getAttribute("title"))})`;
          break;
        }
        case "IMG": out += `![${escapeText(n.getAttribute("alt") ?? "")}](${destination(n.getAttribute("src") ?? "")}${titlePart(n.getAttribute("title"))})`; break;
        case "INPUT": break;
        default:
          // Pasted or browser-made spans can carry bold or italic as a style.
          if (/font-weight:\s*(bold|[6-9]00)/.test(style)) out += wrap(inner(), "**");
          else if (/font-style:\s*italic/.test(style)) out += wrap(inner(), "*");
          else out += isBlock(n) ? "\\\n" + inner() : inner();
      }
    }
    return out;
  }

  function paragraph(nodes) {
    const text = inline(nodes).replace(/^(\\\n)+|(\\\n)+$/g, "").replace(/^[ \t]+|[ \t]+$/gm, "");
    return escapeLineStarts(text).trim();
  }

  // Plain text with line breaks, for code blocks (browsers add <br> or <div> when you press Enter in one).
  function plainText(el) {
    let out = "";
    const walk = node => {
      for (const n of node.childNodes) {
        if (n.nodeType === Node.TEXT_NODE) out += n.data;
        else if (n.tagName === "BR") out += "\n";
        else if (n.nodeType === Node.ELEMENT_NODE) {
          if (isBlock(n) && out && !out.endsWith("\n")) out += "\n";
          walk(n);
        }
      }
    };
    walk(el);
    return out.replace(/\u00a0/g, " ").replace(/[\u200b\ufeff]/g, "").replace(/\n$/, "");
  }

  function codeBlock(pre) {
    const text = plainText(pre);
    const lang = (pre.querySelector("code")?.className.match(/language-(\S+)/) ?? [])[1] ?? "";
    const longest = Math.max(0, ...(text.match(/^ {0,3}`{3,}/gm) ?? []).map(r => r.trim().length));
    const fence = "`".repeat(Math.max(3, longest + 1));
    return `${fence}${lang}\n${text}\n${fence}`;
  }

  function indent(text, width) {
    const pad = " ".repeat(width);
    return text.split("\n").map((l, i) => i === 0 || !l ? l : pad + l).join("\n");
  }

  function list(el, alternate) {
    const ordered = el.tagName === "OL";
    const start = ordered ? parseInt(el.getAttribute("start") ?? "1", 10) || 1 : 1;
    // Items, with a list nested straight into the list (the browser's Indent does that) joined to the item above it.
    const items = [];
    for (const c of el.children) {
      if (c.tagName === "LI") items.push([...c.childNodes]);
      else if ((c.tagName === "UL" || c.tagName === "OL") && items.length) items[items.length - 1].push(c);
      else items.push([c]);
    }
    const loose = [...el.children].some(li => [...li.children].some(c => c.tagName === "P"));
    const task = el.classList.contains("contains-task-list");
    return items.map((nodes, i) => {
      const box = nodes.find(n => n.tagName === "INPUT");
      let body = blocks(nodes.filter(n => n !== box), loose ? "\n\n" : "\n");
      if (box || task) body = (box?.checked ? "[x] " : "[ ] ") + body;
      const marker = ordered ? `${start + i}${alternate ? ")" : "."} ` : alternate ? "* " : "- ";
      return (marker + indent(body, marker.length)).trimEnd();
    }).join(loose ? "\n\n" : "\n");
  }

  function table(el) {
    const rows = [...el.rows];
    if (!rows.length) return "";
    const width = Math.max(...rows.map(r => r.cells.length));
    const cell = c => c ? inline(c.childNodes).replace(/^(\\\n)+|(\\\n)+$/g, "").replace(/\\\n/g, "<br>").replace(/\|/g, "\\|").trim() : "";
    const line = r => "| " + Array.from({ length: width }, (_, i) => cell(r.cells[i])).join(" | ") + " |";
    const align = Array.from({ length: width }, (_, i) => {
      const c = rows[0].cells[i];
      const a = c?.getAttribute("align") || c?.style.textAlign;
      return a === "left" ? ":---" : a === "right" ? "---:" : a === "center" ? ":---:" : "---";
    });
    return [line(rows[0]), "| " + align.join(" | ") + " |", ...rows.slice(1).map(line)].join("\n");
  }

  function block(el, alternate) {
    if (el.nodeType === Node.COMMENT_NODE) return `<!--${el.data}-->`;
    if (isRaw(el)) return raw.get(el.dataset.raw) ?? "";
    const tag = el.tagName;
    if (/^H[1-6]$/.test(tag)) {
      const text = inline(el.childNodes).replace(/\\\n/g, " ").trim();
      return text ? "#".repeat(+tag[1]) + " " + text : "";
    }
    switch (tag) {
      case "UL": case "OL": return list(el, alternate);
      case "PRE": return codeBlock(el);
      case "TABLE": return table(el);
      case "HR": return "---";
      case "BLOCKQUOTE": {
        const inner = blocks(el.childNodes);
        return inner.split("\n").map(l => l ? "> " + l : ">").join("\n");
      }
      default:
        // P, and the DIVs and other containers a browser or a paste can add.
        return [...el.childNodes].some(isBlock) ? blocks(el.childNodes) : paragraph(el.childNodes);
    }
  }

  // Block nodes become blocks; runs of inline nodes between them become paragraphs.
  function blocks(nodes, joiner = "\n\n") {
    const out = [];
    let run = [], prevList = null, alternate = false;
    const flush = () => {
      if (run.length) { const p = paragraph(run); if (p.trim()) { out.push(p); prevList = null; } }
      run = [];
    };
    for (const n of nodes) {
      if (isBlock(n) || n.nodeType === Node.COMMENT_NODE) {
        flush();
        // Two lists in a row would merge into one, so the second one uses the other bullet.
        const isList = n.tagName === "UL" || n.tagName === "OL";
        alternate = isList && prevList === n.tagName ? !alternate : false;
        const b = block(n, alternate);
        if (b.trim()) { out.push(b); prevList = isList ? n.tagName : null; }
      } else run.push(n);
    }
    flush();
    return out.join(joiner);
  }

  function toMarkdown() {
    const md = blocks(visual.childNodes).replace(/\n{3,}/g, "\n\n").trim();
    return md ? md + "\n" : "";
  }

  function syncFromVisual() {
    normalize();
    const md = toMarkdown();
    source.value = md;
    renderedFor = md;
  }

  // ---------- Editing in visual mode ----------

  const checkbox = () => {
    const box = document.createElement("input");
    box.type = "checkbox";
    box.contentEditable = "false";
    return box;
  };

  // Keeps the structure the serializer expects: new task list items get a checkbox.
  function normalize() {
    for (const ul of visual.querySelectorAll("ul.contains-task-list")) {
      for (const li of ul.children) {
        if (li.tagName !== "LI" || li.querySelector(":scope > input")) continue;
        li.classList.add("task-list-item");
        const sel = getSelection(), here = sel.rangeCount && li.contains(sel.anchorNode) && !li.textContent.trim();
        li.prepend(checkbox());
        if (here) placeCaretAt(li, 1);
      }
    }
    ensureParagraph();
  }

  function selectionIn() {
    const sel = getSelection();
    return sel.rangeCount && visual.contains(sel.anchorNode) ? sel : null;
  }

  function restoreSelection() {
    visual.focus();
    if (savedRange && !selectionIn()) { const sel = getSelection(); sel.removeAllRanges(); sel.addRange(savedRange); }
  }

  const closest = (tag) => {
    const sel = selectionIn();
    if (!sel) return null;
    const n = sel.anchorNode.nodeType === Node.ELEMENT_NODE ? sel.anchorNode : sel.anchorNode.parentElement;
    const found = n?.closest(tag);
    return found && visual.contains(found) ? found : null;
  };

  const exec = (cmd, value) => document.execCommand(cmd, false, value);
  const escHtml = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Block changes are made on the DOM rather than with execCommand, whose lists and quotes differ by browser (Chrome
  // puts a list inside the paragraph it came from, for one); the serializer then always sees clean Markdown structure.

  function placeCaret(el, atEnd) {
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(!atEnd);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }

  function placeCaretAround(el) {
    const r = document.createRange();
    r.selectNode(el);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }

  function placeCaretAt(node, offset) {
    const r = document.createRange();
    r.setStart(node, offset);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }

  const emptyParagraph = () => { const p = document.createElement("p"); p.innerHTML = "<br>"; return p; };
  const isEmpty = el => !el.textContent.replace(/[ ​\s]/g, "") && !el.querySelector("img, .raw, table, hr");

  // The block the selection is in, at the top level of the document; inline content there is wrapped in a paragraph.
  function topBlock() {
    const sel = selectionIn();
    if (!sel) return null;
    let n = sel.anchorNode;
    if (n === visual) n = visual.childNodes[Math.min(sel.anchorOffset, visual.childNodes.length - 1)];
    while (n && n.parentNode !== visual) n = n.parentNode;
    if (n && !isBlock(n)) {
      const p = document.createElement("p");
      n.replaceWith(p);
      p.append(n);
      n = p;
    }
    return n;
  }

  // The line the caret is on: a paragraph, heading, code block or list item.
  function line() {
    const el = closest("pre, li, p, div, h1, h2, h3, h4, h5, h6");
    return el && el !== visual ? el : topBlock();
  }

  // Runs fn, which moves nodes around, and puts the caret back where it was.
  function keepCaret(fn) {
    const sel = getSelection(), node = sel.anchorNode, offset = sel.anchorOffset;
    fn();
    if (node && visual.contains(node)) placeCaretAt(node, offset);
  }

  function makeCodeBlock(text) {
    const pre = document.createElement("pre"), code = document.createElement("code");
    code.textContent = text + "\n"; // the last line needs a newline after it to show when empty; the Markdown drops it
    pre.append(code);
    return pre;
  }

  function setBlock(tag) {
    const el = line();
    if (!el || el.tagName === "LI" || el.tagName === "TABLE" || el.tagName === "HR") return;
    if (el.tagName === "PRE") {
      if (tag === "pre") return;
      // Leaving a code block: one paragraph (or heading) per line.
      const blocksOut = plainText(el).replace(/\n$/, "").split("\n").map(l => {
        const b = document.createElement(tag);
        if (l) b.textContent = l; else b.innerHTML = "<br>";
        return b;
      });
      el.replaceWith(...blocksOut);
      placeCaret(blocksOut[0], true);
      return;
    }
    if (tag === "pre") {
      const text = plainText(el);
      const pre = makeCodeBlock(text);
      el.replaceWith(pre);
      placeCaretAt(pre.firstChild.firstChild, text.length);
      return;
    }
    if (el.tagName === tag.toUpperCase()) return;
    const b = document.createElement(tag);
    keepCaret(() => { el.replaceWith(b); b.append(...el.childNodes); });
    if (!b.firstChild) b.innerHTML = "<br>";
  }

  // A list item back to paragraphs: its text becomes a paragraph, a nested list stays a list.
  function itemToBlocks(li) {
    li.querySelector(":scope > input")?.remove();
    const out = [];
    let p = null;
    for (const n of [...li.childNodes]) {
      if (isBlock(n)) { out.push(n); p = null; continue; }
      if (!p) { p = document.createElement("p"); out.push(p); }
      p.append(n);
    }
    if (!out.length) out.push(emptyParagraph());
    return out;
  }

  const listKind = list => list.tagName === "OL" ? "ol" : list.classList.contains("contains-task-list") ? "task" : "ul";

  function setListKind(list, kind) {
    const tag = kind === "ol" ? "OL" : "UL";
    let target = list;
    if (list.tagName !== tag) {
      target = document.createElement(tag);
      keepCaret(() => { list.replaceWith(target); target.append(...list.childNodes); });
    }
    target.classList.toggle("contains-task-list", kind === "task");
    if (!target.classList.length) target.removeAttribute("class");
    if (kind !== "task") {
      for (const li of target.children) { li.classList.remove("task-list-item"); if (!li.classList.length) li.removeAttribute("class"); li.querySelector(":scope > input")?.remove(); }
    }
  }

  // Bulleted, numbered and task lists: on a paragraph it starts one (joining a list just above), in a list of the same
  // kind it turns the list back into paragraphs, and in another kind of list it changes the kind.
  function toggleList(kind) {
    const li = closest("li");
    if (li) {
      const list = li.parentElement;
      if (listKind(list) === kind) keepCaret(() => list.replaceWith(...[...list.childNodes].flatMap(n => n.tagName === "LI" ? itemToBlocks(n) : [n])));
      else setListKind(list, kind);
      return;
    }
    const el = line();
    if (!el || !/^(P|DIV|H[1-6])$/.test(el.tagName)) return;
    const item = document.createElement("li");
    keepCaret(() => {
      let list = el.previousElementSibling;
      if (!list || !/^(UL|OL)$/.test(list.tagName) || listKind(list) !== kind) {
        list = document.createElement(kind === "ol" ? "ol" : "ul");
        if (kind === "task") list.className = "contains-task-list";
        el.before(list);
      }
      item.append(...el.childNodes);
      el.remove();
      list.append(item);
    });
    if (!item.textContent && !item.querySelector("br")) item.append(document.createElement("br"));
    normalize();
  }

  // Tab nests a list item under the one above it; Shift+Tab moves it back out.
  function indentItem(li, out) {
    const list = li.parentElement;
    if (!out) {
      const prev = li.previousElementSibling;
      if (!prev || prev.tagName !== "LI") return;
      let sub = prev.lastElementChild;
      if (!sub || sub.tagName !== list.tagName) {
        sub = document.createElement(list.tagName);
        if (list.className) sub.className = list.className;
        prev.append(sub);
      }
      keepCaret(() => sub.append(li));
      return;
    }
    const parentLi = list.parentElement;
    if (parentLi.tagName !== "LI") return;
    keepCaret(() => {
      const rest = [...list.children].slice([...list.children].indexOf(li) + 1);
      if (rest.length) {
        const sub = document.createElement(list.tagName);
        if (list.className) sub.className = list.className;
        sub.append(...rest);
        li.append(sub);
      }
      parentLi.after(li);
      if (!list.children.length) list.remove();
    });
  }

  // Quotes hold paragraphs, so Enter makes a new line in the quote; Enter on an empty line leaves it.
  function toggleQuote() {
    const q = closest("blockquote");
    if (q) return keepCaret(() => q.replaceWith(...q.childNodes));
    const top = topBlock();
    if (!top) return;
    keepCaret(() => {
      const quote = document.createElement("blockquote");
      top.replaceWith(quote);
      quote.append(top);
    });
  }

  function exitAfter(el) {
    const p = emptyParagraph();
    el.after(p);
    placeCaret(p);
  }

  // Enter in a code block adds a line; on an empty last line it leaves the block, as it does in an empty last list
  // item or quote line.
  function enter(e) {
    const pre = closest("pre");
    if (pre) {
      e.preventDefault();
      const sel = getSelection();
      if (!sel.isCollapsed) sel.deleteFromDocument();
      const holder = pre.querySelector("code") ?? pre;
      const r = document.createRange();
      r.setStart(holder, 0);
      r.setEnd(sel.anchorNode, sel.anchorOffset);
      const at = r.toString().length, before = holder.textContent.slice(0, at), after = holder.textContent.slice(at);
      if (!after.replace(/\n$/, "") && (before.endsWith("\n") || !before)) {
        holder.textContent = before.replace(/\n$/, "");
        if (holder.textContent) exitAfter(pre);
        else { const p = emptyParagraph(); pre.replaceWith(p); placeCaret(p); }
      } else {
        // A newline at the very end needs a second one to show, which the Markdown drops again.
        holder.textContent = before + "\n" + (after || "\n");
        placeCaretAt(holder.firstChild, at + 1);
      }
      syncFromVisual();
      return;
    }
    const li = closest("li");
    if (li && isEmpty(li) && !li.querySelector("ul, ol")) {
      e.preventDefault();
      const list = li.parentElement;
      if (list.parentElement.tagName === "LI") { indentItem(li, true); syncFromVisual(); return; }
      const after = [...list.children].slice([...list.children].indexOf(li) + 1);
      const p = emptyParagraph();
      list.after(p);
      if (after.length) { const rest = list.cloneNode(false); rest.append(...after); p.after(rest); }
      li.remove();
      if (!list.children.length) list.remove();
      placeCaret(p);
      syncFromVisual();
      return;
    }
    const q = closest("blockquote");
    if (q) {
      const el = closest("p, div, h1, h2, h3, h4, h5, h6");
      if (!el || el.parentElement !== q || !isEmpty(el) || el !== q.lastElementChild) return;
      e.preventDefault();
      el.remove();
      exitAfter(q);
      if (isEmpty(q)) q.remove();
      syncFromVisual();
    }
  }

  function toggleCode() {
    const code = closest("code");
    if (code && !code.closest("pre")) {
      code.replaceWith(document.createTextNode(code.textContent));
      return;
    }
    const text = getSelection().toString() || "code";
    // The zero-width space after the code lets you type on outside it; it is dropped from the Markdown.
    exec("insertHTML", `<code>${escHtml(text)}</code>​`);
  }

  // Tables and rules go after the block you are in, or in place of an empty paragraph.
  function insertBlock(el) {
    const top = topBlock();
    if (!top) visual.append(el);
    else if (top.tagName === "P" && isEmpty(top)) top.replaceWith(el);
    else top.after(el);
    if (!el.nextElementSibling) el.after(emptyParagraph());
  }

  function insertTable() {
    const cell = "<td><br></td>";
    const t = document.createElement("table");
    t.innerHTML = `<thead><tr><th>Column 1</th><th>Column 2</th></tr></thead><tbody><tr>${cell + cell}</tr><tr>${cell + cell}</tr></tbody>`;
    insertBlock(t);
    const r = document.createRange();
    r.selectNodeContents(t.rows[0].cells[0]);
    getSelection().removeAllRanges();
    getSelection().addRange(r);
  }

  function insertRule() {
    const hr = document.createElement("hr");
    insertBlock(hr);
    placeCaret(hr.nextElementSibling);
  }

  function link() {
    const a = closest("a");
    const url = prompt("Link address (leave empty to remove the link)", a?.getAttribute("href") ?? "https://");
    if (url === null) return;
    restoreSelection();
    const u = url.trim();
    if (!u || u === "https://") { if (a) { placeCaretAround(a); exec("unlink"); } return; }
    if (a) { a.setAttribute("href", u); return; }
    if (getSelection().isCollapsed) exec("insertHTML", `<a href="${escHtml(u).replace(/"/g, "&quot;")}">${escHtml(u)}</a>`);
    else exec("createLink", u);
  }

  // Typing Markdown at the start of a line formats it: "# " heading, "- " list, "1. " numbered, "[ ] " task,
  // "> " quote, "``` " code block.
  function autoformat() {
    const sel = selectionIn();
    if (!sel || !sel.isCollapsed || sel.anchorNode.nodeType !== Node.TEXT_NODE) return;
    const p = sel.anchorNode.parentElement;
    if (!p || !/^(P|DIV|H[1-6])$/.test(p.tagName) || p === visual || p.closest("li, pre, td, th")) return;
    if (p.firstChild !== sel.anchorNode) return;
    const before = sel.anchorNode.data.slice(0, sel.anchorOffset).replace(/ /g, " ");
    const m = before.match(/^(#{1,6}|[-*+]|1[.)]|>|\[[ xX]?\]|```) $/);
    if (!m) return;
    sel.anchorNode.deleteData(0, sel.anchorOffset);
    if (!p.textContent) p.innerHTML = "<br>";
    placeCaret(p);
    const k = m[1];
    if (k[0] === "#") setBlock("h" + k.length);
    else if (/^[-*+]$/.test(k)) toggleList("ul");
    else if (/^1/.test(k)) toggleList("ol");
    else if (k === ">") toggleQuote();
    else if (k === "```") setBlock("pre");
    else toggleList("task");
  }

  // Tab moves between table cells (adding a row after the last), and indents list items.
  function tab(e) {
    const c = closest("td, th");
    if (c) {
      e.preventDefault();
      const tableEl = c.closest("table");
      const cells = [...tableEl.querySelectorAll("th, td")];
      let next = cells[cells.indexOf(c) + (e.shiftKey ? -1 : 1)];
      if (!next && !e.shiftKey) {
        const row = (tableEl.tBodies[0] ?? tableEl.createTBody()).insertRow();
        for (let i = 0; i < c.parentElement.cells.length; i++) row.insertCell().innerHTML = "<br>";
        next = row.cells[0];
        syncFromVisual();
      }
      if (next) { const r = document.createRange(); r.selectNodeContents(next); getSelection().removeAllRanges(); getSelection().addRange(r); }
      return;
    }
    const li = closest("li");
    if (li) { e.preventDefault(); indentItem(li, e.shiftKey); syncFromVisual(); }
  }

  // ---------- Editing in Markdown mode ----------

  function sourceChanged() {
    source.focus();
    source.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function wrapSource(before, after, placeholder) {
    const s = source.selectionStart, e = source.selectionEnd;
    const sel = source.value.slice(s, e);
    if (sel.startsWith(before) && sel.endsWith(after) && sel.length >= before.length + after.length) {
      source.setRangeText(sel.slice(before.length, sel.length - after.length), s, e, "select");
    } else if (source.value.slice(s - before.length, s) === before && source.value.slice(e, e + after.length) === after) {
      source.setRangeText(sel, s - before.length, e + after.length, "select");
    } else {
      const text = sel || placeholder;
      source.setRangeText(before + text + after, s, e, "end");
      source.setSelectionRange(s + before.length, s + before.length + text.length);
    }
    sourceChanged();
  }

  // Applies fn to every line the selection touches; prefixes toggle off when every line already has them.
  function prefixSource(fn) {
    const v = source.value;
    const s = v.lastIndexOf("\n", source.selectionStart - 1) + 1;
    let e = v.indexOf("\n", source.selectionEnd - (source.selectionEnd > source.selectionStart && v[source.selectionEnd - 1] === "\n" ? 1 : 0));
    if (e < 0) e = v.length;
    const lines = v.slice(s, e).split("\n");
    source.setRangeText(fn(lines).join("\n"), s, e, "end");
    sourceChanged();
  }

  const togglePrefix = (re, make) => lines => {
    const all = lines.every(l => !l.trim() || re.test(l));
    return lines.map((l, i) => all ? l.replace(re, "") : l.trim() ? make(i) + l.replace(/^(#{1,6} |[-*+] (\[[ xX]\] )?|\d+[.)] |> )/, "") : l);
  };

  function insertSource(text) {
    const s = source.selectionStart, v = source.value;
    const lead = s === 0 || v[s - 1] === "\n" ? (s > 1 && v[s - 2] !== "\n" ? "\n" : "") : "\n\n";
    source.setRangeText(lead + text + "\n", s, source.selectionEnd, "end");
    sourceChanged();
  }

  function blockSource(tag) {
    if (tag === "pre") {
      const s = source.selectionStart, e = source.selectionEnd;
      source.setRangeText("```\n" + (source.value.slice(s, e) || "code") + "\n```", s, e, "end");
      return sourceChanged();
    }
    const n = tag === "p" ? 0 : +tag[1];
    prefixSource(lines => lines.map(l => (n ? "#".repeat(n) + " " : "") + l.replace(/^#{1,6}\s+/, "")));
  }

  function linkSource() {
    const url = prompt("Link address", "https://");
    if (!url || !url.trim()) return;
    const s = source.selectionStart, e = source.selectionEnd;
    const text = source.value.slice(s, e) || "link text";
    source.setRangeText(`[${text}](${destination(url.trim())})`, s, e, "end");
    source.setSelectionRange(s + 1, s + 1 + text.length);
    sourceChanged();
  }

  // ---------- The toolbar ----------

  const actions = {
    bold: () => visualOn ? exec("bold") : wrapSource("**", "**", "bold text"),
    italic: () => visualOn ? exec("italic") : wrapSource("*", "*", "italic text"),
    strike: () => visualOn ? exec("strikeThrough") : wrapSource("~~", "~~", "struck text"),
    code: () => visualOn ? toggleCode() : wrapSource("`", "`", "code"),
    link: () => visualOn ? link() : linkSource(),
    ul: () => visualOn ? toggleList("ul") : prefixSource(togglePrefix(/^[-*+] (?!\[[ xX]\] )/, () => "- ")),
    ol: () => visualOn ? toggleList("ol") : prefixSource(togglePrefix(/^\d+[.)] /, i => `${i + 1}. `)),
    task: () => visualOn ? toggleList("task") : prefixSource(togglePrefix(/^[-*+] \[[ xX]\] /, () => "- [ ] ")),
    quote: () => visualOn ? toggleQuote() : prefixSource(togglePrefix(/^> ?/, () => "> ")),
    table: () => visualOn ? insertTable() : insertSource("| Column 1 | Column 2 |\n| --- | --- |\n|  |  |"),
    hr: () => visualOn ? insertRule() : insertSource("---"),
  };

  function run(name) {
    if (visualOn) restoreSelection();
    actions[name]();
    if (visualOn) syncFromVisual();
    updateState();
  }

  // Buttons keep the editor's selection: they do not take focus on mouse down.
  bar.addEventListener("mousedown", e => { if (e.target.closest("button")) e.preventDefault(); });
  bar.addEventListener("click", e => {
    const b = e.target.closest("button[data-cmd]");
    if (b) run(b.dataset.cmd);
  });
  blockSel.addEventListener("change", () => {
    if (visualOn) { restoreSelection(); setBlock(blockSel.value); syncFromVisual(); }
    else blockSource(blockSel.value);
    updateState();
  });

  function clearState() {
    for (const b of bar.querySelectorAll("button[data-cmd]")) b.removeAttribute("aria-pressed");
    blockSel.value = "p";
  }

  function updateState() {
    if (!visualOn) {
      clearState();
      const v = source.value, s = v.lastIndexOf("\n", source.selectionStart - 1) + 1;
      const h = v.slice(s).match(/^(#{1,6}) /);
      blockSel.value = h ? "h" + Math.min(h[1].length, 4) : "p";
      return;
    }
    if (!selectionIn()) return;
    const state = {
      bold: document.queryCommandState("bold"), italic: document.queryCommandState("italic"),
      strike: document.queryCommandState("strikeThrough"), code: !!closest("code") && !closest("pre"), link: !!closest("a"),
      ul: !!closest("ul") && !closest("ul.contains-task-list"), ol: !!closest("ol"), task: !!closest("ul.contains-task-list"),
      quote: !!closest("blockquote"),
    };
    for (const b of bar.querySelectorAll("button[data-cmd]")) {
      if (b.dataset.cmd in state) b.setAttribute("aria-pressed", state[b.dataset.cmd]);
    }
    const blk = closest("h1, h2, h3, h4, h5, h6, pre");
    blockSel.value = blk ? (blk.tagName === "PRE" ? "pre" : "h" + Math.min(+blk.tagName[1], 4)) : "p";
  }

  document.addEventListener("selectionchange", () => {
    const sel = selectionIn();
    if (sel) savedRange = sel.getRangeAt(0).cloneRange();
    if (sel || document.activeElement === source) updateState();
  });

  // ---------- Visual editor events ----------

  visual.addEventListener("input", e => {
    if (e.inputType === "insertText" && e.data === " ") autoformat();
    syncFromVisual();
  });
  visual.addEventListener("change", e => { if (e.target.type === "checkbox") syncFromVisual(); });
  // Paste as plain text: formatting from other pages would not survive the trip to Markdown anyway.
  visual.addEventListener("paste", e => {
    e.preventDefault();
    exec("insertText", e.clipboardData.getData("text/plain"));
  });
  visual.addEventListener("drop", e => { if (!e.dataTransfer.files.length) e.preventDefault(); });
  visual.addEventListener("keydown", e => {
    const mod = e.ctrlKey || e.metaKey;
    if (e.key === "Enter" && mod) { e.preventDefault(); convert(); return; }
    if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); run("link"); return; }
    if (mod && e.key === "e") { e.preventDefault(); run("code"); return; }
    if (mod && e.shiftKey && e.key.toLowerCase() === "x") { e.preventDefault(); run("strike"); return; }
    // Escape then Tab leaves the editor, so keyboard users are never trapped.
    if (e.key === "Enter" && !e.shiftKey) enter(e);
    if (e.key === "Escape") visual.dataset.tabOut = "1";
    else if (e.key === "Tab" && !visual.dataset.tabOut) tab(e);
  });
  visual.addEventListener("blur", () => { delete visual.dataset.tabOut; });

  source.addEventListener("keydown", e => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod || e.altKey) return;
    const k = e.key.toLowerCase();
    const cmd = k === "b" ? "bold" : k === "i" ? "italic" : k === "k" ? "link" : k === "e" ? "code" : e.shiftKey && k === "x" ? "strike" : null;
    if (cmd) { e.preventDefault(); run(cmd); }
  });
  // Examples and opened files replace the Markdown: show them in the visual editor too.
  source.addEventListener("input", () => { if (visualOn && document.activeElement !== source) renderVisual(); });

  // ---------- Switching modes ----------

  async function setMode(toVisual, remember) {
    if (toVisual && !(await renderVisual())) toVisual = false;
    visualOn = toVisual;
    visual.hidden = !toVisual;
    source.hidden = toVisual;
    for (const b of modeButtons) b.setAttribute("aria-pressed", (b.dataset.editor === "visual") === toVisual);
    bar.setAttribute("aria-controls", toVisual ? "visual" : "source");
    document.querySelector(".skip")?.setAttribute("href", toVisual ? "#visual" : "#source");
    $("editorHint").hidden = !toVisual;
    $("sourceHint").hidden = toVisual;
    if (remember) {
      try { localStorage.setItem("pdfpecker.markdownEditor", toVisual ? "visual" : "markdown"); } catch {}
      (toVisual ? visual : source).focus();
    }
    updateState();
  }

  for (const b of modeButtons) b.addEventListener("click", () => setMode(b.dataset.editor === "visual", true));

  try { exec("defaultParagraphSeparator", "p"); } catch {}
  let start = "visual";
  try { start = localStorage.getItem("pdfpecker.markdownEditor") ?? "visual"; } catch {}
  setMode(start === "visual", false);
})();
