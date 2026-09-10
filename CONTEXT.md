# Food Diary

A self-hosted nutrition and weight tracker for one person. This glossary fixes the
vocabulary used across the backend, the frontend, and the MCP contract.

## Language

**Note**:
One product eaten in a given amount, in one meal, on one date. The internal name only —
it is `Note` in the database, the domain entities, and the Application handlers.
_Avoid_: memo, comment (a Note carries no text)

**Food Log**:
The external name for a Note, used in the MCP contract and its tool descriptions.
"Note" reads as a text memo to a language model, so the MCP surface says food log
instead; internal code keeps `Note`. One food log is one product eaten in one meal on
one date — the same grain as a Note, never a whole meal or a whole day.
_Avoid_: meal log, entry, serving, portion

**Meal**:
One of five fixed slots in a day — breakfast, second breakfast, lunch, afternoon snack,
dinner. A grouping of Notes by date and slot, not a stored record of its own.
_Avoid_: mealtime, eating occasion

**Product**:
An eatable product or dish in the personal database, holding nutrition values per 100 g.
A Product is the catalogue item; a Note is one occasion of eating some of it.
_Avoid_: ingredient

**Category**:
A grouping of Products in the personal database.

**Weight Log**:
The weight recorded for one date. At most one per date.
_Avoid_: weigh-in, measurement
