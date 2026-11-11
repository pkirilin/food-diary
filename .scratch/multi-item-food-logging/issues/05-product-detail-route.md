# 05: Product detail route

**What to build:** Tapping a product's name in the search results, or a row on the tray, opens `/log/food/products/$productId`. The screen loads the Product by id and shows its name and calories per 100 g, and a quantity form whose field is focused with its contents selected. Below the field it shows the calories for the quantity typed. The form is the only place a quantity is validated (10–1000), so the Meal Draft never holds an invalid one. For a product not in the Meal Draft yet, confirming adds it with that quantity. For a product already in the Meal Draft, confirming saves the new quantity. The back arrow returns to an empty search with the Meal Draft unchanged. See the spec's "Detail screen" section.

**Blocked by:** 03, 04

**Status:** resolved

- [x] Tapping a result's name or a tray row opens the detail route, with `productId` as the only param. Tapping ⊕ does not open it
- [x] The AppBar uses the `'back'` variant with the title **Product**
- [x] The Product is loaded with `GET /api/v1/products/{id}`, so the route works for products not in the Meal Draft
- [x] The quantity field is focused with its contents selected, and shows the calories for that quantity
- [x] A quantity that isn't a whole number within 10–1000 shows an error and can't be confirmed
- [x] A product not in the Meal Draft is added with `foodLogAdded` and the quantity typed. A product already in it gets `foodLogQuantityChanged`
- [x] ~~**Remove** shows only for a product in the Meal Draft, and takes it out~~ Dropped later: the tray's **Delete <name>** and ⊕ already remove a product
- [x] Back returns to an empty search with the Meal Draft unchanged
- [x] `multiItemFoodLogging.test.tsx` covers adding a product with a custom quantity, changing a quantity from a tray row, an invalid quantity, and removing
