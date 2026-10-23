// Facebook posts (posts.json): cards on the home page, full list on berichten.html.
const fmtDate = d => new Date(d).toLocaleDateString('nl-NL', { day:'numeric', month:'long', year:'numeric' });

function postTitle(p) {
  if (p.title) return p.title;
  const words = p.text.replace(/\s+/g, ' ').trim().split(' ');
  return words.slice(0, 10).join(' ') + (words.length > 10 ? '…' : '');
}

function postCard(p) {
  const a = document.createElement('a');
  a.className = 'item post-item';
  a.href = 'artikel.html?bericht=' + p.id;
  a.innerHTML = '<div><time></time><h3></h3><p></p></div>';
  a.querySelector('time').textContent = fmtDate(p.date) + (p.series ? ' · ' + p.series : '');
  a.querySelector('h3').textContent = postTitle(p);
  const text = (p.subtitle ? p.subtitle + ' ' : '') + (p.title ? p.text : p.text.split(' ').slice(10).join(' '));
  const t = text.replace(/\s+/g, ' ').trim();
  a.querySelector('p').textContent = t.length > 180 ? t.slice(0, 180) + '…' : t;
  if (p.images.length) {
    const i = document.createElement('img');
    i.src = p.images[0].src; i.alt = ''; i.loading = 'lazy';
    a.append(i);
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
