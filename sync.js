// =====================================================================
//  Comunicación entre páginas (control ⇄ zócalo, público ⇄ moderador ⇄ barra)
//  Con CONFIG.URL → usa Google Apps Script (funciona entre computadoras y celulares).
//  Sin CONFIG.URL → modo prueba con localStorage (sólo pestañas del mismo navegador).
// =====================================================================
const EMPTY = { id: 0, visible: false, small: "", big: "" };

const Local = (() => {
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const msgs = () => read("lm_msgs", []);
  const setEstado = (ids, estado, desde) => {
    const l = msgs();
    l.forEach(m => { if (ids.includes(m.id) && (!desde || desde.includes(m.estado))) m.estado = estado; });
    write("lm_msgs", l);
  };
  return {
    get(action) {
      if (action === "zocalo") return read("lm_zocalo", EMPTY);
      if (action === "recibidos") return { ok: true, modOff: read("lm_modoff", false), items: msgs().filter(m => m.estado === "PENDIENTE") };
      if (action === "aprobados") return { ok: true, items: msgs().filter(m => m.estado === "APROBADO") };
      return { ok: false, error: "acción desconocida" };
    },
    post(b) {
      switch (b.action) {
        case "zocalo": write("lm_zocalo", { id: b.id, visible: b.visible, small: b.small, big: b.big }); break;
        case "enviar": {
          const l = msgs(), d = new Date();
          const fecha = d.toISOString().slice(0, 10) + " " + d.toTimeString().slice(0, 8);
          l.push({ id: "m" + Date.now() + Math.random().toString(36).slice(2, 6), fecha, nombre: String(b.nombre).slice(0, 40), texto: String(b.texto).slice(0, 80), estado: read("lm_modoff", false) ? "APROBADO" : "PENDIENTE" });
          write("lm_msgs", l); break;
        }
        case "aprobar":  setEstado([b.id], "APROBADO", ["PENDIENTE"]); break;
        case "rechazar": setEstado([b.id], "RECHAZADO", ["PENDIENTE"]); break;
        case "eliminar": setEstado([b.id], "ELIMINADO", ["APROBADO"]); break;
        case "borrarPendientes": setEstado(b.ids || [], "BORRADO", ["PENDIENTE"]); break;
        case "borrarAprobados":  setEstado(b.ids || [], "ELIMINADO", ["APROBADO"]); break;
        case "setModerador": write("lm_modoff", !!b.off); break;
        default: return { ok: false, error: "acción desconocida" };
      }
      return { ok: true };
    }
  };
})();

const API = {
  remote: () => !!CONFIG.URL,
  async get(action) {
    if (!CONFIG.URL) return Local.get(action);
    const r = await fetch(CONFIG.URL + "?action=" + action + "&_=" + Date.now(), { cache: "no-store" });
    return r.json();
  },
  async post(body) {
    if (!CONFIG.URL) return Local.post(body);
    const r = await fetch(CONFIG.URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!d.ok) throw new Error(d.error || "error");
    return d;
  }
};

// Atajos para el zócalo (mismo formato que usaba el panel del profe)
const Sync = {
  get: () => API.get("zocalo"),
  async set(s) { s.id = Date.now(); await API.post({ action: "zocalo", ...s }); return s; }
};
