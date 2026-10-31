// The interactive parts of the site. Every page works without this script; it adds searching,
// filtering and remembering where you were in Roel en Rusland. Generated pages say which part
// they need with <body data-page="…">.

// Search helpers: case- and accent-insensitive ('orban' finds 'Orbán').
const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// A theme name inside a sentence: lowercase the first letter, unless it starts with a name (Poetin, Trump, Europa, China).
const inSentence = n => /^(Poetin|Trump|Europa|China)\b/.test(n) ? n : n[0].toLowerCase() + n.slice(1);
const escapeHtml = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const termsOf = q => fold(q).split(/\s+/).filter(w => w.length > 1);
const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const fmtDate = iso => { const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return d + ' ' + MONTHS[m - 1] + ' ' + y; };

// A short passage around the first match, with every term marked.
function snippet(text, terms, width = 110) {
  text = text.replace(/\s+/g, ' ');
  const folded = fold(text);
  const found = terms.map(w => folded.indexOf(w)).filter(i => i >= 0);
  if (!found.length) return escapeHtml(text.slice(0, width * 1.6)) + (text.length > width * 1.6 ? '…' : '');
  const at = Math.min(...found);
  let start = Math.max(0, at - width / 2), end = Math.min(text.length, at + width * 1.4);
  if (start > 0) { const sp = text.indexOf(' ', start); if (sp >= 0 && sp < at) start = sp + 1; }
  if (end < text.length) { const sp = text.lastIndexOf(' ', end); if (sp > at) end = sp; }
  const f = folded.slice(start, end), hits = [];
  for (const w of terms) for (let j = f.indexOf(w); j >= 0; j = f.indexOf(w, j + 1)) hits.push([start + j, start + j + w.length]);
  hits.sort((a, b) => a[0] - b[0]);
  let out = '', i = start;
  for (const [a, b] of hits) { if (a < i) continue; out += escapeHtml(text.slice(i, a)) + '<mark>' + escapeHtml(text.slice(a, b)) + '</mark>'; i = b; }
  out += escapeHtml(text.slice(i, end));
  return (start > 0 ? '…' : '') + out.trim() + (end < text.length ? '…' : '');
}

const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
                set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
const page = document.body.dataset.page;

// A column page: remember it for "Verder lezen".
if (page === 'column') {
  const n = document.querySelector('article[data-col]')?.dataset.col;
  if (n) store.set('rr-last', n);
}

// Roel en Rusland: themes, search and Begin hier.
if (page === 'series') {
  const q = document.getElementById('q'), list = document.getElementById('list');
  const items = [...list.querySelectorAll('a.item')];
  const buttons = [...document.querySelectorAll('#themes button')];
  const names = Object.fromEntries(buttons.map(b => [b.dataset.theme, b.querySelector('span').textContent]));
  const params = new URLSearchParams(location.search);
  let theme = names[params.get('thema')] && params.get('thema') ? params.get('thema') : '', texts = null;
  q.value = params.get('q') || '';
  for (const it of items) it.dataset.excerpt = it.querySelector('p')?.innerHTML || '';

  // Continue reading where you left off (kept in this browser only).
  const last = store.get('rr-last'), lastItem = last && items.find(it => it.dataset.no === last);
  if (lastItem) {
    const a = document.createElement('a'); a.href = lastItem.getAttribute('href'); a.textContent = 'Verder lezen bij aflevering ' + last;
    document.getElementById('read-actions').prepend(a, ' ');
  }

  async function update() {
    const terms = termsOf(q.value);
    if (terms.length && !texts) texts = await fetch('/data/rr-text.json').then(r => r.json());
    let shown = 0;
    for (const it of items) {
      const ok = (!theme || it.dataset.themes.split(' ').includes(theme)) && (!terms.length || terms.every(w => fold(texts[it.dataset.no]).includes(w)));
      it.hidden = !ok;
      if (ok) shown++;
      const p = it.querySelector('p');
      if (p) p.innerHTML = ok && terms.length ? snippet(texts[it.dataset.no], terms) : it.dataset.excerpt;
    }
    buttons.forEach(b => b.setAttribute('aria-pressed', b.dataset.theme === theme));
    document.querySelectorAll('.theme-desc').forEach(d => { d.hidden = d.dataset.for !== theme; });
    document.querySelectorAll('.start-list').forEach(d => { d.hidden = d.dataset.for !== theme; });
    document.getElementById('start').hidden = terms.length > 0 || !document.querySelector(`.start-list[data-for="${theme}"]`);
    document.getElementById('start-intro').textContent = theme ? 'Drie afleveringen om mee te beginnen over ' + inSentence(names[theme]) + '.' : 'Drie afleveringen om mee te beginnen.';
    const what = shown === 1 ? '1 aflevering' : shown + ' afleveringen';
    const with_ = terms.length ? ' met ‘' + q.value.trim() + '’' : '';
    document.getElementById('count').textContent = shown ? what + with_ + (theme ? ' over ' + inSentence(names[theme]) : '')
      : 'Geen afleveringen gevonden' + with_ + '. Probeer een ander woord' + (theme ? ' of kies alle thema\'s.' : '.');
    const url = new URLSearchParams();
    if (q.value.trim()) url.set('q', q.value.trim());
    if (theme) url.set('thema', theme);
    history.replaceState(null, '', url.toString() ? '?' + url : location.pathname);
  }
  buttons.forEach(b => b.addEventListener('click', () => { theme = theme === b.dataset.theme ? '' : b.dataset.theme; update(); }));
  let timer;
  q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(update, 150); });
  if (q.value || theme) update();
}

// Berichten: filter by kind.
if (page === 'posts') {
  const buttons = [...document.querySelectorAll('.filters button')];
  const show = f => {
    if (!buttons.some(b => b.dataset.f === f)) f = 'alles';
    buttons.forEach(b => b.setAttribute('aria-pressed', b.dataset.f === f));
    const years = new Set();
    for (const it of document.querySelectorAll('#list a.item')) {
      it.hidden = f !== 'alles' && it.dataset.kind !== f;
      if (!it.hidden) years.add(it.dataset.year);
    }
    document.querySelectorAll('#list .year').forEach(h => { h.hidden = !years.has(h.dataset.year); });
  };
  buttons.forEach(b => b.addEventListener('click', () => { history.replaceState(null, '', '#' + b.dataset.f); show(b.dataset.f); }));
  show(location.hash.slice(1));
}

// People: open the person named in the address (#zjenja).
if (page === 'people' && location.hash) {
  const d = document.getElementById(location.hash.slice(1));
  if (d && d.tagName === 'DETAILS') { d.open = true; d.scrollIntoView(); }
}

// Search the whole site.
if (page === 'search') {
  const KINDS = [['Roel en Rusland', 'Roel en Rusland'], ['Bericht', 'Berichten'], ['Archief', 'Archief'], ['Liefdesverdriet', 'Liefdesverdriet'], ['Boek', 'Boeken'], ['In de pers', 'In de pers'], ['Pagina', "Pagina's"]];
  const q = document.getElementById('q'), kindsBox = document.getElementById('kinds'), list = document.getElementById('list'), more = document.getElementById('more');
  let items = [], kind = '', shown = 30, timer;
  q.value = new URLSearchParams(location.search).get('q') || '';
  const results = terms => {
    if (!terms.length) return [];
    const out = [];
    for (const it of items) {
      if (!terms.every(w => it.f.includes(w))) continue;
      let score = 0;
      for (const w of terms) { if (it.ft.includes(w)) score += 10; score += Math.min(5, it.f.split(w).length - 1); }
      out.push([score, it]);
    }
    return out.sort((a, b) => b[0] - a[0] || (b[1].d || '').localeCompare(a[1].d || '')).map(x => x[1]);
  };
  function update() {
    const terms = termsOf(q.value), all = results(terms);
    kindsBox.replaceChildren();
    if (terms.length) {
      const add = (k, label, n) => {
        if (k && !n) return;
        const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', k === kind);
        b.innerHTML = '<span></span> <small></small>';
        b.querySelector('span').textContent = label; b.querySelector('small').textContent = n;
        b.addEventListener('click', () => { kind = k; shown = 30; update(); });
        kindsBox.append(b);
      };
      add('', 'Alles', all.length);
      for (const [k, label] of KINDS) add(k, label, all.filter(it => it.k === k).length);
    }
    const found = kind ? all.filter(it => it.k === kind) : all;
    document.getElementById('count').textContent = !terms.length ? 'Typ een of meer woorden.'
      : found.length ? found.length + (found.length === 1 ? ' resultaat' : ' resultaten') + ' voor ‘' + q.value.trim() + '’'
      : 'Niets gevonden voor ‘' + q.value.trim() + '’. Probeer een ander of korter woord.';
    list.replaceChildren();
    for (const it of found.slice(0, shown)) {
      const a = document.createElement('a'); a.className = 'item plain hit'; a.href = it.u;
      a.innerHTML = '<span class="series"></span><h3></h3><p></p>';
      a.querySelector('.series').textContent = [it.k, it.d && fmtDate(it.d)].filter(Boolean).join(', ');
      a.querySelector('h3').textContent = it.t;
      a.querySelector('p').innerHTML = snippet(it.x, terms);
      list.append(a);
    }
    more.hidden = found.length <= shown;
    history.replaceState(null, '', q.value.trim() ? '?q=' + encodeURIComponent(q.value.trim()) : location.pathname);
  }
  q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { shown = 30; kind = ''; update(); }, 150); });
  more.addEventListener('click', () => { shown += 30; update(); });
  document.getElementById('count').textContent = 'De zoekindex wordt geladen…';
  fetch('/data/search.json').then(r => r.json()).then(data => {
    items = data.map(it => ({ ...it, f: fold(it.t + ' ' + it.x), ft: fold(it.t) }));
    update();
  });
}

// Links to the old WordPress site arrive at the home page: ?p=123, ?page_id=12, ?m=…, ?cat=…, ?s=…
if (page === 'home' && location.search) {
  const q = new URLSearchParams(location.search), id = q.get('p') || q.get('page_id');
  if (id) fetch('/data/redirects.json').then(r => r.json()).then(map => {
    const to = map[(q.has('page_id') ? 'pagina:' : 'id:') + id] || map['pagina:' + id];
    location.replace(to || '/archief/');
  });
  else if (q.has('s')) location.replace('/zoeken/?q=' + encodeURIComponent(q.get('s')));
  else if (q.has('m') || q.has('cat')) location.replace('/archief/');
}

// Phone menu: fold the menu away behind a button on narrow screens.
(() => {
  const btn = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  if (!btn || !nav) return;
  document.documentElement.classList.add('js');
  btn.hidden = false;
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', open);
    nav.classList.toggle('open', open);
    btn.textContent = open ? 'Sluiten' : 'Menu';
  });
})();
