# MÓDULO 4.1 — Consolidación de sellos e iconografía

## Registro formal

- **Proyecto:** Idotiza
- **Título de la aplicación:** IDOVHS
- **Logotipo principal:** `brand/logo.png` (entregado por el usuario, fondo transparente).
- **Sello histórico:** `brand/sock.svg` (calcetín dibujado a mano, primer registro del módulo).

## Aplicaciones registradas en IDOVHS

| Superficie | Implementación |
| --- | --- |
| Cabecera | `<img id="brand-mark">`, rotación `-4deg` |
| Favicon | Enlace `rel="icon"` inyectado desde `?url` |
| Título | `IDOVHS` (subtítulo: `idotiza`) |
| Otros proyectos | Importar `brand/logo.png?url` o copiar el archivo conservando el nombre |

## Descripción del logotipo actual

Archivo PNG con alpha, derivado de `idotiza BGL.jpg.png`, optimizado a 547×600 px. Se muestra en la cabecera con `height: 64px`, `object-fit: contain`. El título va aparte en tipografía máquina de escribir: **IDOVHS**.

> Si cambia el logotipo, reemplaza `brand/logo.png`: cabecera, favicon y otras apps heredan el cambio sin tocar código.
