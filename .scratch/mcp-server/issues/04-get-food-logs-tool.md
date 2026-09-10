# 04 — `get_food_logs` tool

**What to build:** Claude can ask what was eaten over a date range and get back food logs grouped by day and meal, with macros already scaled to the quantity eaten and totals it can trust.

This is where the real logic of the feature lives. The response shape exists to stop a nutritionist being confidently wrong: a product with no protein value must not silently count as zero protein.

Response shape and the reasoning behind each rule are in [spec.md](../spec.md) § `get_food_logs`.

**Blocked by:** 03

**Status:** open

- [ ] The tool calls `GetNotesHistoryQueryHandler(From, To)` from `FoodDiary.Application`. It already returns notes over a date range with `Product` eager-loaded — **do not write a new handler**, and do not touch `FoodDiaryContext` from the MCP layer
- [ ] Notes are grouped into `days[].meals[].items[]`; `mealType` is the camelCase enum name (`breakfast`, `secondBreakfast`, `lunch`, `afternoonSnack`, `dinner`)
- [ ] Each item carries `productId`, `productName`, `quantity`, and macros **computed for that quantity** from the product's per-100 g values
- [ ] A missing macro is an explicit `null` — never omitted, never zero
- [ ] Each day carries per-macro totals, and each total carries `coveredItems` / `totalItems` so the model can qualify it. `calories` is always fully covered because `CaloriesCost` is non-nullable, and carries the counts anyway for a uniform shape
- [ ] The response carries range-level totals with the same coverage counts plus `dailyAverage`
- [ ] Days with nothing logged appear with an empty `meals[]` and zero totals, and count toward `dailyAverage`
- [ ] A range wider than 31 days returns an MCP **tool error** (`isError`) naming the limit and the span requested, so the model splits the range itself. Not a JSON-RPC protocol error, and never silent truncation
- [ ] The tool description tells the model what `null` and the coverage counts mean — the counts are useless if it does not know to read them
- [ ] Unit tests in `FoodDiary.UnitTests` cover: grouping, macro scaling, null macros excluded from totals but counted in `totalItems`, empty days present, empty days in the average denominator, and the 31-day boundary at 31 and 32 days
- [ ] `dotnet build` and `dotnet test` pass
