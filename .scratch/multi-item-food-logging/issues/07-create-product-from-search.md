# 07: Create "<query>" puts the new product on the tray

**What to build:** When the search finds nothing, a `Create "<query>"` row opens a create route. It shows the product form with the name prefilled from the query, and a **Create** button. **Create** saves the new Product, puts it on the tray with its default quantity, and returns to the search. A name clash shows on the form and keeps what was typed. The old dialog keeps its own copy. See the spec's "Search screen" and "Product create, edit and recognition" sections.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] A search with no results shows a `Create "<query>"` row
- [ ] The create route prefills the name from the query, and its button reads **Create**
- [ ] **Create** calls `POST /api/v1/products`, puts the new product on the tray with its default quantity, and returns to the search
- [ ] A name clash shows an error on the form and keeps the input
- [ ] The old dialog still shows `Add "<query>"`
- [ ] `multiItemFoodLogging.test.tsx` covers creating a product and logging it
