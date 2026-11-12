# 01: Enforce FSD import boundaries with ESLint

**Blocked by:** None (can start immediately)

**Status:** needs-triage

**What to build:** FSD import rules exist only as prose. Nothing checks them, so every implementer and reviewer verifies imports by hand. Turn them into `import-x/no-restricted-paths` zones in `src/frontend/eslint.config.js` (`eslint-plugin-import-x` is already configured), so `yarn lint`, and the CI job that runs it, fails on a violation.

Rules to encode, with their sources:

- A layer imports only from the layers below it: `app` → `pages` → `widgets` → `features` → `entities` → `shared`. Source: `CLAUDE.md`, "Respect FSD import direction".
- A slice doesn't import another slice of the same layer (`features/a` ↛ `features/b`, `widgets/a` ↛ `widgets/b`). Source: FSD.
- `entities/foodLog` imports no other entity. Source: [ADR-0007](../../../docs/adr/0007-food-log-entity-imports-no-other-entity.md).
- `features/manageNote` imports nothing from `entities/foodLog`, even though the layer rule allows that downward import. Source: [multi-item food logging ticket 01](../../multi-item-food-logging/issues/01-settings-switch-opens-new-flow.md).

Code that breaks the layer and cross-slice rules today, as of 2026-11-01. Re-run before starting:

```shell
cd src/frontend/src
rg -l "@/app/" entities features widgets shared
rg -l -P "@/features/(?!<own-slice>\b)" features/<slice>   # per slice; likewise for widgets and entities
```

| Import | Where | Files |
|---|---|---|
| `@/app/store` (`useAppDispatch`, `useAppSelector`, `RootState`) | 4 in `entities`, 19 in `features`, 2 in `widgets` | 25 |
| `@/app/RootProvider`, `@/app/theme` | `*.test.tsx`, `*.steps.tsx`, and `ProductInputDialog.fixture.tsx` | 7 |
| `@/features/product/addEdit` | `features/products/components/ProductsTable{Toolbar,Row}.tsx` | 2 |
| `@/entities/product` | `entities/note/model/note.ts` (older than ADR-0007) | 1 |

A slice importing itself through its `@/` alias (`widgets/NutritionSummaryWidget` does today) is not a violation.

Open questions for the owner, to settle before `ready-for-agent`:

1. `@/app/store` from lower layers: allow it as a named exception (typed hooks are a common FSD compromise), or move the typed hooks down into `shared`?
2. Test support files: exempt `*.test.tsx`, `*.steps.tsx` and `*.fixture.tsx` from the layer rule, so they can render through `@/app/RootProvider` and `@/app/theme`?
3. What counts as a slice? `features/note/{delete,selectDate}` and `features/product/addEdit` are nested, and `features/product` and `features/products` are siblings. Is `features/note` one slice or a group of slices, and so is `note/delete` → `note/selectDate` a cross-slice import?
4. The remaining violations (`products` → `product/addEdit`, `note` → `product`): fix them in this ticket, or grandfather them in an `except` list?

- [ ] `yarn lint` fails on an upward import, a cross-slice import within one layer, an `@/entities/*` import from `entities/foodLog`, and an `@/entities/foodLog` import from `features/manageNote`
- [ ] A slice importing itself through its `@/` alias stays allowed
- [ ] Every existing violation is either fixed or listed as a named exception in the config, per the answers above
- [ ] `yarn lint` passes after the change
- [ ] The "Respect FSD import direction" sentence in `CLAUDE.md` is replaced by a pointer to the lint rule, or removed
