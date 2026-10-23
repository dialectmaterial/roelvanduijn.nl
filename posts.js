// Facebook posts (posts.json): shared helpers for the lists on the home page,
// berichten.html, rusland.html and boek.html.
const fmtDate = d => new Date(d).toLocaleDateString('nl-NL', { day:'numeric', month:'long', year:'numeric' });
const BOOK = /aanval op europa|eurotariaat/i;

const seriesNo = p => p.series ? Number(p.series.match(/\d+/)[0]) : null;
const isBook = p => BOOK.test((p.title || '') + ' ' + (p.subtitle || '') + ' ' + p.text);
const loadPosts = () => fetch('posts.json?v=5').then(r => r.json());

function postTitle(p) {
  if (p.title) return p.title;
  const words = p.text.replace(/\s+/g, ' ').trim().split(' ');
  return words.slice(0, 10).join(' ') + (words.length > 10 ? '…' : '');
}

function excerpt(p, n = 170) {
  const t = ((p.subtitle ? p.subtitle + '. ' : '') + (p.title ? p.text : p.text.split(/\s+/).slice(10).join(' '))).replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n).replace(/\s\S*$/, '') + '…' : t;
}

// One row in a list. With numbered: true, a series column shows its number instead of the date.
function postCard(p, { numbered = false } = {}) {
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
  const text = excerpt(p);
  if (text) { const e = document.createElement('p'); e.textContent = text; a.append(e); }
  if (p.images.length) {
    const s = document.createElement('span'); s.className = 'print';
    const i = document.createElement('img'); i.src = p.images[0].src; i.alt = ''; i.loading = 'lazy';
    s.append(i); a.append(s);
  }
  return a;
}

function renderPosts(el, posts, { byYear = false, numbered = false } = {}) {
  el.replaceChildren();
  let year;
  for (const p of posts) {
    const y = p.date.slice(0, 4);
    if (byYear && y !== year) {
      const h = document.createElement('h3'); h.className = 'year'; h.textContent = year = y; el.append(h);
    }
    el.append(postCard(p, { numbered }));
  }
}
