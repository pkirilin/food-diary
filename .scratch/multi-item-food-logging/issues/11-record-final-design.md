# 11: Record the final design and drop prototype references

**What to build:** Once the feature is built, the spec describes what exists, not how it was found. Remove every reference to the prototype (the `prototype/multi-item-food-logging` branch, commit `e5bd584e`, and the Further Notes bullet about it) from `spec.md` and the tickets. Replace them with a **Final design** section describing the built feature: the screens and routes, the AppBar variants, the tray, the state shape, and the FSD layout. Bring every other section of the spec in line with the code wherever implementation diverged. Then delete the prototype branch.

**Blocked by:** 10

**Status:** ready-for-agent

- [x] `rg -n -i "prototype|e5bd584e" .scratch/multi-item-food-logging/spec.md .scratch/multi-item-food-logging/issues` finds nothing (this ticket's own file excepted)
- [x] `spec.md` has a **Final design** section covering routes, AppBar, tray, state and the FSD layout, matching the code
- [x] Every other spec section matches the code. Divergences found during implementation are written in, not left as notes
- [x] `research.md` is left as is: it describes other apps, not this one
- [x] The local `prototype/multi-item-food-logging` branch is deleted, after the owner confirms
