# MÓDULO 4.1 — Consolidación de sellos e iconografía

## Registro formal

- **Proyecto:** Idotiza
- **Logotipo principal:** `logo.png` (entregado por el usuario, fondo transparente).
- **Sello histórico:** `sock.svg` (calcetín dibujado a mano, primer registro del módulo).
- **Alcance:** paquete agnóstico de la app. Cada proyecto que lo consuma define su propio título.

## Superficies de aplicación

| Superficie | Implementación sugerida |
| --- | --- |
| Cabecera | `<img src="logo.png" alt="Idotiza" />`, rotación `-4deg` |
| Favicon | Enlace `rel="icon"` apuntando a `logo.png` |
| Título | Definido por cada app; la marca no impone un nombre de aplicación |
| Otros proyectos | Importar `logo.png?url` o copiar el archivo conservando el nombre |

## Descripción del logotipo actual

Archivo PNG con alpha, derivado de `idotiza BGL.jpg.png`, optimizado a 547×600 px. Se muestra con `height: 64px` y `object-fit: contain`. El título va aparte en tipografía máquina de escribir.

> Si cambia el logotipo, reemplaza `logo.png`: todas las apps que consuman el paquete heredan el cambio sin tocar código.
