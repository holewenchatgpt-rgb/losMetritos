// =====================================================================
//  CONFIGURACIÓN DE losMetritos  —  lo único que hay que tocar
// =====================================================================
const CONFIG = {
  // URL de la Web App de Google Apps Script (termina en /exec).
  // VACÍO = modo prueba: todo funciona, pero sólo entre pestañas del MISMO navegador.
  URL: "https://script.google.com/macros/s/AKfycbylHOc2BufZQ6jC8qDA8xEdQX547WyogoObva3gJPcDdQfJ3rcBxHNqVCZwwNEBDnkzAA/exec",

  // Dirección que codifica el QR (la página donde el público manda mensajes).
  // VACÍO = se arma sola: la misma carpeta donde está publicado qr.html + "index.html".
  FORM_URL: "",

  POLL_MS: 1200,          // cada cuánto el zócalo consulta si hay algo nuevo
  MSG_POLL_MS: 4000,      // cada cuánto la barra de mensajes busca mensajes aprobados

  // Textos fijos
  TITULO: "losMetritos",
  BASE_CHICO: "EN VIVO DESDE LA METRO",
  BASE_GRANDE: "BIENVENIDOS A LOSMETRITOS",
  HASHTAG: "#losMetritos",

  // Hora y temperatura (Córdoba Capital)
  ZONA: "America/Argentina/Cordoba",
  LAT: -31.4201, LON: -64.1888
};
