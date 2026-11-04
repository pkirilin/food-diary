# 04: Expand the tray and delete from it

**What to build:** The tray expands to list every product in the Meal Draft, in the order they were picked. Each row shows the product's name, "N g · X kcal" and a delete button. The total updates as rows are deleted. There is no quantity field on the tray: quantities are only typed on the detail route (ticket 05), which a tray row opens. See the spec's "Tray" section.

**Blocked by:** 03

**Status:** resolved

- [x] The tray expands and collapses, and lists rows in the order the products were picked
- [x] Each row shows the name, quantity in grams and calories, and has no quantity field
- [x] Deleting a row dispatches `foodLogRemoved` and updates the count and total
- [x] Expanded, the tray scrolls within itself and never covers the AppBar
- [x] `multiItemFoodLogging.test.tsx` covers expanding the tray and deleting a row
