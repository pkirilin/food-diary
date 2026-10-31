# 04: Edit quantities and remove items on the tray

**What to build:** The tray expands to list every product on it, in the order they were picked. Each item has an editable quantity field with no steppers, and a delete action. Calories, per item and in total, update as you type. **Log foods** stays disabled while any quantity is outside 10–1000. See the spec's "Tray" user stories.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] The tray expands and collapses, and lists items in the order they were picked
- [ ] Changing an item's quantity updates its calories and the total
- [ ] The changed quantity is what gets logged
- [ ] Deleting an item takes it off the tray
- [ ] An invalid quantity (not a whole number, or outside 10–1000) marks the field as invalid and disables **Log foods**
- [ ] `multiItemFoodLogging.test.tsx` covers changing a quantity, invalid quantities and deleting
