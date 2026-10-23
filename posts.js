// Facebook posts (posts.json): shared helpers for the lists on the home page,
// berichten.html, rusland.html and boek.html.
const fmtDate = d => new Date(d).toLocaleDateString('nl-NL', { day:'numeric', month:'long', year:'numeric' });
const BOOK = /aanval op europa|eurotariaat/i;
const DATA_V = '11';  // bump when posts.json or themes.json change

const seriesNo = p => p.series ? Number(p.series.match(/\d+/)[0]) : null;
const isBook = p => BOOK.test((p.title || '') + ' ' + (p.subtitle || '') + ' ' + p.text);
const loadPosts = () => fetch('posts.json?v=' + DATA_V).then(r => r.json());

function postTitle(p) {
  if (p.title) return p.title;
  const words = p.text.replace(/\s+/g, ' ').trim().split(' ');
  return words.slice(0, 10).join(' ') + (words.length > 10 ? '…' : '');
}

function excerpt(p, n = 170) {
  const t = ((p.subtitle ? p.subtitle + '. ' : '') + (p.title ? p.text : p.text.split(/\s+/).slice(10).join(' '))).replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n).replace(/\s\S*$/, '') + '…' : t;
}

// Search helpers: case- and accent-insensitive ('orban' finds 'Orbán').
const fold = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const escapeHtml = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const searchText = p => [p.title, p.subtitle, p.text].filter(Boolean).join('\n');
const matches = (p, terms) => { const t = fold(searchText(p)); return terms.every(w => t.includes(w)); };

// A short passage around the first match, with every term marked.
function snippet(p, terms, width = 110) {
  const text = searchText(p).replace(/\s+/g, ' '), folded = fold(text);
  const at = Math.min(...terms.map(w => folded.indexOf(w)).filter(i => i >= 0));
  let start = Math.max(0, at - width / 2), end = Math.min(text.length, at + width * 1.4);
  if (start > 0) { const sp = text.indexOf(' ', start); if (sp >= 0 && sp < at) start = sp + 1; }  // begin at a whole word
  if (end < text.length) { const sp = text.lastIndexOf(' ', end); if (sp > at) end = sp; }
  let out = '', i = start;
  const f = folded.slice(start, end);
  const hits = [];
  for (const w of terms) for (let j = f.indexOf(w); j >= 0; j = f.indexOf(w, j + 1)) hits.push([start + j, start + j + w.length]);
  hits.sort((a, b) => a[0] - b[0]);
  for (const [a, b] of hits) { if (a < i) continue; out += escapeHtml(text.slice(i, a)) + '<mark>' + escapeHtml(text.slice(a, b)) + '</mark>'; i = b; }
  out += escapeHtml(text.slice(i, end));
  return (start > 0 ? '…' : '') + out.trim() + (end < text.length ? '…' : '');
}

// One row in a list. With numbered: true, a series column shows its number instead of the date.
// terms: search words to show a marked passage instead of the opening; themes: slug -> name.
function postCard(p, { numbered = false, terms = null, themes = null } = {}) {
  const a = document.createElement('a');
  a.className = 'item' + (p.images.length ? ' post-item' : '') + (numbered ? ' numbered' : '');
  a.href = 'artikel.html?bericht=' + p.id;
  if (numbered) {
    const n = document.createElement('span'); n.className = 'no'; n.textContent = seriesNo(p); a.append(n);
  } else {
    const t = document.createElement('time'); t.textContent = fmtDate(p.date); a.append(t);
  }
  const h = document.createElement('h3'); h.textContent = postTitle(p); a.append(h);
  if (numbered) {
    const t = document.createElement('span'); t.className = 'series'; t.textContent = fmtDate(p.date); a.append(t);
  } else if (p.series) {
    const s = document.createElement('span'); s.className = 'series'; s.textContent = p.series; a.append(s);
  }
  if (themes && p.themes && p.themes.length) {
    const t = document.createElement('span'); t.className = 'tags';
    t.textContent = p.themes.map(s => themes[s]).join(', ');
    a.append(t);
  }
  if (terms && terms.length) {
    const e = document.createElement('p'); e.innerHTML = snippet(p, terms); a.append(e);
  } else {
    const text = excerpt(p);
    if (text) { const e = document.createElement('p'); e.textContent = text; a.append(e); }
  }
  if (p.images.length) {
    const s = document.createElement('span'); s.className = 'print';
    const i = document.createElement('img'); i.src = p.images[0].src; i.alt = ''; i.loading = 'lazy';
    s.append(i); a.append(s);
  }
  return a;
}

function renderPosts(el, posts, { byYear = false, numbered = false, terms = null, themes = null } = {}) {
  el.replaceChildren();
  let year;
  for (const p of posts) {
    const y = p.date.slice(0, 4);
    if (byYear && y !== year) {
      const h = document.createElement('h3'); h.className = 'year'; h.textContent = year = y; el.append(h);
    }
    el.append(postCard(p, { numbered, terms, themes }));
  }
}

// Press coverage (press.json): interviews, reviews and podcasts about Roel.
const loadPress = () => fetch('press.json?v=' + DATA_V).then(r => r.json());
function renderPress(el, items) {
  el.replaceChildren();
  for (const p of items) {
    const a = document.createElement('a');
    a.className = 'item press'; a.href = p.url; a.rel = 'noopener';
    a.innerHTML = '<time></time><h3></h3><span class="series"></span><p></p>';
    a.querySelector('time').textContent = fmtDate(p.date);
    a.querySelector('h3').textContent = p.title;
    a.querySelector('.series').textContent = p.kind + (p.kind === 'Podcast' ? ' bij ' : ' in ') + p.outlet + (p.by ? ', door ' + p.by : '');
    a.querySelector('p').textContent = p.note;
    el.append(a);
  }
}
