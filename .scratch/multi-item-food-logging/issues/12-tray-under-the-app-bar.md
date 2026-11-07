# 12: Move the tray under the AppBar and make its row tappable

**What to build:** On an iPhone the tray at the bottom of the search screen is hidden by the open keyboard, and its chevron is too small to hit without aiming. The tray moves to the top of the screen, sticky directly under the AppBar, and everything in its row except **Log food** becomes one expand button. See the spec's "Tray" section.

**Blocked by:** None

**Status:** resolved

- [x] The tray is the first element of the search screen and stays under the AppBar while the page scrolls
- [x] Expanded, the list opens below the row and moves the results down
- [x] Tapping anywhere in the row left of **Log food** toggles the list, and **Log food** doesn't
- [x] The row is visible and its toggle disabled while the Meal Draft is empty
- [x] Expanding moves the focus off the search field
- [x] Changing the search query collapses the tray
- [x] On a real iPhone: the row is visible above the keyboard, expanding closes the keyboard, and ⊕ doesn't
