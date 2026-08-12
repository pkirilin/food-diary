# Migrate frontend to React 19 — Design

**Date:** 2026-08-12
**Status:** Approved. Target branch: `migrate-to-react-19`.

## Goal

Move the frontend SPA from **React 18.3** to **React 19.2**. Frontend only —
the backend, the E2E Playwright project, and the Node/Docker toolchains are
untouched.

Deliberately narrow: bump the four React packages, drop two dead dependencies,
convert the codebase's two `forwardRef` components to React 19's ref-as-prop
form, and verify. No MUI major upgrades, no ESLint migration, no new React 19
features adopted.

## Background

The migration is far smaller than a typical React major bump, because the
codebase and its dependency tree are already React 19-ready.

**Every direct dependency already declares React 19 peer support**, verified
against the registry at the pinned versions:

| Package | Version | `react` peer range |
|---|---|---|
| `@mui/material` | 6.5.0 | `^17 \|\| ^18 \|\| ^19` |
| `@mui/lab` | 6.0.1-beta.36 | `^17 \|\| ^18 \|\| ^19` |
| `@mui/icons-material` | 6.5.0 | `^17 \|\| ^18 \|\| ^19` |
| `@mui/system` / `@mui/utils` | 6.5.0 / 6.4.9 | `^17 \|\| ^18 \|\| ^19` |
| `@mui/base` (transitive, via lab) | 5.0.0-beta.70 | `^17 \|\| ^18 \|\| ^19` |
| `@mui/x-charts` | 7.29.1 | `^17 \|\| ^18 \|\| ^19` |
| `@mui/x-date-pickers` | 7.29.4 | `^17 \|\| ^18 \|\| ^19` |
| `react-redux` | 9.3.0 | `^18 \|\| ^19` |
| `react-router` | 7.17.0 | `>=18` |
| `react-hook-form` | 7.79.0 | `^16.8 \|\| ^17 \|\| ^18 \|\| ^19` |
| `@testing-library/react` | 16.3.2 | `^18 \|\| ^19` |
| `react-zoom-pan-pinch` | 4.0.3 | `*` |
| `use-debounce` | 10.1.1 | `*` |

Critically, **`@mui/material` 6.5.0 supports React 19**, so no MUI major
upgrade is forced. MUI core has since shipped v7 and v9, and MUI X v8/v9 — all
deliberately out of scope (see "Out of scope").

**None of React 19's removed APIs are used.** Verified across all 251 `.ts`/`.tsx`
files under `src/frontend/src`:

- No `propTypes` or `defaultProps` (0 matches).
- No `ReactDOM.render`, `hydrate`, `unmountComponentAtNode`, or `findDOMNode` —
  `src/app/index.tsx:22` already uses `createRoot`.
- No string refs, no legacy context (`createContext` has 0 matches — the app has
  no custom React contexts at all).
- No `cloneElement`.

**The `@types/react` 19 type-change surface is equally small:**

- No `JSX.Element` / `JSX.IntrinsicElements` global-namespace usage (0 matches),
  so the `JSX` → `React.JSX` namespace move is inert.
- All `useRef` call sites pass an argument, so the "`useRef` requires an
  argument" change is inert.
- No ref callbacks with implicit returns — the three `ref={...}` sites all pass
  an existing ref, never an arrow function — so the "ref callback must not
  return a value" change is inert.

`skipLibCheck: true` in `src/frontend/tsconfig.json` further suppresses type
errors originating inside dependencies' own `.d.ts` files, confining type
fallout to our own call sites.

## Scope of changes

### 1. Dependency bumps — `src/frontend/package.json`

| Package | Section | From | To |
|---|---|---|---|
| `react` | dependencies | `^18.3.1` | `^19.2.8` |
| `react-dom` | dependencies | `^18.3.1` | `^19.2.8` |
| `@types/react` | devDependencies | `^18.3.31` | `^19.2.18` |
| `@types/react-dom` | devDependencies | `^18.3.7` | `^19.2.4` |

Target versions are the latest stable as of 2026-08-12 and may tick up at
implementation time; resolve against the registry then.

Yarn's `npmMinimalAgeGate: 7d` (`.yarnrc.yml`) is satisfied — `react@19.2.8`
published 2026-07-21, `@types/react@19.2.18` published 2026-07-30.

### 2. Dependency removals — `src/frontend/package.json`

| Package | Section | Why |
|---|---|---|
| `prop-types` | dependencies | Unused — 0 imports in `src/`. Reaches the tree transitively via `@mui/material`, `@mui/lab`, `@mui/base`, `@mui/private-theming`, and `@mui/styled-engine` regardless. React 19 removes `propTypes` support from React itself, making a direct dep on it actively misleading. |
| `@types/react-redux` | devDependencies | Deprecated stub package. react-redux 9 ships its own types; keeping both risks conflicting `Provider`/`connect` declarations under `@types/react` 19. |

### 3. Source changes — 2 files

Both convert `forwardRef` to React 19's ref-as-prop. `forwardRef` still works in
React 19 but is on the deprecation path; converting now avoids a second pass.

**`src/entities/product/ui/NutritionValueInput.tsx`**

`forwardRef<HTMLDivElement | null, Props>` → `ref?: Ref<HTMLDivElement>` added to
the `Props` interface, with the component becoming an arrow `FC<Props>` to satisfy
the repo's `react/function-component-definition` ESLint rule. The existing
`{...props}` spread onto `TextField` must continue to exclude `ref` (destructure
it alongside the other named props).

**`src/shared/ui/Dialog/FullScreenDialog.tsx`**

The `Transition` wrapper (currently
`forwardRef(function FullScreenDialogTransition(props, ref) => <Slide ref={ref} {...props} />)`)
becomes a plain function component taking `ref` as a prop. It is passed to MUI's
`TransitionComponent`, so it must keep satisfying MUI v6's expected transition
component shape — this is the higher-risk of the two conversions.

While in this file, switch the `React.ReactElement` / `React.Ref` qualified
references to named imports, matching the `import { ... } from 'react'` style the
file already uses.

### 4. No changes needed

Confirmed by inspection, not assumed:

- **`.github/workflows/build.yml`** — no React version referenced; Node stays 24.
- **`Dockerfile` / `docker-compose.yml`** — no React version referenced.
- **`README.md`, `CLAUDE.md`** — grep for React version mentions returns 0
  matches. No env vars added or changed, no Node/tooling major bump, so the
  documentation rules in `.claude/rules/coding.md` are not triggered.
- **`CHANGELOG.md`** — the `[Unreleased]` section is populated from commits at
  release time by the `draft-release-changelog` skill; no manual entry here.
- **`src/frontend/vite.config.ts`, `tsconfig.json`** — `@vitejs/plugin-react@6`
  lists `babel-plugin-react-compiler` as an *optional* peer, so no config change
  is required and the React Compiler is not being adopted.
- **`tests/` (Playwright)** — no React dependency; the E2E project is untouched.

## Verification

Local verification is frontend-only, by maintainer decision. Run from
`src/frontend`:

- `yarn install` — regenerates `yarn.lock`; must resolve with no peer-dependency
  warnings about React.
- `yarn lint` — ESLint clean.
- `yarn build` (`tsc && vite build`) — **the primary gate**. This is where
  `@types/react` 19 fallout surfaces.
- `yarn test` — the 25 Vitest files pass.

The full Playwright E2E suite runs in CI via the `e2e-tests` job in
`.github/workflows/build.yml` on push. Docker is available locally, but running
E2E locally was explicitly deferred to CI to keep the loop fast.

## Risks & watch items

Ranked by likelihood:

1. **MUI v6 against `@types/react` 19 (primary risk).** MUI 6.5.0 declares
   `@types/react: ^19.0.0` as a peer and `skipLibCheck` hides errors inside MUI's
   own `.d.ts` files, so residual risk sits at *our* call sites — chiefly
   `TransitionProps` in `FullScreenDialog.tsx` and `@mui/x-date-pickers` slot
   props. Most likely source of a `yarn build` failure.
2. **`ReactElement` default props type: `any` → `unknown`.** Eleven files use
   `ReactElement`, all as opaque render slots (`content: ReactElement`,
   `renderTrigger: () => ReactElement`); none reads `.props` off one, so this
   should be inert. `tsc` confirms.
3. **Test-render differences.** `@testing-library/react` 16.3 supports React 19,
   but React 19 changed error surfacing (no more double-logged errors) and
   `act()` internals. Any fallout in the 25 test files is more likely to appear
   as changed console output or timing in the dialog/form tests than as logic
   failures.
4. **Runtime behavior.** No removed API is used and no ref callback returns a
   value. Low.

## Delivery

Branch `migrate-to-react-19` off `main`, with the work split into **two commits**:

1. Dependency bumps and removals (`package.json`, `yarn.lock`).
2. The two `forwardRef` → ref-as-prop conversions.

Splitting this way means a red CI E2E job can be bisected into "React 19 broke
it" versus "the refactor broke it" without unpicking a single commit. Then a PR,
matching the repo's recent #170–#177 pattern.

## Out of scope

- **MUI core v6 → v7/v9 and MUI X v7 → v8/v9.** Not required — v6.5.0 and X v7.29
  already support React 19. Three major-version jumps in MUI core carry their own
  breaking changes and would make a failure hard to attribute. Separate change.
- **ESLint tooling.** `eslint-plugin-react-hooks` stays at 4.6.2 (v7 is current
  and carries the React 19 hook rules). The repo is still on ESLint 8 with the
  deprecated `eslint-config-standard-with-typescript`, so touching this pulls a
  much bigger thread. Separate change.
- **`<StrictMode>`.** The app renders without it (`src/app/index.tsx`). React's
  upgrade guide recommends it, but it is orthogonal to the version bump and its
  dev-only double-invocation of effects and refs could surface unrelated latent
  bugs mid-migration — precisely in the effect-heavy spots (auth auto-submit,
  photo object URLs, router). Worth doing as its own follow-up.
- **React Compiler.** `babel-plugin-react-compiler` 1.0.0 is available and
  React 19-only, but adopting it is a performance change, not a migration step.
- **New React 19 APIs** — Actions, `useActionState`, `use`, `<Context>` as
  provider, document metadata. No behavioral or feature change belongs in this
  migration. (`<Context>`-as-provider is moot regardless: the app defines no
  custom contexts.)
