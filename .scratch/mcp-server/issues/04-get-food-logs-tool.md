# 04 — `get_food_logs` tool

**What to build:** Claude can ask what was eaten over a date range and get back food logs grouped by day and meal, with macros already scaled to the quantity eaten and totals it can trust.

This is where the real logic of the feature lives. The response shape exists to stop a nutritionist being confidently wrong: a product with no protein value must not silently count as zero protein.

Response shape and the reasoning behind each rule are in [spec.md](../spec.md) § `get_food_logs`.

**Blocked by:** 03

**Status:** resolved

- [x] The tool calls `GetNotesHistoryQueryHandler(From, To)` from `FoodDiary.Application`. It already returns notes over a date range with `Product` eager-loaded — **do not write a new handler**, and do not touch `FoodDiaryContext` from the MCP layer
- [x] Notes are grouped into `days[].meals[].items[]`; `mealType` is the C# enum member name verbatim, i.e. `MealType.ToString()` (`Breakfast`, `SecondBreakfast`, `Lunch`, `AfternoonSnack`, `Dinner`)
- [x] Each item carries `product` as an object with `id` and `name`, plus `quantity`, and macros **computed for that quantity** from the product's per-100 g values
- [x] `product` carries **no** category — `FindByDateRange` eager-loads `Product` only, and widening it would change the query behind the existing REST history endpoint
- [x] A missing macro is an explicit `null` — never omitted, never zero
- [x] Each day carries per-macro totals, and each total carries `coveredItems` / `totalItems` so the model can qualify it. `calories` is always fully covered because `CaloriesCost` is non-nullable, and carries the counts anyway for a uniform shape
- [x] The response carries range-level totals with the same coverage counts plus `dailyAverage`
- [x] Days with nothing logged appear with an empty `meals[]` and zero totals, and count toward `dailyAverage`
- [x] A range wider than 31 days returns an MCP **tool error** (`isError`) naming the limit and the span requested, so the model splits the range itself. Not a JSON-RPC protocol error, and never silent truncation
- [x] The tool description tells the model what `null` and the coverage counts mean — the counts are useless if it does not know to read them
- [x] The tool description states units and date semantics as drafted in [spec.md](../spec.md) § `get_food_logs`: `quantity` in grams (drinks included), `calories` in kilocalories, macros in grams with salt as sodium chloride, values already scaled, `from`/`to` inclusive calendar dates with no time or timezone, and the meal order within a day. Field names stay unit-free
- [x] The `from` and `to` parameter descriptions read "Inclusive calendar date, `yyyy-MM-dd`."
- [x] Unit tests in `FoodDiary.UnitTests` cover: grouping, macro scaling, null macros excluded from totals but counted in `totalItems`, empty days present, empty days in the average denominator, and the 31-day boundary at 31 and 32 days
- [x] `dotnet build` and `dotnet test` pass

## Comments

- On the user's call, scaled values round the way the diary UI does — calories floored per item via `ICaloriesCalculator`, macros and `dailyAverage` rounded half away from zero to 2 decimals. The spec example's `220` / `36.0` became `219` / `37.2`, and spec § `get_food_logs` gained the rule.
- The SDK serializes tool results with `McpJsonUtilities.DefaultOptions`, which ignores nulls when writing. The nullable macros on `FoodLog` carry `[JsonIgnore(Condition = Never)]`, and the unit tests assert on JSON serialized with those same options, so a dropped `null` fails a test.
- `from` after `to` is a tool error too. Without it the range has no days and `dailyAverage` divides by zero.
- Items within a meal are ordered by `DisplayOrder`, as the diary shows them.
- On the user's call, the unit tests target `FoodLogsTool.GetFoodLogs` with `INotesRepository` mocked, not a separate pure mapper.
- Component tests pulled forward from 07, per `.claude/rules/backend.md`: a real `McpClient` lists tools and calls `get_food_logs` over a seeded note, and a 32-day call comes back as `isError` with the limit message rather than a JSON-RPC error.
