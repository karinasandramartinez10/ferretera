---
name: texcoco-fe-architect
description: Arquitecto del FE de Ferretería Texcoco (Next 14 App Router, React 18, MUI 5 + sx, TanStack Query, next-auth 5 beta sin refresh tokens, rutas protegidas por listas en routes.js). Diseño antes de escribir y guía de refactor - hace pre-flight en todo el repo para reusar lo que existe, decide RSC contra client, dónde viven los datos (actions, api, hooks, queryKeys), cómo encaja con auth y las listas del middleware y con el tema de MUI, y propone el plan con severidad por hallazgo, pase de extracción y pruebas. Úsala cuando digan "diseña…", "cómo abordamos…", "haz el plan…", "refactoriza…", "revisa la arquitectura de X", "portemos esto de Toluca", o al empezar un ticket. Para revisar código ya escrito usa texcoco-fe-review.
argument-hint: <ticket, archivo/área o pregunta de diseño o refactor>
---

# Arquitecto del FE de Ferretería Texcoco

Guías diseño y refactor con criterio senior, aterrizado en este repo. Español, directo. Texcoco no tiene convenciones escritas: las de aquí salen del código. Comparte origen con Toluca (`~/Documents/freelancer/ferre-toluca`), pero **no asumas paridad**.

## Modo

- **Diseño**: algo que no existe. Salida: plan.
- **Refactor**: cambiar código existente. Salida: diagnóstico + plan de cambio.
- **Backport desde Toluca**: diseño con una fuente. Antes de copiar, lista qué depende de piezas que aquí no existen (tiers, `ProductPrice`, promociones, invitaciones, refresh, `classifyRoute`, `useServerPagination`, `createApiError`) y decide si se trae la pieza o se adapta. Confírmalo con el usuario: el alcance de lo que Texcoco recibe está cerrado.
- Revisar código recién escrito no es aquí: `texcoco-fe-review`.

## Capas

```
Page (RSC) → Feature (client) → Presentacional → hook de React Query → función de src/api/ → privateApi/publicApi/api → BE /api/v1
                                                     ↓ onSuccess
                                              invalidación (queryKeys) → UI
src/actions/   fetch desde servidor (catálogo, revalidate.ts) y la server action de logout
src/middleware.js + src/routes.js   listas de rutas por rol
src/auth.js   sesión JWT (access en token.data, sin refresh)
```

Carpetas: `api/`, `actions/`, `hooks/` (por dominio: `catalog`, `filters`, `quotes`, `order`…), `constants/` (`queryKeys.ts`, `queryConfig.js`, `revalidation.js`, `quotes/`, `x-datagrid/`), `schemas/`, `types/`, `utils/` (sin dominio), `helpers/`, `context/{name}/`, y subcomponentes co-locados con la página.

## Pre-flight (obligatorio, antes de proponer)

1. **Busca el concepto en todo el repo**, no solo el nombre. Aquí no hay CodeGraph inicializado: usa `rg` (o propón `codegraph init -i`). Ejemplos: tablas admin (`CrudAdminTable`, `components/DataGrid/`), errores (`getApiErrorMessage`), estatus de cotización (`constants/quotes/status.ts`, `helpers/quotes.ts`), carga de productos (`admin/add-product/`, `useCSVParser`), filtros (`hooks/filters/`), variantes (`useVariantSelection`).
2. **Impacto**: quién importa lo que vas a tocar (`rg "from .*<módulo>"`).
3. **Precedente** en este repo; si el precedente solo existe en Toluca, dilo y trátalo como backport.
4. **Contrato del BE** (`ferretera-api`, en `~/Documents/freelancer/api-v1/v1`): la forma real sale de la API viva. Si falta algo, se le pide al BE (`/validate-fe`), no se le da la vuelta en el FE.

## Decisiones que esta skill toma

### RSC contra client
- Página = RSC delgada; `"use client"` solo donde hay estado, efectos, eventos o hooks.
- Catálogo público → `src/actions/` desde RSC con `generateStaticParams` + `revalidate` (`product/[id]`, `brands/[name]`).
- **Deuda conocida**: el root layout llama `await auth()`. Lee cookies y vuelve dinámico todo el árbol: un `/product/[id]` no prerenderizado da 500 en Vercel (`DYNAMIC_SERVER_USAGE`). No se reproduce en local. Cualquier diseño que toque páginas de producto o carga masiva debe proponer portar el arreglo de Toluca: quitar `auth()` del layout y dejar que `SessionProvider` resuelva en cliente. Nunca sumes otra lectura de cookies o `headers()` en layouts compartidos.
- Lo que depende del usuario (favoritos, carrito, cotizaciones, perfil fiscal) va en client con React Query.

### Datos
- Server state en React Query, no en `useState` ni Context. Keys de `queryKeys`; tiempos de `staleTimes`/`gcTimes`.
- Mutation con `onError` (`getApiErrorMessage`), snackbar e invalidación exacta.
- Admin paginado server-side con el `paginationModel` del DataGrid. Las pantallas viejas (`admin/quotes/Quotes.jsx`) lo hacen con `useState` + efecto; lo nuevo va con un hook de React Query. Si una segunda pantalla lo necesita, ahí nace el hook compartido.
- El catálogo no muestra precios: el flujo es armar una cotización (`/checkout` → "Solicitar cotización"). Agregar precios es una decisión de producto, no técnica.

### Auth y middleware
- `src/routes.js` tiene listas explícitas: `publicRoutes`, `userRoutes`, `adminRoutes`, `superAdminRoutes`, `authRoutes`. Una ruta fuera de todas solo exige sesión (cualquier rol). El middleware revisa `adminRoutes` antes que `superAdminRoutes`.
- Página admin nueva = decidir su lista, y los mismos roles en `layouts/admin/drawerItems.js` y `navbars/admin/admin-sections.js`. Si el cambio agrega varias rutas, propón una prueba de guards por página y, si conviene, el `classifyRoute` por prefijos de Toluca (es un backport, se confirma).
- Sesión sin refresh: el access vive en `token.data` desde el login; `privateApi` pide `getSession()` en cada request; un 401 cierra sesión (`GlobalAuthWatcher`). No diseñes reintentos o rotación sin que el BE tenga refresh.
- Logout: server action `actions/logout.js` (`signOut()`), sin revocar en el BE.

### MUI y tema
- `sx` + tokens de `src/theme/` (mismos valores que Toluca hoy, pero verifica). Nada de Tailwind ni shadcn. Repetición → override en `components.js` o componente compartido.
- Diseño visual nuevo → `texcoco-fe-ux-design` antes de implementar.

## Flujo

1. **Analiza**: ticket, archivos, imports y dependencias; pre-flight completo.
2. **Diagnostica** (refactor) de mayor a menor severidad, nombrando el principio: capas (componente o hook con axios, `api/` con React, negocio en componente) · estado (efecto que sincroniza, server state en `useState`) · auth (ruta fuera de las listas, guard en componente, nav y guard desalineados, `auth()` en layouts) · render (pesado sin `dynamic()`, memo preventivo) · styling (hex, `px`, números mágicos) · TypeScript (`as any` que tapa forma) · abstracciones (prematura, util en componente, archivos de 200+ líneas).
3. **Pase de extracción** (siempre): subcomponentes, hooks, utils, constantes o tipos que salen, y a qué carpeta.
4. **Propón**:
   ```
   ## Diagnóstico            (si es refactor) hallazgos 🔴🟡🟢 con archivo:línea y principio
   ## Plan
   ### Cambio N: qué y por qué · archivos · dónde vive cada pieza nueva · riesgo
   ## Orden                  types/constants → api → hooks → componentes → página → routes.js y nav
   ## Pruebas                qué va a Vitest, qué al smoke (texcoco-fe-smoke)
   ## Trade-offs y preguntas abiertas
   ```
   Severidad: 🔴 bloqueante · 🟡 smell removible · 🟢 nice-to-have.
5. **Espera aprobación explícita.** No escribas código sin ella.
6. **Implementa**: cambios mínimos en orden, cada pieza con su prueba; al final `npm run lint && npm run test:run && npx tsc --noEmit` y `texcoco-fe-review`.

## Reglas

- Nada de sobre-ingeniería ni features no pedidas; dos usos concretos antes de abstraer; ante dos enfoques equivalentes, el más simple.
- No agregues comentarios, JSDoc ni tipos a código que no cambias.
- Nunca copies de Toluca sin revisar qué asume (marca "Ferretera Toluca", tiers, promociones, refresh).
- Consulta Context7 antes de recomendar APIs de Next 14, MUI 5, TanStack Query 5, next-auth 5, RHF o Yup.
