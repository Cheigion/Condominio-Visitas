const $ = id => document.getElementById(id);
$('rut').addEventListener('input', e => e.target.value = U.format(e.target.value));
$('f').addEventListener('submit', async e => {
  e.preventDefault();
  const err = t => $('msg').innerHTML = `<div class="alert alert-danger py-2">${t}</div>`;
  if (!U.validRut($('rut').value)) return err('Ingrese un RUT válido.');
  if (!$('clave').value) return err('Ingrese su clave.');
  if (CONFIG.USERS_CSV_URL.startsWith('PEGAR')) return err('Falta configurar USERS_CSV_URL en js/config.js');
  $('btn').disabled = true; $('btn').textContent = 'Validando…';
  try {
    const s = await Auth.login($('rut').value, $('clave').value);
    if (s) return location.replace('app.html');
    err('RUT o clave incorrectos.');
  } catch (x) { err('No se pudo validar. Revise su conexión o el enlace CSV.'); }
  $('btn').disabled = false; $('btn').textContent = 'Ingresar';
});
