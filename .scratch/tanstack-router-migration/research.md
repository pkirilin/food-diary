# Migrating the frontend from React Router to TanStack Router — research

Research date: **2026-10-03**. Versions verified against the npm registry that day:

| Package | Latest | Published |
|---|---|---|
| `@tanstack/react-router` | **1.170.41** (deps: `router-core 1.171.34`, `history 1.162.4`) | 2026-09-30 |
| `@tanstack/router-plugin` | **1.168.42** (peers `vite >=5…>=8`, `@tanstack/react-router ^1.170.41`) | 2026-09-30 |
| `@tanstack/router-core` | 1.171.34 | 2026-09-30 |
| `@tanstack/react-router-devtools` | 1.167.2 | 2026-09-13 |
| `@tanstack/zod-adapter` | 1.167.0 (peers `zod ^3.23.8`) | 2026-07-24 |
| `@tanstack/virtual-file-routes` | 1.162.0 | 2026-06-30 |
| `@tanstack/router-cli` / `router-generator` | 1.167.40 | 2026-09-30 |

Type and runtime claims were checked against the **published tarballs** (`npm pack` of the packages above, unpacked
in the session scratchpad). They were also checked with a **probe project** that installed those exact versions plus
`react@19.3`, `@mui/material@9.4.0`, `zod@3.25.76`, `typescript@5.9.3`, `vitest@4.1.11`, `eslint@10` and
`typescript-eslint@8`. The probe's route tree mirrors this app's shape: root → pathless `_app` layout with an auth
`beforeLoad` → `/`, `/history`, `/products`, `/products/new`, `/weight`, plus `/login` and `/post-login`. It ran
`tsc`, nine vitest/jsdom tests and type-checked ESLint (see the [Appendix](#appendix-probes)). TanStack docs were read
from a sparse clone of `TanStack/router` at `1f0f20a3` (2026-10-01). Doc URLs follow
`https://tanstack.com/router/latest/docs/<path>`, and the raw files are in `docs/router/<path>.md`. Nothing in the
repo was modified apart from this file. Paths like `src/…` and `tests/…` are relative to `src/frontend/`.

This builds on [`.scratch/routes-instead-of-modals/research.md`](../routes-instead-of-modals/research.md) ("prior
research"), which chose TanStack Router. This document does not repeat that comparison.

---

## 1. Bottom line

1. **The surface is small, but it is not just "loaders and links".** There are **26 files with a `react-router`
   import** (6 in `app/`, 10 in `pages/`, 8 in `widgets/` + `features/`, 2 in `tests/render/`), 9 routes, and **2 route `action`s** (`LoginPage`,
   `LogoutPage`) driven by **6 `useSubmit` call sites**. TanStack Router has **no actions**: "it does not manage
   mutation or submission state" ([data-mutations](https://tanstack.com/router/latest/docs/guide/data-mutations)).
   Login/logout therefore become plain functions, and the two GET "submits" (`SelectDate`, `FilterNotesHistory`)
   become typed `navigate({ search })`. The repo uses **no** `useSearchParams`, `useNavigate` or `NavLink` today
   (`NavLink` in `widgets/Navigation` is a local type). Full table in §2.

2. **Plan a single runtime cut-over, preceded by router-agnostic prep PRs.** The official checklist says "At this
   point I don't know if you can do a gradual migration, but it seems likely you could have multiple router
   providers, not desirable" (`installation/migrate-from-react-router.md:12`). The how-to's step 1.2 "keep React
   Router temporarily" is only about installation (`how-to/migrate-from-react-router.md:38`), and no coexistence
   mechanism is documented. What *can* land first on React Router are the changes that remove router coupling:
   actions → functions, pages → props, and the `returnUrl` fixes (§11).

3. **Use file-based routing with `routesDirectory: 'src/app/routes'`, not the POC's `src/routes`.** Route files in
   `app/` that import `pages/*` respect FSD's import direction. The plugin runs under vitest because it generates in
   Vite's `configResolved` (`router-plugin@1.168.42 src/core/router-generator-plugin.ts:79-83`; probe: deleting
   `routeTree.gen.ts` and running vitest regenerated it byte-identical). The generated file **must be committed**
   (FAQ, and `yarn build` runs `tsc` before `vite build`) and **must be added to ESLint `globalIgnores` and
   `.prettierignore`**. It is emitted without semicolons (`api/file-based-routing.md:180-187`), while the repo's
   Prettier uses `"semi": true`. Code-based routing is "not recommended for most applications"
   (`routing/code-based-routing.md:6`). Virtual routes add nothing that `routesDirectory` doesn't already give (§4).

4. **The AppBar contract types cleanly with no casts or guards (verified).** Augment
   `StaticDataRouteOption { appBar: AppBarConfig | null }` with a discriminated union
   (`menu` / `back` / `search`). The generated types then **require** `staticData` on **every** route, including root
   and pathless layouts (`router-core route.d.ts:108-114`; probe: a route without it fails `tsc`, and an unknown
   `variant` fails `tsc`). A leaf-agnostic consumer
   `useMatches({ select: m => m.at(-1)?.staticData.appBar })` gets `AppBarConfig | null | undefined` and narrows with
   `switch (variant)`. **Gotcha:** `staticData`, `beforeLoad` and `loader` are *critical* config that stays in the
   main bundle (`guide/code-splitting.md:15-28`). Today's JSX titles (`SelectDate`, `FilterNotesHistory` with MUI
   date pickers) must therefore enter `staticData` as **lazy** slot components, or the pickers move into the entry
   chunk (§5).

5. **RTK Query stays the cache. TanStack only coordinates.** Inject the store with
   `createRootRouteWithContext<{ store }>()`, keep `initiate()` / `unsubscribe()` in loaders (probe), and set
   `defaultPreloadStaleTime: 0`, the one change the docs prescribe for an external cache
   (`guide/data-loading.md:327-342`). Drop the POC's `defaultStaleTime: 5000`. The repo's `zod@3.25.76` already
   implements Standard Schema (`zod/v3/types.d.ts:54`), so `validateSearch: schema` works without an adapter. But
   `.catch()` makes the *navigation* input `unknown` in both zod v3 and v4 (probe). Use `@tanstack/zod-adapter`'s
   `fallback()` where malformed URLs must degrade gracefully (§6).

6. **Hash URLs, the backend redirects, PWA and the GitHub Pages demo carry over unchanged (verified).**
   `createHashHistory` produces `#/history?month=10&year=2023` and `#/?date=2023-10-19`, the same as today. It parses
   the backend's hard-coded `/#/post-login?returnUrl=…` (`AuthController.cs:30`) and `/#/post-logout`
   (`Startup.cs:61`). `createHref` prefixes `location.pathname`, so `base: './'` and the `/food-diary/` Pages subpath
   need no `basepath` (`history@1.162.4 src/index.ts:609-628`). One one-time gotcha: a tab whose current entry was
   written by React Router (`history.state = {usr,key,idx}`) gets no `__TSR_index`, so `useCanGoBack()` returns
   **true** on the first load after deploy (probe; `src/index.ts:336-346`) (§8).

7. **Two lint traps, both cheap to fix.** typescript-eslint's `only-throw-error` (in `recommendedTypeChecked`)
   rejects `throw redirect(...)` because `Redirect = Response & {…}` (`router-core redirect.d.ts:7`). Use
   `redirect({ …, throw: true })` instead, which passed lint and the auth test in the probe. Separately, the repo
   convention of **arrow-function components** combined with TanStack's habit of declaring route components *below*
   `export const Route` causes a TDZ `ReferenceError` when the code splitter doesn't run. `tsc` catches it as TS2448
   (probe). Declare components above `Route`, or import them from `pages/`.

8. **Testing changes shape: rendering becomes async.** After `await router.load()`, a `RouterProvider` renders
   synchronously. Without it, the UI is absent on the first synchronous query (probe). So `render()` becomes
   `async`, and its 5 importers `await` it. The setup-testing doc's "alternative" helper passes the UI as
   `RouterProvider` children, and those **are dropped**: `RouterProvider` renders only `<Matches />`
   (`react-router@1.170.41 src/RouterProvider.tsx:61-70`; probe). Put the UI under test in a route component instead.

9. **Health delta since 2026-10-02: none material.** There has been no new `@tanstack/react-router` release since
   1.170.41 (2026-09-30). 162 stable 1.x releases in 2026, 9 in September. 713 open issues, 15,146 stars. New issues
   worth knowing about: #8487 (React 19 "conditional `use()`" warning from `lazyRouteComponent`, which
   `autoCodeSplitting` uses) and #8198 (an invariant on interrupted concurrent renders, "information needed"). There
   is still **no v2 announcement**, but the docs name v2 behaviours: `autoCodeSplitting` default `true`
   (`api/file-based-routing.md:197-198`), plus removal of `location.state.key`, `RouterClass`,
   `rootRouteWithContext` and `opts.navigate`. Use only the non-deprecated APIs.

10. **Bundle: TanStack is slightly smaller for the API set this app uses.** esbuild, minified, React external:
    `react-router@7.18.4` 97.2 KB raw / **32.9 KB gzip**; `@tanstack/react-router@1.170.41` 81.2 KB raw /
    **29.0 KB gzip**. Devtools compile to `() => null` outside development
    (`react-router-devtools@1.167.2 dist/esm/index.js:5-7`). A full-app build comparison was skipped because the POC
    branch does not port the app's routes, so the builds would compare different apps (§8.4).

---

## 2. Migration surface (inventory)

`rg -n "react-router" src tests` → 28 files. Two of them only mention it in comments (`tests/setup.ts:22`,
`src/entities/note/lib/useFormValues.ts:13`). `src/pages/ui/RootPage.tsx` imports React Router but is **dead code**:
it is referenced nowhere (`rg RootPage`), so delete it.

### 2.1 RR API → TanStack equivalent

| React Router usage | TanStack equivalent | Files (repo `path:line`) | Notes / gotchas |
|---|---|---|---|
| `createHashRouter([...])` route objects, `lazy: () => import(...)` | File routes under `src/app/routes/` + `createRouter({ routeTree, history: createHashHistory(), context })` ([history-types](https://tanstack.com/router/latest/docs/guide/history-types), [file-based-routing](https://tanstack.com/router/latest/docs/routing/file-based-routing)) | `src/app/routing/createRouter.tsx:1-63` | `autoCodeSplitting` replaces `lazy`. Keep a **factory** (`createAppRouter(store, history?)`) for tests, and register `Register { router: ReturnType<typeof createAppRouter> }` (probe ✓). |
| `<RouterProvider router>` | `RouterProvider` from `@tanstack/react-router` | `src/app/index.tsx:3,27`; `tests/render/render.tsx:36,47` | The first load starts on mount (`Transitioner.tsx:88-90`), so `<WithMockApi>` around it keeps working. |
| `HydrateFallback: AppLoader` | `pendingComponent: AppLoader, pendingMs: 0` on the `_app` layout (and on `/login`) | `createRouter.tsx:8` | Probe: shown on the initial load only. Later navigations keep the old page, because no pending boundary is published without a pending component (`router-core src/load-client.ts:1467-1480`). |
| Layout `loader` + `redirect()` auth gate, `shouldRevalidate: () => true` | `_app.tsx` pathless route, `beforeLoad` + `redirect({ to: '/login', search: { returnUrl: location.href }, throw: true })` ([authenticated-routes](https://tanstack.com/router/latest/docs/guide/authenticated-routes)) | `src/app/routing/AuthenticatedLayout.tsx:21-41` | `beforeLoad` runs on every navigation **and every preload** (`guide/authenticated-routes.md:16-24`). See §7. |
| `errorElement` / `ErrorBoundary` exports | `errorComponent` on `_app` (and root); `defaultNotFoundComponent` or a root `notFoundComponent` ([not-found-errors](https://tanstack.com/router/latest/docs/guide/not-found-errors)) | `createRouter.tsx:14`; `AuthenticatedLayout.tsx:43-47`; `UnauthenticatedLayout.tsx:7-11`; `ErrorLayout.tsx`, `ErrorPage.tsx` | `NotFoundRoute` is deprecated (`guide/not-found-errors.md:5`). |
| `<Outlet />` | `Outlet` | `AuthenticatedLayout.tsx:78`; `UnauthenticatedLayout.tsx:17` | 1:1. |
| `<ScrollRestoration />` | `createRouter({ scrollRestoration: true })` | `AuthenticatedLayout.tsx:56`; `UnauthenticatedLayout.tsx:15` | The component "still works, but has been deprecated" (`guide/scroll-restoration.md:59-64`). Keep the `window.scrollTo` stub in `tests/setup.ts:23-26` (probe logs "Not implemented: scrollTo" without it). |
| `loader: LoaderFunction` + `useLoaderData<T>()` (unchecked generic) | `loader` inferred per route; `Route.useLoaderData()` / `getRouteApi(id).useLoaderData()` | `IndexPage.tsx:26,46`; `HistoryPage.tsx:21,50`; `WeightPage.tsx:16,43`; `ProductsPage.tsx:9`; `CategoriesPage.tsx:9`; `LoginPage.tsx:12` | Loaders should **return void or request params**, not query data. `HistoryPage` returning `notes` freezes data that RTK keeps updating. Read via RTK hooks, as `IndexPage` already does (`IndexPage.tsx:47`). |
| `ok()` (`new Response(null)`) | Delete: return `undefined` | `src/pages/lib/reactRouterExtensions.ts:1`; users `AuthenticatedLayout.tsx:12,35`, `LoginPage.tsx:10,24`, `ProductsPage.tsx:7,15`, `CategoriesPage.tsx:7,14` | Also removes the `app → pages/lib` import (`AuthenticatedLayout.tsx:12`). |
| `new URL(request.url).searchParams.get(...)` | `validateSearch` (zod) + `loaderDeps` + `Route.useSearch()` ([search-params](https://tanstack.com/router/latest/docs/guide/search-params)) | `IndexPage.tsx:27-28`; `HistoryPage.tsx:22-25`; `AuthenticatedLayout.tsx:30`; `LoginPage.tsx:31` | The default parser JSON-parses values: `month=10` → number `10`, while `date=2023-10-19` stays a string (`router-core src/searchParams.ts:4-53`; probe). Schemas must accept numbers for `month`/`year`. |
| `action: ActionFunction` + `<Form method="post">` + `useSubmit(null,{method:'post',action})` | **No equivalent.** Plain `signIn(returnUrl)` / `signOut()` in `features/auth` | `LoginPage.tsx:30-41`; `LogoutPage.tsx:4-12`; `SignInForm.tsx:3,8,14,20`; `NavigationDrawerActions.tsx:4,7,15`; `useAuthStatusCheckEffect.ts:2,8,16`; `tests/render/TestEnvironment.tsx:2,17,25` | **Don't** turn `/logout` into a route with a side-effecting `beforeLoad`: preloading runs `beforeLoad`. `TestEnvironment`'s `signOutAfterMilliseconds` has **no callers** (`rg`), so delete it. |
| `redirectDocument(url)` | `window.location.assign(url)` inside the function, or `redirect({ href, … })` from a `beforeLoad` ([RedirectType](https://tanstack.com/router/latest/docs/api/router/RedirectType)) | `LoginPage.tsx:40`; `LogoutPage.tsx:11` | "For external URLs, always use the `href` property" (`api/router/RedirectType.md:45-47`). |
| GET `useSubmit(new URLSearchParams(...), { action })` | `navigate({ to: '/', search: { date } })` | `SelectDate.tsx:11-21`; `FilterNotesHistory.tsx:17,50-56` | Typed `search`. Better: receive `onSubmitDate` from the route adapter (§4.3). |
| `useParams()` | `Route.useSearch()` | `PostLoginPage.tsx:7,10` | **Latent bug:** `/post-login` has no `:returnUrl` path param, so `params.returnUrl` is always `undefined` and the redirect always goes to `/`. The backend sends `?returnUrl=` (`AuthController.cs:30`). Per the docs, use `router.history.push(returnUrl)` for a full href (`guide/authenticated-routes.md:124-128`). |
| `<Navigate to>` | `Navigate` ([navigateComponent](https://tanstack.com/router/latest/docs/api/router/navigateComponent)) | `PostLoginPage.tsx:11`; `PostLogoutPage.tsx:9` | 1:1. |
| `useMatches()` + `isNavigationLoaderData` guard | `useMatches({ select })` over typed `staticData` | `widgets/Navigation/ui/Navigation.tsx:8-28` | The guard and `NavigationLoaderData` are deleted (§5). |
| `useNavigation()` + `useLocation()` (`useNavigationProgress`, drawer close) | `useRouterState({ select: s => s.isLoading })`; close the drawer in the link's `onClick` or on a `useLocation({ select: l => l.pathname })` change | `app/routing/useNavigationProgress.ts:1-24`; `Navigation.tsx:29-36`; users `AuthenticatedLayout.tsx:50`, `ErrorLayout.tsx:6` | `isLoading` is "`true` when `status` is `pending`". Background reloads don't set it (`api/router/RouterStateType.md`). Probe ✓. |
| `<Link component={RouterLink} to>` on MUI `Link` | `createLink(Link)` ([custom-link](https://tanstack.com/router/latest/docs/guide/custom-link)) | `app/routing/ErrorPage.tsx:14` | §9. |
| `<ListItemButton component={Link} to={createUrl('/', { date })}>` | `createLink(ListItemButton)` + `to="/" search={{ date }}` | `widgets/NotesHistoryList/ui/NotesHistoryList.tsx:33` | Drops `createUrl` here. |
| `<IconButton component={Link} to="/">` | `createLink(IconButton)` | `FilterNotesHistory.tsx:27` | ButtonBase renders `<a>` when `href` is set (probe). |
| `useMatch(`${path}/*`)` + `component={RouterLink}` + manual `selected` | `createLink(ListItemButton)` + `activeProps={{ selected: true }}`; `activeOptions={{ exact: true }}` for `/` | `NavigationDrawerMenuListItem.tsx:11-26`; `NAV_LINKS` in `NavigationDrawerMenuList.tsx:12-38` | `exact` defaults to `false` (`router-core link.d.ts:162-184`), so `/` would match everything. Type `NAV_LINKS` with `linkOptions([...])` ([link-options](https://tanstack.com/router/latest/docs/guide/link-options)) instead of `path: string`. |
| `createMemoryRouter([{ path: '/', element: <TestEnvironment>{ui}</TestEnvironment> }])` | Test router: a root route whose `component` renders the UI, `createMemoryHistory`, `await router.load()` | `tests/render/render.tsx:14-39` | §10. |
| `renderWithRouter()` (real hash router) | `createAppRouter(store, createMemoryHistory({ initialEntries }))` | `tests/render/render.tsx:41-50`; used only by the **skipped** tests in `tests/app.test.tsx:10,28` | §10. |
| Store singleton imported by loaders (`pages → app`) | `context.store` from `createRootRouteWithContext<{ store: AppStore }>()` | `IndexPage.tsx:4`; `HistoryPage.tsx:3`; `WeightPage.tsx:4`; `ProductsPage.tsx:3`; `CategoriesPage.tsx:3`; `LoginPage.tsx:4`; `AuthenticatedLayout.tsx:16` | This removes only the *loader* imports. `@/app/store` is also imported by 15+ files in `entities/` and `features/` (`useAppDispatch`/`useAppSelector`), which is out of scope here. |

Comments to update or delete after the switch: `tests/setup.ts:22` ("react-router-dom's `<ScrollRestoration />`")
and `src/entities/note/lib/useFormValues.ts:13` ("react-router-dom loader data").

### 2.2 Router-touching tests

5 files import `@tests/render` (`rg -l "from '@tests/render'"`): `tests/app.test.tsx` (skipped),
`NutritionSummaryWidget.test.tsx`, `Categories.test.tsx`, `FilterNotesHistory.test.tsx` and `Products.test.tsx`.
`FilterNotesHistory.test.tsx:7-8` calls `getByRole` **synchronously** right after `render()`, so it breaks unless
the helper awaits `router.load()` (§10).

---

## 3. What the official migration guides prescribe

There are two documents, and they differ in depth.

**A. "Migration from React Router Checklist"** (`installation/migrate-from-react-router.md`,
[web](https://tanstack.com/router/latest/docs/installation/migrate-from-react-router)):

1. Install; optionally uninstall React Router so `tsc` lists every leftover import (`:6,10-11`).
2. Gradual migration: "I don't know… it seems likely you could have multiple router providers, not desirable"
   (`:12`). The API similarity makes it "a sprint cycle or two" (`:13`).
3. Create routes for each existing route, a root route and a router instance; add the global `Register` module; remove
   `createBrowserRouter`; set `RouterProvider` (`:14-20`).
4. Replace `Link` (literal `to`, `params`), `useNavigate`, `Outlet`, `useSearchParams` → `validateSearch` + `useSearch`
   + `Link search`, and `useParams({ from })` (`:21-34`).

**B. "How to Migrate from React Router v7"** (`how-to/migrate-from-react-router.md`): 10 steps plus a production
checklist.

| Step | Prescription | Mapping onto this repo |
|---|---|---|
| 1 | Branch, install `@tanstack/react-router`, `-D @tanstack/router-plugin @tanstack/react-router-devtools`, put the plugin **before** `react()` (`:38-63`) | Same as the POC (`git show new-routes-poc:src/frontend/vite.config.ts`) |
| 2 | `tsr.config.json` with `routesDirectory`/`generatedRouteTree`/`quoteStyle` (`:69-79`) | Not needed. The plugin takes the same options inline (POC). `tsr.config.json` only matters for `@tanstack/router-cli`. |
| 3 | Root route, index route, loaders → `Route.useLoaderData()`, dynamic routes, **actions → "mutations or form libraries"** (`:100-256`) | Actions → `signIn`/`signOut` functions (§2.1) |
| 4 | SSR (n/a); code splitting via `createLazyFileRoute` (`:258-342`) | Use `autoCodeSplitting` instead (`api/file-based-routing.md:189-198`) |
| 5 | `Link`/`useNavigate` with typed `to`/`params` (`:344-394`) | §2.1 |
| 6 | `defer` → `pendingComponent` (`:396-448`) | n/a (no `defer`) |
| 7 | Replace router creation in `main.tsx` (`:450-481`) | `src/app/index.tsx` |
| 8 | `useSearchParams` → zod `validateSearch` (`:483-526`) | Index/History hand-parsed search (§6.3) |
| 9 | Uninstall `react-router`; `grep -r "react-router" src/` (`:528-547`) | Final commit of the cut-over |
| 10 | `strict` + `noUncheckedIndexedAccess`; search validation (`:549-582`) | `strict: true` is already on (`tsconfig.json:13`). `noUncheckedIndexedAccess` is a separate decision (not required by the router). |

**Gradual migration, verdict.** Neither document describes a coexistence mechanism. Both routers own
`window.history` and render through their own provider, so two of them can't drive one URL. What *can* coexist is
**code**: both packages installed with only one router mounted. That allows intermediate commits that build.
*Unverified* whether nested providers would even work. Not worth testing, because the prep-then-cut-over plan in §11
avoids needing it.

The how-to's feature table claims "Bundle Size: Smaller" for TanStack (`:717`). That is a vendor claim. The
independent measurement is in §8.4.

---

## 4. Route definition strategy vs FSD

### 4.1 Options

| | File-based (router-plugin) | Code-based | Virtual file routes |
|---|---|---|---|
| Where routes live | `routesDirectory` (any path; default `./src/routes`, `api/file-based-routing.md:33-41`) | Anywhere | A `routes.ts` mapping files relative to `routesDirectory` (`routing/virtual-file-routes.md:16-39`) |
| Codegen | `routeTree.gen.ts` | None | `routeTree.gen.ts` |
| Parent wiring | Generated (`getParentRoute` in the gen file) | Hand-written `getParentRoute` on every route (`routing/code-based-routing.md:53-151`) | Generated |
| Code splitting | `autoCodeSplitting: true` (one file per route) | `createLazyRoute` + `.lazy(() => import(...))` → **two files per route** (`guide/code-splitting.md:320-343`) | `autoCodeSplitting` |
| `createFileRoute('/path')` literal | Managed by the plugin | n/a | Managed |
| Docs stance | Default path | "not recommended for most applications" (`routing/code-based-routing.md:6`) | For "an existing route organization that you want to keep" (`:10-12`) |

**Recommendation: file-based, `routesDirectory: 'src/app/routes'`, `generatedRouteTree: 'src/app/routeTree.gen.ts'`.**

- FSD: route files are app-layer adapters. They import `pages/*` (and, for slots, `features/*`), which is the
  allowed direction. The POC's `src/routes/` (`git show new-routes-poc --stat`) would create a seventh top-level
  folder outside the FSD layers.
- Virtual routes would only matter if route files had to sit inside `pages/`. That would invert FSD, because route
  files import `app` context types. Code-based routing costs a hand-written `getParentRoute` and two files per lazy
  route, which works against the "new routes by analogy, minimal boilerplate" criterion.
- Use the prefix rule for colocated non-route files: `-` (`routeFileIgnorePrefix`, default, `api/file-based-routing.md:67-82`),
  e.g. `src/app/routes/_app/-SelectDateSlot.tsx` (probe).
- **Nesting gotcha for the next step (add flow):** a flat `products.new.tsx` becomes a **child** of `products.tsx`
  (probe tree: `/_app/products/new` with parent `products`). The parent then needs an `<Outlet/>`, or the files must
  be `products.index.tsx` + `products.new.tsx` / `products_.new.tsx`
  ([file-naming-conventions](https://tanstack.com/router/latest/docs/routing/file-naming-conventions)).

### 4.2 Code splitting rules that interact with repo conventions

- Imported components **are** split. When `component: IndexPage` is an identifier imported from `@/pages/...`, the
  splitter moves it into the lazy chunk and removes the now-unused import
  (`router-plugin@1.168.42 src/core/code-splitter/compilers.ts:565-590,763-779`). Import pages per file
  (`@/pages/ui/IndexPage`), as `createRouter.tsx:18-34` does today, not through a barrel.
- "Do not export route properties". Exported components are not split (`guide/automatic-code-splitting.md:81-103`;
  `compilers.ts:585-589`).
- **Arrow-component TDZ.** `component: ProductsRoute` with `const ProductsRoute = () => …` declared *below*
  `export const Route` throws `ReferenceError: Cannot access 'ProductsRoute' before initialization` without the
  splitter. It passes with the splitter, which rewrites the reference to a lazy import. `tsc` reports TS2448/TS2454,
  and ESLint 10's `no-useless-assignment` also fires (all from the probe). TanStack's examples use hoisted
  `function` declarations, which the repo convention forbids (`CLAUDE.md`, "Function components must be arrow
  functions"). Rule: route components are either imported from `pages/` or declared above `Route`.
- Only `component`, `errorComponent`, `pendingComponent`, `notFoundComponent` (and optionally `loader`) are
  splittable (`guide/automatic-code-splitting.md:53-75`). `loader`, `beforeLoad`, `staticData` and `validateSearch`
  are "Critical Route Configuration" in the entry bundle (`guide/code-splitting.md:15-28`). That is acceptable for
  loaders, since the entity APIs are already in the entry via the store, but not for JSX (§5.2).

### 4.3 Pages router-agnostic (architecture criterion)

The issue's criterion is "routing separable from business logic so the latter is testable and the router
swappable". The cheapest way to meet it is: **route file = adapter, page = props.** The route component reads
`Route.useSearch()` / `Route.useLoaderData()` and passes plain values and callbacks
(`<IndexPage date={date} onDateChange={d => navigate({ search: { date: d } })} />`, as in the probe). Pages and
features then need no router in tests. `SelectDate` already has a router-free `SelectDateView`
(`features/note/selectDate/ui/SelectDate.tsx:14`), so the `useSubmit` wrapper can disappear. Navigation widgets
(drawer, history list links) can use `@tanstack/react-router` `Link`/`linkOptions` directly, because navigation *is*
their job.

### 4.4 Generated file × tooling

| Tool | Behaviour | Action |
|---|---|---|
| tsc | The gen file starts with `/* eslint-disable */ // @ts-nocheck` (default `routeTreeFileHeader`, `api/file-based-routing.md:234-246`); its `declare module` augmentation still applies (probe `tsc` clean) | Commit it. `yarn build` = `tsc && vite build` (`package.json` scripts), so `tsc` runs **before** the plugin can generate. The Docker build copies sources and runs the same script (`Dockerfile:9-11`). FAQ: "Yes! … essentially part of your application's runtime" (`faq.md:21-25`). |
| ESLint (`eslint .`, `projectService`) | The gen file contains `as any` and no semicolons | Add `'src/app/routeTree.gen.ts'` to `globalIgnores` (`eslint.config.js:13`), as `installation/with-vite.md:67-74` advises |
| Prettier (`format:check`) | Generator output uses `quoteStyle: 'single'`, `semicolons: false` by default (`api/file-based-routing.md:171-187`); repo `.prettierrc.json` has `"semi": true` | Add it to `.prettierignore`. Optionally set `semicolons: true` so newly scaffolded route files match Prettier. |
| vitest | Uses `vite.config.ts` (`test:` block), so the plugin's `configResolved` generation runs (`router-generator-plugin.ts:79-83`); probe regenerated the tree under vitest | Nothing |
| Temp dir | Atomic writes go to `.tanstack/tmp` by default (`api/file-based-routing.md:264-271`). An empty `src/frontend/.tanstack/tmp/` already exists in the main checkout from the POC and is **not** in `.gitignore` | Add `.tanstack/` to `src/frontend/.gitignore` |
| VS Code | The gen file can open unexpectedly after renames (`installation/with-vite.md:76-96`) | Add the suggested `files.readonlyInclude` / `watcherExclude` / `search.exclude` entries to the tracked `src/frontend/.vscode/settings.json` |
| CI drift | *(suggestion)* | After `yarn build`, run `git diff --exit-code src/app/routeTree.gen.ts`. `@tanstack/router-cli`'s `tsr generate` is the standalone generator (used by the probe) |

### 4.5 What the POC (`new-routes-poc`) established and left open

Commits `8ebecc53…74d1a95d` (2026-10-01 → 2026-10-03). Resolved versions: `react-router@1.170.39`,
`router-plugin@1.168.40`, `react-router-devtools@1.167.2` (`git show new-routes-poc:src/frontend/yarn.lock`).

**Established (keep):**
- File-based routing with `tanstackRouter({ target: 'react', autoCodeSplitting: true, routesDirectory, generatedRouteTree })`
  placed before `react()`, and the gen file committed.
- `Register` augmentation, plus a **required** `StaticDataRouteOption` field (`title: string`, `searchable?: boolean`)
  enforced on every route (`64b76ac3`). The root route had to declare `title: 'Root'`, which confirms "required
  everywhere".
- `createRootRouteWithContext<…>()` + `beforeLoad` context (`79581e20`), typed `Route.useLoaderData()` +
  `pendingComponent` (`abe42364`).
- An AppBar in the root reading the leaf match's `staticData`. A back arrow via `useCanGoBack()` +
  `router.history.back()` (`7be002d9`). A search field toggled by staticData (`74d1a95d`).

**Left open / to change:**
- **No hash history.** `createRouter({ routeTree, … })` uses the default browser history (`src/app/index.tsx` on the
  branch). Add `history: createHashHistory()`.
- The app's routes are not ported. React Router routes remain as dead code, and `react-router` was bumped to v8
  (`8ebecc53`) only to keep it compiling. **Drop that commit:** a single cut-over removes `react-router` entirely,
  so the v8 bump is wasted churn (prior research §5 keeps v8 only as the *fallback*).
- `context: { foo }` demo, with `// TODO: add typing` on `beforeLoad` in `routes/about.tsx`. There is no store
  injection and no auth.
- `defaultStaleTime: 5000` and `defaultPreload: 'intent'` conflict with "RTK owns the cache" and with the auth
  `beforeLoad` (§6, §7).
- Back arrow vs burger is decided by **history** (`canGoBack ? back : menu`), not by route. The user's model is a
  per-route variant, so a deep link into a nested screen should still show back (falling back to the parent).
  `searchable?: boolean` is a flag rather than a discriminated union, so "search without title" is not
  type-enforced.
- `useRouterState({ select: s => s.matches.at(-1) })` returns the whole match object. Select the leaf's
  `staticData.appBar` instead (`useMatches` docs recommend it over raw router state, `api/router/useRouterStateHook.md:9`).
- No ESLint/Prettier ignores, no `.tanstack/` ignore, no test changes. Lint status was **not** checked: the branch
  uses `function` components, against the repo convention.
- Devtools are in `dependencies` (fine: Docker runs a full `yarn install`, and the component is `() => null` in
  production).

---

## 5. Typing the AppBar

### 5.1 Contract (verified in the probe)

```ts
// shared (owned by the AppBar; the augmentation itself sits next to Register in app/)
export type AppBarConfig =
  | { variant: 'menu'; title: string; Title?: ComponentType; Actions?: ComponentType }
  | { variant: 'back'; title: string; Actions?: ComponentType }
  | { variant: 'search'; placeholder: string; Actions?: ComponentType };

declare module '@tanstack/react-router' {
  interface Register { router: ReturnType<typeof createAppRouter> }
  interface StaticDataRouteOption { appBar: AppBarConfig | null }
}
```

- **Required on every route.** `UpdatableStaticRouteOption = {} extends StaticDataRouteOption ? Optional : Required`
  (`router-core@1.171.34 dist/esm/route.d.ts:108-114`), and that type is mixed into root options too
  (`route.d.ts:317,384`). Probe: a route without `staticData` → `tsc` error; `variant: 'drawer'` → error. Use
  **`null`** for root, pathless layouts and auth pages. An explicit `null` beats making `appBar` optional, which
  would let a new screen silently get no AppBar.
- **Leaf-agnostic read.** `useMatches({ select: m => m.at(-1)?.staticData.appBar })`.
  `useMatches`' `select` receives `Array<MakeRouteMatchUnion<TRouter>>` (`react-router@1.170.41 dist/esm/Matches.d.ts:48-50`),
  and every match has `staticData: StaticDataRouteOption` (`router-core Matches.d.ts:66`). Probe: the result is
  assignable to `AppBarConfig | null | undefined`, and `appBar.Title` on the `search` variant is a compile error.
  Narrowing is a `switch (appBar.variant)`, with no guard and no cast. `Navigation.tsx:8-28` (`NavigationLoaderData`,
  `isNavigationLoaderData`, `fallbackNavigation`) is deleted.
- **staticData vs context** ([static-route-data](https://tanstack.com/router/latest/docs/guide/static-route-data),
  `:278-286`): staticData is "synchronous, defined at route creation… same for all instances", while context "can
  depend on params/search". The variant and static title are staticData. The *dynamic* parts are components that
  read their own route's typed state.

### 5.2 Dynamic titles and actions (today: JSX in loader data)

`IndexPage.tsx:36-38` puts `<SelectDate currentDate=…/>` in loader data, and `HistoryPage.tsx:39-42` puts
`<FilterNotesHistory date=…/>` there. Options:

| Option | Typing | Bundle | Verdict |
|---|---|---|---|
| **A. Lazy slot components in `staticData`**: `Title: lazy(() => import('./-SelectDateSlot'))`. The slot reads `getRouteApi('/_app/').useLoaderData()` / `.useSearch()` and renders the feature with props | Fully typed (probe ✓: `getRouteApi('/_app/')` inside the slot) | Pickers stay out of the entry chunk. The AppBar wraps slots in `<Suspense>` | **Recommended** |
| B. Same, but non-lazy imports | Typed | `staticData` is critical config → `@mui/x-date-pickers` lands in the entry bundle (`guide/code-splitting.md:15-28`) | Reject |
| C. `beforeLoad` returns `{ appBarTitle: … }` (router-context "Processing Accumulated Route Context", `guide/router-context.md:500-540`) | Typed per route; a leaf-agnostic read sees a union where some members lack the key. *Unverified* whether that narrows without `in` checks | Same entry-bundle problem as B | Reject |
| D. Each page renders its own `<AppBarLayout variant=…>` | Trivially typed props | Code-split naturally | Contradicts the user's "AppBar at the routing-module level" decision. AppBar remounts per page. Fallback only |

Use React's `lazy` for slots. `lazyRouteComponent` is the router's own wrapper, and issue
[#8487](https://github.com/TanStack/router/issues/8487) (open, 2026-09-23) reports it triggering React 19's
"conditional `use()`" warning.

### 5.3 Back behaviour

- `useCanGoBack()` is still **"currently _experimental_"** (`api/router/useCanGoBack.md`). It is implemented as
  `location.state.__TSR_index !== 0` (`react-router@1.170.41 src/useCanGoBack.ts:11-20`;
  `history@1.162.4 src/index.ts:264`). The index survives refresh because it lives in `history.state`, and it resets
  after `reloadDocument` navigations (doc "Limitations").
- Rule for `variant: 'back'` (Android "Up = Back within the app task", prior research §8.1):
  `canGoBack ? router.history.back() : router.navigate({ to: '..', replace: true })`. This compiled in the probe. The
  runtime resolution of `..` under pathless layouts is **unverified**. Alternative: an explicit typed `backTo`
  (`linkOptions(...)`) in `staticData` for each back route.
- Open issue [#8211](https://github.com/TanStack/router/issues/8211) (`useCanGoBack` hydration error) is SSR-only and
  doesn't apply to this SPA.
- Legacy-state gotcha: see §8.2.

---

## 6. Data loading with RTK Query

### 6.1 Store injection

`createRootRouteWithContext<{ store: AppStore }>()({ … })` plus `createRouter({ context: { store } })`
([router-context](https://tanstack.com/router/latest/docs/guide/router-context), `:16-45`). `loader`/`beforeLoad`
receive a typed `context.store`. The probe's `_app` `beforeLoad` and `/` loader both dispatch
`api.endpoints.x.initiate(...)` and `unsubscribe()` in `finally`, which is the repo's current pattern
(`IndexPage.tsx:29-42`) and RTK's documented non-hook usage
([RTK usage without hooks](https://redux-toolkit.js.org/rtk-query/usage/usage-without-react-hooks)). The test router
passes a fresh `configureStore()`, matching `tests/render/render.tsx:18`.

### 6.2 Cache configuration when RTK owns data

- External-data guide: Router is "a perfect **coordinator** for external data fetching and caching libraries" and
  lists RTK Query (`guide/external-data-loading.md:11-35`).
- The one prescribed change: "if you'd like to use an external cache… the only change you'll need to make is to set
  the `defaultPreloadStaleTime` option on the router to `0`" (`guide/data-loading.md:327-342`; same in
  `guide/preloading.md:160-199`).
- Defaults: `staleTime` 0 with background revalidation, preload freshness 30 s, `gcTime` 5 min,
  `staleReloadMode: 'background'` (`guide/data-loading.md:169-176`). With `staleTime: 0`, re-entering a route re-runs
  its loader → `initiate()`, and RTK answers from its own cache (`keepUnusedDataFor`). That is the current behaviour
  under React Router.
- **Recommended:** `defaultPreloadStaleTime: 0`, leave `defaultStaleTime` / `defaultGcTime` at their defaults
  (remove the POC's `5000`), and don't use `shouldReload`/`gcTime: 0` (that is for opting *out* of router caching,
  `guide/data-loading.md:298-312`, irrelevant once loaders return no data). Loaders return `void` or request params.
  Components read RTK hooks.
- `loaderDeps` must pick only the search keys the loader uses: "❌ Don't do this … `loaderDeps: ({ search }) => search`"
  (`guide/data-loading.md:204-221`). Index: `({ search }) => ({ date: search.date })`. History: `({ month, year })`.

### 6.3 `validateSearch` with zod (repo: `zod@3.25.76`, which exports `zod/v4` too)

| Approach | Navigation input type | Output type | Probe result |
|---|---|---|---|
| zod 3 schema directly (Standard Schema: `"~standard"` at `zod/v3/types.d.ts:54`; TanStack accepts Standard Schema, `router-core dist/esm/validators.d.ts:2-9`) with `.optional()` / `.default()` | Typed, keys optional | Typed | ✓ `<Link to="/weight" />` compiles; `page: number` |
| zod 3 directly with `.catch(x)` | **`unknown`**: `search={{ month: 'x' }}` compiles | Typed | Input type lost |
| `zod/v4` with `.catch(x)` | **`unknown` and required**: `<Link to="/post-login" />` errors "search is missing", and `returnUrl: 5` compiles | Typed | The docs' "will retain type inference throughout" (`guide/search-params.md:262`) holds for output only |
| `@tanstack/zod-adapter` `zodValidator(schema)` + `fallback(z.number(), 10).default(10)` (`guide/search-params.md:198-258`) | Typed, optional | Typed | ✓ `<Link to="/history" />` compiles; `month: '10'` rejected |

The docs still say zod v3 needs the adapter (`guide/search-params.md:189-216`). That is outdated for zod ≥3.24's
Standard Schema in the `.default()` case, but still true for `.catch()`.

**Recommendation:** `zodValidator` + `fallback` for `month`/`year`/`date`, so malformed URLs fall back silently
instead of rendering the error component (a thrown `validateSearch` → `errorComponent`, `guide/search-params.md:166-168`).
This keeps one zod major in the codebase. `@hookform/resolvers@3.10` is on zod 3, and migrating zod is a separate
decision. Fallback values that depend on `MSW_ENABLED` (`IndexPage.tsx:23-24`, `HistoryPage.tsx:15-16`) move into
the schema defaults.

### 6.4 Pending UI

`useNavigationProgress` (`app/routing/useNavigationProgress.ts`) → `useRouterState({ select: s => s.isLoading })`.
Without a `pendingComponent`, the router keeps the previous page presented
(`router-core src/load-client.ts:1467-1480`; `api/router/RouterStateType.md`, "keep the previous presentation
visible"). That matches today's "old page + `LinearProgress`". The probe confirmed that during a navigation to a
slow route the old page stays, `isLoading` is true, and the `_app` pending loader does **not** reappear. Defaults:
`pendingMs` 1000, `pendingMinMs` 500 (`guide/data-loading.md:531-548`). These only matter where a `pendingComponent`
exists.

---

## 7. Auth gating

```ts
// src/app/routes/_app.tsx (pathless layout; probe-verified)
beforeLoad: async ({ context, location, preload }) => {
  const query = context.store.dispatch(authApi.endpoints.getStatus.initiate({}, { forceRefetch: !preload }));
  try {
    const { data } = await query;
    if (data?.isAuthenticated !== true) {
      redirect({ to: '/login', search: { returnUrl: location.href }, throw: true });
    }
  } finally {
    query.unsubscribe();
  }
},
pendingComponent: AppLoader, pendingMs: 0, errorComponent: …,
```

- `beforeLoad` is middleware for the route and its children. A throw stops the children loading
  (`guide/authenticated-routes.md:14-28`). The probe redirected `/history?month=3` → `/login` with
  `search = { returnUrl: '/history?month=3' }`.
- **It also runs on preload** ("Route Loading (including Preloading) → `route.beforeLoad`", `:19-24`), and it receives
  `preload: boolean` / `cause: 'preload' | 'enter' | 'stay'` (`api/router/RouteOptionsType.md`, `beforeLoad`
  section). Today's `forceRefetch: true` (`AuthenticatedLayout.tsx:23`) would fire `/auth/status` on every hover or
  touch if `defaultPreload: 'intent'` were enabled (the default is `false`, `api/router/RouterOptionsType.md`,
  `defaultPreload`).
- `throw: true` instead of `throw redirect(...)`: `@typescript-eslint/only-throw-error` flags the latter
  (`Redirect = Response & {…}`, `router-core redirect.d.ts:7`; probe ESLint). The `throw` option is documented
  (`api/router/RedirectType.md:28-32`). The alternative is an `only-throw-error` `allow` entry for the `Redirect`
  type.
- `/login`: `beforeLoad` redirects to `/` when already authenticated (replaces `LoginPage.tsx:12-28`).
  `validateSearch: { returnUrl }`.
- Fake auth (`FAKE_AUTH_ENABLED`, `VITE_APP_FAKE_AUTH_LOGIN_ON_INIT`): `signIn(returnUrl)` does
  `usersService.signInById(1)`, then `navigate({ to: returnUrl })` (or `router.history.push`). The real path does
  `window.location.assign(createUrl(`${API_URL}/api/v1/auth/login`, { returnUrl }))`. `signOut()` mirrors this with
  `signOutById(1)` → `/login`, or the API logout URL. `useAuthStatusCheckEffect` calls `signOut()` instead of
  `submit(… '/logout')`. The `/logout` route disappears. The server redirects to `/#/post-logout` (`Startup.cs:61`),
  so keep `/post-logout`.
- **Latent bugs to fix along the way.** (1) `AuthenticatedLayout.tsx:30` reads `returnUrl` from the *current* URL
  instead of using the current location, so the login redirect always carries `returnUrl=/`. (2)
  `PostLoginPage.tsx:7-10` reads a non-existent path param. Together, "return to where I was" never worked.
  `location.href` + `validateSearch` make it work for free. Product decision: fix it, or keep `/`.

---

## 8. Infrastructure

### 8.1 Hash history, base path, PWA, Pages demo

| Concern | Finding | Source |
|---|---|---|
| URL format | `#/history?month=10&year=2023`, `#/?date=2023-10-19`, the same as React Router's hash URLs | probe `tests/router.test.tsx` "hash href format" |
| Parsing | Path + search are taken from the fragment; the real `location.search` is appended | `history@1.162.4 src/index.ts:615-624` |
| Backend redirects | `/#/post-login?returnUrl=%2Fhistory%3Fmonth%3D10` → `pathname /post-login`, `search { returnUrl: '/history?month=10' }` | probe; `AuthController.cs:30`, `Startup.cs:61` |
| `base: './'` / Pages subpath `/food-diary/` | `createHref = ${location.pathname}${location.search}#${href}`, so it is relative to whatever path serves `index.html`. No `basepath` needed | `src/index.ts:625-626`; `vite.config.ts:8,51`; `.github/workflows/deploy-demo.yml` |
| PWA `start_url`/`scope` `./`, `injectManifest` SW with `precacheAndRoute` only | Unchanged: hash routing only ever requests `index.html` | `vite.config.ts:13-21`; `src/app/serviceWorker.ts:21` |
| Known hash issue | [#4370](https://github.com/TanStack/router/issues/4370) (open): search params before *and* after `#` overlap. n/a: nothing puts a query before `#` | `gh issue view 4370` |
| MSW | `<WithMockApi>` renders `RouterProvider` only after MSW starts; the router's first `load()` runs on provider mount | `src/app/WithMockApi.tsx:41-45`; `react-router@1.170.41 src/Transitioner.tsx:88-90` |

### 8.2 One-time history-state gotcha after deploy

`createBrowserHistory` (which hash history wraps) seeds `{ __TSR_index: 0, key, __TSR_key }` **only if**
`history.state` has neither `__TSR_key` nor `key` (`src/index.ts:336-346`). React Router writes
`{ usr, key, idx }`, so a tab restored or reloaded on a React Router–written entry keeps
`__TSR_index === undefined`. `canGoBack()` is then `undefined !== 0` → **true**, and a push computes
`undefined + 1` (`src/index.ts:207-208`). Probe: `replaceState({usr:null,key:'abc123',idx:4})` →
`canGoBack() === true`. Impact: one wrong back arrow per pre-existing tab, once. Options: accept it, or add a one-line
`if (history.state && 'idx' in history.state) history.replaceState(null, '')` shim before `createHashHistory()`,
removable after a release.

### 8.3 Devtools

`TanStackRouterDevtools` is `process.env.NODE_ENV !== 'development' ? () => null : …`
(`react-router-devtools@1.167.2 dist/esm/index.js:5-7`). That is null in production and in vitest
(`NODE_ENV=test`). `TanStackRouterDevtoolsInProd` exists to opt in (`devtools.md:40-49`). Mount it in the root route.

### 8.4 Bundle size

| Entry (exports this app uses; react external; esbuild `--minify`) | raw | gzip -9 | brotli |
|---|---|---|---|
| `react-router@7.18.4`: `createHashRouter, RouterProvider, Link, Outlet, ScrollRestoration, redirect, redirectDocument, useLoaderData, useSubmit, Form, useMatch, useMatches, useLocation, useNavigation, Navigate, useParams` | 97,240 | **32,923** | 29,080 |
| `@tanstack/react-router@1.170.41`: `createRouter, createHashHistory, RouterProvider, Link, Outlet, redirect, useNavigate, useMatches, useRouterState, useCanGoBack, useRouter, createLink, createRootRouteWithContext, createFileRoute, Navigate, useSearch, getRouteApi, lazyRouteComponent, useMatchRoute` | 81,203 | **28,956** | 26,253 |

`isbot` (a TanStack dependency) is not in the client output. Per-route split wrappers add a few hundred bytes each.
A full `vite build` comparison wasn't run: the POC branch mounts a demo tree instead of the app, so main vs POC would
compare different applications. Run it in the cut-over PR (`dist/` gzip totals before and after).

---

## 9. MUI integration

- MUI's routing page: "TanStack Router supports custom links through its `createLink` helper function", with a
  pointer to TanStack's Custom Link docs ([MUI routing](https://mui.com/material-ui/integrations/routing/)). MUI also
  documents a global `MuiButtonBase.defaultProps.LinkComponent`, but "The `href` prop only accepts a string", so
  router typing would be lost. Not recommended.
- TanStack: `createLink(Link)` for MUI `Link`, and `ButtonProps<'a'>` / `component="a"` for `Button`
  (`guide/custom-link.md:175-255`). The `how-to/integrate-material-ui.md` examples use `forwardRef` and `to: string`
  (`:124-219`), which loses route typing. Prefer the custom-link guide.
- Probe (MUI 9.4.0): `createLink(ListItemButton)`, `createLink(IconButton)` and `createLink(Link)` type-check with
  typed `to`/`search`, and `to="/nope"` is an error. At runtime, ButtonBase switches to `LinkComponent = 'a'` when
  `href` is present (`@mui/material@9.4.0 ButtonBase/ButtonBase.js:153-157`; `ListItemButton.js:194-197`). The probe
  rendered `<a href>`, and `activeProps={{ selected: true }}` added `Mui-selected`.
- Needed wrappers (put them in `shared/ui`; TanStack's types are global, so `shared` stays router-agnostic at the
  value level only by convention):

| Wrapper | Replaces |
|---|---|
| `RouterLink = createLink(MuiLink)` | `ErrorPage.tsx:14` |
| `RouterListItemButton = createLink(ListItemButton)` | `NavigationDrawerMenuListItem.tsx:16-26` (`activeProps` replaces `useMatch` + `selected`); `NotesHistoryList.tsx:33` |
| `RouterIconButton = createLink(IconButton)` | `FilterNotesHistory.tsx:27` |

- `createLink` with a MUI component *type* and React 19 refs needs no `forwardRef`. The probe passed MUI components
  directly. `@eslint-react` strict-typescript behaviour on these wrappers is **unverified** (that plugin was not
  installed in the probe).

---

## 10. Testing

- **Official pattern** (code-based): `createRootRoute` + `createRoute` + `createRouter({ routeTree, history })`,
  then `render(<RouterProvider router={router} />)` and `await screen.findBy…`
  (`how-to/setup-testing.md:61-113`). File-based: import the generated `routeTree` and use
  `createMemoryHistory({ initialEntries })` (`how-to/test-file-based-routing.md:64-120`). That doc's vitest config
  adds the plugin; here `vite.config.ts` already does.
- **Doc defect:** both docs' "alternative" helpers render `<RouterProvider router={router}>{children}</RouterProvider>`
  (`how-to/setup-testing.md:150-160`). `RouterProvider` destructures `{ router, ...rest }` and renders only
  `<Matches />` (`src/RouterProvider.tsx:61-70`), so the children never render. The probe confirmed it.
- **Async gotcha:** without `await router.load()`, the route UI is absent on the first synchronous query. After it,
  rendering is synchronous (probe `tests/sync.test.tsx`). The first `load()` on mount is skipped when already
  resolved (`Transitioner.tsx:75-90`).
- **Proposed helpers:**
  - `render(ui, opts)` → `async`. Build a root-only tree whose `component` renders
    `<TestEnvironment {...opts}>{ui}</TestEnvironment>` with `staticData: { appBar: null }`, use
    `createMemoryHistory({ initialEntries: ['/'] })`, `await router.load()`, then `rtlRender(<RootProvider store><RouterProvider router/></RootProvider>)`.
    The probe's root-only tree works. Callers become `await render(...)` (5 files, §2.2).
  - `renderWithRouter({ initialEntries })` → `createAppRouter(configureStore(), createMemoryHistory(...))`, the
    real tree on memory history (probe: `/history?month=3&year=2024` loaded, search typed). Only skipped tests use it
    today.
  - With pages router-agnostic (§4.3), most page and feature tests need no router at all.
- `TestEnvironment` loses `useSubmit` and the unused `signOutAfterMilliseconds` (`tests/render/TestEnvironment.tsx:17-31`).
- E2E (`tests/`, Playwright, one sign-in test) needs Docker. Per `CLAUDE.md`, ask the user before running it if
  Docker isn't available.

---

## 11. Risks and project-health delta (since 2026-10-02)

| Item | Status | Relevance |
|---|---|---|
| Releases | Latest still `1.170.41` (2026-09-30). 162 stable 1.x in 2026, 9 since 2026-09-01 | Pin exact or `^` with a lockfile, as today |
| GitHub | 15,146 stars, 713 open issues (prior research: 15.1k / 710), pushed 2026-10-03 | No change |
| [#8487](https://github.com/TanStack/router/issues/8487) (open, 2026-09-23) | `lazyRouteComponent` → React 19 "conditional `use()`" warning when a transition suspends on a lazy route | Console warning. `autoCodeSplitting` uses `lazyRouteComponent` (`compilers.ts:612,662`). Watch it |
| [#8198](https://github.com/TanStack/router/issues/8198) (open, "information needed") | `useMatch({ from })` invariant during interrupted concurrent renders, recoverable | Prefer `Route.useX()` / `getRouteApi` inside their own route subtree. Watch it |
| [#8211](https://github.com/TanStack/router/issues/8211) | `useCanGoBack` hydration error | SSR only, n/a |
| Vite 8 issues (#8511, #7091, #7418, #8031, #8407) | All TanStack **Start** | n/a for `router-plugin` + plain Vite. The probe ran plugin + Vite 8.3 + vitest 4.1 cleanly |
| Strict TS | `tsc` clean in the probe with `strict`; `@ts-nocheck` gen file | ✓ |
| v2 | No announcement or issue (`gh search issues "v2 in:title"`: only Nitro-v2 hits). Docs pre-announce v2 changes: `autoCodeSplitting` default `true`; removal of `location.state.key`, `RouterClass`/`RouteClass`/`FileRouteClass`, `rootRouteWithContext`, `opts.navigate`; structural sharing default "may change" | Use `createRootRouteWithContext`, `throw`/`throw: true` redirects, `__TSR_key`, and opt in to `autoCodeSplitting` now |
| `useCanGoBack` | Still experimental | Isolate it behind one `useAppBarBack()` hook |

---

## 12. Proposed migration plan

A single runtime cut-over is forced by §3: there is no documented coexistence, and both routers would own the URL.
It is kept reviewable by moving every router-independent change into prep PRs that ship on React Router first, each
verified by the existing suite.

| # | PR | Contents | Verify |
|---|---|---|---|
| **P1** | Auth actions → functions *(on React Router)* | `features/auth`: `signIn(returnUrl)`, `signOut()` (fake + real). `SignInForm`, `NavigationDrawerActions`, `useAuthStatusCheckEffect` call them, using RR `useNavigate` only for in-app redirects. Delete `LoginPage.action`, `LogoutPage` + `/logout` route, `TestEnvironment.signOutAfterMilliseconds`. Fix `PostLoginPage` to read search *(decision D10)* | `yarn build`, `yarn lint`, `yarn format:check`, `yarn test`. Manual in MSW + fake-auth mode: login, logout, auto-login-on-init, session-expiry logout |
| **P2** | Router-agnostic pages and features *(on React Router)* | Pages take props from the route layer (`date`, `weightLogsRequest`, …). `SelectDate` → callback (drop the `useSubmit` wrapper, keep `SelectDateView`). `FilterNotesHistory` → `onApply(month, year)`. History reads notes via RTK hook. Delete `RootPage.tsx` | Same + manual: date switch, history filter, links from history to day |
| **C1** | Cut-over, commit 1: infra (builds, nothing mounted) | Add `@tanstack/react-router`, `@tanstack/router-plugin`, `@tanstack/react-router-devtools`, `@tanstack/zod-adapter`. Plugin before `react()` with `routesDirectory: 'src/app/routes'`, `generatedRouteTree: 'src/app/routeTree.gen.ts'`, `autoCodeSplitting: true`. ESLint `globalIgnores` + `.prettierignore` for the gen file, `.tanstack/` in `.gitignore`, VS Code readonly settings | `yarn build`, `yarn lint`, `yarn format:check` |
| | Commit 2: router + routes | `app/router.ts` (`createAppRouter(store, history = createHashHistory())`, `defaultPreloadStaleTime: 0`, `scrollRestoration: true`), `Register` + `StaticDataRouteOption`. Route files: `__root`, `_app` (beforeLoad auth, AppBar, pending/error), `_app/index`, `history`, `weight`, `products`, `categories`, `login`, `post-login`, `post-logout`. Search schemas. `createLink` wrappers in `shared/ui`. AppBar with `menu` variant only (parity: title + lazy `Title`/`Actions` slots) | `tsc` |
| | Commit 3: switch + remove React Router | `app/index.tsx` mounts the TanStack `RouterProvider` (keep `<WithMockApi>` outside). Delete `app/routing/*`, `pages/lib/reactRouterExtensions.ts`, `Navigation.tsx` guard. Port the test helpers (async `render`). `yarn remove react-router`. `rg "react-router" src tests` → only historical comments, then fix those | `yarn build`, `yarn lint`, `yarn format:check`, `yarn test`. Bundle before/after (`dist/` gzip). Manual: every drawer link + active state; deep links `/#/history?month=10&year=2023`, `/#/?date=2023-10-19`, `/#/post-login?returnUrl=%2Fhistory`; refresh on each page; browser back/forward; unknown path → not-found; auth redirect from a deep link; `vite preview` with the PWA (SW update banner); a demo-style build (`VITE_APP_MSW_ENABLED`, `VITE_APP_FAKE_AUTH_ENABLED`) served from a subpath; E2E sign-in test (Docker, ask first) |
| **F1** | AppBar variants | `back` (with `useCanGoBack` + parent fallback) and `search`, ported from the POC onto the typed union. Optional legacy-state shim (§8.2) | Unit test on the AppBar via `renderWithRouter`. Manual: deep link into a `back` route shows the arrow and goes to the parent with `replace` |

After F1 comes the next issue step ("add flow from modals to typed routes"), which is out of scope. That step should
use the §4.1 nesting rule and draft-missing `beforeLoad` redirects (prior research finding 7).

### Open decisions (with recommendation)

| # | Decision | Recommendation |
|---|---|---|
| D1 | Route location | `src/app/routes` + `src/app/routeTree.gen.ts` (not the POC's `src/routes`) |
| D2 | File-based vs code-based vs virtual | File-based + `autoCodeSplitting: true` |
| D3 | How pages get route data | Props from route adapters (router-agnostic pages). Navigation widgets may use `Link`/`linkOptions` directly |
| D4 | Dynamic AppBar title/actions | Lazy slot components in `staticData` (`React.lazy`), reading their route via `getRouteApi` |
| D5 | `staticData` shape | Required `appBar: AppBarConfig \| null` discriminated union (`menu`/`back`/`search`), explicit `null` on root, layouts and auth pages |
| D6 | Search-param validation | `@tanstack/zod-adapter` + `fallback()` on zod 3. Revisit (direct schemas, no adapter) if/when the repo moves to zod 4 |
| D7 | Redirect vs `only-throw-error` | `redirect({ …, throw: true })`. No lint-config exception |
| D8 | Router cache and preload | `defaultPreloadStaleTime: 0`, default `staleTime`/`gcTime`, `defaultPreload` off at cut-over (behaviour parity). If `'intent'` is enabled later, skip `forceRefetch` when `preload` |
| D9 | POC commit `8ebecc53` (react-router v8) | Drop it. Not needed when React Router is removed in the same cut-over |
| D10 | Fix the `returnUrl` round-trip (§7) | Fix it in P1. It is a behaviour change, so call it out in the PR |
| D11 | Legacy history-state shim (§8.2) | Accept the one-time glitch. Add the shim only if it bothers you in testing |
| D12 | Back fallback target | `navigate({ to: '..', replace: true })`. Switch to an explicit typed `backTo` in `staticData` if `..` misbehaves under pathless layouts (unverified) |
| D13 | Route-component declaration style | Arrow consts **above** `export const Route`, or imported from `pages/` (TDZ, §4.2) |
| D14 | Devtools | Include `TanStackRouterDevtools` in the root route. It's null outside development |
| D15 | CI check for a stale `routeTree.gen.ts` | Add `git diff --exit-code` after build (cheap insurance) |

---

## Sources

### Repo (`src/frontend/` unless noted)
- `package.json` (scripts, deps); `vite.config.ts:8,13-21,44-51`; `eslint.config.js:13`; `tsconfig.json:13`; `.prettierrc.json`; `.prettierignore`; `.gitignore`; `.vscode/settings.json`
- `src/app/routing/createRouter.tsx:1-63`; `AuthenticatedLayout.tsx:1-81`; `UnauthenticatedLayout.tsx:1-19`; `ErrorLayout.tsx`; `ErrorPage.tsx:14`; `useNavigationProgress.ts:1-24`
- `src/app/index.tsx:3,22-29`; `src/app/WithMockApi.tsx:10-45`; `src/app/store.ts:1-27`; `src/app/serviceWorker.ts:21`
- `src/pages/ui/{IndexPage,HistoryPage,WeightPage,ProductsPage,CategoriesPage,LoginPage,LogoutPage,PostLoginPage,PostLogoutPage,RootPage}.tsx`; `src/pages/lib/reactRouterExtensions.ts:1`
- `src/widgets/Navigation/ui/{Navigation,NavigationDrawerActions,NavigationDrawerMenuList,NavigationDrawerMenuListItem}.tsx`; `src/widgets/NotesHistoryList/ui/{FilterNotesHistory,NotesHistoryList}.tsx`
- `src/features/auth/ui/SignInForm.tsx`; `src/features/auth/hooks/useAuthStatusCheckEffect.ts`; `src/features/note/selectDate/ui/SelectDate.tsx`; `src/entities/note/lib/useFormValues.ts:13`; `src/shared/lib/urlHelper.ts`
- `tests/render/render.tsx:14-50`; `tests/render/TestEnvironment.tsx`; `tests/setup.ts:22-26`; `tests/app.test.tsx`; `src/widgets/NotesHistoryList/ui/FilterNotesHistory.test.tsx:7-8`
- `src/backend/src/FoodDiary.API/Controllers/v1/AuthController.cs:14-30`; `src/backend/src/FoodDiary.API/Startup.cs:53-74`; `Dockerfile:7-11`; `.github/workflows/deploy-demo.yml`
- Branch `new-routes-poc` (`8ebecc53`…`74d1a95d`), `git diff main...new-routes-poc`

### TanStack Router docs (`TanStack/router@1f0f20a3`, `docs/router/…`; web: `https://tanstack.com/router/latest/docs/<path>`)
- Migration checklist — [installation/migrate-from-react-router](https://tanstack.com/router/latest/docs/installation/migrate-from-react-router)
- How to migrate from React Router v7 — [how-to/migrate-from-react-router](https://tanstack.com/router/latest/docs/how-to/migrate-from-react-router)
- File-based routing API — [api/file-based-routing](https://tanstack.com/router/latest/docs/api/file-based-routing)
- Installation with Vite — [installation/with-vite](https://tanstack.com/router/latest/docs/installation/with-vite)
- FAQ — [faq](https://tanstack.com/router/latest/docs/faq)
- Code-based routing — [routing/code-based-routing](https://tanstack.com/router/latest/docs/routing/code-based-routing)
- Virtual file routes — [routing/virtual-file-routes](https://tanstack.com/router/latest/docs/routing/virtual-file-routes)
- File naming conventions — [routing/file-naming-conventions](https://tanstack.com/router/latest/docs/routing/file-naming-conventions)
- Automatic code splitting — [guide/automatic-code-splitting](https://tanstack.com/router/latest/docs/guide/automatic-code-splitting)
- Code splitting — [guide/code-splitting](https://tanstack.com/router/latest/docs/guide/code-splitting)
- Static route data — [guide/static-route-data](https://tanstack.com/router/latest/docs/guide/static-route-data)
- Router context — [guide/router-context](https://tanstack.com/router/latest/docs/guide/router-context)
- Data loading — [guide/data-loading](https://tanstack.com/router/latest/docs/guide/data-loading)
- External data loading — [guide/external-data-loading](https://tanstack.com/router/latest/docs/guide/external-data-loading)
- Preloading — [guide/preloading](https://tanstack.com/router/latest/docs/guide/preloading)
- Search params — [guide/search-params](https://tanstack.com/router/latest/docs/guide/search-params)
- Authenticated routes — [guide/authenticated-routes](https://tanstack.com/router/latest/docs/guide/authenticated-routes)
- Data mutations — [guide/data-mutations](https://tanstack.com/router/latest/docs/guide/data-mutations)
- History types — [guide/history-types](https://tanstack.com/router/latest/docs/guide/history-types)
- Scroll restoration — [guide/scroll-restoration](https://tanstack.com/router/latest/docs/guide/scroll-restoration)
- Not-found errors — [guide/not-found-errors](https://tanstack.com/router/latest/docs/guide/not-found-errors)
- Custom link — [guide/custom-link](https://tanstack.com/router/latest/docs/guide/custom-link)
- Link options — [guide/link-options](https://tanstack.com/router/latest/docs/guide/link-options)
- Devtools — [devtools](https://tanstack.com/router/latest/docs/devtools)
- Setup testing — [how-to/setup-testing](https://tanstack.com/router/latest/docs/how-to/setup-testing)
- Test file-based routing — [how-to/test-file-based-routing](https://tanstack.com/router/latest/docs/how-to/test-file-based-routing)
- Integrate MUI — [how-to/integrate-material-ui](https://tanstack.com/router/latest/docs/how-to/integrate-material-ui)
- API: [useCanGoBack](https://tanstack.com/router/latest/docs/api/router/useCanGoBack), [RouterState](https://tanstack.com/router/latest/docs/api/router/RouterStateType), [RouteOptions](https://tanstack.com/router/latest/docs/api/router/RouteOptionsType), [RouterOptions](https://tanstack.com/router/latest/docs/api/router/RouterOptionsType), [RedirectType](https://tanstack.com/router/latest/docs/api/router/RedirectType), [redirect](https://tanstack.com/router/latest/docs/api/router/redirectFunction), [Navigate](https://tanstack.com/router/latest/docs/api/router/navigateComponent), [useRouterState](https://tanstack.com/router/latest/docs/api/router/useRouterStateHook)

### TanStack tarballs / source cited
- `@tanstack/history@1.162.4 src/index.ts:207-208,264,336-346,609-628,742-752`
- `@tanstack/router-core@1.171.34 dist/esm/route.d.ts:29-30,108-114,317,384`; `dist/esm/Matches.d.ts:66`; `dist/esm/link.d.ts:162-184`; `dist/esm/redirect.d.ts:7,22-25`; `dist/esm/validators.d.ts:2-9`; `src/searchParams.ts:4-53`; `src/load-client.ts:1467-1480`
- `@tanstack/react-router@1.170.41 dist/esm/Matches.d.ts:48-50`; `dist/esm/link.d.ts:63`; `dist/esm/index.d.ts:3`; `src/RouterProvider.tsx:17-70`; `src/Transitioner.tsx:75-90`; `src/useCanGoBack.ts:5-20`
- `@tanstack/router-plugin@1.168.42 src/core/router-generator-plugin.ts:79-83`; `src/core/code-splitter/compilers.ts:400-411,565-590,612,662,763-779`
- `@tanstack/react-router-devtools@1.167.2 dist/esm/index.js:5-8`
- `zod@3.25.76 v3/types.d.ts:54`; `@mui/material@9.4.0 ButtonBase/ButtonBase.js:153-157`, `ListItemButton/ListItemButton.js:194-197`

### GitHub (TanStack/router)
- [#8487](https://github.com/TanStack/router/issues/8487), [#8198](https://github.com/TanStack/router/issues/8198), [#8211](https://github.com/TanStack/router/issues/8211), [#4370](https://github.com/TanStack/router/issues/4370), [#8511](https://github.com/TanStack/router/issues/8511); releases list (`gh release list`, latest `release-2026-09-30-1747`)

### Other
- MUI routing integration — https://mui.com/material-ui/integrations/routing/
- RTK Query without hooks — https://redux-toolkit.js.org/rtk-query/usage/usage-without-react-hooks
- Prior research — `.scratch/routes-instead-of-modals/research.md`

---

## Appendix: probes

All probes ran in the session scratchpad (`…/scratchpad/{pkgs,tsr,probe}`). None ran in the repo.

```
# versions
npm view @tanstack/{react-router,router-plugin,router-core,react-router-devtools,virtual-file-routes,zod-adapter,history,router-generator,router-cli} dist-tags.latest time.modified --json
npm view @tanstack/react-router dist-tags time --json            # 1.x release counts (2026: 162; since 2026-09-01: 9)
npm view @tanstack/react-router@1.170.41 peerDependencies dependencies --json
npm view @tanstack/router-plugin@1.168.42 peerDependencies dependencies --json
npm view @tanstack/zod-adapter@1.167.0 peerDependencies --json

# tarballs + docs
npm pack @tanstack/react-router@1.170.41 @tanstack/router-core@1.171.34 @tanstack/router-plugin@1.168.42 \
         @tanstack/router-generator@1.167.40 @tanstack/history@1.162.4 @tanstack/zod-adapter@1.167.0 \
         @tanstack/virtual-file-routes@1.162.0 @tanstack/react-router-devtools@1.167.2
git clone --depth 1 --filter=blob:none --sparse https://github.com/TanStack/router.git tsr && git -C tsr sparse-checkout set docs/router   # 1f0f20a3

# repo inventory (read-only)
rg -n "react-router" src tests;  rg -l "from '@tests/render'" src tests;  rg -l "from '@/app" src --glob '!src/app/**'
git log main..new-routes-poc;  git diff main...new-routes-poc -- src/frontend ':!src/frontend/yarn.lock'
git show new-routes-poc:src/frontend/yarn.lock | rg '@tanstack/'

# probe project (react 19.3, @mui/material 9.4.0, zod 3.25.76, ts 5.9.3, vite 8.3, vitest 4.1.11, eslint 10, typescript-eslint 8)
npm install @tanstack/react-router@1.170.41 @tanstack/router-plugin@1.168.42 @tanstack/router-cli@1.167.40 \
            @tanstack/zod-adapter@1.167.0 react@19 react-dom@19 zod@3.25.76 typescript@5.9.3 @mui/material@9 \
            @emotion/react @emotion/styled @reduxjs/toolkit@2 react-router@7.18.4 esbuild vite@8 vitest@4 jsdom @testing-library/react
npx tsr generate                         # routesDirectory ./src/app/routes → src/app/routeTree.gen.ts
npx tsc -p .                             # clean, except the intended findings in src/negative.tsx:
                                         #   v4 .catch makes search required; v4/v3 .catch input = unknown
npx vitest run                           # 9 tests: RouterProvider drops children; backend hash URL parse;
                                         # legacy RR state → canGoBack true; fresh → false; memory-history app tree;
                                         # hash href format; beforeLoad redirect w/ returnUrl; MUI createLink <a>+activeProps;
                                         # pending UI (initial-only loader, isLoading on navigation); sync render after load()
npx vitest run --config vitest.plugin.config.ts   # gen file deleted first → regenerated identically under vitest; TDZ case passes only with splitter
npx eslint src                           # recommendedTypeChecked + repo strict-boolean-expressions:
                                         # only-throw-error on `throw redirect()`, cleared by `redirect({throw:true})`

# bundle size
esbuild size/{rr,tsr}.js --bundle --minify --format=esm --platform=browser \
        --define:process.env.NODE_ENV='"production"' --external:react --external:react-dom ...; gzip -9 / brotli

# health
gh api repos/TanStack/router
gh search issues --repo TanStack/router --state open "<createHashHistory|useCanGoBack|hash router|staticData|Vite 8|rolldown|React 19>"
gh issue view {4370,8487,8198,8211,8511} -R TanStack/router
gh search issues --repo TanStack/router "v2 in:title";  gh release list -R TanStack/router --limit 8
```
