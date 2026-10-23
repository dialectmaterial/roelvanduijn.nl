// Main menu, the same on every page.
const NAV = [['./', 'Home'], ['rusland.html', 'Rusland en Roel'], ['boek.html', 'De aanval op Europa'], ['berichten.html', 'Berichten'],
  ['artikel.html?pagina=11', 'Boeken'], ['archief.html', 'Archief'], ['over.html', 'Over Roel'], ['artikel.html?pagina=595', 'Contact']];
(() => {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const here = location.pathname.split('/').pop() + location.search;
  const page = (here.match(/pagina=(\d+)/) || [])[1];
  // Old-site pages other than Boeken and Contact live under Over Roel.
  const current = href => href === here || (href === './' && (here === '' || here === 'index.html'))
    || (href === 'over.html' && page && !['11', '595'].includes(page));
  for (const [href, label] of NAV) {
    const a = document.createElement('a'); a.href = href; a.textContent = label;
    if (current(href)) a.setAttribute('aria-current', 'page');
    nav.append(a);
  }
})();
