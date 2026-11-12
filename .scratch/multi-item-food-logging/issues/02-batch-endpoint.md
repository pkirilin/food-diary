# 02: Batch endpoint for logging several foods

**What to build:** `POST /api/v1/notes/batch` saves several Food Logs for one date and Meal in a single transaction. Either every Food Log is saved or none is. The server appends them after the Meal's existing Food Logs, in request order. The request carries no display order. See the spec's "Batch endpoint" section.

```
CreateNotesRequest {
  date: DateOnly
  mealType: MealType
  notes: [{ productId: int, productQuantity: int }]   // at least one
}
```

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] A valid request returns `200` and creates every Food Log
- [x] New Food Logs get display orders after the Meal's existing ones, in request order
- [x] An unknown product id returns `400`, names the missing id, and saves nothing
- [x] A `productQuantity` outside 10–1000 returns `400` and saves nothing
- [x] An empty `notes` list returns `400`
- [x] `POST /api/v1/notes` is unchanged
- [x] LightBDD component scenarios in the Notes suite cover every case above (Docker required: if it isn't available, stop and ask)
