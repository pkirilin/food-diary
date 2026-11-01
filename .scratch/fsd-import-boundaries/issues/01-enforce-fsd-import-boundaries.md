# 01: Enforce FSD import boundaries with ESLint

**What to build:** FSD import rules are only prose today: `CLAUDE.md` says "Respect FSD import direction", and [ADR-0007](../../../docs/adr/0007-food-log-entity-imports-no-other-entity.md) says `entities/foodLog` imports no other entity. Nothing checks either, so every implementer and reviewer verifies imports by hand. Turn them into `import-x/no-restricted-paths` zones in `src/frontend/eslint.config.js` (`eslint-plugin-import-x` is already configured), so `yarn lint` (and the CI job running it) fails on a violation.

Rules to encode:

- A layer imports only from layers below it: `app` → `pages` → `widgets` → `features` → `entities` → `shared`.
- A slice doesn't import another slice of the same layer (`features/a` ↛ `features/b`, `widgets/a` ↛ `widgets/b`).
- `entities/foodLog` imports no other entity (ADR-0007), once it exists.

Existing code that breaks these today (found with `rg` on 2026-11-01):

| Import | Where | Count |
|---|---|---|
| `@/app/store` (`useAppDispatch`, `useAppSelector`, `RootState`) | `entities`, `features` | 25 files |
| `@/app/RootProvider`, `@/app/theme` | tests and test steps in `entities`, `features`, `widgets` | 6 |
| `@/features/product/addEdit` | `features/products/components/ProductsTable{Toolbar,Row}.tsx` | 2 |
| `@/entities/product` | `entities/note/model/note.ts` | 1 (older than ADR-0007) |

**Blocked by:** None (can start immediately)

**Status:** needs-triage

Open questions for the owner, to settle before `ready-for-agent`:

1. `@/app/store` from lower layers: allow it as a named exception (typed hooks are a common FSD compromise), or move the typed hooks down into `shared`?
2. Test files: exempt `*.test.tsx` and `*.steps.tsx` from the layer rule, so they can render through `@/app/RootProvider`?
3. The remaining violations (`products` → `product/addEdit`, `note` → `product`): fix them in this ticket, or grandfather them in an `except` list?

- [ ] A slice importing itself through its `@/` alias stays allowed (`widgets/NutritionSummaryWidget` does today)
- [ ] `yarn lint` fails on an upward import, a cross-slice import within one layer, and (once it exists) any `@/entities/*` import from `entities/foodLog`
- [ ] Every existing violation is either fixed or listed as a named exception in the config, per the answers above
- [ ] `yarn lint` passes on `main` after the change
- [ ] The "Respect FSD import direction" sentence in `CLAUDE.md` is replaced by a pointer to the lint rule, or removed
