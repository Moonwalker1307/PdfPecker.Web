// On phones the header links sit behind a menu button, because they no longer fit on one row.
// Without this script the button stays hidden and the links remain a row that scrolls sideways.
(() => {
  const header = document.querySelector('.site-header');
  const button = header && header.querySelector('.menu-toggle');
  if (!button) return;
  header.classList.add('has-menu');
  const setOpen = open => {
    header.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
  };
  button.addEventListener('click', () => setOpen(!header.classList.contains('open')));
  document.addEventListener('click', e => { if (!header.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && header.classList.contains('open')) { setOpen(false); button.focus(); }
  });
})();
