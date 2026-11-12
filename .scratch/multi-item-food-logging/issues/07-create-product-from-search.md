# 07: Create "<query>" adds the new product to the Meal Draft

**What to build:** When the search finds nothing, a `Create "<query>"` row opens `/log/food/products/new?name=<query>`. It shows the product form with the name prefilled from `name`, and a **Create** button. **Create** saves the new Product, adds it to the Meal Draft with its default quantity, and returns to the search. A name clash shows on the form and keeps what was typed. The old dialog keeps its own copy. See the spec's "Search screen" and "Product create, edit and recognition" sections.

**Blocked by:** 03

**Status:** resolved

- [x] A search with no results shows a `Create "<query>"` row
- [x] The create route uses the `'back'` variant with the title **New product**, prefills the name from the `name` param, and its button reads **Create**
- [x] **Create** calls `POST /api/v1/products`, maps the created product to a `MealDraftProduct`, adds it with its default quantity, and returns to the search
- [x] A name clash shows an error on the form and keeps the input
- [x] The old dialog still shows `Add "<query>"`
- [x] `multiItemFoodLogging.test.tsx` covers creating a product and logging it
