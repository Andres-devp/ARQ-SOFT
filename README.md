# Estudio · Primer parcial de Arquitectura de Software

Plataforma web interactiva para preparar el Parcial 1 de Arquitectura de Software (PUJ 2026-30): fundamentos, atributos de calidad y tácticas, estilos y patrones, modelo 4+1, ADD, Taller 4 (Gestión de Desastres), ATAM y Jakarta EE. Incluye diagramas con zoom, reproductores paso a paso, simuladores, quiz y tarjetas de memoria.

Es un solo archivo estático (`index.html`), sin dependencias ni servidor.

## Activar GitHub Pages

1. Sube este repositorio a GitHub (rama `main`).
2. En GitHub: **Settings → Pages**.
3. En *Build and deployment → Source* elige **Deploy from a branch**.
4. En *Branch* elige **main** y carpeta **/ (root)**. Guarda.
5. En 1–2 minutos la página queda en `https://<tu-usuario>.github.io/Estudio-Primer-parcial-Arquitectura/`.

El archivo `.nojekyll` evita que GitHub procese el sitio con Jekyll.

## Uso local

Abre `index.html` con doble clic. Sin internet funciona igual; solo cambian las tipografías (usa las del sistema).

## Editar el contenido

El código fuente está en `src/`:

| Archivo | Contenido |
|---|---|
| `body1.html` … `body5.html` | Texto de las secciones |
| `styles.css` | Estilos (tema claro y oscuro) |
| `data-gloss.js` | Glosario de los tooltips |
| `data-ids.js` | Identificadores del Taller 4 (RF, QA, RES, PA, DA, R) |
| `data-diag.js` | Diagramas (cajas y flechas, secuencias) |
| `data-more.js` | Reproductores paso a paso y tablas |
| `data-quiz.js` | Preguntas del quiz y tarjetas |
| `sims.js` | Simuladores |
| `app.js` | Navegación, zoom, búsqueda, progreso |
| `img/` | Imágenes (se incrustan en el HTML) |

Después de editar, regenera la página con Python 3:

```bash
python3 src/build.py
```

Eso reescribe `index.html` en la raíz. Haz commit y push; GitHub Pages se actualiza solo.

## Fuentes

Programa del curso, diapositivas del profesor (Clases 1 JEE, 2, 3, 4, 5a, 5b, 9, 10, 12), Bass, Clements y Kazman (2021), Richards (2022), Taller 3 y Taller 4. La sección *Fuentes y vacíos* de la plataforma detalla qué se leyó y qué no cuadra entre fuentes.
