# 16: Bring the spec in line with the branch as built

**What to build:** A two-axis review of the branch against `main` found places where the spec doesn't describe the code as built. The spec catches up so it matches the code again. Docs only, no code changes.

**Blocked by:** None

**Status:** ready-for-agent

- [ ] The "Old dialog behaviours" table has a "Dropped" row: after creating or recognising a product, the old dialog opened the quantity step for it. The new flow adds it to the Meal Draft at its default quantity and goes back to the search (user story 39).
- [ ] The table has a row for the old **Add <meal>** button being disabled while the day's notes load, marked kept or dropped against what the new button does.
- [ ] The table has a "Dropped" row for the old dialog's visible headings: the "Found products" subheader (the new list carries it only as its accessible name), "Analyzing Images..." and "Review AI suggestions".
- [ ] The "Frontend architecture (FSD)" table lists `ImagePreviewList` moving to `shared/ui`, the soft-keyboard helper in `shared/lib`, `PageContainer`'s new padding option, and `-leaveSearch.ts` among the `app/routes` helpers.
- [ ] The spec describes the `_app` layout's auth check, which now skips its refetch on any same-route search-param change. That covers every route, not only typing in the search.
