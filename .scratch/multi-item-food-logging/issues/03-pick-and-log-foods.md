# 03: Pick products with ⊕ and log them

**What to build:** The tracer bullet. On the search screen, ⊕ next to a result puts the product on the tray with its default quantity, then clears the search and refocuses it. ⊕ on a product already on the tray takes it off. Products on the tray look selected in the results. A collapsed tray along the bottom shows how many products are on it and their total calories, plus a **Log foods** button. **Log foods** saves the whole tray through the batch endpoint. On success the app returns to the day page, with the new Food Logs listed under the Meal. On failure the tray is left as it was and an error shows. See the spec's "Routes and state" and "Batch endpoint" sections.

The tray is a new Redux slice. This shape for a tray item came from the prototype:

```ts
interface TrayItem {
  product: { id: number; name: string; calories: number; defaultQuantity: number; /* nutrition */ };
  quantity: number;
}
```

**Blocked by:** 01, 02

**Status:** ready-for-agent

- [ ] ⊕ adds a product with its default quantity, clears the search and refocuses the search field
- [ ] ⊕ on a product already on the tray removes it
- [ ] Products on the tray show as selected in the search results
- [ ] The tray shows the item count and total calories
- [ ] **Log foods** is disabled while the tray is empty
- [ ] **Log foods** sends `CreateNotesRequest`, with the same contract name as the backend, in tray order
- [ ] On success, the notes queries for that date are invalidated and the day page lists the new Food Logs
- [ ] On failure, the tray is kept, an error shows, and **Log foods** can be retried
- [ ] The MSW mock API has a matching batch handler, so the flow works in dev and in tests
- [ ] `multiItemFoodLogging.test.tsx` covers adding, toggling off, logging, and a failed save
