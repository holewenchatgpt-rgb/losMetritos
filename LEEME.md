# losMetritos — Gráficas del streaming

Zócalos, mosca, hora, mensajes del público y QR para el streaming de La Metro.
Colores: rojo `#DA0000`, blanco `#FBFFFF`, negro `#1D1D1B`, estrellitas `#A00000`.

## Qué hay en la carpeta

| Archivo | Para qué es | Dónde va |
|---|---|---|
| `graph.html` | **Zócalo** (texto chico + texto grande, con fade al cambiar) | OBS |
| `control.html` | **Panel de control** de zócalos, con previsualización AL AIRE / BORRADOR | Compu del operador |
| `canal.html` | **Mosca** losMetritos (arriba a la derecha) | OBS |
| `hora.html` | **Hora y temperatura** de Córdoba (arriba del QR) | OBS |
| `hashtag.html` | **#losMetritos** (arriba a la izquierda) | OBS |
| `mensajes.html` | **Barra de mensajes** del público que pasa abajo | OBS |
| `qr.html` | **QR** “Escaneá y mandá tu mensaje” (esquina inferior derecha). Se arma solo | OBS |
| `index.html` | **Formulario** donde el público escribe (a esto lleva el QR) | Celulares del público |
| `moderador.html` | **Moderador**: aprobar / rechazar mensajes. Mantené apretado el título para ver los que están en pantalla | Celular del moderador |
| `prueba-todo.html` | Todas las capas juntas, para probar | Sólo para pruebas |
| `config.js` | **El único archivo que hay que tocar** (URL de Google, textos fijos) | — |
| `apps-script/Code.gs` | El “servidor” en Google que conecta todo | Google Apps Script |

---

## 1. Probar ya (modo prueba, sin configurar nada)

Con `URL: ""` en `config.js` todo anda, pero **sólo entre pestañas del mismo navegador** (Chrome).
Abrí `control.html` en una pestaña y `prueba-todo.html` en otra: lo que mandes desde el control aparece en la otra.
Para probar mensajes: abrí `index.html`, mandá uno, aprobalo en `moderador.html` y mirá la barra.

> En modo prueba OBS **no** ve lo que hacés en Chrome (son navegadores distintos). Para el vivo hacé los pasos 2 y 3.

## 2. Publicar las páginas (GitHub Pages, como el profe)

1. Creá una cuenta en github.com y un repositorio nuevo (por ejemplo `losmetritos`), **público**.
2. **Add file → Upload files** y arrastrá **todo el contenido** de esta carpeta (incluidas `fonts/` y `apps-script/`). Commit.
3. **Settings → Pages → Branch: main / (root) → Save**. En un minuto queda en
   `https://TU-USUARIO.github.io/losmetritos/`
4. El QR se arma solo con esa dirección + `index.html`. Abrí `.../qr.html` y escanealo con el celu para verificar.

## 3. Conectar con Google (para que control, OBS y celulares hablen entre sí)

1. Creá una **Hoja de cálculo de Google** nueva (ej. “losMetritos mensajes”).
2. En la hoja: **Extensiones → Apps Script**. Borrá lo que hay y pegá todo `apps-script/Code.gs`. Guardá (💾).
3. Arriba elegí la función **`instalar`** y tocá **▶ Ejecutar**. Aceptá los permisos (“Configuración avanzada → Ir a … (no seguro)” es normal, es tu propio script). Se crea la hoja **MENSAJES**.
4. **Implementar → Nueva implementación →** tipo **Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
   - **Implementar** y copiá la URL que termina en **`/exec`**.
5. Pegala en `config.js`:
   ```js
   URL: "https://script.google.com/macros/s/AAAA.../exec",
   ```
6. Volvé a subir `config.js` a GitHub. Listo: ya no dice “MODO PRUEBA” en el control.

> Si después cambiás `Code.gs`, usá **Implementar → Administrar implementaciones → ✏️ → Versión: nueva** para que la URL siga siendo la misma.

## 4. OBS

Agregá una **Fuente de navegador** por cada capa, todas de **1920 × 1080**, con la URL de GitHub Pages.
Orden de abajo hacia arriba (las de arriba tapan a las de abajo):

1. `hashtag.html`
2. `canal.html`
3. `hora.html`
4. `qr.html`
5. `mensajes.html`
6. `graph.html` ← el zócalo, siempre arriba de todo

Tip: en cada fuente tildá “Actualizar el navegador cuando la escena se active” sólo si algo se traba.

## 5. Durante el vivo

- **Operador de zócalos:** `control.html` (botón PANTALLA COMPLETA). Escribí, mirá el BORRADOR, **ENVIAR A PANTALLA** → confirmar. `Ctrl+Enter` también envía. **OCULTAR / MOSTRAR ZÓCALO** saca o vuelve a poner el último.
- **Moderador:** `moderador.html` en el celu. Aprobar = sale en la barra. Mantené apretado “MODERADOR” 2 segundos para ver lo que está en pantalla, sacar mensajes o desactivar la moderación.
- **Público:** escanea el QR → `index.html` → escribe nombre y mensaje (máx. 80 caracteres).

## Cambiar cosas

- Textos fijos (base del zócalo, hashtag, título): `config.js`.
- Colores: `fonts.css` (variables `--rojo`, `--blanco`, `--negro`, `--rojo-osc`).
- Posiciones: cada página tiene comentarios arriba explicando las medidas (todo pensado en 1920×1080: zócalo y barra dejan 340 px a la derecha para el QR).
- Si el QR tiene que llevar a otra dirección: `FORM_URL` en `config.js`.

Tipografías libres incluidas: Bebas Neue (zócalo) e Inter (todo lo demás). QR generado con *qrcode-generator* (licencia MIT).
