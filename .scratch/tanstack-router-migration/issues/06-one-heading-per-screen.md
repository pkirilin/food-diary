# 06 — One heading per screen

**What to build:** Each authenticated screen has exactly one top-level heading, and it is the AppBar title. Two screens currently repeat their name or have the wrong heading level:
- Categories repeats its name as a large heading under the AppBar.
- Products has a heading that only screen readers see, and its table toolbar repeats the name as a visible title.

On the diary, the heading is the date switcher. A screen reader therefore announces the selected date, which tells the owner which day's Food Logs they are on. This is a behaviour change, so the PR description must call it out.

Context worth knowing before starting:
- **The AppBar title is not a heading today.** It renders as a plain inline element.
- **Weight's in-page heading is not a duplicate.** It shows the date range of the Weight Logs on screen, so it stays but becomes a second-level heading.

See the [spec](../spec.md), *AppBar contract* and *Headings*.

**Blocked by:** 05 — Cut over to TanStack Router

**Status:** resolved

- [x] The AppBar title renders as the page's top-level heading and keeps today's visual style. A slot title is wrapped in the heading too
- [x] The visible heading on Categories is removed
- [x] The visually hidden heading on Products is removed
- [x] The Products table toolbar's visible title is removed
- [x] Weight's date-range heading becomes a second-level heading
- [x] New app-level test: History, Weight, Products and Categories each show their title as the only top-level heading
- [x] New app-level test: the diary's top-level heading names the selected date
- [x] Browser check with playwright-cli in MSW and fake-auth mode: every section shows its title once. The console shows nothing beyond the MSW-mode baseline
- [x] `yarn build`, `yarn lint`, `yarn format:check` and `yarn test --run --reporter=verbose` (no `stderr` blocks) all exit zero
