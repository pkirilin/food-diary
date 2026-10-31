# 10: Browser pass at phone and desktop widths

**What to build:** Seam 3 of the spec. Go through the finished flow in a real browser using the chrome-devtools MCP tools, against the MSW dev server, at a phone width (about 390 px) and at a desktop width, and fix whatever is broken. For this feature this replaces the `playwright-cli` default in `.claude/rules/frontend.md`, at the owner's request. See the spec's "Seam 3" section.

**Blocked by:** 04, 05, 06, 07, 08, 09

**Status:** ready-for-agent

- [ ] The whole flow runs at both widths: Settings switch → **Add <meal>** → ⊕ → tray edits → detail → **Edit product** → `Create "<query>"` → camera and recognition → **Log foods** → day page
- [ ] No overlapping or clipped elements, the tray never covers content or buttons, and there's no horizontal scroll
- [ ] The search field has focus after every ⊕, and the AppBar back arrow returns at every step
- [ ] The camera file input, expanding and collapsing the tray, and the discard prompt on the browser's back all work
- [ ] The console shows no errors beyond the MSW-mode baseline
- [ ] Any defect found is fixed, and covered in `multiItemFoodLogging.test.tsx` where Vitest can reach it
