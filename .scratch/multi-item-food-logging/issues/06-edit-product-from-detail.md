# 06: Edit product from the detail screen

**What to build:** The detail screen gets an **Edit product** action. It opens `/log/food/products/$productId/edit`, with the full product form prefilled with the product's current values, and saves it straight away through the existing product edit endpoint. After the save, `productUpdated` refreshes the Meal Draft's snapshot of that product (name and nutrition values), and its quantity becomes the new default quantity (the same as the old dialog). A name clash shows on the form and keeps what was typed. See the spec's "Product create, edit and recognition" section.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] **Edit product** opens the existing product form, prefilled, as a route in the flow with the `'back'` variant and the title **Edit product**
- [ ] Saving calls `PUT /api/v1/products/{id}` and returns to the detail screen
- [ ] After saving, the tray row for that product shows the new name and calories, and its quantity equals the new default quantity
- [ ] A name clash shows an error on the form, keeps the input, and leaves the Meal Draft unchanged
- [ ] `multiItemFoodLogging.test.tsx` covers renaming a product and changing its default quantity while it's in the Meal Draft
