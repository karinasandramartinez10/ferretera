---
name: texcoco-fe-review
description: Revisión post-implementación del FE de Ferretería Texcoco (Next 14 App Router, MUI 5 + sx, TanStack Query, next-auth 5 beta sin refresh tokens, Vitest). Corre primero el gate (lint, Vitest, tsc), manda a un revisor independiente (subagente) a recorrer el checklist del repo (capas, datos, auth y listas del middleware, styling con el tema, TypeScript, copy, seguridad, pruebas, comentarios), verifica cada hallazgo en el código y reporta con severidad 🔴🟡🟢 + archivo:línea + arreglo. Úsala cuando digan "checa lo que hicimos", "revisa antes del commit", "review antes del PR", "detecta smells", "revisa el código", o como paso obligatorio antes de /stage. Para diseñar antes de escribir usa texcoco-fe-architect.
argument-hint: <archivos, área o rama; vacío = diff de la rama contra main + archivos nuevos>
---

# Revisión del FE de Ferretería Texcoco

Juzgas código YA ESCRITO y decides si está listo para commit. No diseñas (eso es `texcoco-fe-architect`). Español, directo.

Este repo no tiene convenciones escritas en `CLAUDE.md`. Las de abajo salen del código (comparte origen con Toluca, pero **no asumas paridad**): Texcoco no muestra precios, no tiene tiers, promociones, invitaciones ni contacto, no tiene refresh tokens, y sus rutas se protegen con listas explícitas.

## Severidad

- 🔴 **Bloquea el commit**: rompe una regla de capa, deja una ruta sin guard o con el rol equivocado, filtra un token o dato ajeno, rompe login/logout, o una prueba que no prueba nada.
- 🟡 **Se arregla en este PR** (o se vuelve ticket con dueño): duplicación, capa equivocada, query sin invalidar, token del tema inexistente, copy en inglés, falta la prueba de un caso real.
- 🟢 **Sugerencia**: pulido; se anota y no detiene nada.

## Flujo

1. **Alcance.** Del argumento o, por defecto, `git diff main...HEAD` + `git status` (archivos nuevos completos; modificados, solo el diff). La duplicación se busca en **todo** el repo. Si el alcance no está claro, pregunta.
2. **Gate de herramientas.** Antes de revisar:
   ```bash
   npm run lint && npm run test:run && npx tsc --noEmit
   ```
   No hay script de typecheck: `tsc --noEmit` va directo (`strict: false`). Si `tsc` ya fallaba en `main`, solo bloquean los errores nuevos. Nunca `next build` con `next dev` arriba (comparten `.next`). El CI (`.github/workflows/ci.yml`) corre lint, `test:run` y build. Si algo falla, se arregla antes de revisar.
3. **Revisor independiente.** Quien escribió el código no se revisa a sí mismo: lanza un subagente `general-purpose` de solo lectura con el alcance y este checklist. Pídele hallazgos con archivo:línea, principio violado y arreglo concreto, y que use CodeGraph (`codegraph_context`, `codegraph_impact`) si está inicializado. No le pases tus conclusiones.
4. **Verifica cada hallazgo.** Ábrelo en el código. Si es real, conserva o ajusta su severidad; si no, descártalo y di por qué. Nunca reportes algo que no viste.
5. **Reporta y aplica.** Los arreglos triviales se aplican y se anotan; los grandes o con decisión abierta se reportan primero y esperan aprobación.
6. **Prueba lo arreglado.** Cada arreglo de lógica lleva su prueba; rómpela una vez a propósito para ver que falla. Vuelve a correr el gate.

## Checklist

### 1. Drift entre plan y código
- [ ] Lo que el plan dejó "para después" está hecho o es un ticket explícito.
- [ ] Los compromisos no planeados siguen justificados; si no, se revierten.
- [ ] Muchos smells estructurales = el diseño previo quedó corto. Dilo, es feedback para `texcoco-fe-architect`.

### 2. Capas (DIP / SRP)
Mapa: `src/api/` (axios), `src/actions/` (fetch de servidor y server actions), `src/hooks/` (React Query), `src/constants/`, `src/schemas/` (Yup), `src/types/`, `src/utils/` (sin dominio), `src/context/{name}/`, helpers y subcomponentes co-locados con la página.
- [ ] Componente que llama `privateApi`/`publicApi`/`api` o una función de `src/api/` directo → pasa por un hook. Hay pantallas admin viejas que llaman `api/` con `useState` + efecto (`admin/quotes/Quotes.jsx`): no propagues el patrón.
- [ ] Hook que llama axios directo → función de `src/api/`. Una función de `api/` no importa React ni decide negocio.
- [ ] Presentacional que fetchea; `utils/` con conceptos de dominio; lógica de negocio en componentes.
- [ ] Componente que fetchea, transforma, maneja form y pinta N secciones → pase de extracción.
- [ ] Cascada de `if (status === …)` → tabla en `src/constants/` (hoy conviven `constants/quotes/status.ts` y `helpers/quotes`: reúsa, no sumes una tercera). Bolsa de booleanos → unión de estados.

### 3. Duplicación (DRY, en el segundo uso)
- [ ] Busca el **concepto** en todo el repo (`codegraph_search` o `rg`): `getApiErrorMessage`, `toCapitalizeWords`, `formatPhoneNumber`, `CrudAdminTable`, `components/DataGrid/`, `queryKeys`.
- [ ] Helper de 1 a 3 líneas con un solo uso → inlinear. Lo que solo se parece se queda separado; dilo.

### 4. React y render
- [ ] `useEffect` + `setState` para algo derivable → derivar en render.
- [ ] `useMemo`/`useCallback` preventivo; valor estático dentro del componente → constante de módulo.
- [ ] `key={index}` en listas que reordenan o filtran; efecto sin cleanup (timers, listeners, `socket.io-client`).
- [ ] Componente pesado sin `dynamic()` (precedente: `add-product/AddProduct.tsx`, `checkout/CheckoutPage.js`).
- [ ] `localStorage`/`js-cookie` directo en componente → hook o `utils/cookies.js`.
- [ ] `"use client"` innecesario, o página RSC convertida en client sin razón.

### 5. Datos (TanStack Query)
- [ ] Mutation que no invalida la key correcta (factory de `src/constants/queryKeys.ts`); key literal inline.
- [ ] `staleTime` inline → `staleTimes`/`gcTimes` de `src/constants/queryConfig.js`.
- [ ] Estado del servidor copiado en `useState`; waterfalls con `enabled` sin dependencia real.
- [ ] Paginación admin: server-side con `paginationModel` del DataGrid; un `size` alto es deuda que se reporta. (No existe `useServerPagination`: eso es de Toluca.)

### 6. Auth, sesión y middleware (propio de Texcoco)
- [ ] Página nueva agregada a la lista correcta de `src/routes.js`: `publicRoutes`, `userRoutes`, `adminRoutes` o `superAdminRoutes`. Una ruta que no está en ninguna solo exige sesión: cualquier rol, incluido `user`, entra → 🔴.
- [ ] El middleware evalúa `adminRoutes` **antes** que `superAdminRoutes`: una ruta en ambas queda abierta a `admin`. Algo solo de superadmin no va en `adminRoutes`.
- [ ] Navegación y guard coinciden: `src/layouts/admin/drawerItems.js` (desktop) y `src/navbars/admin/admin-sections.js` (móvil) con el mismo `visibleFor`, y ese `visibleFor` igual a la lista de `routes.js`. Hoy `/admin/products` se muestra a `admin` pero el middleware lo manda a `/admin/quotes`; no sumes más casos así.
- [ ] Protección en el componente en vez de `src/middleware.js`; esconder un botón no es seguridad.
- [ ] Sin refresh tokens: `jwt` callback guarda el access en `token.data` solo en el login; un 401 en `privateApi` emite `SESSION_EXPIRED` y `GlobalAuthWatcher` cierra sesión. No metas reintentos ni rotación a medias.
- [ ] Logout = server action `src/actions/logout.js` (`signOut()`); no llama `GET /auth/logout` del BE. Es un hueco conocido: no lo reportes como nuevo salvo que el cambio toque el logout.
- [ ] `auth()` en el root layout: ya está (deuda conocida, rompe `/product/[id]` on-demand en Vercel). No sumes otra lectura de cookies o `headers()` en layouts compartidos; si el cambio toca páginas de producto, recomiéndale al usuario portar el arreglo de Toluca.
- [ ] Token leído fuera de la sesión de next-auth; roles como string suelto en componentes.

### 7. Errores y feedback
- [ ] Mutation sin `onError`, o con mensaje genérico en vez de `getApiErrorMessage(error)` (`src/utils/apiError.ts`; aquí no existe `createApiError`).
- [ ] Manejo duplicado (`onError` + `try/catch`); 401/403/409/429 tratados antes del catch genérico.
- [ ] Feedback con `console.*` o `alert` → `enqueueSnackbar` (notistack). `console.log` nuevo → quitar.

### 8. Styling (MUI 5 + `sx` y `src/theme/`)
- [ ] Hex en `sx` → token (`primary.main`, `grey.light`, `secondary.main`); token que no existe en `palette.js` (resuelve a `undefined`).
- [ ] `px`/`rem` para tipografía → `<Typography variant>` o `typography.js`; números mágicos de layout → `sizes.js`.
- [ ] Mismo bloque `sx` en 2 lugares → componente compartido u override en `theme/components.js`.
- [ ] Loader equivocado: página `<Loading />`, botón `LoadingButton`, error con `<ErrorUI onRetry />`.

### 9. TypeScript (`strict: false`)
- [ ] `as`/`as any` que tapa un desajuste → se arregla en `src/types/`; tipo nuevo verificado contra la respuesta viva del BE.
- [ ] Fallback sobre valor garantizado; `async` sin `await`; exports sin consumidor; `.js` nuevo con forma de dominio conocida → `.ts`.

### 10. Copy (español, sin i18n)
- [ ] Texto visible o mensaje de Yup en inglés o vacío → español.
- [ ] La marca es "Ferretería Texcoco"; un "Toluca" o "Ferretera Toluca" en pantalla es fuga de un backport → 🔴.
- [ ] Precios: el catálogo de Texcoco no los muestra; un precio en UI es un cambio de producto, no un detalle.

### 11. Seguridad del cliente
- [ ] `dangerouslySetInnerHTML` sin contenido confiable; secreto fuera de `NEXT_PUBLIC_*` en el bundle.
- [ ] `callbackUrl` o destino tomado de la URL sin validar; dato de otro usuario pintado en la UI.

### 12. Pruebas (Vitest + Testing Library)
- [ ] Lógica nueva sin prueba en `src/__tests__/` (misma ruta que en `src/`).
- [ ] Mock de internals en vez del borde (`src/api/`); falta `createQueryWrapper` con React Query.
- [ ] MUI `Select`/`Autocomplete` probados con setters nativos → `userEvent`. Prueba que codifica un bug o aserción débil.
- [ ] Cambio en `routes.js`: no hay prueba de guards por página; propón una (como `guardedPages.test.ts` de Toluca) si el cambio agrega rutas.

### 13. Comentarios (cero por defecto)
- [ ] JSDoc, comentario que repite el código, historia o ticket → borrar. Solo el porqué no derivable.
- [ ] Si escribiste el código, cita cada comentario nuevo y justifícalo. Nada agregado a código que no cambiaste.

## Gate antes del commit

- [ ] Lint, `test:run` y `tsc --noEmit` en verde (sin errores nuevos contra `main`).
- [ ] 🔴 arreglados; 🟡 arreglados o en ticket.
- [ ] Cambio en auth, rutas, cotizaciones o carga de productos → `texcoco-fe-smoke` además de las pruebas.
- [ ] Algo que necesita al BE (`ferretera-api`) → redactado con `/validate-fe` o en el PR.
- [ ] Commits sin trailer de coautor de Claude. Siguiente paso: `/stage` y `/create-pr`.

## Reporte

Primero 🔴, luego 🟡 y 🟢: archivo:línea, smell, principio (SRP, DIP, DRY, capa, auth, perf, seguridad, copy) y arreglo. Secciones sin hallazgos en una línea ("limpio"). Hallazgos descartados, con su razón en una línea. Al final: resultado del gate, totales por severidad, qué se aplicó, qué queda abierto y la recomendación.

## Reglas

- Nunca "se ve bien" sin recorrer cada sección; nunca refactor de código correcto por gusto ni features no pedidas.
- Lo que en Toluca es regla no lo es aquí por defecto: verifica en este repo antes de exigirlo.
- Consulta Context7 antes de afirmar APIs de Next, MUI, TanStack Query, next-auth, RHF o Yup.
