# Fundaserinco · Portafolio técnico

Sitio estático de Fundaserinco: ingeniería, tecnología e inteligencia artificial
desde Pereira, Risaralda. Está construido con HTML, CSS y JavaScript sin
dependencias ni proceso de compilación.

## Contenido

| Ruta | Qué es |
|---|---|
| `index.html` | Portafolio principal: 13 secciones tipo «deck», escenas en video y franja de aliados |
| `servicios/` | Siete fichas técnicas de servicio (civil, seguridad, telecom, energía, software, integrales, deportivas) |
| `planes/` | Los cuatro planes de TI: índice, detalle de cada plan y cotizador |
| `css/` | Hojas de estilo, con tipografías autoalojadas |
| `js/` | Motor de navegación, escenas, filtros, fichas y estimadores |
| `assets/` | Imágenes, videos, tipografías y recursos de marca |

## Ver el sitio en local

Cualquier servidor estático sirve. Con Node.js:

```bash
npx --yes serve . -l 4321
```

Y abrir <http://localhost:4321>.

> El sitio usa rutas relativas, así que también funciona abriendo `index.html`
> directamente, aunque algunas funciones (analítica y video) rinden mejor con
> un servidor.

## Notas

- Sin recursos de terceros: tipografías, imágenes y video se sirven desde el
  propio repositorio.
- Los valores de los planes y estimadores son orientativos y están fechados en
  2026; el alcance definitivo se fija en la propuesta.
- `sitemap.xml` y las etiquetas `canonical`/`og:url` esperan el dominio final.
