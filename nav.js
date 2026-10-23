// Main menu, the same on every page.
const NAV = [['rusland.html', 'Rusland en Roel'], ['boek.html', 'De aanval op Europa'], ['berichten.html', 'Berichten'],
  ['boeken.html', 'Boeken'], ['liefdesverdriet.html', 'Liefdesverdriet'], ['archief.html', 'Archief'], ['over.html', 'Over Roel'], ['artikel.html?pagina=595', 'Contact'], ['zoeken.html', 'Zoeken']];
(() => {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const here = location.pathname.split('/').pop() + location.search;
  const file = location.pathname.split('/').pop();
  const page = (here.match(/pagina=(\d+)/) || [])[1];
  // Old-site pages other than Contact live under Over Roel (the old Boeken page is replaced by boeken.html).
  const current = href => href === here || (href === './' && (here === '' || here === 'index.html'))
    || (href === 'over.html' && page && page !== '595' && file === 'artikel.html') || (href === 'liefdesverdriet.html' && file === href);
  for (const [href, label] of NAV) {
    const a = document.createElement('a'); a.href = href; a.textContent = label;
    if (current(href)) a.setAttribute('aria-current', 'page');
    nav.append(a);
  }
})();
