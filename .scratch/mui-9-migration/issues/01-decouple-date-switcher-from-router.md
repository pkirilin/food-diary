# 01 — Decouple the date switcher from the router

**What to build:** The day switcher in the app bar — the control that changes which day's meals you are viewing — keeps behaving exactly as it does today, but its date-submission behaviour becomes observable from a test. The component itself stops reaching for the router and instead reports a chosen date through a callback prop; a thin container supplies that callback from the router.

This is prefactoring for ticket 03, which deliberately changes how date selection is confirmed. It has no dependency on any MUI version and can land on the current one.

Context worth knowing before starting: the switcher is currently constructed inside a route loader and returned as loader data. Loaders cannot call hooks, which is why a component boundary has to be introduced rather than the callback simply being passed down from the calling page.

**Blocked by:** None — can start immediately

**Status:** resolved

- [x] The day switcher accepts the current date and a submit callback as props, and no longer calls a router hook itself
- [x] A container component owns the router hook and supplies the callback; the index page's loader renders the container
- [x] Selecting a date in the running app still navigates to that day, exactly as before
- [x] A test drives the switcher with a mocked callback and asserts it fires once with the selected date, using today's single-tap selection flow
- [x] The container itself is deliberately left untested — it is wiring, and testing it would mean recreating the router-level seam this change moves away from
- [x] `yarn build`, `yarn test` (verbose reporter, no `stderr` blocks) and `yarn lint` all exit zero
