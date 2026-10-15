# Food Diary

A self-hosted nutrition and weight tracker for one person. This glossary fixes the
vocabulary used across the backend, the frontend, and the MCP contract.

## Language

**Food Log**:
One product eaten in a given amount, in one meal, on one date — never a whole meal or a
whole day. The canonical name wherever a person or a language model reads it: the UI,
user documentation, and the MCP contract.
_Avoid_: meal log, entry, serving, portion

**Note**:
The legacy name for a Food Log. It remains in the database, the domain entities, the
Application handlers, and older parts of the UI; new UI text says food log.
_Avoid_: memo, comment (a Note carries no text)

**Meal**:
One of five fixed slots in a day — breakfast, second breakfast, lunch, afternoon snack,
dinner. A grouping of Food Logs by date and slot, not a stored record of its own.
_Avoid_: mealtime, eating occasion

**Product**:
An eatable product or dish in the personal database, holding nutrition values per 100 g.
A Product is the catalogue item; a Food Log is one occasion of eating some of it.
_Avoid_: ingredient

**Nutrition Values**:
Calories in kilocalories, and protein, fats, carbs, sugar and salt in grams. Salt means
sodium chloride, never sodium. On a Product they are per 100 g; on a Food Log they are scaled
to the quantity eaten. Quantities are always grams, drinks included — there is no
millilitre.
_Avoid_: joules, kJ, sodium, ml, servings

**Category**:
A grouping of Products in the personal database.

**Weight Log**:
The weight recorded for one date. At most one per date.
_Avoid_: weigh-in, measurement
