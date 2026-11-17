/**
 * losMetritos — backend en Google Apps Script
 * Maneja: el estado del zócalo (control ⇄ graph) y los mensajes del público (index ⇄ moderador ⇄ mensajes).
 *
 * Cómo se instala: ver LEEME.md (paso "Conectar con Google").
 * Este script tiene que estar creado DESDE la planilla (Extensiones → Apps Script).
 */

const ZONA = 'America/Argentina/Cordoba';
const HOJA = 'MENSAJES';
const COLS = ['id', 'fecha', 'nombre', 'texto', 'estado'];   // estado: PENDIENTE · APROBADO · RECHAZADO · ELIMINADO · BORRADO

// ───────────────────────── entrada ─────────────────────────
function doGet(e) {
  const a = (e.parameter.action || '').trim();
  try {
    if (a === 'zocalo')    return json(getZocalo());
    if (a === 'recibidos') return json({ ok: true, modOff: modOff(), items: mensajes('PENDIENTE') });
    if (a === 'aprobados') return json({ ok: true, items: mensajes('APROBADO') });
    return json({ ok: true, info: 'losMetritos funcionando' });
  } catch (err) { return json({ ok: false, error: String(err) }); }
}

function doPost(e) {
  let b = {};
  try { b = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'JSON inválido' }); }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    switch (b.action) {
      case 'zocalo':           setZocalo(b); break;
      case 'enviar':           enviar(b); break;
      case 'aprobar':          cambiar([b.id], 'APROBADO', ['PENDIENTE']); break;
      case 'rechazar':         cambiar([b.id], 'RECHAZADO', ['PENDIENTE']); break;
      case 'eliminar':         cambiar([b.id], 'ELIMINADO', ['APROBADO']); break;
      case 'borrarPendientes': cambiar(b.ids || [], 'BORRADO', ['PENDIENTE']); break;
      case 'borrarAprobados':  cambiar(b.ids || [], 'ELIMINADO', ['APROBADO']); break;
      case 'setModerador':     PropertiesService.getScriptProperties().setProperty('modOff', b.off ? '1' : '0'); break;
      default: return json({ ok: false, error: 'acción desconocida' });
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// ───────────────────────── zócalo ─────────────────────────
function getZocalo() {
  const raw = PropertiesService.getScriptProperties().getProperty('zocalo');
  return raw ? JSON.parse(raw) : { id: 0, visible: false, small: '', big: '' };
}
function setZocalo(b) {
  const s = { id: Number(b.id) || Date.now(), visible: !!b.visible, small: limpiar(b.small, 120), big: limpiar(b.big, 200) };
  PropertiesService.getScriptProperties().setProperty('zocalo', JSON.stringify(s));
}

// ───────────────────────── mensajes ─────────────────────────
function modOff() { return PropertiesService.getScriptProperties().getProperty('modOff') === '1'; }

function hoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(HOJA);
  if (!sh) {
    sh = ss.insertSheet(HOJA);
    sh.getRange(1, 1, 1, COLS.length).setValues([COLS]).setFontWeight('bold').setBackground('#DA0000').setFontColor('#FBFFFF');
    sh.setFrozenRows(1);
    sh.setColumnWidth(3, 160); sh.setColumnWidth(4, 420);
  }
  return sh;
}

function filas() {
  const sh = hoja(), n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, COLS.length).getValues();
}

function mensajes(estado) {
  return filas()
    .filter(r => r[4] === estado)
    .map(r => ({
      id: String(r[0]),
      fecha: r[1] instanceof Date ? Utilities.formatDate(r[1], ZONA, 'yyyy-MM-dd HH:mm:ss') : String(r[1]),
      nombre: String(r[2]), texto: String(r[3]), estado: r[4]
    }));
}

function enviar(b) {
  const nombre = limpiar(b.nombre, 40), texto = limpiar(b.texto, 80);
  if (!nombre || !texto) throw new Error('Faltan datos');
  const id = 'm' + Date.now() + Math.floor(Math.random() * 1000);
  const fecha = Utilities.formatDate(new Date(), ZONA, 'yyyy-MM-dd HH:mm:ss');
  // con el moderador desactivado, los mensajes nuevos salen directo a pantalla
  hoja().appendRow([id, "'" + fecha, nombre, texto, modOff() ? 'APROBADO' : 'PENDIENTE']);
}

function cambiar(ids, estado, desde) {
  if (!ids.length) return;
  const sh = hoja(), data = filas(), set = new Set(ids.map(String));
  data.forEach((r, i) => {
    if (set.has(String(r[0])) && desde.indexOf(r[4]) !== -1) sh.getRange(i + 2, 5).setValue(estado);
  });
}

// ───────────────────────── utilidades ─────────────────────────
function limpiar(t, max) { return String(t || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** Ejecutalo una vez desde el editor (botón ▶ Ejecutar) para dar permisos y crear la hoja MENSAJES. */
function instalar() { hoja(); Logger.log('Listo: hoja MENSAJES creada. Ahora: Implementar → Nueva implementación → Aplicación web.'); }
