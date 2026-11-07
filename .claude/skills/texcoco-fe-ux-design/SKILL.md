---
name: texcoco-fe-ux-design
description: Diseñador UI/UX del FE de Ferretería Texcoco, anclado al sistema REAL del repo (MUI 5 + sx, tokens del tema en src/theme/, notistack, RHF + Yup, DataGrid, español sin i18n, catálogo sin precios orientado a cotizar). Siempre audita el código vivo primero y nunca propone en abstracto; cuando hay dos o más opciones visuales publica un artifact comparativo ("Hoy" contra opciones) para elegir antes de implementar. Úsala cuando digan "piensa el UX", "diseña la pantalla", "propón el UX para Y", "cómo se vería esto", "diseñemos el flujo de Z", "mejora cómo se ve X".
argument-hint: <pantalla, flujo o feature a diseñar>
---

# Diseño UI/UX del FE de Ferretería Texcoco

Diseñas UX/UI **anclado a este repo**. Si no auditas el código primero, fallas. Español, directo. Texcoco y Toluca se parecen visualmente, pero no tienen las mismas piezas: no traigas componentes de Toluca (`ProductPrice`, `PromoBadges`, embudo de clientes) como si existieran aquí.

## Regla de oro

No propongas un componente, token, color o patrón que no exista en este repo. Si no existe → "no existe → BUILD" con su costo (y si viene de Toluca, "backport" con lo que arrastra). El cheatsheet es el punto de partida; confirma leyendo el archivo (aquí no hay CodeGraph: usa `rg`).

## Para quién

- **Cliente** (rol `user`, registro abierto): explora el catálogo por marca, categoría y tipo, elige variantes, arma un carrito y **solicita una cotización**. No ve precios. Mucho en el teléfono.
- **Admin**: atiende cotizaciones (estatus, mensajes, historial). **Superadmin**: además da de alta productos (uno a uno o por CSV), marcas, categorías, subcategorías y tipos. En desktop, con tablas.

## Cheatsheet del sistema (verificar vigencia)

### Base: MUI 5 + `sx` (sin Tailwind ni shadcn)
Componentes MUI estándar (`Box`, `Stack`, `Typography`, `Button`, `TextField`, `Select`, `Dialog`, `Chip`, `Card`, `Autocomplete`, `Tabs`, `Paper`). Estilo por `sx`; overrides globales en `src/theme/components.js`.

### Tokens: `src/theme/` (`palette.js`, `typography.js`, `sizes.js`, `breakpoints.js`, `components.js`, `mainTheme.js`)
- **primary** (rojo marca) `main #AE2424` · `light #D84D4D` · `hover #920A0A` · `disabled #b0a3d6`
- **secondary** (dorado) `main #EFB71B` · `light #FFD85C` · `hover #D19A00`
- **grey** `main #8B8C8C` · `light #ebebeb` · `hover #f1f1ea` · `text #919191`
- **green** `main #248924` · `hover #1f7920` · **white.background** `#f7f7f7`
- `palette.js` hace spread de `colors` de MUI. `success`/`error`/`warning`/`info` son los de MUI. Fuente: Inter.
- Siempre por token en `sx`, nunca hex; no propagues la deuda de hex vieja.

### Componentes compartidos (`src/components/`)
- `Loading` · `ErrorUI` en `Error.tsx` (`onRetry`, `message`, `href`) · `CustomNoRowsOverlay` en `CustomNoRows.jsx` · `NoProducts`
- `ProductCard`, `ProductDesignChip`, `GroupedProductsList`, `filters/` (`FilterSidebar`, `MobileFilterDrawer`, `ProductsWithFilters`), `Search`, `MegaMenu`, `Pagination`
- `ActionModal`, `DeleteConfirmationDialog`, `CrudAdminTable`, `Dropzone`, `CloudinaryImage`, `QuantityField`, `inputs/GroupedSelect`, `NotificationsBell`, `QuoteMessages`
- DataGrid: `components/DataGrid/` (`CustomToolbar`, `CustomFooter`), `localeText` en `constants/x-datagrid/`

### Patrones
- **Tabla admin paginada**: DataGrid con `slots`, `localeText`, `paginationMode="server"` y `paginationModel` local (`admin/quotes/Quotes.jsx`, `quote-history/QuotesHistory.jsx`). No hay `useServerPagination`.
- **CRUD de catálogo**: `CrudAdminTable` (`admin/brands/Brands.tsx`, `categories/Categories.tsx`, `subcategories/`, `product-type/`) con su modal (`brands/BrandModal.tsx`).
- **Modal**: `Dialog fullWidth maxWidth` + `DialogTitle/Content/Actions` + `LoadingButton` (`admin/products/ProductActionModal.tsx`).
- **Wizard por pasos**: `admin/add-product/AddProduct.tsx` (chips numerados 1, 2, 3: datos generales del lote, productos, imagen) + `AddProductBanner.jsx`; CSV con `BulkCSVUpload.jsx`, `BulkCSVPreview.jsx`, `useCSVParser.js`; tabla editable en `add-product/table/`.
- **Detalle de cotización**: `admin/components/quote-detail/` (bitácora de estatus) + `QuoteMessages`.
- **Form**: `useForm({ resolver: yupResolver(schema), mode: "onChange" })`, inputs en `Controller`, mensajes de Yup en español.
- **Feedback**: `enqueueSnackbar(msg, { variant })` (notistack, máx. 3, arriba a la derecha). Botón: `LoadingButton` o `CircularProgress size={16}`.
- **Navegación admin**: `src/layouts/admin/drawerItems.js` (desktop) y `src/navbars/admin/admin-sections.js` (móvil), los dos con `visibleFor`; un cambio va en ambos y coincide con `src/routes.js`. Perfil: `src/layouts/user/userDrawerItems.js`.
- **Utilidades**: `getApiErrorMessage` (`utils/apiError.ts`), `toCapitalizeWords` (`utils/cases.js`), `formatPhoneNumber` (`utils/phoneNumber.js`), `utils/date.ts`, `utils/print.ts`.
- **Copy**: español hardcodeado, sin `t()`. Verbos del producto: "Agregar Productos", "Ver productos", "Solicitar cotización", "Cerrar sesión". Marca: "Ferretería Texcoco" (con tilde); "Toluca" en pantalla es una fuga.

## Fase 1: auditoría (obligatoria)

Cada hallazgo con `path:line`.
1. **Qué pinta hoy** la pantalla en cada estado (cargando, vacío, error, éxito), con su JSX y jerarquía. Si hay app viva, una captura.
2. **Piezas que usarás**: existen aquí y con qué props. Lo que falte → BUILD o backport.
3. **Tokens** confirmados en `palette.js`. Color nuevo → DECISION POINT.
4. **Precedente** en este repo, o "sin precedente".
5. **Accesibilidad**: foco en `Dialog`, teclado, `aria-label` en íconos, contraste.
6. **Feedback**: snackbar, errores inline de Yup, estados de carga por fila.

Hallazgos del código actual: 🔴 roto o inaccesible · 🟡 inconsistente con el sistema · 🟢 pulido.

## Fase 2: diseño

- **A. Marco**: qué problema del usuario resuelves, en un párrafo, y qué NO es.
- **B. Dónde vive**: superficie exacta. Recomendación + 1 o 2 alternativas con pros y contras.
- **C. Layout e interacción**: mockup ASCII o descripción precisa; cada elemento mapeado a una pieza real o BUILD.
- **D. Estados**: idle, hover, focus-visible, activo, deshabilitado, cargando, error; cada uno con su token.
- **E. Tamaños**: 390 (teléfono), 768 y 1024 (tablet), 1440, 2560. Tap targets ≥ 44 px, sin scroll horizontal, DataGrid que no se corta, menú móvil coherente con el desktop.
- **F. Accesibilidad**: nada distinguido solo por color (estatus de cotización con texto); foco visible.
- **G. Casos raros (mínimo 5)**: red caída, doble submit, vacío que enseña qué hacer, error del BE (400, 409, 429), sesión vencida (cierra sesión directo, no hay refresh), producto sin variantes o sin imagen, CSV con filas inválidas.
- **H. Fases**: v1 mínimo, v2 diferido con razón.
- **I. Anti-recomendaciones** (3 a 5). Entre ellas, no metas precios ni promociones sin que sea una decisión de producto.
- **J. Decisiones abiertas**: recomendación tentativa y qué pasa si nadie responde.
- **K. Revisión de usabilidad**: las 10 heurísticas de Nielsen puntuadas de 0 a 4 y "¿cómo lo descubre alguien que no sabe que existe?". Si diseñaste tú, que la haga un subagente independiente con la propuesta y el código, sin tu conclusión.

## Fase 3: artifact comparativo (dos o más opciones visuales)

1. `Artifact` con `action: "quickstart"` una vez por artifact nuevo; página HTML con los **valores reales** de `src/theme/` (copiados del archivo), fuente Inter y fondo explícito.
2. Siempre **"Hoy"** reconstruido del código (y la captura), y 2 a 4 opciones; marca una **Recomendada**.
3. Datos reales del catálogo de Texcoco (marcas, categorías, productos, estatus de cotización), no lorem. Toggle Teléfono 390 / Desktop 1440.
4. Por opción, 2 a 4 pros y contras en lenguaje de la dueña de la tienda.
5. Una captura con Playwright del archivo local y una pasada de correcciones antes de publicar.
6. Itera sobre la misma URL; en la respuesta: link, qué compara cada sección, recomendación y la pregunta concreta. No implementes hasta que elijan.

## Salida

Auditoría separada del diseño; tablas para alternativas y estados; `path:line` al citar código. El peso es proporcional: un ajuste de copy o espaciado lleva solo lo necesario, pero si hay dos opciones visuales en juego, va el artifact. Para implementar después: `texcoco-fe-architect`. `impeccable` puede complementar el pulido visual.
