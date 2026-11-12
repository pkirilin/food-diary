# The foodLog entity imports no other entity

Status: accepted (2026-11-01)

`entities/foodLog` is the frontend's home for Food Log concepts, starting with the Meal
Draft. It imports nothing from another entity slice: not `entities/note`, not
`entities/product`. There are two reasons. `foodLog` is meant to replace the legacy
`entities/note` later, and it can't do that while depending on it. And entities that import
each other can't change independently, because a change in one ripples into the other.
The existing `entities/note` → `entities/product` import is older than this decision and
is not affected by it.

## Consequences

`foodLog` has its own `MealType`, and features map it to and from `noteModel.MealType`. It
keeps its own copy of the calorie and nutrition rules, which are also in `entities/note`.
Both copies are pinned by unit tests, so drift between them fails a test. Product data
enters the Meal Draft as a `MealDraftProduct` snapshot that features map from whatever
Product type they hold.

## Considered options

**Import `MealType` and the calculation helpers from `entities/note` as named
exceptions.** This is less code, but every exception is a dependency on the slice that
`foodLog` is meant to replace.

**Move `MealType` and the calculation helpers to `shared`.** This avoids duplication, but
it puts business concepts into the layer that FSD keeps free of them, and the helpers
would drag the Product type down with them.
