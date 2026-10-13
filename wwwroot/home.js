// The home page: copy buttons, the code tabs and a small C# highlighter.
for (const b of document.querySelectorAll("button.copy")) {
  b.addEventListener("click", async () => {
    try {
      // Install buttons say what to copy; code buttons copy the code next to them.
      await navigator.clipboard.writeText(b.dataset.copy ?? b.parentElement.querySelector("code").textContent);
      b.textContent = "Copied!";
    } catch {
      b.textContent = "Select and copy";
    }
    setTimeout(() => { b.textContent = "Copy"; }, 1600);
  });
}

const tabs = [...document.querySelectorAll("[role=tab]")];
function select(tab) {
  for (const t of tabs) {
    const on = t === tab;
    t.setAttribute("aria-selected", on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  }
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => select(t));
  t.addEventListener("keydown", e => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    const next = tabs[(i + step + tabs.length) % tabs.length];
    select(next);
    next.focus();
  });
});

// Comments, strings, keywords, type names and numbers, in that order of precedence.
const keywords = "using|var|new|await|byte|string|float|int|bool|true|false|null|return";
const token = new RegExp(String.raw`(//[^\n]*)|("(?:[^"\\\n]|\\.)*")|\b(${keywords})\b|\b([A-Z][A-Za-z0-9]*)\b|\b(\d+(?:\.\d+)?f?)\b`, "g");
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
for (const code of document.querySelectorAll("code.cs")) {
  const text = code.textContent;
  let html = "", last = 0;
  for (const m of text.matchAll(token)) {
    html += esc(text.slice(last, m.index));
    const cls = m[1] ? "c" : m[2] ? "s" : m[3] ? "k" : m[4] ? "t" : "n";
    html += `<span class="${cls}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  code.innerHTML = html + esc(text.slice(last));
}
