# 17: Give the lone Create row's list an accessible name

**What to build:** When a search finds products, the results are a list labelled **Found products**, and a `Create "<query>"` row can follow them. When nothing is found, `Create "<query>"` is the only row, and its list has no accessible name, so a screen reader announces an unnamed list. That list gets a name. See the spec's "Search screen" section.

**Blocked by:** None

**Status:** needs-info

- [ ] When nothing is found, the list holding `Create "<query>"` has an accessible name
- [ ] When products are found, the list is still labelled **Found products**, with the Create row last when it shows
- [ ] The spec's "Search screen" section names the label

## Open questions

- What should the label be? "Found products" is wrong when nothing was found. Options: one fixed label for both cases (such as "Search results"), or a separate label for the no-results case (such as "No products found").
