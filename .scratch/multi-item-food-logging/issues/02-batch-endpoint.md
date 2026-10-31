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

**Status:** ready-for-agent

- [ ] A valid request returns `200` and creates every Food Log
- [ ] New Food Logs get display orders after the Meal's existing ones, in request order
- [ ] An unknown product id returns `400`, names the missing id, and saves nothing
- [ ] A `productQuantity` outside 10–1000 returns `400` and saves nothing
- [ ] An empty `notes` list returns `400`
- [ ] `POST /api/v1/notes` is unchanged
- [ ] LightBDD component scenarios in the Notes suite cover every case above (Docker required: if it isn't available, stop and ask)
