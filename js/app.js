const $ = id => document.getElementById(id);
const S = Auth.get();
document.querySelectorAll('.uname').forEach(e => e.textContent = S.nombre);
for (let i = 101; i <= 110; i++) $('depto').add(new Option(i, i));
['Torre A', 'Torre B', 'Torre C'].forEach(t => $('torre').add(new Option(t, t)));

// Navegación interna (sin salir de la página)
function show(s) {
  document.querySelectorAll('[data-sec]').forEach(b => b.classList.toggle('active', b.dataset.sec === s));
  ['registro', 'listado'].forEach(x => $('sec-' + x).classList.toggle('d-none', x !== s));
  bootstrap.Collapse.getOrCreateInstance($('m'), { toggle: false }).hide();
  if (s === 'listado') loadList();
}
document.querySelectorAll('[data-sec]').forEach(b => b.onclick = () => show(b.dataset.sec));

// Formulario
const L = /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'\-]/g, NAME = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/, PAT = /^[A-Z0-9]{5,7}$/;
$('rut').oninput = e => e.target.value = U.format(e.target.value);
['nombre', 'apellidos'].forEach(i => $(i).oninput = e => e.target.value = e.target.value.replace(L, ''));
$('pat').oninput = e => e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
$('obs').oninput = () => $('cnt').textContent = $('obs').value.length;
const togglePat = () => { $('patw').classList.toggle('d-none', !$('veh').checked); if (!$('veh').checked) { $('pat').value = ''; $('pat').classList.remove('is-invalid'); } };
$('veh').onchange = togglePat;
const chk = (el, ok) => { el.classList.toggle('is-invalid', !ok); el.classList.toggle('is-valid', ok && el.value !== ''); return ok; };
const validate = () => [
  chk($('rut'), U.validRut($('rut').value)), chk($('nombre'), NAME.test($('nombre').value.trim())),
  chk($('apellidos'), NAME.test($('apellidos').value.trim())), chk($('pat'), !$('veh').checked || PAT.test($('pat').value)),
  chk($('depto'), !!$('depto').value), chk($('torre'), !!$('torre').value)].every(Boolean);
const alertMsg = (t, m) => $('msg').innerHTML = `<div class="alert alert-${t} py-2">${m}</div>`;
// Aviso en pantalla (modal) con botón Aceptar
function notify(ok, text) {
  $('mi').className = 'bi ' + (ok ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger');
  $('mt').className = 'fw-bold mt-2 ' + (ok ? 'text-success' : 'text-danger');
  $('mt').textContent = ok ? '¡Visita registrada!' : 'Error en el servidor';
  $('mp').textContent = text;
  $('mb').className = 'btn btn-lg px-5 mx-auto ' + (ok ? 'btn-success' : 'btn-danger');
  bootstrap.Modal.getOrCreateInstance($('mdl')).show();
}
const ERR = 'Ocurrió un error en el servidor. Comuníquese con el área de informática para más información.';

$('f').addEventListener('submit', async e => {
  e.preventDefault();
  if (!validate()) return alertMsg('warning', 'Revise los campos marcados en rojo.');
  if (CONFIG.MAKE_WEBHOOK_URL.startsWith('PEGAR')) { console.error('Falta configurar MAKE_WEBHOOK_URL en js/config.js'); return notify(false, ERR); }
  const n = new Date(), tz = { timeZone: CONFIG.TIMEZONE };
  const d = {
    Rut: $('rut').value, Nombre: $('nombre').value.trim(), Apellidos: $('apellidos').value.trim(),
    Patente: $('veh').checked ? $('pat').value : '', Departamento: $('depto').value, Torre: $('torre').value,
    Observacion: $('obs').value.trim(),
    Fecha: n.toLocaleDateString('es-CL', { ...tz, day: '2-digit', month: '2-digit', year: 'numeric' }),
    Hora: n.toLocaleTimeString('es-CL', { ...tz, hourCycle: 'h23' }),
    NombreUsuario: S.nombre, RutUsuario: S.rut
  };
  $('btn').disabled = true;
  try {
    await fetch(CONFIG.MAKE_WEBHOOK_URL, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(d) });
    $('msg').innerHTML = ''; notify(true, 'Visita registrada exitosamente.');
    $('f').reset(); togglePat(); $('cnt').textContent = 0;
    $('f').querySelectorAll('.is-valid,.is-invalid').forEach(x => x.classList.remove('is-valid', 'is-invalid'));
  } catch (x) { console.error(x); notify(false, ERR); }
  $('btn').disabled = false;
});

// Listado
const COLS = ['Rut', 'Nombre', 'Apellidos', 'Patente', 'Departamento', 'Torre', 'Observacion', 'Fecha', 'Hora'];
let rows = [];
function render() {
  const q = $('q').value.toLowerCase();
  const r = rows.filter(x => !q || COLS.some(c => (x[c.toUpperCase()] || '').toLowerCase().includes(q)));
  $('th').innerHTML = '<tr>' + COLS.map(c => `<th>${c}</th>`).join('') + '</tr>';
  $('tb').innerHTML = r.map(x => '<tr>' + COLS.map(c => `<td>${U.esc(x[c.toUpperCase()] || '')}</td>`).join('') + '</tr>').join('');
  $('cn').textContent = r.length + ' registro(s)';
}
async function loadList() {
  if (CONFIG.VISITS_CSV_URL.startsWith('PEGAR')) return $('cn').textContent = 'Falta configurar VISITS_CSV_URL en js/config.js';
  $('cn').textContent = 'Cargando…';
  try { rows = (await U.csv(CONFIG.VISITS_CSV_URL)).reverse(); render(); }
  catch (e) { $('cn').textContent = 'No se pudo cargar el listado.'; }
}
$('q').oninput = render; $('rf').onclick = loadList;

// Sesión: se mantiene hasta "Cerrar sesión"; revalida en segundo plano
setInterval(Auth.revalidate, CONFIG.REVALIDATE_MINUTES * 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) Auth.revalidate(); });
