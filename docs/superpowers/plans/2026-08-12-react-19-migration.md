# React 19 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the Food Diary frontend from React 18.3 to React 19.2, drop two dead dependencies, and convert the codebase's two `forwardRef` components to React 19's ref-as-prop form.

**Architecture:** Four sequential commits on `migrate-to-react-19`. The dependency bump lands first and alone, so a CI failure can be attributed to React 19 rather than to the refactor. A regression test for `FullScreenDialog` lands second, closing a coverage gap found during planning. The two `forwardRef` conversions land last, one commit each, each guarded by tests that already exist by then.

**Tech Stack:** React 19.2, TypeScript 5.9, Vite 8, Vitest 4, MUI v6 (unchanged), react-hook-form 7, Testing Library 16, Yarn 4 (Berry, node-modules linker).

**Source spec:** `docs/superpowers/specs/2026-08-12-react-19-migration-design.md`

## Global Constraints

- **Work directory is `src/frontend`.** It is its own Yarn workspace — never run `yarn` from the repo root. Every command in this plan, including `git`, assumes that working directory; path arguments are relative to it, while prose refers to files by their repo-relative path.
- **Do not upgrade MUI.** `@mui/material` stays at `^6.5.0`, `@mui/x-charts` at `^7.29.1`, `@mui/x-date-pickers` at `^7.29.4`. MUI 6.5.0 already declares `react: ^19` peer support.
- **Do not touch ESLint tooling.** `eslint-plugin-react-hooks` stays at `^4.6.2`; ESLint stays at `^8.57.1`.
- **Do not add `<StrictMode>`, React Compiler, or any new React 19 API** (Actions, `useActionState`, `use`, document metadata).
- **No `React.<SomeType>` qualified type references** — always `import { type SomeType } from 'react'` (`.claude/rules/frontend.md`).
- **Function components must be arrow functions** — `react/function-component-definition` is an error, and `FC<Props>` is the house pattern.
- **Never use `any`** — use `unknown` with type guards (`.claude/rules/frontend.md`).
- **Vitest mocks need explicit type arguments** — `vi.fn<SomeFn>()`, never bare `vi.fn()` (`.claude/rules/frontend.md`).
- **Comments must earn their place** (`.claude/rules/coding.md`). Do not add comments explaining that `ref` is now a prop, and do not leave behind notes justifying approaches you rejected.
- **Run build and tests before finishing any task** (`.claude/rules/coding.md`).
- **Do not run the E2E suite or `docker-compose`.** Browser verification is delegated to CI's `e2e-tests` job by maintainer decision.

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `src/frontend/package.json` | Modify | 4 version bumps, 2 dependency removals |
| `src/frontend/yarn.lock` | Regenerated | Lockfile — never hand-edit |
| `src/frontend/src/shared/ui/Dialog/FullScreenDialog.test.tsx` | Create | Regression coverage for the mobile full-screen dialog and its `Slide` transition |
| `src/frontend/src/entities/product/ui/NutritionValueInput.tsx` | Modify (imports, `Props`, component signature) | `forwardRef` → ref-as-prop |
| `src/frontend/src/shared/ui/Dialog/FullScreenDialog.tsx` | Modify (line 12, lines 17–24) | `forwardRef` → ref-as-prop for the `Transition` wrapper |

### Why the new test file exists (deviation from the spec)

The spec planned two commits and no new tests. Planning turned up a coverage gap the spec did not account for:

- `FullScreenDialog` only renders when `Dialog.tsx:21` sees `isMobile && renderMode === 'fullScreenOnMobile'`.
- `isMobile` comes from `useMediaQuery(theme => theme.breakpoints.down('md'))`. The jsdom stub in `tests/setup.ts` returns `matches: query === '(pointer: fine)'`, so breakpoint queries resolve **false** — the unit suite always takes the `ModalDialog` branch.
- All Playwright mobile projects are **commented out** in `tests/playwright.config.ts:56-63` — only Desktop Chrome/Firefox/Safari run.

So `FullScreenDialog` — which holds the riskier of the two `forwardRef` conversions — is currently exercised by neither the unit suite nor E2E. Task 2 closes that gap **before** Task 4 touches the component.

---

## Task 1: Bump React to 19 and drop dead dependencies

**Files:**
- Modify: `src/frontend/package.json`
- Regenerated: `src/frontend/yarn.lock`

**Interfaces:**
- Consumes: nothing.
- Produces: a React 19 toolchain that Tasks 2–4 build against. No source-level API.

- [ ] **Step 1: Establish a green baseline on React 18**

You cannot attribute a post-bump failure without knowing the suite was green before. Run from `src/frontend`:

```bash
yarn lint && yarn build && yarn test --run
```

Expected: all three succeed. **If any of these fail before you change anything, stop and report it** — that is a pre-existing failure, not part of this migration.

- [ ] **Step 2: Resolve the current published versions**

```bash
npm view react version
npm view react-dom version
npm view @types/react version
npm view @types/react-dom version
```

Expected as of 2026-08-12: `19.2.8`, `19.2.8`, `19.2.18`, `19.2.4`. Use whatever the registry actually returns — these may have ticked up. Yarn enforces `npmMinimalAgeGate: 7d` (`.yarnrc.yml`), so if the newest version was published under 7 days ago, install will reject it; drop to the newest version older than 7 days:

```bash
npm view react time --json | rg '"19\.'
```

- [ ] **Step 3: Edit `package.json` — bump 4, remove 2**

In `dependencies`, change:

```json
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
```

and **delete** this line from `dependencies`:

```json
    "prop-types": "^15.8.1",
```

In `devDependencies`, change:

```json
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
```

and **delete** this line from `devDependencies`:

```json
    "@types/react-redux": "^7.1.34",
```

Leave every other entry untouched.

- [ ] **Step 4: Install**

```bash
yarn install
```

Expected: completes and rewrites `yarn.lock`. Warnings about peer dependencies that mention `react@^18` would indicate a package that has not been checked — none is expected, since all 13 direct React consumers declare `^19` support.

- [ ] **Step 5: Verify the installed tree**

```bash
yarn why react | head -20
yarn info react --json | rg -o '"version":"[^"]*"' | head -1
```

Expected: a single `react@npm:19.x.x` — no duplicate React 18 copy. A second React copy causes "invalid hook call" failures at runtime, so confirm this before moving on.

- [ ] **Step 6: Build — the primary gate**

```bash
yarn build
```

Expected: `tsc` then `vite build`, both clean.

**If `tsc` reports errors, the likely sources, in order:**
1. `TransitionProps` in `src/shared/ui/Dialog/FullScreenDialog.tsx` — MUI v6 transition typings against `@types/react` 19.
2. `@mui/x-date-pickers` slot props at call sites.
3. `ReactElement` defaulting its props type to `unknown` instead of `any` (11 files use it, all as opaque render slots, so this is not expected to bite).

Fix only what the compiler actually reports. Do not preemptively refactor files it does not flag.

- [ ] **Step 7: Lint and test**

```bash
yarn lint
yarn test --run
```

Expected: both clean. React 19 changed error surfacing (no more double-logged errors) and `act()` internals, so if tests fail, expect changed console output or timing in the dialog/form tests rather than logic failures.

- [ ] **Step 8: Commit**

```bash
git add package.json yarn.lock
git commit -m "$(cat <<'EOF'
Migrate frontend from React 18 to React 19

Bump react, react-dom and their type packages to 19.2. MUI stays on v6 --
6.5.0 already declares React 19 peer support, so no major upgrade is forced.

Also drops two dead dependencies: prop-types (unused directly; MUI pulls its
own copy transitively, and React 19 removes propTypes support) and the
deprecated @types/react-redux stub (react-redux 9 ships its own types).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add regression coverage for `FullScreenDialog`

**Files:**
- Create: `src/frontend/src/shared/ui/Dialog/FullScreenDialog.test.tsx`

**Interfaces:**
- Consumes: React 19 from Task 1. `FullScreenDialog` (default export of `./FullScreenDialog`), `Button` + `ButtonProps` (named exports of `../Button`), `DialogBaseProps` (from `./types`).
- Produces: the test that guards Task 4. Task 4 must leave it green without editing it.

This task adds the test **while `forwardRef` is still in place**, so it characterizes current behavior. Step 3 proves the test has teeth rather than assuming it.

**Do not assert on `console.error` to detect a dropped ref.** React 19 removed the "Function components cannot be given refs" warning — refs are ordinary props now — so a broken transition produces no warning at all. That approach was tried during planning and passed against a deliberately broken component. The assertion below was verified to actually fail instead (see Step 3).

- [ ] **Step 1: Write the test**

Create `src/frontend/src/shared/ui/Dialog/FullScreenDialog.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';
import FullScreenDialog from './FullScreenDialog';

const renderFullScreenDialog = (): void => {
  render(
    <FullScreenDialog
      title="Edit product"
      opened
      content={<p>Dialog content</p>}
      onClose={vi.fn<() => void>()}
      renderSubmit={props => <Button {...props}>Save</Button>}
    />,
  );
};

test('should render title, content and submit action', () => {
  renderFullScreenDialog();

  expect(screen.getByText('Edit product')).toBeVisible();
  expect(screen.getByText('Dialog content')).toBeVisible();
  expect(screen.getByRole('button', { name: /save/i })).toBeVisible();
});

// MUI's FocusTrap reaches the transition's DOM node through a cloned ref and focuses it on open.
// If the transition stops forwarding that ref, focus silently stays on <body> and the dialog
// becomes unreachable by keyboard.
test('should forward the transition ref so the dialog traps focus', () => {
  renderFullScreenDialog();

  expect(document.activeElement).not.toBe(document.body);
  expect(document.activeElement).toHaveAttribute('role', 'presentation');
});
```

The focused node is MUI's `MuiDialog-container` div (`role="presentation"`), which sits *above* the `role="dialog"` paper — so do not rewrite this as `expect(dialog).toContainElement(document.activeElement)`. That inverts the actual DOM relationship and fails even when the ref works correctly.

- [ ] **Step 2: Run it — expect PASS**

```bash
yarn test --run src/shared/ui/Dialog/FullScreenDialog.test.tsx
```

Expected: 2 passed. This is a characterization test against working code, so passing immediately is correct — which is exactly why Step 3 exists.

- [ ] **Step 3: Prove the test has teeth**

Temporarily break the ref forwarding. In `src/frontend/src/shared/ui/Dialog/FullScreenDialog.tsx`, replace the whole `Transition` definition (lines 17–24) with a version that swallows the ref:

```tsx
const Transition = (
  props: TransitionProps & {
    children: React.ReactElement;
  },
) => {
  return <Slide direction="up" {...props} />;
};
```

Run:

```bash
yarn test --run src/shared/ui/Dialog/FullScreenDialog.test.tsx
```

Expected: **1 failed | 1 passed** — `should forward the transition ref so the dialog traps focus` fails with `expected <body> not to be <body>`, while the render test still passes. This exact pairing was confirmed during planning.

**If both tests still pass, the regression net is worthless — stop and report it** rather than proceeding to Task 4 with a test that cannot detect the very regression it exists to catch.

- [ ] **Step 4: Revert the deliberate break**

```bash
git checkout -- src/shared/ui/Dialog/FullScreenDialog.tsx
yarn test --run src/shared/ui/Dialog/FullScreenDialog.test.tsx
```

Expected: 2 passed, and `git status` shows `FullScreenDialog.tsx` unmodified.

- [ ] **Step 5: Lint, then full suite**

```bash
yarn lint
yarn test --run
```

Expected: both clean.

- [ ] **Step 6: Commit**

```bash
git add src/shared/ui/Dialog/FullScreenDialog.test.tsx
git commit -m "$(cat <<'EOF'
Cover FullScreenDialog with unit tests

FullScreenDialog only renders on mobile viewports, which neither the unit
suite (jsdom matchMedia resolves breakpoint queries to false) nor the E2E
suite (Playwright mobile projects are commented out) exercises.

Covers the Slide transition's ref handling so the ref-as-prop conversion
has a regression net.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Convert `NutritionValueInput` to ref-as-prop

**Files:**
- Modify: `src/frontend/src/entities/product/ui/NutritionValueInput.tsx`
- Test (existing, do not edit): `src/frontend/src/entities/product/ui/ProductForm.test.tsx`, `src/frontend/src/features/product/addEdit/ui/ProductInputDialog/ProductInputDialog.test.tsx`

**Interfaces:**
- Consumes: React 19 from Task 1. `nutritionValuesConfig`, `NutritionValueType` from `../model`; `NutritionSuggestButton`, `NutritionValueIcon` from siblings.
- Produces: `NutritionValueInput: FC<Props>` where `Props` gains `ref?: Ref<HTMLDivElement>`. Its only consumer is `ProductForm.tsx:232`, which spreads react-hook-form's `{...field}` — and `field.ref` is `RefCallBack = (instance: any) => void`, which is assignable to `Ref<HTMLDivElement>`.

- [ ] **Step 1: Confirm the guarding tests are green**

```bash
yarn test --run src/entities/product/ui/ProductForm.test.tsx src/features/product/addEdit/ui/ProductInputDialog/ProductInputDialog.test.tsx
```

Expected: all pass. These render `ProductForm`, which renders `NutritionValueInput` through a react-hook-form `Controller` for every field in `OPTIONAL_NUTRITION_FIELDS` — so the ref path is genuinely exercised.

- [ ] **Step 2: Rewrite the component**

Replace lines 1–25 and the trailing `);` of `src/frontend/src/entities/product/ui/NutritionValueInput.tsx`. The full file becomes:

```tsx
import { InputAdornment, TextField } from '@mui/material';
import { type ChangeEventHandler, type FC, type Ref } from 'react';
import { nutritionValuesConfig, type NutritionValueType } from '../model';
import { NutritionSuggestButton } from './NutritionSuggestButton';
import { NutritionValueIcon } from './NutritionValueIcon';

interface Props {
  label: string;
  placeholder: string;
  type: NutritionValueType;
  value: number | null;
  error: boolean;
  helperText: string;
  disabled: boolean;
  suggesting: boolean;
  suggestDisabled: boolean;
  ref?: Ref<HTMLDivElement>;
  onChange: ChangeEventHandler;
  onSuggest: () => void;
}

export const NutritionValueInput: FC<Props> = ({
  label,
  placeholder,
  type,
  value,
  disabled,
  suggesting,
  suggestDisabled,
  ref,
  onSuggest,
  ...props
}) => (
  <TextField
    {...props}
    ref={ref}
    fullWidth
    disabled={disabled}
    label={`${label}, ${nutritionValuesConfig[type].unit} (optional)`}
    placeholder={placeholder}
    value={value ?? ''}
    margin="none"
    size="small"
    onFocus={event => event.target.select()}
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <NutritionValueIcon type={type} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <NutritionSuggestButton
              label={label}
              suggesting={suggesting}
              disabled={suggestDisabled}
              onClick={onSuggest}
            />
          </InputAdornment>
        ),
      },
      htmlInput: {
        type: 'text',
        inputMode: 'decimal',
      },
    }}
  />
);
```

Three things to note about this diff:
- `ref` sits with the properties, above the `onChange`/`onSuggest` callbacks, per the props-ordering convention in `.claude/rules/frontend.md`.
- `ref` is destructured rather than left in `...props` so the explicit `ref={ref}` on `TextField` is preserved — matching the shape the file already had.
- `ref` is optional. `.claude/rules/frontend.md` says props are required by default, but `ref` is a React-supplied prop typed as `Ref<T>`, which already encodes absence; making it required would break any direct render without a ref.

- [ ] **Step 3: Run the guarding tests**

```bash
yarn test --run src/entities/product/ui/ProductForm.test.tsx src/features/product/addEdit/ui/ProductInputDialog/ProductInputDialog.test.tsx
```

Expected: all pass, exactly as in Step 1.

- [ ] **Step 4: Typecheck and lint**

```bash
yarn build
yarn lint
```

Expected: both clean. A `tsc` error at `ProductForm.tsx:232` about `ref` would mean react-hook-form's `RefCallBack` is not matching `Ref<HTMLDivElement>` — widen the prop to `Ref<HTMLDivElement | null>` in that case, and no further.

- [ ] **Step 5: Commit**

```bash
git add src/entities/product/ui/NutritionValueInput.tsx
git commit -m "$(cat <<'EOF'
Replace forwardRef with ref prop in NutritionValueInput

React 19 passes ref as a regular prop, so forwardRef is no longer needed.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Convert the `FullScreenDialog` transition to ref-as-prop

**Files:**
- Modify: `src/frontend/src/shared/ui/Dialog/FullScreenDialog.tsx`
- Test (created in Task 2, do not edit): `src/frontend/src/shared/ui/Dialog/FullScreenDialog.test.tsx`

**Interfaces:**
- Consumes: React 19 from Task 1; the regression test from Task 2. `DialogBaseProps` from `./types`; `TransitionProps` from `@mui/material/transitions`.
- Produces: no exported API change — `FullScreenDialog` remains the default export with the same `Props extends DialogBaseProps`. Only the module-private `Transition` changes shape.

- [ ] **Step 1: Confirm the guarding test is green**

```bash
yarn test --run src/shared/ui/Dialog/FullScreenDialog.test.tsx
```

Expected: 2 passed.

- [ ] **Step 2: Rewrite the imports and the `Transition` component**

In `src/frontend/src/shared/ui/Dialog/FullScreenDialog.tsx`, two edits. First, line 12 — the `react` import — becomes:

```tsx
import { type FC, type ReactElement, type Ref } from 'react';
```

Second, lines 17–24 — the entire `forwardRef` block, which currently carries the file's only two `React.`-qualified references (`React.ReactElement` on line 19 and `React.Ref<unknown>` on line 21) — are replaced wholesale by:

```tsx
interface TransitionComponentProps extends TransitionProps {
  children: ReactElement;
  ref?: Ref<unknown>;
}

const Transition: FC<TransitionComponentProps> = props => <Slide direction="up" {...props} />;
```

Then confirm no qualified reference survives:

```bash
rg -n "React\.|forwardRef" src/shared/ui/Dialog/FullScreenDialog.tsx
```

Expected: 0 matches. `.claude/rules/frontend.md` forbids `React.<SomeType>` references.

Note that `ref` is deliberately left inside the `{...props}` spread here rather than destructured — the original passed `ref={ref}` *before* `{...props}`, so spreading now delivers the ref to `Slide` with the same precedence and one fewer moving part. This is the opposite choice from Task 3, where an explicit `ref={ref}` already existed after the spread.

- [ ] **Step 3: Run the guarding test**

```bash
yarn test --run src/shared/ui/Dialog/FullScreenDialog.test.tsx
```

Expected: 2 passed — in particular `should forward the transition ref so the dialog traps focus`, which Task 2 Step 3 proved will fail if the ref stops reaching `Slide`.

- [ ] **Step 4: Typecheck**

```bash
yarn build
```

Expected: clean.

**If `tsc` rejects `Transition` at the `TransitionComponent={Transition}` prop** (MUI v6 types `TransitionComponent` as `JSXElementConstructor<TransitionProps & { children: ReactElement<any, any> }>`), use this instead — it derives the props from `Slide` rather than restating them:

```tsx
import { type ComponentProps, type FC } from 'react';

const Transition: FC<ComponentProps<typeof Slide>> = props => <Slide direction="up" {...props} />;
```

With that form, drop `ReactElement`/`Ref`/`TransitionProps` from the imports if nothing else in the file uses them. Do not reach for `any` in either form.

- [ ] **Step 5: Lint and full suite**

```bash
yarn lint
yarn test --run
```

Expected: both clean, all 26 test files passing.

- [ ] **Step 6: Re-read the diff for stray comments**

```bash
git diff
```

`.claude/rules/coding.md` bans comments that narrate the change or defend a rejected alternative. Delete any comment added during this task that explains "ref is now a prop" or why the spread was chosen — that reasoning belongs in the commit message and this plan, not in the source.

- [ ] **Step 7: Commit**

```bash
git add src/shared/ui/Dialog/FullScreenDialog.tsx
git commit -m "$(cat <<'EOF'
Replace forwardRef with ref prop in FullScreenDialog transition

React 19 passes ref as a regular prop, so the Slide transition wrapper no
longer needs forwardRef.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Final verification

After Task 4, from `src/frontend`:

```bash
yarn lint
yarn build
yarn test --run
```

All three must be clean. Then confirm the commit shape and that nothing outside the planned files moved:

```bash
git log --oneline main..HEAD
git diff --stat main..HEAD
```

Expected: 5 commits — the spec, then one per task — and exactly seven changed files: the spec, the plan, `package.json`, `yarn.lock`, `NutritionValueInput.tsx`, `FullScreenDialog.tsx`, and the new `FullScreenDialog.test.tsx`. Anything else appearing here — a workflow, the `Dockerfile`, `README.md`, `CLAUDE.md`, `CHANGELOG.md` — means scope leaked and should be reverted.

Push and open a PR. **CI's `e2e-tests` job is the browser gate for this change** — the local suite never renders `FullScreenDialog` outside the new unit test, and Playwright's mobile projects are disabled, so the full-screen dialog's real-browser behavior is verified by neither. Call that out in the PR description rather than implying full coverage.

## Out of scope

Do not do any of these, even if they look tempting while you are in the files:

- MUI v6 → v7/v9, MUI X v7 → v8/v9.
- ESLint 8 → 9, `eslint-config-standard-with-typescript` replacement, `eslint-plugin-react-hooks` 4 → 7.
- Adding `<StrictMode>`.
- Adopting React Compiler or any new React 19 API.
- Re-enabling Playwright's mobile projects. The gap is real and worth a follow-up, but widening E2E coverage inside a version-bump branch mixes two unrelated failure sources.
