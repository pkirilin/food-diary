# 14: Warn about missing nutrition values on the detail screen

**What to build:** When the owner picks a product in the old dialog, the quantity step warns "Nutrition values are missing" if any of the product's protein, fats, carbs, sugar or salt is missing. The new flow never shows this warning, so a product with incomplete nutrition goes into the Meal Draft without notice. The detail screen shows the same warning under the product's calories. See the spec's "Old dialog behaviours" table, row "Nutrition values are missing", and its "Detail screen" section.

**Blocked by:** None

**Status:** needs-info

- [ ] The detail screen shows "Nutrition values are missing" for a product missing any of protein, fats, carbs, sugar or salt
- [ ] A product with every nutrition value shows no warning
- [ ] After **Edit product** fills in the missing values, the detail screen no longer shows the warning
- [ ] The spec's "Old dialog behaviours" row changes from "Kept, gap" to "Kept", and the "Detail screen" section describes the warning

## Open questions

- Should the warning appear only on the detail screen, where the old dialog showed it, or also on search result rows and tray rows, so the owner sees it without opening the product?
