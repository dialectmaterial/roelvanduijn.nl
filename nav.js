// Menu built from the imported WordPress pages, in a sensible order.
const NAV_ORDER = ['Biografie', 'Boeken', 'Publicaties', 'Politiek', 'Films – Documentaires – Uitzendingen', 'Chopin', 'Diepvriesfiguur', 'Familie', 'Werkstukken studenten', 'Links', 'English Page', 'Contact'];
fetch('pages.json').then(r => r.json()).then(pages => {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const rank = p => { const i = NAV_ORDER.indexOf(p.title); return i < 0 ? 99 : i; };
  const links = [['./', 'Home'], ['berichten.html', 'Berichten'], ['archief.html', 'Archief'],...pages.filter(p => p.title !== 'Frédéric Chopin 200 jaar geleden geboren')
    .sort((a, b) => rank(a) - rank(b)).map(p => ['artikel.html?pagina=' + p.id, p.title.replace(' – Documentaires – Uitzendingen', '')])];
  for (const [href, label] of links) {
    const a = document.createElement('a'); a.href = href; a.textContent = label;
    const here = location.pathname.split('/').pop() + location.search;
    if (href === here || (href === './' && (here === '' || here === 'index.html'))) a.setAttribute('aria-current', 'page');
    nav.append(a);
  }
});
