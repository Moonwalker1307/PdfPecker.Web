// Status filters for the docs pages whose tables mark each row (the CSS support page): one toggle per mark, all on at
// first. Rows of a mark that is off are hidden, and so are tables left with no rows and the headings above them. The
// bar is built here rather than in the page, so a browser without scripts shows every row and no buttons that do
// nothing.
(function () {
  var article = document.querySelector('article[data-mark-filter]');
  if (!article) return;
  var marks = [
    { key: 'y', label: 'Yes', symbol: '✓' },
    { key: 'p', label: 'Partly', symbol: '½' },
    { key: 'n', label: 'No', symbol: '✕' },
    { key: 'x', label: 'No effect', symbol: '–' }
  ];
  var rows = [];
  article.querySelectorAll('tr').forEach(function (tr) {
    var cell = tr.querySelector('td.mark');
    if (!cell) return;
    for (var i = 0; i < marks.length; i++) {
      if (cell.classList.contains(marks[i].key)) { rows.push({ tr: tr, key: marks[i].key }); return; }
    }
  });
  if (!rows.length) return;
  var counts = {};
  rows.forEach(function (r) { counts[r.key] = (counts[r.key] || 0) + 1; });
  marks = marks.filter(function (m) { return counts[m.key]; });

  var shown = {};
  var bar = document.createElement('div');
  bar.className = 'mark-filter';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Show rows marked');
  var label = document.createElement('span');
  label.className = 'mark-filter-label';
  label.textContent = 'Show';
  label.setAttribute('aria-hidden', 'true');
  bar.appendChild(label);
  var buttons = marks.map(function (m) {
    shown[m.key] = true;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'mark-toggle ' + m.key;
    b.setAttribute('aria-pressed', 'true');
    b.innerHTML = '<b aria-hidden="true"></b><span></span><small></small>';
    b.children[0].textContent = m.symbol;
    b.children[1].textContent = m.label;
    b.children[2].textContent = counts[m.key];
    b.addEventListener('click', function () {
      shown[m.key] = !shown[m.key];
      b.setAttribute('aria-pressed', String(shown[m.key]));
      apply();
    });
    bar.appendChild(b);
    return b;
  });
  var status = document.createElement('span');
  status.className = 'mark-filter-status';
  status.setAttribute('aria-live', 'polite');
  bar.appendChild(status);
  var empty = document.createElement('p');
  empty.className = 'mark-filter-empty';
  empty.textContent = 'Turn on a status above to see its rows.';
  empty.hidden = true;

  // The bar goes before the first heading, so the introduction above it still reads as the page's opening.
  var first = article.querySelector('h2');
  article.insertBefore(bar, first);
  article.insertBefore(empty, first);

  // The bar sticks under the site header, whose height changes with the width of the window, when nav.js folds the
  // links into the menu button (after this script has run) and when the menu opens.
  var header = document.querySelector('.site-header');
  function place() {
    if (header) document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
  }
  place();
  if (header && window.ResizeObserver) new ResizeObserver(place).observe(header);
  else window.addEventListener('resize', place);

  function apply() {
    var visible = 0;
    rows.forEach(function (r) {
      r.tr.hidden = !shown[r.key];
      if (shown[r.key]) visible++;
    });
    // A heading stays while anything under it, up to the next heading of its level or higher, is still shown.
    var blocks = article.querySelectorAll('.table-scroll');
    blocks.forEach(function (block) {
      var table = block.querySelector('table');
      var marked = table && table.querySelector('td.mark');
      block.hidden = !!marked && !table.querySelector('tbody tr:not([hidden])');
    });
    article.querySelectorAll('h2, h3').forEach(function (h) {
      var level = h.tagName;
      var any = false, el = h.nextElementSibling;
      for (; el && !(el.tagName === 'H2' || (level === 'H3' && el.tagName === 'H3')); el = el.nextElementSibling) {
        if (el.tagName === 'H3' || el.classList.contains('mark-filter') || el.classList.contains('mark-filter-empty')) continue;
        if (!el.hidden) { any = true; break; }
      }
      h.hidden = !any;
    });
    var all = visible === rows.length;
    status.textContent = all ? '' : visible + ' of ' + rows.length + ' rows';
    empty.hidden = visible > 0;
  }

  // A link or a search result that points at a hidden heading turns every filter back on, so it lands somewhere.
  function reveal() {
    var id = decodeURIComponent(location.hash.slice(1));
    var target = id && document.getElementById(id);
    if (target && target.closest('article') === article && target.hidden) {
      marks.forEach(function (m, i) { shown[m.key] = true; buttons[i].setAttribute('aria-pressed', 'true'); });
      apply();
      target.scrollIntoView();
    }
  }
  window.addEventListener('hashchange', reveal);
  apply();
})();
