const Auth = {
  KEY: 'condo_session',
  get() { try { return JSON.parse(localStorage.getItem(Auth.KEY)); } catch (e) { return null; } },
  async login(rut, clave) {
    const users = await U.csv(CONFIG.USERS_CSV_URL);
    const u = users.find(x => U.clean(x.RUT) === U.clean(rut) && x.CLAVE === clave);
    if (!u) return null;
    const token = crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random().toString(36).slice(2);
    const s = { token, rut: u.RUT, nombre: u.NOMBRE, ts: Date.now() };
    localStorage.setItem(Auth.KEY, JSON.stringify(s));
    return s;
  },
  logout() { localStorage.removeItem(Auth.KEY); location.replace('index.html'); },
  redirectIfLogged() { if (Auth.get()) location.replace('app.html'); },
  requireLogin() { if (!Auth.get()) location.replace('login.html'); },
  // Si el usuario fue eliminado del Excel, se cierra su sesión. Si no hay internet, la sesión se mantiene.
  async revalidate() {
    const s = Auth.get(); if (!s) return;
    try { const us = await U.csv(CONFIG.USERS_CSV_URL); if (!us.some(x => U.clean(x.RUT) === U.clean(s.rut))) Auth.logout(); } catch (e) {}
  }
};
