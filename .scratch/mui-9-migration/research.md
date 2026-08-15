# MUI v9 migration research

Research date: **2026-08-15**. All version claims verified against the npm registry and upstream
source on that date. Where a claim was ambiguous in the docs it was checked against the **published
package tarballs** (`npm pack` of `@mui/material@9.3.1`, `@mui/material@7.3.11`,
`@mui/x-date-pickers@9.11.0`, `@mui/x-charts@9.11.1`) — see
[Appendix: how the package probes were run](#appendix-how-the-package-probes-were-run).

---

## 1. Bottom line

1. **MUI v9 exists and is stable.** `@mui/material@9.0.0` shipped **2026-04-07**; latest is
   **9.3.1** (2026-08-06). `npm view @mui/material dist-tags --json` →
   `{"latest":"9.3.1","latest-v7":"7.3.11","latest-v6":"6.5.0","latest-v5":"5.18.0","next":"9.0.0-beta.1","canary":"6.1.1-dev…"}`.
   The migration target is real and there is no need to pivot to a pre-release.

2. **🔑 There is no MUI Core v8. The jump is two hops, not three.** `npm view @mui/material versions`
   returns **261 versions and not a single `8.x`** — the line goes `7.3.11` → `9.0.0-alpha.0`. The
   docs repo confirms it: `docs/data/material/migration/` contains `upgrade-to-v6`, `upgrade-to-v7`,
   `upgrade-to-v9` and **no `upgrade-to-v8`**. So the core path is **v6 → v7 → v9**.
   The v9 guide does not explain why 8 was skipped (most likely to align the core major with the MUI X
   major, which *does* have a v8).

3. **MUI X is on its own line and *does* have a v8** — `@mui/x-charts` and `@mui/x-date-pickers` are
   at **9.11.1 / 9.11.0**, with a real `8.x` line (8.0.0, 2025-04-17). So X is **v7 → v8 → v9**,
   three package versions, two migration guides. Both packages are still **MIT**; `LineChart` is in
   the free tier. No licensing exposure.

4. **The X peer ranges decouple the two migrations, which is the single most useful finding here.**
   - `@mui/x-*@7.29.x` peers `@mui/material: ^5.15.14 || ^6.0.0 || ^7.0.0`
   - `@mui/x-*@8.x` peers `@mui/material: ^5.15.14 || ^6.0.0 || ^7.0.0`
   - `@mui/x-*@9.x` peers `@mui/material: ^7.3.0 || ^9.0.0`

   **Core v7 is the only version compatible with every X major.** That makes core-v7 a safe parking
   spot: land core v6→v7 with X untouched, then move X 7→8→9 while core sits on 7, then land core
   v7→v9 with X already on 9. Core v9 is compatible with **X v9 only**.

5. **Emotion is still the styling engine. Nothing about the CSS-in-JS story changes.**
   `@mui/styled-engine@9.3.0` still depends on `@emotion/cache`, `@emotion/sheet`, `@emotion/serialize`
   and peers on `@emotion/react` / `@emotion/styled`. `@mui/material-pigment-css` is an **optional**
   peer in v9, exactly as in v7. `@emotion/react@^11.14` / `@emotion/styled@^11.14` already satisfy
   `^11.5.0` / `^11.3.0`. **No emotion work at all.**

6. **`@mui/lab` is a dead dependency in this repo — delete it, don't migrate it.**
   `rg '@mui/lab'` across the whole repo returns exactly **one** hit: `src/frontend/package.json:22`.
   Zero source imports. It never reached a stable release on any line (`latest` is `9.0.0-beta.8`)
   and pins `@mui/material: ^9.3.1`, which would make every future core patch a lockstep bump.

7. **The two hard build breaks are tiny and both are one-liners.**
   - `src/app/RootProvider.tsx:3` — `@mui/x-date-pickers/AdapterDateFnsV3` **does not exist** in
     x-date-pickers v8+. Verified: the 9.11.0 tarball ships `AdapterDateFns/`, `AdapterDateFnsV2/`,
     `AdapterDateFnsBase/` and **no `AdapterDateFnsV3/`**. Fix: import `AdapterDateFns` from
     `@mui/x-date-pickers/AdapterDateFns`.
   - `src/widgets/WeightChart/ui/WeightChart.tsx:43` — `slotProps={{ legend: { hidden: true } }}`
     became the `hideLegend` prop in charts v8.

8. **The real cost is three things, in descending order:**
   - **52 system-prop occurrences across 11 files** (`<Stack alignItems>`, `<Box p>`, `<Grid display>`,
     `<Typography color>` …) removed in v9 — but **fully codemod-able** via `v9.0.0/system-props`.
   - **Grid**: the repo uses *both* generations — legacy `<Grid item xs sm lg>` in one file and `Grid2`
     in three. v7 renames both; v9 deletes `GridLegacy` and `Grid2` outright (verified: the 9.3.1
     tarball contains only `Grid/`).
   - **Tests.** One breaks by construction: `WeightLogsList.test.tsx:26` does
     `findByRole('textbox', { name: /date/i })` + `toHaveValue(…)`, but in x-date-pickers v8+ the
     field is no longer an `<input>` — verified in the published bundle, each date section renders
     with **`role: 'spinbutton'`** and `contentEditable`, and the v8 escape hatch
     `enableAccessibleFieldDOMStructure` is **removed in v9**. Two more are at risk:
     `Products.test.tsx:52,54` depend on a `<TextField select>` label association that core v9
     changes from native `htmlFor` to `aria-labelledby` (§5.4).

9. **No React / TypeScript / Node / emotion work is required.** React 19.2 satisfies
   `^17 || ^18 || ^19`; the `react-is` resolution workaround in the v7 guide applies only to React ≤18.
   TypeScript minimum is **4.9** (raised from 4.7 in v7, unchanged in v9) — repo is on 5.9.3.
   Node engines on the packages are `>=14.0.0` — repo is on 24.

10. **The one genuinely non-mechanical risk is the picker "confirm the selection" behaviour change**
    in x-date-pickers v8, which changes runtime UX for the two `StaticDatePicker`s and may stop
    `onAccept` firing in `SelectDate.tsx`. This needs a spike, not a codemod. See §10.1.

11. **Sizing: 4 PRs.** Core v6→v7 (small), X v7→v9 (medium, carries the test breakage), core v7→v9
    (medium, mostly codemod), cleanup. **Do not attempt this as one PR** — not because of volume, but
    because the X hop and the core hop fail in completely different ways and you want to bisect them
    independently. See §9.

12. **Two doc defects found.** (a) The v7 guide claims
    `import { StyledEngineProvider } from '@mui/material'` "has been removed" — it has **not**; it
    still resolves in both 7.3.11 and 9.3.1 via the wildcard re-export of `./styles` (§4.4). (b) MUI X
    uses "migrate **from** vN" directory naming while MUI Core uses "upgrade **to** vN", so
    `migration-pickers-v8` is the v8→**v9** guide (§5.1). Both are traps for a reader skimming URLs.

---

## 2. Version reality check

### 2.1 MUI Core (verified from the registry)

`npm view @mui/material dist-tags --json`:

```json
{
  "canary": "6.1.1-dev.20240919-130050-82a6448768",
  "latest-v5": "5.18.0",
  "latest-v6": "6.5.0",
  "latest-v7": "7.3.11",
  "next": "9.0.0-beta.1",
  "latest": "9.3.1"
}
```

| Fact | Value | Source |
|---|---|---|
| Latest stable major | **v9** — `9.3.1`, published **2026-08-06** | `npm view @mui/material dist-tags/time --json` |
| First 9.x | **9.0.0**, **2026-04-07** | `npm view @mui/material time --json` |
| 9.x prereleases | `9.0.0-alpha.0` … `-alpha.4`, `-beta.0`, `-beta.1` | `npm view @mui/material versions --json` |
| **v8 line** | **does not exist** — zero `8.*` versions among 261 | `npm view @mui/material versions --json` |
| Latest v7 | `7.3.11`, 2026-05-07 | same |
| Current repo pin | `^6.5.0` (v6.5.0 published 2025-07-08) | `src/frontend/package.json` |
| v7.0.0 released | 2025-03-26 | `npm view @mui/material time --json` |
| Node engines | `>=14.0.0` on 7.0.0, 9.0.0 and 9.3.1 alike | `npm view @mui/material@<v> engines` |

`@mui/lab` is the odd one out and is covered in §6. All other core packages track the same numbers:

| Package | `latest` | `latest-v7` | `latest-v6` |
|---|---|---|---|
| `@mui/material` | 9.3.1 | 7.3.11 | 6.5.0 |
| `@mui/icons-material` | 9.3.1 | 7.3.11 | 6.5.0 |
| `@mui/system` | 9.3.0 | 7.3.11 | 6.5.0 |
| `@mui/utils` | 9.3.0 | 7.3.11 | 6.4.9 |
| `@mui/codemod` | 9.3.1 | 7.3.10 | 6.5.0 |
| `@mui/lab` | **9.0.0-beta.8** | 7.0.1-beta.25 | 6.0.1-beta.36 |

**No `8.x` exists for `@mui/lab` either** (`npm view @mui/lab versions --json` → `8.x: []`), which
independently corroborates that the whole core monorepo skipped 8.

### 2.2 MUI X (independent version line)

`npm view @mui/x-charts dist-tags --json` → `{"latest-v7":"7.29.1","latest-v8":"8.29.0","next":"9.0.0-rc.0","latest":"9.11.1"}`
`npm view @mui/x-date-pickers dist-tags --json` → `{"latest-v6":"6.20.2","latest-v7":"7.29.4","latest-v8":"8.29.0","next":"9.0.0-rc.0","latest":"9.11.0"}`

| Fact | `@mui/x-charts` | `@mui/x-date-pickers` |
|---|---|---|
| Latest | **9.11.1** (2026-08-06) | **9.11.0** (2026-08-06) |
| v9.0.0 released | 2026-04-08 | 2026-04-08 |
| v8.0.0 released | 2025-04-17 | 2025-04-17 |
| Repo pin | `^7.29.1` (7.29.1 = 2025-04-23) | `^7.29.4` (7.29.4 = 2025-05-22) |
| License | **MIT** | **MIT** |

Note X v9.0.0 landed **one day after** core v9.0.0 — the majors are deliberately aligned from v9
onward, which is the most plausible reason core skipped 8.

### 2.3 Support / EOL status of v6

**MUI publishes no dated EOL policy comparable to ESLint's version-support page.** What is observable:

- `@mui/material@6.5.0` was published **2025-07-08** — over 13 months without a v6 release.
- The v6 line still holds a `latest-v6` dist-tag, i.e. it is addressable but not being cut.
- `docs/data/material/migration/upgrade-to-v6` still exists, so v6 docs are not deleted.

**Treat v6 as unmaintained-in-practice rather than formally EOL.** This is an inference from release
cadence, not a published statement — flagged as such.

---

## 3. Peer requirements for the target majors

Verified with `npm view <pkg>@<version> peerDependencies engines --json`.

### 3.1 `@mui/material@9.3.1`

```json
"peerDependencies": {
  "react": "^17.0.0 || ^18.0.0 || ^19.0.0",
  "react-dom": "^17.0.0 || ^18.0.0 || ^19.0.0",
  "@types/react": "^17.0.0 || ^18.0.0 || ^19.0.0",
  "@emotion/react": "^11.5.0",
  "@emotion/styled": "^11.3.0",
  "@mui/material-pigment-css": "^9.3.0"
},
"peerDependenciesMeta": {
  "@types/react": { "optional": true },
  "@emotion/react": { "optional": true },
  "@emotion/styled": { "optional": true },
  "@mui/material-pigment-css": { "optional": true }
},
"engines": { "node": ">=14.0.0" }
```

`@mui/material@7.0.0` declares **the identical shape** (only the pigment-css version differs). So
nothing in the peer surface changes across either hop.

| Requirement | Target needs | Repo has | Verdict |
|---|---|---|---|
| React | `^17 \|\| ^18 \|\| ^19` | 19.2 | ✅ |
| `react-dom` | same | 19.2 | ✅ |
| `@types/react` | `^17 \|\| ^18 \|\| ^19` (optional) | 19.x | ✅ |
| `@emotion/react` | `^11.5.0` | `^11.14.0` | ✅ |
| `@emotion/styled` | `^11.3.0` | `^11.14.1` | ✅ |
| **TypeScript** | **≥ 4.9** | 5.9.3 | ✅ |
| Node (SSR) | `>=14.0.0` | 24 | ✅ |
| `react-is` | v9 depends on `react-is@^19.2.8` directly | React 19 | ✅ (see below) |

**The `react-is` resolution workaround does not apply here.** The v7 guide devotes ~60 lines to
forcing `react-is@18.3.1` via `resolutions`/`overrides`; that block is explicitly scoped: *"If you are
using React 18 or below, you need to set up a resolution of `react-is` package to the same version as
the `react` you are using."* This repo is on React 19.2, so **skip it entirely** — no `resolutions`
entry in `package.json`.

### 3.2 Styling engine — emotion, unchanged

The task asked whether MUI has moved off emotion by v9. **It has not.**

`npm view @mui/styled-engine@9.3.0 dependencies peerDependencies --json`:

```json
"dependencies": {
  "csstype": "^3.2.3", "prop-types": "^15.8.1", "@babel/runtime": "^7.29.7",
  "@emotion/cache": "^11.14.0", "@emotion/sheet": "^1.4.0", "@emotion/serialize": "^1.3.3"
},
"peerDependencies": {
  "react": "^17.0.0 || ^18.0.0 || ^19.0.0",
  "@emotion/react": "^11.4.1", "@emotion/styled": "^11.3.0"
}
```

Pigment CSS (`@mui/material-pigment-css`) is an **optional** peer in both v7.0.0 and v9.3.1 — an
opt-in alternative, never a default. `StyledEngineProvider` and `styled()` keep their current
semantics. The only v7-era styling addition worth knowing about is `enableCssLayer` on
`StyledEngineProvider` (CSS `@layer` support), which is **opt-in and irrelevant here**.

### 3.3 Browser targets — the one requirement that actually tightens

From the v9 guide, *"Supported browsers and versions — the default bundle targets have changed in v9"*:

| Browser | v7 (and earlier) | **v9** |
|---|---|---|
| Chrome | 109 | **117** |
| Firefox | 115 | **121** |
| Safari (macOS + iOS) | 15.4 | **17.0** |
| Edge | — | **121** |

⚠️ **This does not match the repo's own browserslist.** `src/frontend/package.json` declares
`"production": [">0.2%", "not dead", "not op_mini all"]`, which admits browsers well below Safari 17
and Chrome 117. Vite does not transpile `node_modules` for the modern build, so **MUI v9's shipped
syntax becomes the effective floor for the app regardless of what browserslist says.** Two options:
tighten browserslist to match MUI's `stable` targets (honest), or accept the mismatch (status quo,
and the PWA audience is a single self-hosting user). Either way it should be a conscious decision —
see [Open questions](#10-risks--open-questions).

---

## 4. Core hop 1 — v6 → v7

Guide: <https://mui.com/material-ui/migration/upgrade-to-v7/>
Raw: <https://raw.githubusercontent.com/mui/material-ui/master/docs/data/material/migration/upgrade-to-v7/upgrade-to-v7.md>

Every breaking change in that guide, mapped onto this codebase:

| # | Breaking change | Affects this repo? |
|---|---|---|
| 1 | **Package layout uses Node `exports`** — deep imports beyond one level break (`@mui/material/styles/createTheme` → `@mui/material/styles`) | ❌ **No.** Deepest import in the repo is `@mui/material/colors` and `@mui/icons-material/<Icon>`, both one level. |
| 2 | **Modern bundles removed** — drop aliases for `@mui/material/modern` etc., and the Vite alias forcing ESM icon imports | ❌ **No.** `vite.config.ts` has no MUI aliases. |
| 3 | **Theme augmentation must import from `@mui/material/styles`**; `TypographyOptions`→`TypographyVariantsOptions`, `Typography`→`TypographyVariants` | ❌ **No.** `src/app/theme.ts:4` already declares `module '@mui/material/styles'` and augments only `Theme`/`ThemeOptions`. |
| 4 | **`Grid` → `GridLegacy`; `Grid2` → `Grid`** | ✅ **Yes — both halves.** See §4.1. |
| 5 | **`InputLabel` `size="normal"` → `size="medium"`** | ❌ No `InputLabel` usage. |
| 6 | **Default `data-testid` removed from `@mui/icons-material` icons in production bundles** | ❌ No test queries an icon `data-testid`. |
| 7 | **`TablePaginationActions` import path** moved out of `TablePagination/` | ❌ Not imported. |
| 8 | **Theme object no longer re-created on colour-scheme change** (CSS theme variables only); `forceThemeRerender` opt-out | ❌ **No.** `createTheme` is called without `cssVariables` and with a fixed `palette.mode: 'light'` (`theme.ts:12-18`). No colour-scheme switching exists. |
| 9 | `createMuiTheme` removed | ❌ Uses `createTheme`. |
| 10 | `Dialog`/`Modal` `onBackdropClick` removed | ❌ `rg 'onBackdropClick'` → 0 hits. |
| 11 | `experimentalStyled` removed | ❌ 0 hits. |
| 12 | `Hidden` / `PigmentHidden` removed | ❌ 0 hits. |
| 13 | `Rating` `.MuiRating-readOnly` → `.Mui-readOnly` | ❌ No `Rating`. |
| 14 | `StepButtonIcon` type removed | ❌ No Stepper. |
| 15 | **`StyledEngineProvider` import path** | ⚠️ **Nominally yes** (`RootProvider.tsx:1`) — but the guide is wrong about it being removed. See §4.4. |
| 16 | **Lab components moved to `@mui/material`** (Alert, AlertTitle, Autocomplete, Skeleton, …) | ❌ **No.** All already imported from `@mui/material`; `@mui/lab` is unused (§6). |
| 17 | **TypeScript minimum 4.7 → 4.9** | ❌ On 5.9.3. |
| 18 | **`react-is` resolution for React ≤18** | ❌ On React 19. |

**Net: 1 real change (Grid) + 1 cosmetic (StyledEngineProvider).** This hop is remarkably cheap for
this codebase.

### 4.1 Grid — the one substantive v6→v7 change

The repo uses **both generations simultaneously**:

**Legacy `Grid` (v1 API) — 1 file:**
```
src/features/categories/components/CategoriesList/CategoriesList.tsx:1   import { Grid, Typography } from '@mui/material';
src/features/categories/components/CategoriesList/CategoriesList.tsx:24    <Grid container spacing={2}>
src/features/categories/components/CategoriesList/CategoriesList.tsx:26      <Grid item xs={12} sm={6} lg={4} key={category.id}>
```

**`Grid2` (v2 API) — 3 files:**
```
src/entities/product/ui/ProductForm.tsx:10,143,144,185,186,210,211,225,227,246,248
src/features/manageNote/ui/SuggestionSkeleton.tsx:1,8,9,11,12,14,15
src/widgets/NutritionSummaryWidget/NutritionSummaryWidget.tsx:1   import { …, Grid2 as Grid } from '@mui/material';
```

The v7 guide offers three paths. **Path 1 is the right one here**, because v9 deletes `GridLegacy`
anyway (verified: the `@mui/material@9.3.1` tarball contains only `Grid/` — no `Grid2/`, no
`GridLegacy/`). Doing the legacy→v2 conversion at v7 means the v9 hop needs no Grid work at all.

- For `CategoriesList.tsx`: run `npx @mui/codemod@latest v7.0.0/grid-props src` — converts
  `xs={12} sm={6} lg={4}` → `size={{ xs: 12, sm: 6, lg: 4 }}` and drops `item`.
- For the three `Grid2` files: **manual rename**, `Grid2` → `Grid`. There is **no codemod** for the
  import rename — the guide gives raw diffs only. `NutritionSummaryWidget.tsx` already aliases
  `Grid2 as Grid`, so only its import line changes.

Theme keys `MuiGrid`/`MuiGrid2` and CSS classes `.MuiGrid-root` also shift, but the repo has neither
(`theme.ts` has no `components` block, and no CSS targets MUI classes).

### 4.2 v6→v7 codemods that apply

```bash
cd src/frontend
npx @mui/codemod@latest v7.0.0/grid-props src
```

The other two v7 codemods (`v7.0.0/lab-removed-components`, `v7.0.0/input-label-size-normal-medium`)
are **no-ops here** — no lab imports, no `InputLabel`.

`v7.0.0/theme-color-functions` is also a **no-op**: it rewrites imports of `alpha`/`lighten`/`darken`
from **`@mui/system/colorManipulator`**, and this repo imports `alpha` from `@mui/material`
(`src/widgets/MealsList/ui/NotesList/NotesListItem.tsx:12`, used at `:58`). Verified that `alpha` is
still reachable from `@mui/material` in 9.3.1 via `styles/index.d.ts` (which re-exports it from
`@mui/system`), so **no change needed at all**.

**There is no `v7.0.0/preset-safe`.** The only `preset-safe` in `@mui/codemod` is `v5.0.0/preset-safe`
(confirmed by grepping the package README). Codemods must be run individually.

### 4.3 Packages to bump together in hop 1

```
@mui/material      ^6.5.0        → ^7.3.11
@mui/icons-material ^6.5.0       → ^7.3.11
@mui/system        ^6.5.0        → ^7.3.11
@mui/utils         ^6.4.9        → ^7.3.11
@mui/lab           6.0.1-beta.36 → DELETE (§6)
@mui/x-charts      ^7.29.1       → unchanged  ← the v7 guide says so explicitly
@mui/x-date-pickers ^7.29.4      → unchanged
```

> v7 guide: *"Note that MUI X packages do not follow the same versioning strategy as Material UI.
> If you're using any of the following packages, they should remain unchanged during the upgrade
> process."* And `@mui/x-*@7.29.x` peers `@mui/material: ^5.15.14 || ^6.0.0 || ^7.0.0` — X v7 is
> genuinely compatible with core v7.

### 4.4 ⚠️ Doc defect — `StyledEngineProvider` was *not* removed from `@mui/material`

The v7 guide states, at `upgrade-to-v7.md:531`:

> *"Importing `StyledEngineProvider` from `'@mui/material'` was deprecated and now has been removed.
> Import it from `'@mui/material/styles'` instead."*

**This is false as published.** Verified in both `@mui/material@7.3.11` and `@mui/material@9.3.1`
tarballs:

| Entry point | Contents |
|---|---|
| `index.d.ts:5` / `index.d.mts:5` | `export * from "./styles/index.js"` (`.mjs` respectively) |
| `styles/index.d.ts:18` | `… emphasize, alpha, darken, lighten, ColorFormat, ColorObject, StyledEngineProvider, SxProps } from '@mui/system';` |
| `index.mjs:11` (ESM runtime) | `export * from "./styles/index.mjs"` |
| `index.js:987-990` (CJS runtime) | `var _styles = require("./styles"); Object.keys(_styles).forEach(…)` — dynamic re-export of every key |

So `import { StyledEngineProvider } from '@mui/material'` still type-checks **and** resolves at
runtime in v9.3.1. What was removed is presumably the dedicated deprecated re-export; the wildcard
re-export of `./styles` keeps the specifier alive.

**Recommendation: change it anyway.** `src/app/RootProvider.tsx:1` should become
`import { StyledEngineProvider } from '@mui/material/styles';`. Depending on a specifier that the
official guide declares removed is exactly the kind of thing that breaks in a patch release with no
changelog entry. It is a one-line change.

---

## 5. Core hop 2 — v7 → v9

Guide: <https://mui.com/material-ui/migration/upgrade-to-v9/>
Raw: <https://raw.githubusercontent.com/mui/material-ui/master/docs/data/material/migration/upgrade-to-v9/upgrade-to-v9.md> (2348 lines)

The guide has two top-level parts: **`## Breaking changes`** (behavioural/API removals) and
**`## Deprecated APIs removed (Breaking)`** (the long codemod-driven tail).

### 5.1 Part 1 — behavioural breaking changes

| Section | Change | Affects this repo? |
|---|---|---|
| Autocomplete | Listbox no longer toggles on right-click | ❌ Cosmetic; no test depends on it. |
| Autocomplete | `freeSolo` changes the `getOptionLabel` / `isOptionEqualToValue` signatures to accept `string` | ❌ **No.** `ProductForm.tsx:112-119` uses `Autocomplete` **without `freeSolo`**. |
| Backdrop | No longer sets `aria-hidden="true"` by default | ⚠️ Possible — dialogs are queried by `getByRole('dialog')` in 5 tests. Removing `aria-hidden` **adds** nodes to the a11y tree, which can make previously-unique queries ambiguous. Low risk, but a plausible source of "found multiple elements" failures. |
| ButtonBase | Enter/Spacebar now propagate click as a real `MouseEvent`; event handlers disabled on non-native disabled buttons; new `nativeButton` prop when replacing native `<button>` | ⚠️ Worth a look — `src/shared/ui/Button/Button.tsx` wraps `MuiButton`, and `ButtonBase` is imported in the codebase. No `component=` override on a `Button` was found, so likely ❌. |
| **Dialog & Modal** | **`disableEscapeKeyDown` removed** → check `reason` in `onClose` | ❌ `rg 'disableEscapeKeyDown'` → **0 hits**. |
| **GridLegacy** | **Component removed entirely**; `MuiGridLegacy` gone from theme types | ❌ **if hop 1 ran `v7.0.0/grid-props`.** This is why doing the Grid conversion at v7 pays off. |
| Grid | `direction="column"` / `"column-reverse"` removed — use `Stack` | ❌ No `Grid direction=` usage. |
| **List** | **`ListItemIcon` default min-width `56px` → `36px`** | ⚠️ **Visual.** `ListItemIcon` is used (Navigation drawer, meals list). Purely cosmetic — tighter icon gutter. Verify visually, no code change. |
| Material Icons | 23 legacy `…Outline` (no "d") exports removed | ❌ **No.** All 7 outlined icons in the repo use `…Outlined` (`WhatshotOutlined`, `WaterDropOutlined`, `WarningAmberOutlined`, `GrainOutlined`, `FitnessCenterOutlined`, `CookieOutlined`, `AdjustOutlined`). Verified: `rg -o '@mui/icons-material/[A-Za-z]+' src \| rg 'Outline$'` → none. |
| Menu / MenuList | `tabindex` updated during keyboard nav; **`MenuItem` outside `Menu`/`MenuList` now throws** | ❌ **No — verified.** The only `MenuItem`s in the repo are `SearchByCategory.tsx:37,40`, both children of a `<TextField select>` (which renders `Select` → `Menu` → `MenuList`). Correctly parented. |
| Slider | Pointer events instead of mouse events | ❌ No `Slider`. |
| Stepper/Step | `Stepper` renders `<ol>`, `Step` renders `<li>`; roving tabindex; `aria-current` → `aria-selected` | ❌ No Stepper. |
| **TablePagination** | **Numbers formatted with `Intl.NumberFormat`** by default | ⚠️ **Low.** `ProductsTablePagination.tsx:25-33`. `Products.test.tsx:77` asserts `findByText(/1–.* of .*/i)` — the regex is loose enough to survive, and thousands separators only appear above 999 rows. Cosmetic only. |
| Tabs | `tabindex` updates on arrow/Home/End; **`Tab` outside `Tabs` throws** | ❌ No Tabs. |
| **TextField** | `<TextField select />` renders `<div>` instead of native `<label>` for the `InputLabel` | ✅ **HIT — one component, two test assertions.** `SearchByCategory.tsx:29-34` is a `<TextField select label="Category">`. See §5.6. |
| Theme | `MuiTouchRipple` removed from theme component types | ❌ `theme.ts` has no `components` block. |
| **jsdom support** | `process.env.NODE_ENV === 'test'` checks replaced with **feature detection / user-agent sniffing**; components now auto-detect layout-less DOMs (jsdom, happy-dom) via UA sniffing. *"This change shouldn't impact most users, but it might lead to unintended CI changes."* | ⚠️ **Directly relevant.** 26 vitest files run under `jsdom@29`. This is upstream's own hedge that test behaviour may shift. Budget for surprises here rather than being surprised. |

### 5.2 Part 2 — deprecated APIs removed, mapped to real call sites

These are the ones that actually cost time. Each row is a **confirmed hit** in this codebase.

| API used | File:line | v9 replacement | Codemod |
|---|---|---|---|
| **System props** (52 occurrences, 11 files) | see §5.3 | move into `sx` | `v9.0.0/system-props` ✅ |
| `Dialog TransitionComponent={Transition}` | `src/shared/ui/Dialog/FullScreenDialog.tsx:31` | `slots={{ transition: Transition }}` | `deprecations/dialog-props` ✅ |
| `Drawer PaperProps={{…}}` | `src/widgets/Navigation/ui/NavigationDrawer.tsx:17` | `slotProps={{ paper: {…} }}` | `deprecations/drawer-props` ✅ |
| `TextField inputProps={{…}}` | `src/features/products/components/ProductsTable/ProductsTable.tsx:66`, `ProductsTableRow.tsx:32` | `slotProps={{ htmlInput: {…} }}` | `deprecations/text-field-props` ✅ |
| `<DialogContentText paragraph>` | `src/features/note/delete/ui/DeleteNoteDialog.tsx:34` | `sx={{ marginBottom: '16px' }}` | `deprecations/typography-props` ✅ |
| `params.InputProps` spread from Autocomplete `renderInput` | `src/entities/product/ui/ProductForm.tsx:130,134` | ⚠️ **read**, not a prop the repo passes — already spread into `slotProps.input` (line 128-129). Needs a compile check; the guide's `InputProps → slotProps.input` row is about props you *pass*. | manual verify |

The full v9 deprecation surface has **58 `deprecations/*` transforms**. The repo touches 5.

`FullScreenDialog.tsx:11-20` also declares `interface TransitionComponentProps extends TransitionProps`
importing `TransitionProps` from `@mui/material/transitions` — that module still exists; only the
*prop name* changes.

### 5.3 System props — the bulk of the v9 work

v9 removes MUI System style props from `Box`, `DialogContentText`, `Grid`, `Link`, `Stack`,
`Typography`, `TimelineContent`, `TimelineOppositeContent`. Guide diff:

```diff
-<Stack mt={2} alignItems="center" />
+<Stack sx={{ mt: 2, alignItems: 'center' }} />
```

Component-owned props (`Stack direction`/`spacing`, `Grid container`/`size`/`spacing`,
`Typography variant`/`component`) are **not** affected — only the System style props.

**Measured on this codebase: 52 occurrences across 11 files.**

| File | Occurrences |
|---|---|
| `src/widgets/NutritionSummaryWidget/NutritionSummaryItem.tsx` | 10 |
| `src/widgets/MealsList/ui/MealsListItem.tsx` | 9 |
| `src/widgets/NutritionSummaryWidget/NutritionSummaryWidget.tsx` | 12 (6 × `<Grid display justifyContent>`) |
| `src/widgets/MealsList/ui/NotesList/NotesListItem.tsx` | 7 |
| `src/pages/ui/IndexPage.tsx` | 4 |
| `src/features/manageNote/ui/ImagePreviewList.tsx` | 3 |
| `src/features/manageNote/ui/NoteForm.tsx` | 2 |
| `src/widgets/NutritionSummaryWidget/NutritionSummaryWidgetBar.tsx` | 1 |
| `src/app/WithMockApi.tsx` | 1 |
| `src/entities/product/ui/NutritionValueDisplay.tsx` | 1 |
| `src/widgets/NotesHistoryList/ui/NotesHistoryList.tsx` | 1 |

**All of it is codemod-able.** One case needs a manual eye: `IndexPage.tsx:65` uses
`bgcolor={theme => theme.palette.background.paper}` — a **callback** system prop. Whether the codemod
lifts a function value into `sx` correctly is unverified; check that file's diff by hand.

The codemod also fixes a real latent bug, per the guide: props like `color` were previously *consumed*
by the component instead of being forwarded to the element rendered via `component`.

### 5.4 ⚠️ `<TextField select>` loses its native `<label>` association

The v9 guide states:

> *"When specifying `<TextField select />` to render a `<Select>`, the underlying `<InputLabel>`
> renders a `<div>` instead of a native `<label>` element. This does not affect `<InputLabel>` on its
> own."*

**Verified in the published packages** — `TextField/TextField.js`:

| Version | Line | Code |
|---|---|---|
| **7.3.11** | `:242` | `htmlFor: id,` |
| **9.3.1** | `:233` | `htmlFor: select && !nativeSelect ? undefined : id,` |
| **9.3.1** | `:236` | `component: 'div'` |

So for a non-native select the label becomes a `<div>` with **no `htmlFor`** — the native
label/control association is gone.

**Mitigation is already in place upstream:** both versions still pass `labelId: inputLabelId`
(v9 `:243`, v7 `:249`) down to the `Select`, i.e. the control keeps an `aria-labelledby` pointing at
the label element.

**Affected code — one component, two test assertions:**

```
src/features/products/components/SearchByCategory.tsx:29-34   <TextField select size="small" label="Category" …>
src/features/products/routes/Products.test.tsx:52   await screen.findByLabelText(/category/i)
src/features/products/routes/Products.test.tsx:54   await screen.findByRole('listbox', { name: /category/i })
```

**Assessment:** Testing Library's `getByLabelText` resolves `aria-labelledby` as well as native
`<label>`, so line 52 will *probably* still pass. Line 54 depends on whether the popup `listbox`
inherits the accessible name (as opposed to the closed combobox trigger) — **less certain**.
Treat both as expected-to-need-attention in ticket 3 rather than assuming they survive.

### 5.5 v7→v9 codemod commands

```bash
cd src/frontend

# 1. The only v9-namespaced transform — the system-props removal
npx @mui/codemod@latest v9.0.0/system-props src

# 2. All 58 deprecation transforms in one pass (recommended over picking 5)
npx @mui/codemod@latest deprecations/all src

# ...or, targeted to what this repo actually uses:
npx @mui/codemod@latest deprecations/dialog-props     src
npx @mui/codemod@latest deprecations/drawer-props     src
npx @mui/codemod@latest deprecations/text-field-props src
npx @mui/codemod@latest deprecations/typography-props src
```

Useful flags (from the `@mui/codemod` README): `--dry` for a dry run, `--print` to dump transformed
files, `--parser=tsx` (already the default), and `--jscodeshift="…"` to pass through.

**What the codemods do *not* cover:**
- The `Grid2` → `Grid` **import** rename (v7 hop) — manual.
- The `AdapterDateFnsV3` → `AdapterDateFns` import (X hop) — covered by the *X* codemod, not this one.
- Every behavioural change in §5.1 (jsdom, ListItemIcon min-width, TablePagination formatting,
  `MenuItem` throwing outside a menu, Backdrop `aria-hidden`).
- Test assertions. Nothing rewrites `getByRole` queries.

`deprecations/all` is safe to over-apply — transforms no-op on code they don't match — so prefer it
over hand-picking.

### 5.6 Packages to bump together in hop 2

```
@mui/material       ^7.3.11 → ^9.3.1
@mui/icons-material ^7.3.11 → ^9.3.1
@mui/system         ^7.3.11 → ^9.3.0
@mui/utils          ^7.3.11 → ^9.3.0
```

`@mui/utils` v9 still exports `visuallyHidden` as a **named export from the package root** (verified:
`@mui/utils@9.3.0/index.d.ts:43` → `export { default as visuallyHidden } from "./visuallyHidden/index.js"`),
so `src/features/products/routes/Products.tsx:2` and
`src/features/manageNote/ui/UploadImagesButton.tsx:3` are unaffected.

⚠️ **X must already be on v9 before this lands** — `@mui/x-*@8` peers cap at `@mui/material ^7.0.0`.

---

## 6. `@mui/lab` — delete it

| Fact | Value | Source |
|---|---|---|
| Repo pin | `6.0.1-beta.36` | `src/frontend/package.json:22` |
| `latest` | **`9.0.0-beta.8`** | `npm view @mui/lab dist-tags --json` |
| `latest-v7` | `7.0.1-beta.25` | same |
| **`8.x` versions** | **none** | `npm view @mui/lab versions --json` |
| Ever had a stable release? | **No.** Every version on every line is `-alpha`/`-beta` | same |
| `9.0.0-beta.8` peer on core | **`@mui/material: ^9.3.1`** | `npm view @mui/lab@9.0.0-beta.8 peerDependencies` |
| `7.0.1-beta.25` peer on core | `@mui/material: ^7.3.11` | same |

**Source usage in this repo: zero.**
`rg '@mui/lab' . -g '!node_modules' -g '!yarn.lock'` returns exactly one line — the `package.json`
dependency declaration.

**What happened to lab across the majors:** v7 graduated 13 components + 1 hook out of lab into
`@mui/material` — Alert, AlertTitle, Autocomplete, AvatarGroup, Pagination, PaginationItem, Rating,
Skeleton, SpeedDial, SpeedDialAction, SpeedDialIcon, ToggleButton, ToggleButtonGroup, `usePagination`
(codemod: `v7.0.0/lab-removed-components`). This repo already imports `Alert`, `AlertTitle`,
`Autocomplete` and `Skeleton` from `@mui/material`, so it was already on the far side of that move.

**Recommendation: drop the dependency in hop 1.** Keeping it means (a) carrying a package with no
stable release, and (b) accepting `@mui/material: ^9.3.1` as a peer — a near-exact pin that would turn
every core patch bump into a lockstep lab bump. If a lab component is ever needed, add it back then.

---

## 7. MUI X migration — `x-charts` and `x-date-pickers`

### 7.1 Compatibility matrix (from declared peers)

`npm view @mui/x-<pkg>@<v> peerDependencies`:

| MUI X major | peers `@mui/material` / `@mui/system` | Works with core v6? | core v7? | core v9? |
|---|---|---|---|---|
| **v7** (7.29.x) | `^5.15.14 \|\| ^6.0.0 \|\| ^7.0.0` | ✅ | ✅ | ❌ |
| **v8** (8.29.0) | `^5.15.14 \|\| ^6.0.0 \|\| ^7.0.0` | ✅ | ✅ | ❌ |
| **v9** (9.11.x) | `^7.3.0 \|\| ^9.0.0` | ❌ | ✅ | ✅ |

Both packages declare identical ranges. Consequences:

- **Core v7 is the universal donor** — compatible with X v7, v8 and v9.
- **Core v9 requires X v9.** No exceptions.
- X v9 can be adopted while core is still on v7 (needs core ≥ **7.3.0**; `latest-v7` is 7.3.11 ✅).

Caveat from the X v8 guide: *"MUI X v8 requires Material UI v7 for optimal ESM support (v5/v6
supported with additional configuration)."* So although X v8 *peers* allow core v6, upstream steers
you to do core v7 first. That matches the recommended ordering in §9.

`date-fns` peer is **unchanged across X v7, v8 and v9**: `^2.25.0 || ^3.2.0 || ^4.0.0`. The repo's
`date-fns@^3.6.0` satisfies all three — **no date-fns work required**, and no need to go to v4.

### 7.2 ⚠️ MUI X guide naming is inverted relative to MUI Core

MUI Core uses "upgrade **to** vN" (`upgrade-to-v7` = v6→v7).
MUI X uses "migrate **from** vN" (`migration-pickers-v7` = **v7→v8**).

Confirmed by reading both raw files:
- `migration-pickers-v7.md` — *"This guide migrates from **v7.x.x to v8.0.0**"*
- `migration-pickers-v8.md` — the **v8→v9** guide (§ headings reference v9 codemods and v9 removals)
- `migration-charts-v8.md` — *"covers migration from `@mui/x-charts` **v8.x.x to v9.0.0**"*

So the two guides needed here are **`migration-*-v7`** (7→8) and **`migration-*-v8`** (8→9).
`master` has no `migration-*-v9` directory because v9 is the current major — as expected under this
convention, not a documentation gap.

### 7.3 Licensing — no exposure

| Package | License | Notes |
|---|---|---|
| `@mui/x-charts@9.11.1` | **MIT** | contains `LineChart/`, `SparkLineChart/`, `RadarChart/` |
| `@mui/x-date-pickers@9.11.0` | **MIT** | |
| `@mui/x-charts-pro` | `SEE LICENSE IN LICENSE` (commercial) | **separate package**, not a dependency |

`LineChart` — the only chart this repo uses — is verified present in the free MIT
`@mui/x-charts@9.11.1` tarball. The v9 charts guide mentions `Unstable_FunnelChart` → `FunnelChart`
and `Unstable_SankeyChart` → `SankeyChart` renames; those live in the Pro package and are irrelevant.
Pro/Premium **license keys** must be regenerated for v9 — not applicable, this repo has none.

### 7.4 `x-date-pickers` v7 → v8

Guide: <https://mui.com/x/migration/migration-pickers-v7/>

| Breaking change | Affects this repo? |
|---|---|
| **`AdapterDateFnsV3` renamed to `AdapterDateFns`** (and the old `AdapterDateFns` → `AdapterDateFnsV2`) | ✅ **HARD BREAK.** `src/app/RootProvider.tsx:3`. Verified the v9 tarball ships `AdapterDateFns/`, `AdapterDateFnsV2/`, `AdapterDateFnsBase/` and **no `AdapterDateFnsV3/`**. |
| **New DOM structure is the default for all fields** | ✅ **Breaks a test.** §7.6. |
| **Updated view selection process** — "Next"/"OK" confirmation; only `DesktopDatePicker`/`DesktopDateRangePicker` keep the old auto-close behaviour | ⚠️ **Behavioural risk.** Two `StaticDatePicker`s + one `DatePicker`. §10.1. |
| Range pickers default to single-input fields | ❌ No range pickers. |
| Custom field slots no longer receive `InputProps`, `value`, `onChange`, … — use `usePickerContext()` | ❌ No custom `field`/`textField` slots. `LogWeightButton.tsx:76-81` passes only `slotProps.textField`, which is fine. |
| Translation keys `clockLabelText`, `openDatePickerDialogue`, … now receive formatted strings | ❌ No custom localeText. |
| Adapter formats `fullTime`/`keyboardDateTime` removed | ❌ Not used. |
| Hooks `useMultiInput*Field`, `useClearableField` removed | ❌ Not used. |
| Theme renames `MuiPickersPopper`→`MuiPickerPopper`, `MuiPickersMonth`→`MuiMonthCalendar`, `MuiPickersYear`→`MuiYearCalendar` | ❌ No theme `components` block. |
| ⚠️ **If you customize `MuiTextField` in the theme, you must duplicate the config to `MuiPickersTextField`** | ❌ today — but a **future trap**: any later `MuiTextField` theme override will silently miss the pickers. |
| `TDate`/`TSection` generics removed; `FieldValueType`→`PickerValueType`; `RangeFieldSection`→`FieldRangeSection` | ❌ No picker types referenced. |
| License import moves to `@mui/x-license` | ❌ MIT tier. |

### 7.5 `x-date-pickers` v8 → v9

Guide: <https://mui.com/x/migration/migration-pickers-v8/>

| Breaking change | Affects this repo? |
|---|---|
| **`enableAccessibleFieldDOMStructure` removed from all Picker and Field components** — *"The legacy `<input>` based fallback is no longer available."* | ✅ **Confirms the v8 DOM change is permanent.** The repo never set the prop, so nothing to remove — but the escape hatch is gone. §7.6. |
| Dialog slot changes | ❌ No picker dialog slot overrides. |
| `unstableFieldRef` → `fieldRef`; new `clearValue()` on `FieldRef` | ❌ Not used. |
| `textField` slot **type** change | ❌ No custom `textField` component (only `slotProps.textField`). |
| Day slot / component structure change; `PickersDay` → **`PickerDay`** | ❌ Not referenced. |
| `DateRangePickerDay` selection behaviour + classes | ❌ No range pickers. |
| `disableMargin` prop removal | ❌ Not used. |
| **`data-testid` changes** — `DateRangeHighlight` moved to root; `DateRangePreview` removed; `PickerDay` now respects a custom `data-testid` (default `"day"`) | ❌ No `data-testid` picker queries in the suite. |
| Deprecated `PickersTextField` props dropped | ❌ Not used. |
| `LocalizationProvider`: `utils` removed from the adapter context value; `MuiPickersAdapterContext` export removed | ❌ `RootProvider.tsx:17` only passes `dateAdapter`. |
| Types `UseDateManagerParameters`, `PickerManager` generic, picker/field type parameters | ❌ Not referenced. |

**Verified in the published bundle**: `enableAccessibleFieldDOMStructure` still appears in
`internals/hooks/useField/useField.mjs` — but only as a **dev-mode deprecation warning**:

> `MUI X: The \`enableAccessibleFieldDOMStructure\` prop has been removed. The accessible DOM
> structure is now the default and only option. You can safely remove the prop from your code.`

### 7.6 ✅ Confirmed test breakage — the DatePicker field is no longer a textbox

The pickers v8 guide explains the change:

> *"Before version `v7.x`, the fields' DOM structure consisted of an `<input />`, which held the whole
> value for the component. … Starting with version `v8.x`, the new DOM structure is the default for
> all fields."* The structure follows the
> [W3C ARIA spinbutton datepicker pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/examples/datepicker-spinbuttons/).

**Verified empirically** by grepping the published `@mui/x-date-pickers@9.11.0` tarball —
`internals/hooks/useField/useFieldSectionContentProps.mjs` sets, per date section:

```
role: 'spinbutton'
contentEditable
'aria-label':  'aria-valuemin':  'aria-valuemax':  'aria-valuenow':  'aria-valuetext':
'aria-disabled':  'aria-readonly':
```

**Broken test:** `src/widgets/WeightLogsList/ui/WeightLogsList.test.tsx`

```
26:  const dateField = await screen.findByRole('textbox', { name: /date/i });
28:  expect(dateField).toHaveValue('30 Jan 2022');
```

Both lines fail: there is no `textbox` role, and `toHaveValue` needs a form element. The rewrite must
target the section container (a `group`) or the individual `spinbutton`s. Note lines 31-34 of the
same test (`getByRole('button', {name: /choose date/i})` → `getByRole('gridcell', {name: '29'})`)
target the **calendar**, not the field, and are more likely to survive.

`src/entities/product/ui/ProductForm.test.tsx:40,46` also use `getByRole('textbox')` — but against a
plain MUI `TextField`, **not** a picker. Unaffected.

### 7.7 `x-charts` v7 → v8

Guide: <https://mui.com/x/migration/migration-charts-v7/>

| Breaking change | Affects `WeightChart.tsx`? |
|---|---|
| Series `xAxisKey`→`xAxisId`, `yAxisKey`→`yAxisId`, `zAxisKey`→`zAxisId` | ❌ Uses `dataKey`, not `xAxisKey`. |
| `series.highlightScope.highlighted`→`highlight`, `.faded`→`fade` | ❌ Not used. |
| **Legend is now HTML, not SVG**; `legend` prop → `slotProps.legend`; **`slotProps.legend.hidden` → `hideLegend` prop** | ✅ **HIT.** `WeightChart.tsx:43-45` is exactly `slotProps={{ legend: { hidden: true } }}`. |
| Legend `direction: 'column'/'row'` → `'vertical'/'horizontal'`; `position.horizontal` values → `start/center/end`; `LegendPosition`→`Position` | ❌ Not used. |
| Tooltip slots `popper`/`axisContent`/`itemContent` collapse into one `tooltip` slot; tooltip DOM refactored (`<caption>`, `<th>`) | ❌ No tooltip customization. |
| `ResponsiveChartContainer` removed (`ChartContainer` is now responsive); `ChartsOnAxisClickHandler` removed | ❌ Not used. |
| Axis props `topAxis`/`rightAxis`/`bottomAxis`/`leftAxis` removed → axis config `position`; `labelFontSize`→`labelStyle`, `tickFontSize`→`tickStyle` | ❌ Not used. |
| **LineChart**: `experimentalMarkRendering` removed; marks render as `<circle/>` by default | ❌ Not set. |
| `useHighlighted()` removed; `unstable_` prefixes dropped | ❌ No chart hooks used. |
| `SparkLineChart` `colors`→`color` | ❌ No SparkLine. |
| `resolveSizeBeforeRender` removed; `ChartContainer` now wraps the SVG in a `div` | ⚠️ Minor CSS/layout shift. |

**Net: one prop.** `slotProps={{ legend: { hidden: true } }}` → `hideLegend`.

### 7.8 `x-charts` v8 → v9

Guide: <https://mui.com/x/migration/migration-charts-v8/>

| Breaking change | Affects `WeightChart.tsx`? |
|---|---|
| **`showMark` default `true` → `false`** | ⚠️ **VISUAL REGRESSION.** The chart currently shows point markers by default. To preserve today's look, add `showMark: true` to the series at `WeightChart.tsx:37-42`. Easy to miss — nothing errors. |
| **`shape` no longer defaults to `'circle'`** — now cycles `circle, square, diamond, cross, star, triangle, wye` per series | ⚠️ Single series ⇒ first shape = `circle`. **No visible change**, but relies on ordering. |
| **`preferStrictDomainInLineCharts` became the default** — x-axis domain now matches the data range exactly | ⚠️ **Visual.** The line will now touch the plot edges instead of being padded. Verify. |
| `seriesId` restricted to `string` (was `number \| string`); series `id` must be globally unique | ❌ No explicit `id`. |
| `domainLimit` signature uses `NumberValue` | ❌ Not used. |
| `axisClasses.id` / `MuiChartsAxis-id-*` removed → `[data-axis-id]` | ❌ No CSS targets these. |
| `.MuiLineElement-highlighted`→`[data-highlighted]`, `.MuiLineElement-faded`→`[data-faded]`, `[data-series-id]`→`[data-series]` | ❌ No CSS targets these. |
| Class reorg: `lineElementClasses.root`→`lineClasses.line`, `markElementClasses.root`→`lineClasses.mark`, `areaElementClasses.root`→`lineClasses.area` | ❌ Not imported. |
| `ChartContainer`→`ChartsContainer`, `ChartZoomSlider`→`ChartsZoomSlider`, `Unstable_*Chart`→`*Chart` | ❌ Not used. (codemod ✅) |
| `useAxisTooltip()`→`useAxesTooltip()` (returns an array); `useItemHighlighted()`→`useItemHighlightState()`; `useMouseTracker()` removed | ❌ No hooks used. |
| `onPointerEnter`/`onPointerLeave` no longer attached per-element (container-level now) | ❌ Not used. |
| **`LineChart` ref now points at the root `HTMLDivElement`, not the `SVGSVGElement`** | ❌ No ref. |
| Tooltip renders inside `ChartsLayerContainer` (was `document.body`) | ❌ No tooltip assertions. |
| **Keyboard navigation enabled by default** (`disableKeyboardNavigation` to opt out) | ⚠️ New focusable elements appear in the chart — could affect a11y/tab-order tests. None exist today. |
| `ChartsOverlay` `message` prop → localization keys | ❌ Not used. |
| Min `@mui/material`/`@mui/system` → `^7.3.0 \|\| ^9.0.0` | ✅ Gates the ordering (§7.1). |

**Net: `showMark: true` to preserve appearance, plus two visual checks.**

### 7.9 MUI X codemods

MUI X has its **own** codemod package — `@mui/x-codemod` — separate from `@mui/codemod`.
`npm view @mui/x-codemod dist-tags --json` → `{"latest":"9.11.0","latest-v8":"8.29.0","next":"9.0.0-rc.0"}`

Unlike `@mui/codemod`, **X does have `preset-safe` presets**:

```bash
cd src/frontend

# hop A: X v7 → v8
npx @mui/x-codemod@latest v8.0.0/pickers/preset-safe src
npx @mui/x-codemod@latest v8.0.0/charts/preset-safe  src
# ...or both packages at once:
npx @mui/x-codemod@latest v8.0.0/preset-safe src

# hop B: X v8 → v9
npx @mui/x-codemod@latest v9.0.0/pickers/preset-safe src
npx @mui/x-codemod@latest v9.0.0/charts/preset-safe  src
npx @mui/x-codemod@latest v9.0.0/preset-safe src

# targeted charts transforms (v9)
npx @mui/x-codemod@latest v9.0.0/charts/rename-classes           src
npx @mui/x-codemod@latest v9.0.0/charts/rename-axis-tooltip-hook src
```

Per the v9 pickers guide: *"Breaking changes that are handled by this codemod are denoted by a ✅ emoji
in the table of contents … All other changes must be handled manually."*

**Documented codemod gaps:**
- `enableAccessibleFieldDOMStructure` passed **via spread or a variable reference** is not handled
  (irrelevant here — the repo never sets it).
- Nothing rewrites test assertions.
- `showMark`/`shape`/domain **default** changes cannot be codemodded — they are behaviour, not syntax.

---

## 8. Codebase inventory

Measured over `src/frontend/src` + `src/frontend/tests`.

| Metric | Value |
|---|---|
| TS/TSX files | 281 |
| Files importing `@mui/*` | **78** |
| `@mui/material` import statements | 75 |
| `@mui/icons-material` imports | 38 (one per icon) |
| `@mui/x-date-pickers` imports | 5 |
| `@mui/x-charts` imports | 1 |
| `@mui/system` imports | 2 |
| `@mui/utils` imports | 2 |
| **`@mui/lab` imports** | **0** |
| `sx=` occurrences | 68 |
| `styled()` call sites | **3** |
| System-prop occurrences (v9-removed) | **52** across 11 files |
| Test files | 26 (`*.test.ts(x)`) + 1 fixture |

**Theme setup** (`src/app/theme.ts`, 29 lines): `createTheme` with `palette.mode: 'light'`,
`palette.primary.main: green[600]`, and `typography.h1/h2` overrides. **No `components` block, no
`cssVariables`, no colour schemes.** This is why so many v7/v9 theme breaking changes miss entirely —
there is almost no theme to break.

**Provider setup** (`src/app/RootProvider.tsx`):
`StyledEngineProvider injectFirst` → `ThemeProvider` → `LocalizationProvider` → redux `Provider` →
`CssBaseline`. Two lines change (`:1` StyledEngineProvider path, `:3` adapter path); the structure is
untouched by both hops.

**`styled()` sites** — all three use the `({ theme }) => ({…})` callback form, which is stable across
v6/v7/v9:
```
src/shared/ui/PageContainer.tsx:3               styled(Container)
src/shared/ui/AppFab/AppFab.tsx:3               styled(Fab)
src/features/categories/components/CategoryTitle.tsx:3   styled('div')
```

**MUI components in use** (from named imports): Accordion*, Alert, AlertTitle, AppBar, Autocomplete,
Avatar, Badge, Box, Button, ButtonBase, Card*, Checkbox, CircularProgress, Collapse, Container,
CssBaseline, Dialog*, Divider, Drawer, Fab, Fade, Grid, Grid2, Grow, IconButton, InputAdornment,
LinearProgress, Link, List, ListItem*, MenuItem, Paper, Popover, Skeleton, Slide, Snackbar, Stack,
StyledEngineProvider, SvgIcon, Table*, TablePagination, TextField, ThemeProvider, Toolbar, Tooltip,
Typography.

**All verified present in `@mui/material@9.3.1`** — spot-checked `Popover`, `Drawer`, `Fab`,
`Skeleton`, `Autocomplete`, `TablePagination`, `Collapse`, `Slide`, `Fade`, `Grow`,
`ListItemSecondaryAction` against the tarball directory listing. The only removals are `Grid2/` and
`GridLegacy/`.

---

## 9. Migration strategy

### 9.1 Sequential majors, not a direct jump

**Do the hops in order.** Reasons specific to this situation:

1. There is no combined "v6 → v9" guide. Upstream documents v6→v7 and v7→v9 as separate pages with
   separate codemod namespaces (`v7.0.0/*` vs `v9.0.0/*` + `deprecations/*`). Skipping v7 means
   reading both guides anyway while losing the ability to verify halfway.
2. **`v7.0.0/grid-props` only makes sense while `GridLegacy` still exists.** If you jump straight to
   v9, the legacy `<Grid item xs sm lg>` in `CategoriesList.tsx` has no component to bind to and the
   codemod has nothing to transform — you'd hand-write the conversion.
3. Core v7 is the only version compatible with all three X majors (§7.1). Jumping core to v9 forces
   the X 7→8→9 migration into the *same* PR, and the X hop is where the genuinely risky change lives
   (the picker DOM/behaviour). You want those failures separable.

### 9.2 Ordering: core first, then X, then core again

```
PR 1   core v6 → v7          X stays on v7      (X v7 peers allow core ^7)
PR 2   X v7 → v8 → v9        core stays on v7   (X v9 peers allow core ^7.3.0)
PR 3   core v7 → v9          X already on v9    (core v9 requires X v9)
PR 4   cleanup / follow-ups
```

Each step is independently installable and independently revertible. The alternative (X first, while
core is on v6) is blocked at the last step: **X v9 does not accept core v6.**

### 9.3 Ticket breakdown

| # | Ticket | Contents | Size |
|---|---|---|---|
| **1** | **Core v6 → v7** | Bump `@mui/material`, `@mui/icons-material`, `@mui/system`, `@mui/utils` to `^7.3.11`. **Delete `@mui/lab`.** Run `v7.0.0/grid-props`. Rename `Grid2` → `Grid` in 3 files. Move `StyledEngineProvider` import to `@mui/material/styles`. X untouched. | **Small** — ~1 sitting |
| **2** | **MUI X v7 → v9** | Bump `@mui/x-charts` + `@mui/x-date-pickers` to `^9.11.x`. Run `v8.0.0/preset-safe` then `v9.0.0/preset-safe`. Fix `AdapterDateFnsV3` import. `slotProps.legend.hidden` → `hideLegend`. Add `showMark: true`. **Rewrite `WeightLogsList.test.tsx:26-28`.** Spike the StaticDatePicker confirmation behaviour (§10.1) — this may grow. | **Medium** — the risky one |
| **3** | **Core v7 → v9** | Bump the four core packages to `^9.3.x`. Run `v9.0.0/system-props` + `deprecations/all`. Review the 52 system-prop diffs (esp. the `bgcolor` callback in `IndexPage.tsx:65`). Verify `MenuItem` placement, `TextField select` labels, `ListItemIcon` spacing. Run the full vitest suite and watch for jsdom-behaviour fallout. | **Medium** — mostly codemod, tail is verification |
| **4** | **Follow-ups** | Decide on browserslist vs. MUI v9 browser targets (§3.3). Optionally add `MuiPickersTextField` alongside any future `MuiTextField` theme override. | **Small** |

### 9.4 Why not one PR

Not volume — **failure-mode separation**. The core hops fail at **compile time** (missing exports,
removed props) and are almost entirely codemod-driven. The X hop fails at **runtime and in tests**
(DOM structure, confirmation behaviour, chart defaults) and needs human judgement. Merging them means
a red test suite where you cannot tell which upgrade caused it. Tickets 1 and 3 are close to
mechanical; ticket 2 is the one that deserves attention.

### 9.5 Verification per ticket

Per `.claude/rules/coding.md` ("Run build and tests before finishing any coding task"):

```bash
cd src/frontend
yarn build                              # tsc + vite build — catches every removed export
yarn test --run --reporter=verbose      # per frontend rules: treat any `stderr |` block as a defect
yarn lint
```

`yarn build` is the highest-value gate for tickets 1 and 3 — `tsc` catches removed exports, removed
props and the `Grid2`/`AdapterDateFnsV3` breaks directly. It will **not** catch the behavioural
changes in ticket 2 (`showMark`, picker confirmation, domain padding) — those need the running app.

---

## 10. Risks / open questions

### 10.1 🔴 `StaticDatePicker` + the v8 "confirm the selection" change — needs a spike

The pickers v8 guide states:

> *"Only `<DesktopDatePicker />` and `<DesktopDateRangePicker />` maintain the previous behavior of
> closing after the selection is complete… Selection on a given view has to be confirmed by clicking
> the "**Next**" action button if there are other selection steps. The "**Next**" action is replaced
> with "**OK**" if there is no next step. The "**OK**" action has to be clicked to confirm the
> selection and close the Picker."*

`StaticDatePicker` is **not** in the exempt list. The repo has two, both with
`displayStaticWrapperAs="desktop"` (which historically suppresses the action bar):

- `src/features/note/selectDate/ui/SelectDate.tsx:42-55` — `views={['year','month','day']}`,
  **relies on `onAccept` firing** to navigate (`submit(...)` + close the Popover).
- `src/widgets/NotesHistoryList/ui/FilterNotesHistory.tsx:64-74` — `views={['year','month']}`,
  uses `onChange` (safer).

**The risk:** with multi-step views and mandatory confirmation, `SelectDate` may need an explicit
"OK" that `displayStaticWrapperAs="desktop"` does not render — i.e. **date selection silently stops
working**. Neither guide addresses `displayStaticWrapperAs` directly.

*Would resolve it:* run the app against `@mui/x-date-pickers@9.11.0` and click through both pickers.
This is the single most important manual check in the whole migration — no test covers `SelectDate`.

### 10.2 🟠 Rewriting the picker field test

`WeightLogsList.test.tsx:26-28` must be rewritten against the spinbutton structure. The exact
accessible name and role of the *container* were not pinned down —
`useFieldSectionContentProps.mjs` gives `role: 'spinbutton'` per section, but the container's role
(likely `group`) was not found in the files inspected.
*Would resolve it:* render a `DatePicker` under v9 in a scratch test and `screen.debug()` it. Cheap,
and worth doing before ticket 2 starts so the rewrite is known rather than guessed.

### 10.3 🟠 `<TextField select>` label association — two test assertions at risk

Covered in detail in §5.4. `SearchByCategory.tsx:29-34` is the only `<TextField select>`;
`Products.test.tsx:52` (`findByLabelText`) and `:54` (`findByRole('listbox', { name })`) both depend
on the label association that v9 changes from native `htmlFor` to `aria-labelledby`.
*Would resolve it:* run `yarn test --run src/features/products/routes/Products.test.tsx` under v9.

> **Resolved during research (was an open question):** *"`MenuItem` outside a `Menu`/`MenuList` now
> throws."* Not a risk here — the repo's only two `MenuItem`s (`SearchByCategory.tsx:37,40`) are
> children of that same `<TextField select>`, so they render inside a real `MenuList`.

### 10.4 🟡 Browserslist vs. MUI v9 bundle targets

The repo's `production` browserslist (`>0.2%`, `not dead`) is looser than MUI v9's floor
(Chrome 117 / Safari 17 / Firefox 121). Vite does not down-level `node_modules`, so MUI's syntax wins.
**This is a policy decision, not a fact gap.** Given the app is self-hosted for one user and is a PWA,
tightening browserslist to match is the honest option.

### 10.5 🟡 jsdom behaviour changes in v9

Upstream's own words: *"This change shouldn't impact most users, but it might lead to unintended CI
changes."* The replacement of `NODE_ENV === 'test'` checks with **user-agent sniffing** for
layout-less DOMs is impossible to predict statically against 26 test files on `jsdom@29`.
*Would resolve it:* nothing but running the suite. Budget for it in ticket 3.

### 10.6 🟡 Does `v9.0.0/system-props` handle callback values?

`src/pages/ui/IndexPage.tsx:65` has `bgcolor={theme => theme.palette.background.paper}`. All the
guide's examples use literal values. Whether the codemod lifts a function into `sx` correctly is
**unverified**. Cheap to check with `--dry --print` on that one file.

### 10.7 🟢 Backdrop `aria-hidden` removal and query ambiguity

v9 drops the default `aria-hidden="true"` on `Backdrop`. Five tests use `getByRole('dialog')` /
`within(screen.getByRole('dialog'))`. More nodes in the a11y tree can turn a unique query into
"found multiple elements". Speculative; will surface immediately if real.

### 10.8 🟢 `params.InputProps` from Autocomplete `renderInput`

`ProductForm.tsx:130,134` reads `params.InputProps` and spreads it into `slotProps.input`. The v9
`InputProps → slotProps.input` deprecation is about props you **pass**, not what `renderInput` hands
back. Whether `AutocompleteRenderInputParams` still exposes `InputProps` in v9 was **not verified**.
*Would resolve it:* `yarn build` in ticket 3 — `tsc` will say so immediately.

### 10.9 Unverified by design

- **v6 EOL date.** MUI publishes no dated support policy; §2.3 is an inference from release cadence.
- **Why core skipped v8.** The v9 guide does not say. The one-day gap between core v9.0.0 (2026-04-07)
  and X v9.0.0 (2026-04-08) makes major-alignment the obvious explanation, but this is inference.
- **`ListItemIcon` 56px→36px visual impact** — not measured; needs eyes on the running app.

---

## 11. Sources

### MUI Core
- v9 migration guide — <https://mui.com/material-ui/migration/upgrade-to-v9/>
- v9 raw markdown (2348 lines) — <https://raw.githubusercontent.com/mui/material-ui/master/docs/data/material/migration/upgrade-to-v9/upgrade-to-v9.md>
- v7 migration guide — <https://mui.com/material-ui/migration/upgrade-to-v7/>
- v7 raw markdown (578 lines) — <https://raw.githubusercontent.com/mui/material-ui/master/docs/data/material/migration/upgrade-to-v7/upgrade-to-v7.md>
- Migration directory listing (proves no `upgrade-to-v8`) — `https://api.github.com/repos/mui/material-ui/contents/docs/data/material/migration?ref=master`
- Grid v2 upgrade guide — <https://mui.com/material-ui/migration/upgrade-to-grid-v2/>
- Supported platforms (TS 4.9, React ^17+, browser floors) — <https://mui.com/material-ui/getting-started/supported-platforms/>
- `.browserslistrc` `stable` entry — <https://github.com/mui/material-ui/blob/master/.browserslistrc#L9>
- `@mui/codemod` README (4509 lines; all transform names) — <https://raw.githubusercontent.com/mui/material-ui/master/packages/mui-codemod/README.md>

### MUI X
- Pickers v7→v8 — <https://mui.com/x/migration/migration-pickers-v7/> · raw: <https://raw.githubusercontent.com/mui/mui-x/master/docs/data/migration/migration-pickers-v7/migration-pickers-v7.md>
- Pickers v8→v9 — <https://mui.com/x/migration/migration-pickers-v8/> · raw: <https://raw.githubusercontent.com/mui/mui-x/master/docs/data/migration/migration-pickers-v8/migration-pickers-v8.md>
- Charts v7→v8 — <https://mui.com/x/migration/migration-charts-v7/> · raw: <https://raw.githubusercontent.com/mui/mui-x/master/docs/data/migration/migration-charts-v7/migration-charts-v7.md>
- Charts v8→v9 — <https://mui.com/x/migration/migration-charts-v8/> · raw: <https://raw.githubusercontent.com/mui/mui-x/master/docs/data/migration/migration-charts-v8/migration-charts-v8.md>
- Migration directory listing — `https://api.github.com/repos/mui/mui-x/contents/docs/data/migration?ref=master`
- `mui-x` master `x-charts/package.json` (v9.11.1, peers) — <https://raw.githubusercontent.com/mui/mui-x/master/packages/x-charts/package.json>
- `x-codemod` preset-safe transform list — <https://github.com/mui/mui-x/blob/HEAD/packages/x-codemod/README.md#preset-safe-for-pickers-v900>
- Fields / custom field docs — <https://mui.com/x/react-date-pickers/custom-field/>
- W3C ARIA spinbutton datepicker pattern (cited by the pickers guide) — <https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/examples/datepicker-spinbuttons/>

### Registry commands used

```
npm view @mui/material          dist-tags versions time peerDependencies engines --json
npm view @mui/material@{7.0.0,9.0.0,9.3.1} peerDependencies engines --json
npm view @mui/material@9.3.1    dependencies peerDependenciesMeta --json
npm view @mui/{system,utils,icons-material,lab,codemod} dist-tags --json
npm view @mui/lab               versions --json
npm view @mui/lab@{7.0.1-beta.25,9.0.0-beta.8} peerDependencies
npm view @mui/styled-engine@9.3.0 dependencies peerDependencies --json
npm view @mui/x-charts          dist-tags time --json
npm view @mui/x-date-pickers    dist-tags time --json
npm view @mui/x-charts@{7.29.1,8.0.0,9.0.0,9.11.1}      peerDependencies license --json
npm view @mui/x-date-pickers@{7.29.4,8.0.0,9.0.0,9.11.0} peerDependencies license --json
npm view @mui/x-charts-pro      dist-tags license --json
npm view @mui/x-codemod         dist-tags --json
npm view @mui/utils@9.3.0       version peerDependencies --json
```

---

## Appendix: how the package probes were run

Nothing was installed into the repo and no repo file was modified. `npm view`, `npm pack` and `curl`
are read-only; the tarballs were downloaded and extracted into the session scratchpad
(`/private/tmp/claude-501/.../scratchpad`), never into `src/frontend`.

```bash
npm pack @mui/material@9.3.1        # → mui-material-9.3.1.tgz
npm pack @mui/material@7.3.11
npm pack @mui/x-date-pickers@9.11.0
npm pack @mui/x-charts@9.11.1
tar -xzf <each>.tgz -C <dir>
```

Claims established from the extracted packages rather than from documentation:

| Claim | Evidence |
|---|---|
| `Grid2` and `GridLegacy` are gone in v9 | `ls -d m9/package/Grid*` → only `Grid/` |
| `AdapterDateFnsV3` is gone in x-date-pickers v9 | `ls -d xdp/package/AdapterDateFns*` → `AdapterDateFns`, `AdapterDateFnsBase`, `AdapterDateFnsJalali`, `AdapterDateFnsJalaliV2`, `AdapterDateFnsV2` — no `V3` |
| Picker sections render as spinbuttons | `rg "role: '\w+'" xdp/package/internals/hooks/useField/useFieldSectionContentProps.mjs` → `role: 'spinbutton'` |
| `enableAccessibleFieldDOMStructure` is removed (warn-only) | `rg -C3 enableAccessibleFieldDOMStructure xdp/package/internals/hooks/useField/useField.mjs` → `warnOnce(['MUI X: The \`enableAccessibleFieldDOMStructure\` prop has been removed…'])` |
| `StyledEngineProvider` still resolves from `@mui/material` in v9 | `m9/package/index.d.ts:5` + `index.mjs:11` `export * from "./styles/index.*"`; `m9/package/styles/index.d.ts:18` re-exports it; CJS `index.js:987-990` `Object.keys(_styles).forEach(…)` |
| `visuallyHidden` is still a root named export of `@mui/utils@9` | `@mui/utils@9.3.0/index.d.ts:43` |
| `LineChart` is in the free MIT charts package | `ls xc/package \| rg -i linechart` + `npm view @mui/x-charts@9.11.1 license` → `MIT` |
| Emotion is still the styling engine | `npm view @mui/styled-engine@9.3.0 dependencies` → `@emotion/{cache,sheet,serialize}` |
| `<TextField select>` drops native `htmlFor` in v9 | `m7/package/TextField/TextField.js:242` `htmlFor: id,` vs `m9/package/TextField/TextField.js:233` `htmlFor: select && !nativeSelect ? undefined : id,` + `:236` `component: 'div'`; both keep `labelId: inputLabelId` |

The system-prop count in §5.3 came from a throwaway Node script in the scratchpad that regex-matched
opening tags of `Box`/`DialogContentText`/`Grid`/`Grid2`/`Link`/`Stack`/`Typography` across
`src/frontend/src` and intersected their attributes with the MUI System style-prop set. It is a
**lower bound** — multiline tags with attributes past the first `>` on a nested element could be
missed, and it does not resolve aliased imports (e.g. `Grid2 as Grid`, which it counts under `Grid`).
