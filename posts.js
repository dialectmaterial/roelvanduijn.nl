// Facebook posts (posts.json): the list on the home page and on berichten.html.
const fmtDate = d => new Date(d).toLocaleDateString('nl-NL', { day:'numeric', month:'long', year:'numeric' });

function postTitle(p) {
  if (p.title) return p.title;
  const words = p.text.replace(/\s+/g, ' ').trim().split(' ');
  return words.slice(0, 10).join(' ') + (words.length > 10 ? '…' : '');
}

function postCard(p) {
  const a = document.createElement('a');
  a.className = 'item' + (p.images.length ? ' post-item' : '');
  a.href = 'artikel.html?bericht=' + p.id;
  a.innerHTML = '<time></time><h3></h3>';
  a.querySelector('time').textContent = fmtDate(p.date);
  a.querySelector('h3').textContent = postTitle(p);
  if (p.series) {
    const s = document.createElement('span'); s.className = 'series'; s.textContent = p.series; a.append(s);
  }
  const text = ((p.subtitle ? p.subtitle + '. ' : '') + (p.title ? p.text : p.text.split(/\s+/).slice(10).join(' '))).replace(/\s+/g, ' ').trim();
  if (text) {
    const e = document.createElement('p'); e.textContent = text.length > 170 ? text.slice(0, 170).replace(/\s\S*$/, '') + '…' : text; a.append(e);
  }
  if (p.images.length) {
    const s = document.createElement('span'); s.className = 'print';
    const i = document.createElement('img'); i.src = p.images[0].src; i.alt = ''; i.loading = 'lazy';
    s.append(i); a.append(s);
  }
  return a;
}

function renderPosts(el, posts, byYear) {
  let year;
  for (const p of posts) {
    const y = p.date.slice(0, 4);
    if (byYear && y !== year) {
      const h = document.createElement('h3'); h.className = 'year'; h.textContent = year = y; el.append(h);
    }
    el.append(postCard(p));
  }
}
