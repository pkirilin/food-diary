# 10: Browser pass at phone and desktop widths

**What to build:** Seam 3 of the spec. Go through the finished flow in a real browser using the chrome-devtools MCP tools, against the MSW dev server, at a phone width (about 390 px) and at a desktop width, and fix whatever is broken. For this feature this replaces the `playwright-cli` default in `.claude/rules/frontend.md`, at the owner's request. Then ask the owner for the one check emulation can't do: the phone keyboard after ⊕. See the spec's "Seam 3" section.

**Blocked by:** 04, 05, 06, 07, 08, 09

**Status:** resolved

- [x] The whole flow runs at both widths: Settings switch → **Add <meal>** → ⊕ → tray → detail → **Edit product** → `Create "<query>"` → camera and recognition → **Log food** → day page
- [x] No overlapping or clipped elements, the AppBar search field leaves room for the back arrow and the camera action, the tray never covers content or buttons, and there's no horizontal scroll
- [x] The search field has focus after every ⊕, and the AppBar back arrow returns at every step
- [x] The camera file input, expanding and collapsing the tray, and the discard prompt on the browser's back all work
- [x] The console shows no errors beyond the MSW-mode baseline
- [x] Any defect found is fixed, and covered in `multiItemFoodLogging.test.tsx` where Vitest can reach it
- [x] The owner has confirmed on a real phone that the on-screen keyboard stays open after ⊕
