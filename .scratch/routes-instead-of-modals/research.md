# Routes instead of modals — routing library research

Research date: **2026-10-02**. Version claims verified against the npm registry on that date. Type-level
claims were checked against the **published package tarballs** (`npm pack react-router@7.18.4`,
`react-router@8.4.0`, `@react-router/dev@8.4.0`, `@tanstack/react-router@1.170.41`,
`@tanstack/router-core@1.171.34`), unpacked into the session scratchpad — see
[Appendix: how the probes were run](#appendix-how-the-probes-were-run). Nothing in the repo was
modified. Paths like `src/…` are relative to `src/frontend/`.

Goal under evaluation (from the issue note "Routes instead of modals for mobile"): replace the
Redux-driven screen switching inside the fullscreen note dialog with real routes — the router owns
"which screen", Redux keeps owning the note draft — and get a native-app-like AppBar (burger on
section roots, back arrow on nested screens) driven by route metadata, plus typed loaders/search params.

---

## 1. Bottom line

1. **The premise "the repo is on React Router v7" is now one major behind.** React Router **v8.0.0
   shipped 2026-06-17**; latest is **8.4.0** (2026-09-15). `npm view react-router dist-tags` →
   `latest: 8.4.0`, `version-7: 7.18.4`. The repo pins `^7.18.4` (`src/frontend/package.json:35`).
   v7 is now a maintenance line that "will continue to receive security updates"
   ([v8 blog](https://remix.run/blog/react-router-v8)). Whatever the choice, "Option 1" really means
   **Data Mode on v8**. The upgrade is small: the one code break in this repo is `UIMatch.data` →
   `UIMatch.loaderData` (removed in 8.0.0, [CHANGELOG](https://github.com/remix-run/react-router/blob/main/packages/react-router/CHANGELOG.md#v800)),
   used at `src/widgets/Navigation/ui/Navigation.tsx:28`. The local `new-routes-poc` branch already
   made exactly that change (commit `8ebecc53`).

2. **🔑 The claim "`handle` + `useMatches` require Framework Mode" is false.** It comes from a
   misleading badge: the [Using Handle how-to](https://reactrouter.com/how-to/using-handle) is tagged
   Framework-only, but:
   - the Data Mode [Route Object docs](https://reactrouter.com/start/data/route-object) document
     `handle` ("Route handle allows apps to add anything to a route match in `useMatches`…");
   - [`useMatches`](https://reactrouter.com/api/hooks/useMatches) is tagged **Framework ✓ Data ✓**;
   - the published types put `handle?: any` on the Data Mode `RouteObject` (7.18.4
     `dist/development/data-CjO11-hU.d.ts:767`; 8.4.0 `lib/router/utils.d.ts:499`), and `handle` is a
     lazily loadable key (it is not in `UnsupportedLazyRouteObjectKey`, 7.18.4 `data-CjO11-hU.d.ts:703`);
   - **this repo already does it**: `Navigation.tsx:26-28` calls `useMatches()` under
     `createHashRouter` and reads per-route metadata from loader data.

3. **🔑 Framework Mode does not fix the type-guard problem either.** The leaf-agnostic consumer — an
   AppBar that reads "whatever route is current" — gets `handle: unknown` in **every** React Router
   mode: `UIMatch<Data = unknown, Handle = unknown>` (8.4.0 `lib/router/utils.d.ts:652-669`), and the
   Framework-Mode `Route.ComponentProps.matches` also type `handle: unknown`
   (8.4.0 `lib/types/route-module-annotations.d.ts:76`). Typed `handle` exists only through
   `unstable_useRoute("routes/some-id")` when you already **know** the route ID; the 7.9.4 changelog
   says plainly: "when calling `useRoute()` (without a route ID), TS has no way to know which route
   is the current route… you can either narrow the type yourself with something like `zod`".
   So the `isNavigationLoaderData` guard (`Navigation.tsx:21-22`) survives a move to Framework Mode.

4. **TanStack Router is the only candidate that types route metadata for a leaf-agnostic consumer.**
   `useMatches()` returns `Array<MakeRouteMatchUnion<TRouter>>` — a union of every registered route's
   match type (`@tanstack/react-router@1.170.41 dist/esm/Matches.d.ts:50`; `router-core` `Matches.d.ts:97`).
   Every match carries `staticData: StaticDataRouteOption` (`router-core` `Matches.d.ts:66`), an empty
   interface (`route.d.ts:29-30`) that the app extends by module augmentation; required properties are
   then **enforced on every route definition** ([Static Route Data guide](https://tanstack.com/router/latest/docs/framework/react/guide/static-route-data)).
   Search params get schema validation (`validateSearch`) and typed reads.

5. **Framework Mode has two hard blockers for this app, independent of typing.**
   - **No hash routing.** `HydratedRouter` hard-codes browser history:
     `history: UNSAFE_createBrowserHistory()` (8.4.0 `lib/dom-export/hydrated-router.js:79`), and
     `@react-router/dev`'s `ReactRouterConfig` has no history option (8.4.0 `dist/config-t89niiFv.d.ts:57-148`).
     The GitHub Pages demo switched to `createHashRouter` specifically "to avoid 404.html hack"
     (commit `66a5cf44`, PR #160).
   - **PWA.** In SPA mode the React Router plugin writes `index.html` *after* `vite-plugin-pwa` runs,
     so it never gets precached. React Router closed the report as a vite-plugin-pwa matter
     ([react-router#14268](https://github.com/remix-run/react-router/issues/14268), closed 2025-09-01,
     maintainer comment: "This is something on the `vite-plugin-pwa` side of things"); the
     vite-plugin-pwa request ([vite-plugin-pwa#809](https://github.com/vite-pwa/vite-plugin-pwa/issues/809))
     is **still open** (17 comments; latest workarounds 2026-09-11 patch the precache list by hand).

6. **The two reported bugs are routing bugs, not state bugs, and none of the options fixes them
   for free.** The close (X) button on every screen calls `noteDraftDiscarded`, which resets the whole
   slice (`NoteInputDialog.tsx:57-63, 115`; `manageNoteSlice.ts:92`). Any router fixes problem 1 only
   when the product screen is a **child route** and its close/back goes to the parent. Back semantics
   need an explicit rule (history-back when there is in-app history, else navigate to parent) — see §8.1.

7. **Redux can keep the draft in every option.** None of the routers own form state. The current
   screen machine is a *derived* selector over the draft (`manageNoteSlice.ts:34-67`), so the
   migration deletes `activeScreen` and the `ManageNoteScreenState` union (`types.ts:19-45`) and keeps
   the reducers. One catch: a draft lives in memory only, so a refresh or deep link into
   `…/notes/new/product` has no draft. Every child route needs a guard (loader / `beforeLoad`) that
   redirects to the parent when the draft is missing.

8. **Recommendation (§10): TanStack Router, decided by a time-boxed POC. React Router Data Mode on
   v8 is the fallback. Reject Framework Mode.** TanStack is the only option that meets the
   strict-typing criterion without guards. It also keeps hash history, so it leaves the PWA, MSW and
   GitHub Pages setup alone. Its weaker point is project-health signal (§9), which is acceptable but
   not as strong as React Router's.

---

## 2. Current state (repo)

### 2.1 Routing

| Fact | Where |
|---|---|
| `react-router` `^7.18.4`, resolved `7.18.4` | `src/frontend/package.json:35`, `yarn.lock:7918-7920` |
| **Data Mode** with **hash history**: `createHashRouter([...])` | `src/app/routing/createRouter.tsx:1-63` |
| Routes are flat pages under one pathless `AuthenticatedLayout`: `/`, `/history`, `/weight`, `/products`, `/categories` (+ unauthenticated `/login`, `/logout`, `/post-login`, `/post-logout`) | `createRouter.tsx:10-59` |
| Each page is `lazy: () => import('@/pages/ui/XPage')` exporting `loader` + `Component` | `createRouter.tsx:18-30`; e.g. `src/pages/ui/IndexPage.tsx:26-45` |
| Loaders warm RTK Query via `store.dispatch(api.endpoints.x.initiate())` + `unsubscribe()` and import the singleton `store` from `@/app/store` | `IndexPage.tsx:4,29-42`; `HistoryPage.tsx:27-46`; `ProductsPage.tsx:9-19` |
| Loader data is typed by **unchecked generics**: `loader: LoaderFunction` (erases the return type) + `useLoaderData<LoaderData>()` | `IndexPage.tsx:26,46`; `HistoryPage.tsx:21,50`; `WeightPage.tsx:16,43` |
| `useLoaderData<T = any>()` — `T` is a caller-supplied cast, not inferred from the route | `react-router@7.18.4 dist/development/index.d.ts:632` |
| Search params parsed by hand from `new URL(request.url).searchParams` as strings | `IndexPage.tsx:27-28`; `HistoryPage.tsx:22-25` |
| AppBar lives once in `AuthenticatedLayout`, renders `<Navigation />` + `<Outlet />` | `src/app/routing/AuthenticatedLayout.tsx:57-78` |
| Production serves the SPA via ASP.NET `UseSpa` catch-all (browser-history-capable) | `src/backend/src/FoodDiary.API/Startup.cs:139,168-171` |
| Vite `base: './'` (relative), PWA `start_url`/`scope` `./`, `injectManifest` SW with `precacheAndRoute` only (no navigation route) | `vite.config.ts:8,13-21,49`; `src/app/serviceWorker.ts:19-21` |
| MSW is started by `<WithMockApi>` wrapped *around* `<RouterProvider>` | `src/app/index.tsx:22-29`; `src/app/WithMockApi.tsx:10-27` |
| Tests: `render()` wraps the UI under test in a one-route `createMemoryRouter`; `renderWithRouter()` mounts the real hash router | `tests/render/render.tsx:14-50` |

### 2.2 The header already uses route metadata (Data Mode) — and the type guard

`src/widgets/Navigation/ui/Navigation.tsx`:

```tsx
export interface NavigationLoaderData {          // :8-13
  navigation: { title: string | ReactElement; action?: ReactElement };
}
const isNavigationLoaderData = (data: unknown): data is NavigationLoaderData =>   // :21-22
  typeof data === 'object' && data !== null && 'navigation' in data;
…
const matches = useMatches();                                   // :26
const route = matches[matches.length - 1];                      // :27
const loaderData = isNavigationLoaderData(route.data) ? route.data : fallbackNavigation; // :28
```

Pages put **JSX into loader data** to feed it. `IndexPage.tsx:36-38` returns
`navigation: { title: <SelectDate … /> }`, and `HistoryPage.tsx:39-42` returns an `action:
<FilterNotesHistory … />`. `ProductsPage`/`CategoriesPage` return `ok()` (an empty `Response`,
`src/pages/lib/reactRouterExtensions.ts:1`), so the guard falls back to an empty title. The burger
(`MenuIcon`) is unconditional (`Navigation.tsx:48-57`), so the header has no "back arrow" state yet.
That is the hook the issue wants to extend.

The guard is the "hand-written type guard" the issue complains about. It is a structural check
(`'navigation' in data`), so it does not validate the payload's shape.

### 2.3 The note-dialog screen machine

- There is **one** MUI `Dialog` per trigger, not a stack of nested dialogs. `AddNoteButton` mounts a
  `NoteInputDialog` per meal (`src/features/manageNote/ui/AddNoteButton.tsx:46`), and `EditNote`
  mounts one per note (`EditNote.tsx:31`). Each instance decides visibility with a selector
  (`NoteInputDialog.tsx:22-24` → `manageNoteSlice.ts:81-85`).
- The "screen" is a **derived** discriminated union, computed by `selectors.activeScreen` from
  which draft fields are present (`manageNoteSlice.ts:34-67`, union in `model/types.ts:19-45`):

  | Screen (`type`) | Condition | Rendered by |
  |---|---|---|
  | `product-input` | `state.product` set | `ProductForm` (`NoteInputDialog.tsx:90-100`) |
  | `image-upload` | `images.length > 0` | `ImageUploadStep` (`:101-104`) |
  | `product-search` | `!note.product` | `ProductSearch` (`:75-76`) |
  | `note-input` | otherwise | `NoteForm` (`:77-89`) |

- Transitions are dispatched from leaf components. `ProductSearchResults.tsx:72-84` dispatches
  `productDraftCreated` / `productSelected`, `UploadImagesButton.tsx:41` dispatches
  `imagesUploaded`, and `useLoadProductForEdit.ts:40-51` dispatches `productForEditLoaded`.
- Title, submit text and the AppBar submit button's target `formId` are derived the same way
  (`manageNoteSlice.ts:70-79`, `NoteInputDialog.tsx:38-55,123-133`). The submit button sits in the
  dialog's AppBar and submits the active form through the HTML `form` attribute
  (`NoteInputDialog.tsx:127`, `FullScreenDialog.tsx:48-52`). That pattern carries over unchanged to a
  route-level AppBar.

**Problem 1, root cause.** `FullScreenDialog`'s close icon calls `onClose` (`FullScreenDialog.tsx:42`),
which is `handleDialogClose` → `dispatch(actions.noteDraftDiscarded())` (`NoteInputDialog.tsx:57-63,115`)
→ `initialState` (`manageNoteSlice.ts:92`). The same X is used on every screen, so on the
`product-input` screen it discards the note too. A "back to the note" path exists only through the
note form's own discard-product button (`productDraftDiscarded`, `manageNoteSlice.ts:115-121`).

**Form state today.** `NoteForm` keeps its edits in local react-hook-form state seeded from
`defaultValues` (`NoteForm.tsx:57-61`) and does not write edits back to Redux. When the screen
switches to `product-input`, `NoteForm` unmounts and an edited quantity is lost. After a save,
`productDraftSaved` overwrites the quantity with the product's default (`manageNoteSlice.ts:131-141`).
Routes would not make this worse. Whether to persist field edits into the draft is a separate decision
(§11, Q5).

### 2.4 Fullscreen-on-mobile dialogs that are route candidates

`rg 'renderMode="fullScreenOnMobile"'` → 4 hits:

| Dialog | File | Candidate route (illustrative) |
|---|---|---|
| Note add/edit flow (4 screens) | `features/manageNote/ui/NoteInputDialog.tsx:111-113` | `/?date=…` → `notes/new?meal=…` (search) → `…/product` (product form) → `…/images` (photo recognition); edit: `notes/:noteId` |
| Product add/edit (Products page) | `features/product/addEdit/ui/ProductInputDialog/ProductInputDialog.tsx:38-40` | `/products/new`, `/products/:productId` |
| Log weight | `features/logWeight/ui/LogWeightButton.tsx:71-72` | `/weight/new` |
| History filter | `widgets/NotesHistoryList/ui/FilterNotesHistory.tsx:36-37` | probably stays a dialog, or becomes search params on `/history` |

Confirmation dialogs (`AppDialog` in `DeleteNoteDialog`, `DeleteProductsDialog`, `DeleteCategoryDialog`,
`CategoryInputDialog`) are small modals and are not candidates.

### 2.5 Prior art in the repo

Local branch `new-routes-poc` (3 commits, 2026-10-01). It upgrades to `react-router@^8.4.0`, adds
`@tanstack/react-router@^1.170.39` + `@tanstack/router-plugin` (file-based, `routesDirectory:
'src/routes'`), and experiments with `createRootRouteWithContext` + `beforeLoad` context
(`routes/__root.tsx`, `routes/about.tsx` carrying a `// TODO: add typing`). It is a spike only, with no
app routes ported. `node_modules` in the main checkout currently holds `react-router@8.4.0` from this
branch, while the lockfile on `main` says 7.18.4. Run `yarn install` before trusting local type checks.

---

## 3. Version reality check

| Fact | Value | Source |
|---|---|---|
| React Router latest | **8.4.0** (2026-09-15) | `npm view react-router dist-tags/time` |
| React Router v8.0.0 | 2026-06-17 | same; [v8 blog](https://remix.run/blog/react-router-v8) (dated 2026-06-17) |
| React Router v7 line | `version-7` tag = **7.18.4** (2026-09-15), still patched | same |
| v6 → v7 → v8 gaps | 6.0.0 2021-11-03 → 7.0.0 2024-11-22 → 8.0.0 2026-06-17 | same |
| v6 status | **EOL** (no security updates) as of v8 | [v8 blog](https://remix.run/blog/react-router-v8), "React Router Moving Forward" |
| Future cadence | "adopting a yearly major release schedule" | [v8 blog](https://remix.run/blog/react-router-v8) |
| v8 minimums | Node 22.22.0, React 19.2.7, Vite 7+, ESM-only | [CHANGELOG v8.0.0](https://github.com/remix-run/react-router/blob/main/packages/react-router/CHANGELOG.md#v800); blog |
| Repo baseline | Node `>=24 <25`, React `^19.3.0`, Vite `^8.3.0`, TS `5.9.3` — all satisfy v8 | `src/frontend/package.json:30,65,67,94-95` |
| `@react-router/dev@8.4.0` peers | `vite ^7 \|\| ^8`, `typescript ^5.1 \|\| ^6 \|\| ^7` | `npm view @react-router/dev@8.4.0 peerDependencies` |
| TanStack Router latest | **1.170.41**; 1.0.0 published 2023-12-23 | `npm view @tanstack/react-router dist-tags/time` |
| TanStack Router 1.x volume | 942 stable 1.x versions; **162 in 2026** (vs. 23 React Router 7/8 releases in 2026) | `npm view … versions/time` |
| TanStack Router peers | `react >=18 \|\| >=19`; `@tanstack/router-plugin@1.168.42` peers `vite >=5…>=8` | `npm view` |
| TanStack Router v2 | **No public v2 plan found** (searched GitHub issues titled "v2" and tanstack.com). *Unverified* — absence of evidence only. | `gh search issues --repo TanStack/router v2` |

---

## 4. Claim check: `handle` / `useMatches` outside Framework Mode

| Evidence | Says |
|---|---|
| [how-to/using-handle](https://reactrouter.com/how-to/using-handle) | Badges: Framework ✓, **Data ✗**, Declarative ✗ |
| [start/data/route-object](https://reactrouter.com/start/data/route-object) (the Data Mode reference) | Documents `handle`: "Route handle allows apps to add anything to a route match in `useMatches`…" |
| [api/hooks/useMatches](https://reactrouter.com/api/hooks/useMatches) | Framework ✓, **Data ✓**; "only works with data routers like `createBrowserRouter`" |
| [start/modes](https://reactrouter.com/start/modes) feature table | `useMatches`: Framework ✅ Data ✅ |
| `react-router@7.18.4` types | `RouteObject.handle?: any` (`data-CjO11-hU.d.ts:767`); `useMatches` JSDoc `@mode framework` + `@mode data` (`index.d.ts:600-608`) |
| This repo | `useMatches()` in Data Mode at `Navigation.tsx:26` (works today, with loader data instead of `handle`) |

**Verdict: `handle` + `useMatches` work in Data Mode.** The how-to page's "Data ✗" badge
contradicts the Data Mode reference and the types. That is a docs defect worth knowing about, not a
capability gap.

What Framework Mode adds is typegen for a route module's own `params` / `loaderData` / `actionData`
(`Route.ComponentProps`), plus `unstable_useRoute(id)`, which returns a typed `handle` when given a
route ID (CHANGELOG 7.9.5 "useRoute: return type-safe `handle`", #14462). For "render the current
leaf's header", `useMatches()` still yields `handle: unknown` (finding 3).

---

## 5. Option 1 — React Router Data Mode (upgrade to v8)

**Header/back pattern.** Add `handle: { appBar: … }` to route objects (or export `handle` from the
lazily loaded page module). A layout-level `<AppBar>` then reads `useMatches().at(-1)`. "Burger on
section root vs back arrow on nested screen" can also be **structural**: two pathless layout routes
(`SectionLayout` renders the burger, `ScreenLayout` renders back + submit). Nesting decides the icon,
so metadata only has to supply the title. Dynamic titles (`SelectDate` today) can keep coming from
loader data, as now.

**Type safety.**
- `handle` is `any` at definition and `unknown` at read (§4). Without a guard you need a cast, or a
  small typed `defineRoute()` wrapper plus one cast inside a `useAppBarMatch()` hook. That is still a
  hand-written assertion, which fails the strict-typing criterion.
- Params and search params are untyped strings
  ([modes table](https://reactrouter.com/start/modes): "type-safe params/loaderData: Framework ✅,
  Data ✗").
- Loader data: `useLoaderData<typeof loader>()` infers through `SerializeFrom<T>`
  (`index.d.ts:632`). Nothing ties *that* loader to *this* route, and annotating `loader:
  LoaderFunction` (as the repo does) erases the return type.

**Nested fullscreen layout.** Native: nested `children` + `<Outlet />`. The note flow becomes a
`notes/new` layout route with `product`/`images` children, rendered under a `ScreenLayout`
pathless route that swaps the page AppBar for a back-arrow AppBar.

**Back navigation.** `location.key` "is always `"default"` on the initial location" (8.4.0
`lib/router/history.d.ts:53-57`). So the rule "history-back if in-app history exists, else navigate
to the parent" is `key !== 'default' ? navigate(-1) : navigate('..', { replace: true })`. To return
to the note after a product save: `navigate('..', { replace: true })`, so Back from the note form does
not re-open the product form (`NavigateOptions.replace`, 8.4.0 `lib/context.d.ts:37-39`).

**Draft state.** Unchanged slice. Child-route `loader`s read the store and `redirect()` when the draft
is missing, which is the same pattern as the auth gate at `AuthenticatedLayout.tsx:21-39`. v8 makes
middleware always on and adds `getContext` to `createHashRouter`, so the store can be injected
instead of imported (8.4.0 `lib/dom/lib.d.ts:31-45,541`). That fixes the `pages → app` import
(`IndexPage.tsx:4`).

**Desktop modal (optional).** `NavigateOptions.mask` is in the 8.4.0 types (`lib/context.d.ts:40-41`).
It was introduced as `<Link unstable_mask>` in 7.13.1 ("contextual routing… displaying an image in a
modal on top of a gallery"). This would let desktop keep a modal-over-page while mobile gets a page.

**Migration cost: lowest.** The v8 bump is roughly one line in this repo (finding 1). After that,
you add routes the same way the existing ones are defined.

**Testing.** Keep `createMemoryRouter` (`tests/render/render.tsx:20`). `createRoutesStub` exists in
8.4.0 (`lib/dom/ssr/routes-test-stub.d.ts:68`) for component tests
([testing docs](https://reactrouter.com/start/framework/testing)).

---

## 6. Option 2 — React Router Framework Mode (SPA, `ssr: false`)

**What changes** ([Framework Adoption from RouterProvider](https://reactrouter.com/upgrading/router-provider)):
install `@react-router/dev`, add `reactRouter()` to Vite, add `react-router.config.ts`
(`appDirectory: "src"`, `ssr: false`). `index.html` is replaced by `src/root.tsx` with
`Layout`/`<Scripts/>`, and `main.tsx` becomes `entry.client.tsx` with `hydrateRoot(document,
<HydratedRouter/>)`. Routes move to `routes.ts` + route modules (`clientLoader`, default export).

**Type safety.** Typegen gives each route module typed `params`, `loaderData` and `actionData`
([start/modes](https://reactrouter.com/start/modes)), plus type-safe `href` (`@mode framework`,
8.4.0 `lib/href.d.ts:28-34`). The **header** still sees `handle: unknown` (finding 3). Search params
are still `URLSearchParams` (no schema layer).

**Blockers / costs specific to this repo.**
1. **No hash routing** (finding 5). The GitHub Pages demo would need the `404.html` copy trick that
   PR #160 removed on purpose, plus an absolute `basename` instead of `base: './'`
   (`vite.config.ts:8`). Production URLs change from `/#/history` to `/history`, which affects
   bookmarks and the installed PWA `start_url`.
2. **PWA precache gap** (finding 5). There is no first-party fix. The fix would be a manual edit of the
   `injectManifest` SW (`serviceWorker.ts:21`) or of the Workbox globs.
3. **The root route is rendered in Node at build time**, even with `ssr: false`: "The root route is
   still server-rendered at build time to generate `index.html`"
   ([how-to/spa](https://reactrouter.com/how-to/spa)). Anything `root.tsx` imports runs in Node, and
   `RootProvider`, the store, MUI theme and MSW are currently browser-assumed. *Unverified* whether
   they break; it needs a build probe.
4. **Browser history needs a SW navigation route for offline deep links.** The current SW only does
   `precacheAndRoute` (`serviceWorker.ts:21`). This is inferred from the code; not probed.
5. **MSW boot** moves from `<WithMockApi>` around `<RouterProvider>` (`index.tsx:24-30`) into
   `entry.client.tsx` before `hydrateRoot`. This is mechanical.

**Testing.** `createRoutesStub` "is **not designed for direct testing of Route components** using
`Route.*` types in Framework Mode" ([testing docs](https://reactrouter.com/start/framework/testing)).
Route modules would be tested through the stub with hand-built loaders.

**Verdict.** The highest migration cost, and it delivers only part of the typing goal. It adds two
infrastructure regressions (hash routing, PWA). **Reject.**

---

## 7. Option 3 — TanStack Router

**Header/back pattern.** Declare the AppBar contract once:

```ts
declare module '@tanstack/react-router' {
  interface StaticDataRouteOption { appBar: { kind: 'root' | 'nested'; title?: string } }
}
```

Every `createRoute`/`createFileRoute` must then supply it ("Omitting required properties triggers:
Property 'customData' is missing…", [static-route-data](https://tanstack.com/router/latest/docs/framework/react/guide/static-route-data)).
The layout reads `useMatches({ select: m => m.at(-1)?.staticData.appBar })` with full types
(`Matches.d.ts:48-51`; `RouteMatch.staticData`, `router-core Matches.d.ts:66`). `staticData` "can
literally contain anything you want as long as it's synchronously available". For dynamic titles
(the date picker), there are two routes to try: the documented route-context pattern (`beforeLoad`
returns `getTitle`, the root reads `matches.at(-1).context`;
[router-context guide](https://tanstack.com/router/latest/docs/framework/react/guide/router-context),
"Processing Accumulated Route Context"), or a component reference inside `staticData`. Which is
cleaner under strict types is POC question Q1.

**Type safety.** Requires `declare module … { interface Register { router: typeof router } }`
([type-safety guide](https://tanstack.com/router/latest/docs/framework/react/guide/type-safety)). The
POC branch already does this. Params, `validateSearch`-parsed search params and loader data are
inferred per route. From shared components, `strict: false` gives "relaxed, but accurate types" as a
union. Code-based routing needs `getParentRoute` on every route ("everything to do with the magical
type safety", [code-based routing](https://tanstack.com/router/latest/docs/framework/react/routing/code-based-routing)),
and the docs say "Code-based routing is not recommended for most applications" (file-based is the
default path).

**Hash history: supported.** `createRouter({ routeTree, history: createHashHistory() })`
([history-types](https://tanstack.com/router/latest/docs/framework/react/guide/history-types);
export at `react-router@1.170.41 dist/esm/index.d.ts:3`). The GitHub Pages demo, `base: './'`, the PWA
scope and the SW stay as they are. The router plugin is a plain Vite plugin that generates
`routeTree.gen.ts` and does not take over `index.html`, unlike `@react-router/dev`. The POC branch's
`vite.config.ts` shows it next to `pwa()`.

**Back navigation.** `useCanGoBack()` + `router.history.back()`, else navigate to the parent. The
hook is marked "**experimental**", and its index resets after a `reloadDocument` navigation
([useCanGoBack](https://tanstack.com/router/latest/docs/framework/react/api/router/useCanGoBack)).

**Draft state / Redux.** TanStack lists RTK Query and Redux among supported external libraries
("Router is designed to be a perfect **coordinator** for external data fetching and caching
libraries", [external-data-loading.md](https://github.com/TanStack/router/blob/main/docs/router/guide/external-data-loading.md)).
Inject the store via `createRootRouteWithContext<{ store }>()`, use loaders for
`initiate()`/`unsubscribe()`, and use `beforeLoad` + `throw redirect()` for missing-draft guards.
TanStack Router also has its own loader cache (`defaultStaleTime`, used in the POC). Running it on
top of RTK Query is a double cache to configure deliberately (POC question Q3).

**Desktop modal (optional).** First-class route masking ("Navigating to a modal route like
`/photo/5/modal`, but masking the actual URL as `/photos/5`",
[route-masking.md](https://github.com/TanStack/router/blob/main/docs/router/guide/route-masking.md)).

**MUI.** MUI documents TanStack integration via `createLink`
([MUI routing integration](https://mui.com/material-ui/integrations/routing/)).

**Migration cost: medium–high.** Every route, `Link`/`useNavigate`/`useLoaderData`/`useSearchParams`
call, both test helpers and `useNavigationProgress` must be ported. TanStack's own checklist says
"At this point I don't know if you can do a gradual migration"
([migrate-from-react-router checklist](https://github.com/TanStack/router/blob/main/docs/router/installation/migrate-from-react-router.md)).
Plan it as a single cut-over. The route surface is small enough for that: 9 routes in
`createRouter.tsx`, and **26 files** import from `react-router`. Those are 10 in `pages/`, 6 in
`app/`, 8 in `widgets/`+`features/`, and 2 in `tests/render/` (`rg -l "from 'react-router'" src tests`).

**Testing.** Memory history + a `createTestRouter`/`renderWithRouter` helper
([setup-testing](https://tanstack.com/router/latest/docs/framework/react/how-to/setup-testing)).
File-based apps "need different patterns", and the generated tree must exist for vitest.

---

## 8. Cross-cutting

### 8.1 Back-navigation semantics (independent of library)

Android's navigation principles are the clearest primary statement of the native behaviour the issue
asks for ([developer.android.com/guide/navigation/principles](https://developer.android.com/guide/navigation/principles)):
"Within your app's task, the Up and Back buttons behave identically". "If a user is at the app's
start destination, then the Up button does not appear". For a deep link, "any existing back stack…
is replaced with the deep-linked back stack", which "must be realistic". Mapped onto a SPA:

- Header back arrow: history-back when there is in-app history, else `replace`-navigate to the parent
  route (the synthetic back stack). RR exposes this via `location.key === 'default'`; TanStack via
  `useCanGoBack()`.
- Completing a child (product saved) returns to the parent with `replace`, not `push`.
- Refresh or deep link into a child with no draft: the guard redirects to the nearest valid parent.

### 8.2 MUI

- MUI `Modal` (under `Dialog`) "disables scrolling of the page content while open" and "properly
  manages focus… keeping it there until the modal is closed". "Stacking of more than two modals… is
  discouraged" ([MUI Modal](https://mui.com/material-ui/react-modal/)). Rendering screens as pages
  under the existing sticky `AppBar` (`AuthenticatedLayout.tsx:57`) removes scroll lock and the
  focus trap from the flow. Whether that is what fixes the reported scroll bug is **unverified**: the
  bug isn't reproduced here.
- No MUI guidance specific to a "fullscreen Dialog vs. page" choice was found. The routing
  integration page covers only `Link` adapters.
- Material 3 app-bar guidelines (m3.material.io) could not be fetched (client-rendered). The
  "search in the app bar" guidance is therefore **unverified** here.

### 8.3 Redux Toolkit 2.x

No router-specific official guidance. RTK documents the primitives the loaders already use:
`initiate()` + `unsubscribe()`, and `prefetch()` for fire-and-forget
([Usage Without React Hooks](https://redux-toolkit.js.org/rtk-query/usage/usage-without-react-hooks)).
Nothing in any option requires moving the draft out of Redux. The user's worry that "form state can't
move out of Redux" is moot. It doesn't have to.

### 8.4 Bundle size

No primary source with numbers was found for either library. Measure in the POC (`vite build` before
and after).

---

## 9. Project health

| | React Router | TanStack Router |
|---|---|---|
| Stability line | v7 2024-11-22 → v8 2026-06-17; v8 breaking changes "quite minimal, and all of them are changes you can make in v7" ([blog](https://remix.run/blog/react-router-v8)) | 1.x since 2023-12-23 (≈2.8 years, no major bump) |
| Breaking-change mechanism | `future.v8_*` flags pre-ship v8 behaviour inside v7 (removed in [8.0.0](https://github.com/remix-run/react-router/blob/main/packages/react-router/CHANGELOG.md#v800)); unstable APIs carry `unstable_` prefix ([API strategy](https://reactrouter.com/community/api-development-strategy)) | Experimental APIs flagged in docs (e.g. `useCanGoBack`). A formal deprecation/semver policy page was **not found** (*unverified*) |
| Cadence | Yearly majors announced; 23 releases in 2026 | 162 1.x releases in 2026 (continuous publish) |
| Old-major support | v7 keeps security updates; v6 EOL at v8 ([blog](https://remix.run/blog/react-router-v8)) | n/a (single major) |
| Governance / backing | Steering Committee + RFC stages ([GOVERNANCE.md](https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md)); Remix team. Remix 3 is a separate, non-React framework, and the blog says "If you need something battle-tested, stick with React Router" | TanStack org (MIT) |
| GitHub (2026-10-02) | 56.6k stars, 212 open issues | 15.1k stars, 710 open issues |

Neither project looks likely to be abandoned in 6–12 months. React Router has the more conservative
and explicitly documented change policy. TanStack has the higher release churn and a larger issue
backlog.

---

## 10. Recommendation

Scores: 1 (poor) – 5 (good) against the issue's criteria. Migration cost is scored separately
because it is not one of the user's criteria but decides sequencing.

| Criterion | RR Data Mode (v8) | RR Framework Mode | TanStack Router |
|---|---|---|---|
| Maintainability / reliability | **5** — conservative policy, yearly majors, v7 still patched | 4 — same project; SPA+PWA path has an open upstream gap | 4 — stable 1.x for ~2.8 y; high churn, larger backlog, no published deprecation policy found |
| Architecture (routing separable, business logic testable, swappable) | 4 — plain route objects; `getContext` lets the store be injected | 2 — takes over entry/`index.html`/build; route-module conventions | 4 — router context injection; code-based option keeps routes in `app/`; file-based fights FSD layout (Q4) |
| Strict typing (no guards/casts) | **1** — `handle: any/unknown`, untyped params/search, generic casts | 2 — typed per-module data/params; header metadata still `unknown`; no search schema | **5** — typed `staticData` on every match, typed params/search/loader data |
| Scalability (add routes by analogy, little boilerplate) | 3 | 4 | 4 |
| *Migration cost* | *Low* | *High + 2 infra regressions* | *Medium–high, single cut-over* |

**Recommendation: TanStack Router, gated by a POC. React Router Data Mode on v8 is the fallback.
Reject Framework Mode.**

- Framework Mode loses on every axis that matters here. It costs the most and breaks hash routing and
  PWA precaching. It also does not remove the header type guard, which was the main reason it was
  considered.
- TanStack is the only option that satisfies strict typing as defined in the issue. It keeps hash
  history, so the deploy, PWA and MSW setups don't move.
- If the POC fails (see Q1–Q4), stay on React Router, upgrade to v8, and implement the nested note
  routes in Data Mode. That fixes problem 1 and the multi-product boilerplate at low cost, and accepts
  one localized cast or guard for `handle`.

---

## 11. Open questions a POC must answer

1. **Dynamic header under strict types (TanStack).** Can the Today page's `SelectDate` title and the
   History `FilterNotesHistory` action come from `staticData` or route context with zero casts? Which
   is cleaner, `staticData` holding a component or `beforeLoad` returning `getTitle`? Does the
   router-context example type-check across a union of routes when only some define `getTitle`?
2. **Hash history end-to-end.** `createHashHistory()` + `base: './'` + PWA `scope`/`start_url` +
   MSW on the GitHub Pages demo build. Do existing `/#/…` URLs keep working?
3. **RTK Query in loaders.** Store via `createRootRouteWithContext`; `initiate`/`unsubscribe` in
   `loader`; what to set for TanStack's own `staleTime`/`gcTime` so the two caches don't fight; does
   `useNavigationProgress` (`app/routing/useNavigationProgress.ts`) have a clean equivalent?
4. **Routes vs FSD.** File-based (`src/routes/` is a new top-level, the POC default) vs code-based
   routes in `app/routing` that import `pages/*`. Which keeps FSD import direction and testability?
   How does `routeTree.gen.ts` interact with ESLint (`import-x/order`, type-checked rules) and vitest?
5. **Note draft and form state.** With `notes/new` (search) → `product` → back: is the draft-missing
   redirect enough, or should `NoteForm` field edits (quantity) be written into the draft so they
   survive the product detour (today they don't, §2.3)? Model the planned **multi-product** flow:
   one draft holding N items with a `…/items/:index/product` child, or N drafts.
6. **Back semantics.** Verify `useCanGoBack` (experimental) on: in-app navigation, cold deep link,
   refresh mid-flow, and installed-PWA launch. Confirm product-save returns with `replace`.
7. **Desktop.** Should desktop keep a modal over the day page (route masking) or use pages
   everywhere? This decides whether masking is in scope.
8. **Scroll bug.** Reproduce it first, then confirm it disappears once the screen is a page rather
   than a `Dialog` (§8.2).
9. **Bundle delta.** `vite build` size before and after, against React Router v8 Data Mode as the baseline.
10. **Fallback check (if TanStack is rejected).** In Data Mode, can a `defineRoute<AppHandle>()`
    helper plus one cast in a single hook pass `strict-boolean-expressions` and
    `@typescript-eslint/no-unsafe-*` cleanly, and would the user accept that one localized cast?

---

## Sources

### Repo
- `src/frontend/package.json:30,35,65,67,94-95`; `src/frontend/yarn.lock:7918-7920`
- `src/frontend/src/app/routing/createRouter.tsx:1-63`; `AuthenticatedLayout.tsx:21-39,57-78`
- `src/frontend/src/app/index.tsx:22-30`; `src/app/WithMockApi.tsx:10-27`; `src/app/serviceWorker.ts:19-21`
- `src/frontend/vite.config.ts:8,13-21,49`; `src/frontend/tests/render/render.tsx:14-50`
- `src/frontend/src/widgets/Navigation/ui/Navigation.tsx:8-28,48-57`
- `src/frontend/src/pages/ui/IndexPage.tsx:4,26-46`; `HistoryPage.tsx:21-50`; `WeightPage.tsx:16,43`; `ProductsPage.tsx:9-19`; `pages/lib/reactRouterExtensions.ts:1`
- `src/frontend/src/features/manageNote/ui/NoteInputDialog.tsx:21-135`; `AddNoteButton.tsx:46`; `EditNote.tsx:31`; `NoteForm.tsx:57-61`; `ProductSearchResults.tsx:72-84`
- `src/frontend/src/features/manageNote/model/manageNoteSlice.ts:34-141`; `model/types.ts:19-45`
- `src/frontend/src/shared/ui/Dialog/FullScreenDialog.tsx:42,48-52`
- `src/backend/src/FoodDiary.API/Startup.cs:139,168-171`
- Commit `66a5cf44` "Configure demo deployment to GitHub Pages (#160)" ("Switch to hash router to avoid 404.html hack")
- Branch `new-routes-poc` (`8ebecc53`, `8041aa88`, `79581e20`)

### React Router
- Modes — https://reactrouter.com/start/modes
- Using Handle (Framework-only badge) — https://reactrouter.com/how-to/using-handle
- Route Object (Data Mode, documents `handle`) — https://reactrouter.com/start/data/route-object
- useMatches — https://reactrouter.com/api/hooks/useMatches
- Route Module — https://reactrouter.com/start/framework/route-module
- SPA mode — https://reactrouter.com/how-to/spa
- Framework adoption from RouterProvider — https://reactrouter.com/upgrading/router-provider
- Testing — https://reactrouter.com/start/framework/testing
- API development strategy — https://reactrouter.com/community/api-development-strategy
- v8 blog (2026-06-17) — https://remix.run/blog/react-router-v8 (raw: https://remix.run/blog/react-router-v8.md)
- CHANGELOG (v8.0.0 breaking changes; 7.9.4/7.9.5 `useRoute`; 7.13.1 `unstable_mask`) — https://github.com/remix-run/react-router/blob/main/packages/react-router/CHANGELOG.md
- GOVERNANCE — https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md
- SPA Mode not compatible with PWA — https://github.com/remix-run/react-router/issues/14268
- Tarball paths cited: `react-router@7.18.4 dist/development/{index.d.ts,data-CjO11-hU.d.ts}`; `react-router@8.4.0 dist/development/lib/{router/utils.d.ts,router/history.d.ts,hooks.d.ts,context.d.ts,href.d.ts,types/route-module-annotations.d.ts,types/register.d.ts,dom/lib.d.ts,dom-export/hydrated-router.js}`; `@react-router/dev@8.4.0 dist/config-t89niiFv.d.ts`

### TanStack Router
- Static Route Data — https://tanstack.com/router/latest/docs/framework/react/guide/static-route-data
- Router Context — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
- Type Safety — https://tanstack.com/router/latest/docs/framework/react/guide/type-safety
- useMatches — https://tanstack.com/router/latest/docs/framework/react/api/router/useMatchesHook
- useCanGoBack — https://tanstack.com/router/latest/docs/framework/react/api/router/useCanGoBack
- History types — https://tanstack.com/router/latest/docs/framework/react/guide/history-types
- Code-based routing — https://tanstack.com/router/latest/docs/framework/react/routing/code-based-routing
- Setup testing — https://tanstack.com/router/latest/docs/framework/react/how-to/setup-testing
- External data loading — https://github.com/TanStack/router/blob/main/docs/router/guide/external-data-loading.md
- Route masking — https://github.com/TanStack/router/blob/main/docs/router/guide/route-masking.md
- Migration checklist — https://github.com/TanStack/router/blob/main/docs/router/installation/migrate-from-react-router.md
- Tarball paths cited: `@tanstack/react-router@1.170.41 dist/esm/{index.d.ts,Matches.d.ts}`; `@tanstack/router-core@1.171.34 dist/esm/{route.d.ts,Matches.d.ts}`

### Other
- vite-plugin-pwa: Feature Request React Router 7 (open) — https://github.com/vite-pwa/vite-plugin-pwa/issues/809
- MUI Modal — https://mui.com/material-ui/react-modal/
- MUI routing integration — https://mui.com/material-ui/integrations/routing/
- RTK Query usage without hooks — https://redux-toolkit.js.org/rtk-query/usage/usage-without-react-hooks
- Android principles of navigation — https://developer.android.com/guide/navigation/principles

### Not evaluated
- **Option 4 ("other")**: no further candidate was found that offers data loaders plus typed route
  metadata with primary-source backing within this research's scope. The list is deliberately not padded.

---

## Appendix: how the probes were run

```
npm view react-router dist-tags time --json
npm view @tanstack/react-router dist-tags versions time peerDependencies --json
npm view @react-router/dev@8.4.0 peerDependencies --json
npm view @tanstack/router-plugin@latest peerDependencies --json
npm pack react-router@7.18.4 react-router@8.4.0 @react-router/dev@8.4.0 \
         @tanstack/react-router@1.170.41 @tanstack/router-core@1.171.34   # into the session scratchpad
rg -n 'handle\?: any|interface UIMatch|declare function useMatches' <unpacked>/dist
gh issue view 14268 -R remix-run/react-router --json state,stateReason,closedAt,comments
gh issue view 809 -R vite-pwa/vite-plugin-pwa --json state,comments
gh api repos/{TanStack/router,remix-run/react-router}
git log main..new-routes-poc; git show --stat 66a5cf44
```
