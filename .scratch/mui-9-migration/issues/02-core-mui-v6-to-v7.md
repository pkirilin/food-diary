# 02 — Core MUI v6 → v7

**What to build:** The app builds and runs on core MUI v7, looking and behaving exactly as it does today. Internally it stops carrying two generations of the grid component and stops carrying a dependency it never uses.

The date pickers and the weight chart stay on their current version throughout — the v7 guide states explicitly that MUI X packages should remain unchanged during a core upgrade, and their peer ranges accept a v7 core.

**Blocked by:** None — can start immediately

**Status:** resolved

- [x] The four core packages — material, icons, system and utils — are on the v7 line
- [x] The lab dependency is removed from the manifest; nothing in the source imported it
- [x] Legacy grid usage is converted to the current grid API using the upstream codemod, run as a dry run and reviewed first
- [x] The second-generation grid imports are renamed by hand — there is no codemod for the import rename, only diffs in the guide
- [x] Exactly one grid generation remains in the codebase
- [x] The styled-engine provider is imported from the styles entry point rather than the package root. The v7 guide claims the root specifier was removed; it was not, and still resolves — the change is made anyway rather than depending on a specifier the guide declares gone
- [x] No `react-is` resolution override is added — that workaround applies only to React 18 and below
- [x] The picker and chart packages are untouched
- [x] `yarn build`, `yarn test` (verbose reporter, no `stderr` blocks) and `yarn lint` all exit zero
