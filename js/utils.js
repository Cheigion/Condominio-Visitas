const U = {
  clean: r => String(r || '').replace(/[^0-9kK]/g, '').toUpperCase(),
  format(v) {
    const c = U.clean(v).slice(0, 9);
    if (c.length < 2) return c;
    return c.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + c.slice(-1);
  },
  validRut(v) {
    const c = U.clean(v);
    if (c.length < 8 || !/^\d+[\dK]$/.test(c)) return false;
    let s = 0, m = 2;
    for (let i = c.length - 2; i >= 0; i--) { s += +c[i] * m; m = m === 7 ? 2 : m + 1; }
    const r = 11 - (s % 11);
    return c.slice(-1) === (r === 11 ? '0' : r === 10 ? 'K' : String(r));
  },
  parse(t) {
    const rows = []; let r = [], f = '', q = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ',') { r.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; r.push(f); rows.push(r); r = []; f = ''; }
      else f += c;
    }
    if (f || r.length) { r.push(f); rows.push(r); }
    return rows.filter(x => x.some(y => y.trim()));
  },
  async csv(url) {
    const res = await fetch(url + (url.includes('?') ? '&' : '?') + '_=' + Date.now());
    if (!res.ok) throw new Error('csv');
    const rows = U.parse(await res.text());
    const h = (rows.shift() || []).map(x => x.trim().toUpperCase());
    return rows.map(r => Object.fromEntries(h.map((k, i) => [k, (r[i] || '').trim()])));
  },
  esc: s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
};
