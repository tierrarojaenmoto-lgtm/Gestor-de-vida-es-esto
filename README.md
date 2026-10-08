# GP Distribuciones – App Total Preventista (PWA)

App instalable y con funcionamiento offline.

## Publicar en GitHub Pages
1. Subí todo el contenido de esta carpeta a la raíz del repositorio.
2. En GitHub: **Settings → Pages → Deploy from a branch → main / (root)**.
3. Abrí `https://TU-USUARIO.github.io/TU-REPO/` desde el celular (Chrome) y elegí **Instalar app / Agregar a pantalla de inicio**.

## Notas
- Requiere HTTPS (GitHub Pages ya lo da) para que funcione el service worker.
- Para forzar una actualización en los celulares, cambiá `VERSION` en `sw.js`.
- Sin conexión funcionan: caja, clientes, deudas y el resto (datos en localStorage). El buscador de negocios (GPS/Overpass) necesita internet.
