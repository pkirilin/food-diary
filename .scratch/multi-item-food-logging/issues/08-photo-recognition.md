# 08: Recognise a product from a photo

**What to build:** A camera action in the search screen's AppBar opens a file picker that allows one or more images, then goes to a recognition route. That route shows skeletons while recognition runs, and an error with **Retry** if it fails. When recognition returns, it shows the product form prefilled from the first suggestion, with the recognised quantity as the default quantity. **Create** saves the Product, puts it on the tray and returns to the search. In demo mode the camera action is shown, and recognition returns the mock API's mock suggestion. See the spec's "Product create, edit and recognition" section.

**Blocked by:** 07

**Status:** ready-for-agent

- [ ] The search AppBar has a camera action, and picking one or more images goes to the recognition route
- [ ] The images reach the recognition route through Redux state, not URL params
- [ ] Skeletons show while `POST /api/v1/notes/recognitions` runs
- [ ] A failed recognition shows an error with **Retry**, and **Retry** runs it again
- [ ] The form is prefilled from the first suggestion only, with its quantity as the default quantity
- [ ] **Create** puts the created product on the tray and returns to the search
- [ ] The camera action is visible in demo mode and works against the mock API
- [ ] The `CLAUDE.md` line saying demo mode disables external-integration features is corrected
- [ ] `multiItemFoodLogging.test.tsx` covers recognition through the mock suggestion, and the Retry path
