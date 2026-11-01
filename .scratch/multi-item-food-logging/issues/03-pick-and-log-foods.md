# 03: Pick products with ⊕ and log them

**What to build:** The tracer bullet. On the search screen, ⊕ next to a result adds the product to the Meal Draft with its default quantity, then clears the search and keeps the search field focused. ⊕ on a product already in the Meal Draft takes it out. Products in the Meal Draft look selected in the results. A collapsed tray along the bottom takes a single row: a count badge, the Meal's name, the total calories and a **Log food** button. There are no chips. **Log food** saves the whole Meal Draft through the batch endpoint. On success the app returns to the day page, with the new Food Logs listed under the Meal. On failure the Meal Draft is left as it was and an error shows. See the spec's "State", "Search screen", "Tray" and "Batch endpoint" sections.

**Blocked by:** 01, 02

**Status:** resolved

- [x] ⊕ dispatches `foodLogAdded` with the default quantity, clears `q`, and the search field keeps focus: ⊕ calls `preventDefault` on `mousedown`
- [x] ⊕ on a product already in the Meal Draft dispatches `foodLogRemoved`
- [x] ⊕ buttons are labelled `Add <name>` / `Remove <name>`, and products in the Meal Draft show as selected
- [x] The collapsed tray is one row: count badge, the Meal's name in bold, total calories (or "Tap ⊕ to add a food" while empty), and **Log food**. It doesn't cover results
- [x] Total calories come from `entities/foodLog`'s own calorie rules, which have unit tests mirroring `entities/note`'s (ADR-0007)
- [x] **Log food** is disabled while the Meal Draft is empty
- [x] **Log food** sends `CreateNotesRequest` through a new `createNotes` mutation in `entities/note/api`, with the same contract name as the backend, in Meal Draft order. `foodLog`'s `MealType` is mapped to the API's
- [x] On success, `mealDraftLogged` empties the Meal Draft, the notes queries for that date are invalidated, and the day page lists the new Food Logs
- [x] On failure, the Meal Draft is kept, an error shows, and **Log food** can be retried
- [x] The MSW mock API has a matching batch handler, so the flow works in dev and in tests
- [x] The word "plate" appears nowhere in code or UI
- [x] `multiItemFoodLogging.test.tsx` covers adding, toggling off, logging, and a failed save
