# 04 — Core MUI v7 → v9

**What to build:** The app builds and runs on core MUI v9, looking and behaving as it does today. There is no v8 to pass through — the core line goes straight from v7 to v9.

The bulk of the work is mechanical: style props are removed from several components in v9 and move into the style prop object instead, across roughly fifty call sites. A codemod does this. The tail of the work is verification, because v9 also changed how the library detects a layout-less test environment, and upstream's own guidance is that this "might lead to unintended CI changes".

**Blocked by:** 03 (a v9 core accepts only X v9)

**Status:** ready-for-agent

- [ ] The four core packages — material, icons, system and utils — are on the v9 line
- [ ] The style-props codemod is run as a dry run, its claims compared against the research inventory, and then applied
- [ ] **Every** deprecation transform is run, not only the handful the inventory predicted. Transforms no-op on code they do not match, and the inventory's count is a documented lower bound from a scan that cannot resolve aliased imports. If the pass touches more than predicted, that is a finding, not noise
- [ ] The one style prop passed a theme callback rather than a literal is reviewed by hand — every example in the guide uses literals, and whether the codemod lifts a function correctly is unverified
- [ ] The category filter's label assertions pass, or are updated. v9 changes a select field's label from a native association to ARIA labelling; the label query most likely survives, the listbox-by-name query is less certain
- [ ] The navigation drawer's icon spacing is checked visually — the icon gutter tightens by twenty pixels in v9
- [ ] Any test fallout from the changed test-environment detection is addressed rather than worked around
- [ ] `yarn build`, `yarn test` (verbose reporter, no `stderr` blocks) and `yarn lint` all exit zero
