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

**Status:** ready-for-agent

- [ ] Each screen has a pure page component that takes props. Only its route adapter reads route state or navigates
- [ ] The date switcher takes the current date and a change callback
- [ ] The History filter takes an apply callback for month and year
- [ ] History reads its data through an RTK hook, and its loader only warms the cache
- [ ] The dead root page is deleted
- [ ] Ticket 01's tests pass unchanged
- [ ] The existing History filter test drives the apply callback through a typed mock
- [ ] Browser check with playwright-cli in MSW and fake-auth mode: switch the date, apply a History filter, and open a diary day from History. The console shows nothing beyond the MSW-mode baseline
- [ ] `yarn build`, `yarn lint`, `yarn format:check` and `yarn test --run --reporter=verbose` (no `stderr` blocks) all exit zero
