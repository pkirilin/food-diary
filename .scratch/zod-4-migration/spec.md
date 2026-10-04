# Spec: Migrate the frontend to Zod 4

Status: resolved

Research: [research.md](./research.md) — version facts, the call-site inventory and every tsc/test count below were measured on 2026-10-04 by installing `zod@4.6.5` + `@hookform/resolvers@5.9.1` into a copy of `src/frontend`.

## Problem Statement

The frontend validates its forms with `zod@3.25.76`, the last 3.x release (2025-07-08). Nothing has shipped to the 3.x line since; every fix lands in 4.x. `@hookform/resolvers@3.10.0` is pinned alongside it and cannot run against Zod 4 at all: it recognises a Zod error by `ZodError.errors`, which Zod 4 removed, so a failed validation would throw out of `handleSubmit` instead of marking fields invalid.

## Solution

Bump `zod` and `@hookform/resolvers` together in one PR. Forms keep validating the same inputs with the same custom messages and keep submitting the same parsed values. The one visible difference is the wording of Zod's built-in error messages, which Zod 4 rewrote.

## Implementation Decisions

### Target versions

- `zod@^4.6.5`, imported from the package root as today (`import { z } from 'zod'`). Not 3.25.x with `zod/v4`: that subpath is frozen at Zod 4.0.0 and costs the same code changes plus a later import rewrite.
- `@hookform/resolvers@^5.9.1`. 5.1.0 is the first with Zod 4 support; `zod >= 4.3` needs at least 5.4.2.
- Run `yarn dedupe zod` so the `@eslint-react` dev copy (4.4.3) collapses onto 4.6.5.
- The measured +9.4 kB gzip total JS is accepted.

### Pre-flight

Run `yarn install` in `src/frontend` before starting. The local `node_modules` holds `react-router@8.4.0` while `yarn.lock` pins 7.18.4, which produces 5 unrelated lint errors in `Navigation.tsx`.

### Coerced number inputs

Zod 4 types `z.coerce.number()` input as `unknown`. Pin it to `number` with `z.coerce.number<number>()` in `shared/lib/quantitySchema.ts`, `entities/product/model/productSchema.ts` (`calories`) and `features/manageNote/model/noteSchema.ts` (`displayOrder`). In `features/logWeight/model/weightSchema.ts` the coerce inside `.pipe(...)` becomes plain `z.number()`, since the preceding `.transform` already yields a number.

### Form typing

Drop the explicit type parameter from the three `useForm` calls (`ProductForm.tsx`, `NoteForm.tsx`, `LogWeightButton.tsx`) and let it infer from `zodResolver`. Resolvers 5 types field values as the schema input and `handleSubmit` data as the schema output; a single type parameter claims they are the same, which fails wherever a schema transforms. Submitted values and `onSubmit` signatures are unchanged.

The inferred input types expose two declarations that claim a nutrition field holds `number | null` while the user is typing, when it actually holds a string. Widen both to `string | number | null`:

- `entities/product/lib/useNutritionSuggestions.ts` — the `getFieldValue` return type
- `entities/product/ui/NutritionValueInput.tsx` — the `value` prop

### Product name length

Zod ≥ 4.5 counts `.min()`/`.max()` in code points; the backend's `[StringLength(100, MinimumLength = 3)]` on `ProductCreateEditRequest` counts UTF-16 units. Replace `.min(3).max(100)` on the product name with a `.refine` on `name.length` (JS `length` is UTF-16 units, matching .NET), carrying the backend's message: `Product name must be between 3 and 100 characters`.

### Deprecated APIs

Clear the two Zod 4 deprecations in the same PR, with identical behaviour:

- `z.nativeEnum(X)` → `z.enum(X)` in `entities/note/lib/mealsHelpers.ts` and `features/manageNote/model/noteSchema.ts`
- `{ message: … }` → `{ error: … }` in `NutritionValueSchema.ts`, `productSchema.ts`, `noteSchema.ts` and `weightSchema.ts` (two in the last)

### Validation messages

Zod 4's default English messages are accepted as they are (e.g. `Too small: expected number to be >=10`, full table in research §4.3). No global error map, no per-check overrides beyond the product name above. The change is user-visible, so the PR description calls it out.

## Testing Decisions

The existing seams are sufficient: schema unit tests (`NutritionValueSchema.test.ts`, `weightSchema.test.ts`) and the form component tests. No test asserts on default Zod messages, so none needs updating for the wording change.

Add a test for the product name rule that pins the behaviour the refine exists for: a name whose UTF-16 length exceeds 100 while its code-point count does not (e.g. 51 emoji) is rejected with the backend's message.

Verification, from `src/frontend`:

1. `yarn build` — 0 tsc errors.
2. `yarn test` — all pass; baseline was 154 passed / 2 skipped, plus the new name test.
3. `yarn lint` and `yarn format:check` — 0 errors.
4. Manual pass in the dev server (MSW mode, see `docs/development.md`): product add/edit, food log add/edit and log weight, each submitted with invalid input, to see the new messages in place and confirm fields are marked invalid rather than the submit throwing.

## Out of Scope

- **The cleared-field bug in nutrition suggestions.** Surfaced by the widened types, not caused by the migration. Tracked in [`product-nutrition-ai-suggestions/issues/01`](../product-nutrition-ai-suggestions/issues/01-cleared-field-counts-as-filled.md).
- **Custom wording for Zod's default messages** (global `z.config({ customError })` or per-check `error` strings).
- **Code-point counting on the backend.**
- **Zod Mini.**
- **Enabling `@typescript-eslint/no-deprecated`.**

## Further Notes

Nothing in `README.md` or `CLAUDE.md` names a Zod version, so no documentation changes. The next `CHANGELOG.md` entry should mention the changed validation wording.
