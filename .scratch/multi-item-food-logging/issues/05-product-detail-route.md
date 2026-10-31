# 05: Product detail route

**What to build:** Tapping a product's name in the search results opens a detail route. The screen shows the product's name and its calories per 100 g, and a quantity field that is focused with its contents selected. Below the field it shows the calories for the quantity typed. For a product that isn't on the tray yet, confirming puts it on the tray with that quantity. For a product already on the tray, confirming saves the new quantity, and **Remove** takes it off. The back arrow returns to the search with the tray unchanged. See the spec's "Detail screen" user stories.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Tapping a product's name opens the detail route (with the date and Meal still in the search params). Tapping ⊕ does not open it
- [ ] The quantity field is focused with its contents selected, and shows the calories for that quantity
- [ ] A quantity outside 10–1000 can't be confirmed
- [ ] A product not on the tray is added with the quantity typed. A product already on the tray has its quantity updated
- [ ] **Remove** shows only for a product already on the tray, and takes it off
- [ ] Back returns to the search with the tray unchanged
- [ ] `multiItemFoodLogging.test.tsx` covers adding a product with a custom quantity, changing a quantity and removing
