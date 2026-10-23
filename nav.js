// Main menu: the pages people look for most. Everything else is on meer.html.
const NAV = [['./', 'Home'], ['berichten.html', 'Berichten'], ['archief.html', 'Archief'],
  ['artikel.html?pagina=2', 'Biografie'], ['artikel.html?pagina=11', 'Boeken'], ['artikel.html?pagina=595', 'Contact'], ['meer.html', 'Meer']];
const MAIN_PAGES = [2, 11, 595];
(() => {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const here = location.pathname.split('/').pop() + location.search;
  const inMore = /pagina=(\d+)/.test(here) && !MAIN_PAGES.includes(Number(here.match(/pagina=(\d+)/)[1]));
  for (const [href, label] of NAV) {
    const a = document.createElement('a'); a.href = href; a.textContent = label;
    if (href === here || (href === './' && (here === '' || here === 'index.html')) || (href === 'meer.html' && inMore)) a.setAttribute('aria-current', 'page');
    nav.append(a);
  }
})();
