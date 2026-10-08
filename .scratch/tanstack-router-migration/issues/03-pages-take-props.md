# 03 — Pages take props

**What to build:** Every screen behaves exactly as it does today. Pages and the features they compose stop reading route state, and receive plain values and callbacks instead ([ADR-0005](../../../docs/adr/0005-pages-are-router-agnostic.md)). Each screen gets a pure page component. A thin adapter is now the only code that touches the router: it reads route state and passes props down. At the cut-over, these adapters move into TanStack route files almost unchanged. This is prefactoring, with no visible change.

Context worth knowing before starting:
- **The date switcher** already has a router-free view and a thin container (MUI 9 migration, ticket 01). That container is the piece being replaced.
- **The History filter** submits a GET form through the router today. It becomes an apply callback that takes a month and a year.
- **The History screen** returns its history data from the loader today. That is a frozen copy, which RTK Query keeps updating elsewhere. It switches to reading through an RTK hook, and the loader only warms the cache.
- **The diary and Weight screens** read loader data through an unchecked generic.
- **Navigation widgets keep their router links.** That covers the drawer, the History list items that open a diary date, and the filter's icon link. Navigation is their job, and they move to typed links at the cut-over.
- **The root page** is dead code that nothing references.

See the [spec](../spec.md), *Pages, features and navigation widgets*.

**Blocked by:** 01 — App-level regression tests on today's router

**Status:** resolved

- [x] Each screen has a pure page component that takes props. Only its route adapter reads route state or navigates
- [x] The date switcher takes the current date and a change callback
- [x] The History filter takes an apply callback for month and year
- [x] History reads its data through an RTK hook, and its loader only warms the cache
- [x] The dead root page is deleted
- [x] Ticket 01's tests pass unchanged
- [x] The existing History filter test drives the apply callback through a typed mock
- [x] Browser check with playwright-cli in MSW and fake-auth mode: switch the date, apply a History filter, and open a diary day from History. The console shows nothing beyond the MSW-mode baseline
- [x] `yarn build`, `yarn lint`, `yarn format:check` and `yarn test --run --reporter=verbose` (no `stderr` blocks) all exit zero

## Comments

### Where things live

- **Adapters** are `src/app/routing/<Screen>Route.tsx`: React Router lazy route modules that export the `loader` and a `Component` that reads route state and renders the page. `createRouter` lazy-loads them instead of the pages.
- **AppBar slots** sit in the same files: `DateSwitcherSlot` in `IndexRoute.tsx` and `HistoryFilterSlot` in `HistoryRoute.tsx`. Until the cut-over, the loader still puts them into the AppBar's loader data and passes them the date as a prop. At the cut-over they read their route's search themselves.
- **Page props:**

  | Page | Props |
  |---|---|
  | `IndexPage` | `date` |
  | `HistoryPage` | `notesHistoryRequest` |
  | `WeightPage` | `weightLogsRequest` |
  | `LoginPage` | `returnUrl`, `navigate` |
  | `PostLoginPage` | `returnUrl`, `navigate` |
  | `PostLogoutPage` | `navigate` |
  | `ProductsPage`, `CategoriesPage` | none |

- **The date switcher** is `SelectDateView`, under its existing name. The `SelectDate` container is deleted.
- **`ok()`** moved from `src/pages/lib` to `src/app/routing/reactRouterExtensions.ts`, because only the adapters use it now. `src/pages/lib` is gone. Ticket 05 still deletes `ok()`.

### Notes for later tickets

- **Typed loader data.** The diary, History and Weight adapters read `useLoaderData<typeof loader>()`, typed from each loader's declared return type. At the cut-over these become `Route.useSearch()` for the diary and `Route.useLoaderData()` for History and Weight.
- **History's loader returns the request, not the data.** `HistoryPage` reads through `noteApi.useNotesHistoryQuery`. In app-level tests, the loader still warms the store singleton while the page reads the fresh store, so the page fetches for itself there. Ticket 05's store-through-context removes that split.
- **Post-login and post-logout render nothing while they redirect**, just as `<Navigate>` did. They call `navigate` from an effect. Rendering the progress label through the follow-up load instead would remove a blank flash on the real-backend round trip. That would be a visible change, so it was not made.
- **The filter test's "picked month survives until it is applied"** now asserts `onApply(12, 2023)` instead of the radio's checked state.
- **Applying the History filter has no app-level test.** The spec's seam-1 list does not include it, and the browser check covers it.

### Browser check

playwright-cli against the dev server in MSW and fake-auth mode:
- **Date switch:** switching from 19 to 20 Oct opened `#/?date=2023-10-20` with the new title.
- **History filter:**
  - Applying Sep 2023 opened `#/history?month=9&year=2023`, showing "No items found", since the mocks have no September data.
  - Applying Oct 2023 brought the days back.
- **Diary day from History:** tapping 21 Oct opened `#/?date=2023-10-21`, and Back returned to the History month.
- **Other screens:** Weight, Products and Categories rendered.
- **Console:** only the three `ERR_CONNECTION_REFUSED` baseline errors.
