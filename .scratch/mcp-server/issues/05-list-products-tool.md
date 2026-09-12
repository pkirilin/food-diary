# 05 — `list_products` tool

**What to build:** Claude can page through the personal product catalogue with its per-100 g nutrition, so it can build a ration or a week of meals from products that already exist.

**Blocked by:** 03

**Status:** open

- [ ] The tool calls `GetProductsQueryHandler` from `FoodDiary.Application` unchanged — it already pages, filters by name, eager-loads `Category` and returns `TotalProductsCount`
- [ ] Arguments are `pageNumber`, `pageSize` and optional `productName`
- [ ] The handler's `CategoryId` filter is **not** exposed — an integer the model cannot guess, and exposing it would force a `list_categories` tool into existence purely to make it usable
- [ ] Each product carries `category` as an object, `{ "name": "..." }`, so a later field is an addition rather than a breaking change. Never `null` — `Product.CategoryId` is a non-nullable `int`. `id` stays out, for the same reason the `CategoryId` filter does
- [ ] Nutrition is nested under `per100g`, naming the difference from `get_food_logs`, which returns macros already scaled to a quantity
- [ ] The tool description states units as drafted in [spec.md](../spec.md) § `list_products`: `per100g` calories in kilocalories, the rest in grams with salt as sodium chloride, and `defaultQuantity` as the usual portion in grams, not a number of servings
- [ ] The response carries `pageNumber`, `pageSize` and `totalCount` so the model knows whether to page
- [ ] A `pageSize` above 100 returns a tool error naming the limit — same rule as the range cap in 04
- [ ] Unit tests cover the mapping and the `pageSize` boundary
- [ ] `dotnet build` and `dotnet test` pass
