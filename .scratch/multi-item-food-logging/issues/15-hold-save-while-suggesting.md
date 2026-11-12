# 15: Hold save and back while nutrition values are being suggested

**What to build:** In the old dialog, while AI nutrition suggestion runs, the submit button is disabled and the dialog can't be closed. In the new flow the product form's fields are disabled during a suggestion, but **Create**, **Save** and the AppBar back arrow stay active. So the owner can save the product before the suggested values land, or leave and lose them. On every product form in the flow (create from the search, create from recognition, edit), saving and leaving wait until the suggestion finishes. See the spec's "Old dialog behaviours" table, row "Saving and closing are blocked while nutrition values are being suggested", and its "Product create, edit and recognition" section.

**Blocked by:** None

**Status:** needs-info

- [ ] While a suggestion runs, **Create** on the create and recognition forms and **Save** on the edit form can't submit
- [ ] While a suggestion runs, the AppBar back arrow doesn't leave the form
- [ ] Once the suggestion succeeds or fails, saving and leaving work again
- [ ] The spec's "Old dialog behaviours" row changes from "Kept, gap" to "Kept", and "Product create, edit and recognition" describes the hold

## Open questions

- Should the back arrow be visibly disabled during a suggestion, or stay enabled and silently do nothing, as closing the old dialog did?
- Should the browser's own back button be held too, through the flow's existing navigation blocker, or only the AppBar back arrow?
