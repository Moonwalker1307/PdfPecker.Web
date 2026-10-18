// Search for the docs pages. The site is static, so the index (wwwroot/docs/search.json, written by
// tools/DocsBuilder) is fetched on first use and searched here: every word typed must appear in a section, and
// matches in page titles and headings rank above matches in the text.
(function () {
  var input = document.getElementById('docs-q');
  var list = document.getElementById('docs-results');
  if (!input || !list) return;
  var form = input.form;
  var index = null, loading = null, results = [], active = -1;

  function load() {
    if (!loading) {
      loading = fetch(form.getAttribute('data-index') || '/docs/search.json')
        .then(function (r) { return r.json(); })
        .then(function (entries) {
          index = entries.map(function (e) {
            return { e: e, title: (e.p + ' ' + e.h).toLowerCase(), text: e.x.toLowerCase() };
          });
        })
        .catch(function () { loading = null; });
    }
    return loading;
  }

  function search(query) {
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length || !index) return [];
    var found = [];
    index.forEach(function (item) {
      var score = 0;
      for (var i = 0; i < words.length; i++) {
        var w = words[i];
        var inTitle = item.title.indexOf(w) >= 0;
        var inText = item.text.indexOf(w) >= 0;
        if (!inTitle && !inText) return;
        score += inTitle ? 10 : 1;
        if (inText) score += Math.min(3, count(item.text, w)) / 3;
      }
      found.push({ item: item, score: score });
    });
    found.sort(function (a, b) { return b.score - a.score; });
    return found.slice(0, 8).map(function (f) { return f.item.e; });
  }

  function count(text, word) {
    var n = 0, at = text.indexOf(word);
    while (at >= 0 && n < 3) { n++; at = text.indexOf(word, at + word.length); }
    return n;
  }

  // A short piece of the text around the first word found, with the words marked.
  function snippet(text, words) {
    var lower = text.toLowerCase(), at = -1;
    for (var i = 0; i < words.length && at < 0; i++) at = lower.indexOf(words[i]);
    var start = Math.max(0, at - 50);
    var piece = (start > 0 ? '…' : '') + text.slice(start, start + 150) + (start + 150 < text.length ? '…' : '');
    return mark(piece, words);
  }

  function mark(text, words) {
    var frag = document.createDocumentFragment();
    var pattern = new RegExp('(' + words.map(escape).join('|') + ')', 'gi');
    text.split(pattern).forEach(function (part, i) {
      if (i % 2) { var m = document.createElement('mark'); m.textContent = part; frag.appendChild(m); }
      else if (part) frag.appendChild(document.createTextNode(part));
    });
    return frag;
  }

  function escape(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function render() {
    var query = input.value.trim();
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    results = search(query);
    active = -1;
    list.textContent = '';
    if (!query) { close(); return; }
    if (!results.length) {
      var empty = document.createElement('li');
      empty.className = 'empty-result';
      empty.textContent = index ? 'Nothing found for “' + query + '”.' : 'Loading…';
      list.appendChild(empty);
    }
    results.forEach(function (e, i) {
      var li = document.createElement('li');
      li.id = 'docs-r' + i;
      li.setAttribute('role', 'option');
      var a = document.createElement('a');
      a.href = e.u;
      var title = document.createElement('b');
      title.appendChild(mark(e.h ? e.p + ' › ' + e.h : e.p, words));
      var text = document.createElement('span');
      text.appendChild(snippet(e.x, words));
      a.appendChild(title);
      a.appendChild(text);
      li.appendChild(a);
      list.appendChild(li);
    });
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function close() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  function highlight(i) {
    var items = list.querySelectorAll('[role=option]');
    if (!items.length) return;
    active = (i + items.length) % items.length;
    items.forEach(function (el, n) { el.classList.toggle('active', n === active); });
    input.setAttribute('aria-activedescendant', items[active].id);
    items[active].scrollIntoView({ block: 'nearest' });
  }

  input.addEventListener('focus', load);
  input.addEventListener('input', function () {
    if (index) render(); else load().then(render);
  });
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); highlight(active + 1); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); highlight(active - 1); }
    else if (ev.key === 'Escape') { input.value = ''; close(); }
  });
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var pick = results[active >= 0 ? active : 0];
    if (pick) location.href = pick.u;
  });
  document.addEventListener('keydown', function (ev) {
    var tag = (ev.target.tagName || '').toLowerCase();
    if (ev.key === '/' && tag !== 'input' && tag !== 'textarea' && !ev.ctrlKey && !ev.metaKey) {
      ev.preventDefault();
      input.focus();
    }
  });
  document.addEventListener('click', function (ev) {
    if (!form.contains(ev.target)) close();
  });
})();

// The version picker: choosing a version opens the same page in that version's manual, or its first page when that
// manual has no such page. The Download PDF link on each page already points at that page's manual.
(function () {
  var select = document.getElementById('docs-version');
  if (!select) return;
  select.addEventListener('change', function () {
    var option = select.options[select.selectedIndex];
    var slug = select.getAttribute('data-slug') || '';
    var pages = (option.getAttribute('data-pages') || '').split(' ');
    // Only a manual on this site is opened: the value must be /docs/ or /docs/v1.2.3/, and the address is rebuilt from
    // a fixed /docs/ prefix with each part URI-encoded, so nothing read from the page can become a javascript: link.
    var match = /^\/docs\/(?:(v\d+\.\d+\.\d+)\/)?$/.exec(option.value);
    if (!match) return;
    var href = '/docs/' + (match[1] ? encodeURIComponent(match[1]) + '/' : '');
    if (slug && pages.indexOf(slug) >= 0) href += encodeURIComponent(slug) + '/';
    location.href = href;
  });
})();
