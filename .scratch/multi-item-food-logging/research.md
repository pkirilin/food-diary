# Multi-item food logging — how the market leaders do it

Research date: **2026-10-31**. App claims are sourced from each vendor's own help center, blog and
store listings, as they stood on that date. MyFitnessPal, Lose It! and Cronometer run Zendesk help
centers that return HTTP 403 to non-browser clients, so their articles were read through the public
Zendesk Help Center API (`/api/v2/help_center/en-us/articles/{id}.json`). The URLs cited below are
the human-readable article URLs that API returns. Install counts were read from the Google Play
listings, and ratings and chart positions from the US App Store listings, on the same date. Nothing
in the repo was modified apart from this file. Paths like `src/…` are relative to `src/frontend/`.

Question under evaluation (from the issue note "multi-item food logging"): today each product is
one full round trip through the add dialog. Would a multi-select pattern make logging faster? The
proposed pattern is search, select several, review them in a cart and save once. The note also
asks two open questions. Should the new UI be routes rather than dialogs? Should the action be
called "Add", "Log" or something else?

---

## 1. Summary

1. **All four apps studied have solved the one-item-per-round-trip problem, each in its own
   way.** Two of them stage the foods before saving, with a selection and a review step:
   - **Cronometer** shows checkboxes in search, then **Review Items**, then **Add to Diary**
     ([Cronometer: Mobile – Add a Food](https://support.cronometer.com/hc/en-us/articles/360018955211-Mobile-Add-a-Food)).
   - **MacroFactor** collects foods on a **Plate**, which you review before tapping **Log Foods**
     ([MacroFactor: Multi-add](https://help.macrofactorapp.com/en/articles/40-multi-add-foods)).

   The other two save each food at once and keep the search screen open:
   - **MyFitnessPal Quick Log** puts a **+** on each search row. Tapping it logs the food straight
     away, a notification confirms it, and you stay on search
     ([MFP: Quick Log](https://support.myfitnesspal.com/hc/en-us/articles/360032622491-Getting-started-with-Quick-Log)).
   - **Lose It!** works as **Add/Save** for each food, then **Done**
     ([Lose It!: How to Log Food](https://loseit.zendesk.com/hc/en-us/articles/49210381551380-How-to-Log-Food-in-Lose-It)).

   Your proposed flow (select, then a cart, then save once) is almost exactly what Cronometer
   and MacroFactor ship.

2. **Repeat logging is the bigger shortcut, and Food Diary lacks it.** All four apps show
   history before you type a single letter. MFP has Recent/Frequent lists, Lose It! shows foods
   you often eat at that mealtime, Cronometer shows Recents/Most Frequent, and MacroFactor shows
   favorites, "hourly go-tos" and Latest. All four can also copy a previous meal in one or two
   steps. Food Diary shows **nothing** until 3 characters are typed (`searchProducts.ts:3`) and
   has no copy at all.

3. **Multi-select makes sense only when it is fast to stage.** MacroFactor's own benchmark says
   "multi-add" pays off when "the search result already has the correct serving and serving
   quantity" ([FLSI 2024](https://macrofactor.com/fastest-food-logger/)). That fits Food Diary
   well. You usually keep `defaultQuantity`, which is exactly the case it speeds up.

4. **The two open questions, answered:**
   - **Routes vs dialogs → routes.** Your new flow has 3–5 screens: search/select, edit
     quantity, review, create product and photo. Apple's HIG warns against "a modal experience
     that feels like an app within your app" and against "a hierarchy of views within a modal
     task" ([HIG: Modality](https://developer.apple.com/design/human-interface-guidelines/modality)).
     The leaders all run logging as full-screen pushed screens that have back navigation. The
     repo has already chosen TanStack Router for this
     ([ADR-0004](../../docs/adr/0004-tanstack-router-for-typed-route-metadata.md)). See §8.1.
   - **Naming → keep "Add breakfast" as the entry point, and call the commit "Log (N)".** Where an
     app has a staging step, the verbs split: **Add** puts a food into the selection and **Log**
     saves it (MacroFactor "Add" / "Log Foods"; MFP "Log" throughout). "Log" also matches
     `GLOSSARY.md`, where the canonical noun is **Food Log**. In the current dialog, "Add"
     already means three different things. See §8.2.

5. **Recommended scope for the prototype, ranked (§6):**
   1. A selection mode in search, where tapping a row toggles it on with `defaultQuantity`.
   2. A quantity chip on each selected row that you can edit.
   3. A selection counter and a sticky **Log (N)** button.
   4. A review screen.
   5. After you create a product (typed or from a photo), it comes back already selected.
   6. As a separate follow-up, recent products for the meal shown before you type, and "copy
      yesterday's {meal}".

   Skip saved meals and recipes, voice logging, barcode, Quick Add calories, multi-day and
   repeating logs (§7).

---

## 2. Current Food Diary flow (repo, 2026-10-31)

| Step | What happens | Where |
|---|---|---|
| 1 | **Add {meal}** creates a draft (`product: null`, `quantity: 100`) | `features/manageNote/ui/AddNoteButton.tsx:31-44` |
| 2 | A `Dialog` opens, `renderMode="fullScreenOnMobile"`. Its screen is derived from the draft by `activeScreen` (search → note form → product form → image upload) | `NoteInputDialog.tsx:112-113`; `model/manageNoteSlice.ts:34` |
| 3 | The search field has autofocus. Results appear only from **3 characters** up. With no query the list is empty, with no recents or frequents | `lib/searchProducts.ts:3`; `ui/ProductSearchResults.tsx` |
| 4 | Tapping a product sets `quantity = defaultQuantity` and switches to the note form (product read-only, quantity field) | `manageNoteSlice.ts:104`; `ui/NoteForm.tsx` |
| 5 | **Add** (`submitText`) sends `POST /api/v1/notes`, **waits for the notes refetch**, then resets the slice, and the dialog closes | `manageNoteSlice.ts:73`; `lib/useSubmitNote.ts:35-42`; backend `NotesController.cs:45` |
| 6 | Repeat steps 1–5 for every product | — |

Other facts that matter for the design:

- **The word "Add" means three things in one dialog:** the entry point (**Add breakfast**), the
  create-product row (`Add "${query}"`, `ProductSearchResults.tsx:102`) and the submit button.
- **Photo recognition already returns several items.** `RecognizeNoteResponse.notes` is an
  array (`entities/note/api/contracts.ts:69-76`), but the UI only uses `suggestions.at(0)`
  (`ImageUploadStep.tsx:77`).
- **There is no batch endpoint.** `NotesController` has a single-note `POST` only. The MCP
  server is read-only (`get_food_logs`, `list_products`).
- **There is no copy-meal feature and no recents.**

Cost per breakfast of N products (counted from the code; not a measured benchmark): **3N taps + N
typed searches (≥ 3 characters each) + N waits for the server.** The flow waits twice per item,
once for the POST and once for the refetch, before the dialog closes. For 3 products that is
**9 taps, 3 searches and 3 waits.** The proposed flow brings it to **1 + N + 1 taps, N searches and
1 wait** (5 taps for 3 products). Recents shown before typing would remove most of the searches.

---

## 3. Apps chosen and why

| App | Google Play installs | US App Store (ratings · H&F chart) | Why it's here |
|---|---|---|---|
| **MyFitnessPal** | 100M+ ([Play](https://play.google.com/store/apps/details?id=com.myfitnesspal.android)) | 2.4M · #14 ([App Store](https://apps.apple.com/us/app/myfitnesspal-calorie-counter/id341232718)) | The category default, and the most popular by a wide margin |
| **Lose It!** | 10M+ ([Play](https://play.google.com/store/apps/details?id=com.fitnow.loseit)) | 783K · #80 ([App Store](https://apps.apple.com/us/app/lose-it-calorie-counter/id297368629)) | A long-running mass-market tracker (launched 2008, [About Lose It!](https://loseit.zendesk.com/hc/en-us/articles/54516668028564-About-Lose-It)). "Strong" in every case of the third-party speed benchmark, multi-add included |
| **Cronometer** | 5M+ ([Play](https://play.google.com/store/apps/details?id=com.cronometer.android.gold)) | 100K · #20 ([App Store](https://apps.apple.com/us/app/cronometer-calorie-counter/id1145935738)) | Ships the **exact** pattern in your note (checkboxes → Review → Add) |
| **MacroFactor** | 1M+ ([Play](https://play.google.com/store/apps/details?id=com.sbs.diet)) | 24K · #102 ([App Store](https://apps.apple.com/us/app/macrofactor-macro-tracker/id1553503471)) | The logging-speed leader. It built and publishes the only cross-app speed benchmark (FLSI) |

**Considered and not deep-dived:** Yazio (50M+ [Play](https://play.google.com/store/apps/details?id=com.yazio.android))
and FatSecret (50M+ [Play](https://play.google.com/store/apps/details?id=com.fatsecret.android))
have more installs than Lose It!. They were left out because the two less popular apps show the
patterns more clearly: Cronometer has the exact cart pattern and MacroFactor leads on speed. Yazio
also scored "Weak" on multi-add in FLSI
([2024](https://macrofactor.com/fastest-food-logger/), [2025](https://macrofactor.com/fastest-food-logger-2025/)).
So the choice is "the two most popular, plus the two most relevant", not a pure popularity top 4.

**About FLSI (Food Logging Speed Index).** It counts discrete actions (taps, selections) per task.
Case 2 is "multi-add": log a banana and peanut butter with default servings. Results:
**MacroFactor 6, Lose It! 7 (strong), MyFitnessPal 9, Cronometer 9, Yazio 9 (weak)**
([2024](https://macrofactor.com/fastest-food-logger/)). The 2025 update gives the same
strong/weak split ([2025](https://macrofactor.com/fastest-food-logger-2025/)).
⚠️ **Conflict of interest:** FLSI was written by a MacroFactor developer, who says he is "biased
toward making MacroFactor the best product it can be". Treat the ranking as indicative only.

---

## 4. Per-app findings

### 4.1 MyFitnessPal

**Does it have the problem?** It used to. It now has three answers: **saving each food at once
while search stays open** (Quick Log), **copying a meal**, and **AI batch logging**. MFP has no
staged cart for search results. Its only screens that review several items before saving are the
voice and photo results.

| Mechanism | How it works in the UI | Source |
|---|---|---|
| **Quick Log** (in-search +) | "When you search for a food, you'll see a plus sign to the right of each item. Tap the plus sign to log the food with its current portion." Then "a notification letting you know that the item was logged successfully… You can keep tapping the plus sign to add more foods while you're still on the search page." The meal is chosen "at the very top of the search page" | [Quick Log](https://support.myfitnesspal.com/hc/en-us/articles/360032622491-Getting-started-with-Quick-Log) |
| Edit before logging | "Tap the item, adjust the portion, then tap **Log** or the Check mark in the top right corner" (iOS: **Log**, Android: check mark) | [Quick Log](https://support.myfitnesspal.com/hc/en-us/articles/360032622491-Getting-started-with-Quick-Log); [Log food](https://support.myfitnesspal.com/hc/en-us/articles/360032274592-How-to-log-food-to-your-diary) |
| Entry point | "Tap the blue **Log** button next to the meal", or the **+** at the bottom right. Tapping **Log** "bring[s you] directly to your recent or frequently logged items" | [Log food](https://support.myfitnesspal.com/hc/en-us/articles/360032274592-How-to-log-food-to-your-diary); [Today tab](https://support.myfitnesspal.com/hc/en-us/articles/39985611667341-Your-Today-tab) |
| Recent / Frequent | Built automatically from what you log, and shown before you search. Swipe to hide an item | [Recent & Frequent](https://support.myfitnesspal.com/hc/en-us/articles/360032622071-How-the-Recent-and-Frequent-lists-work) |
| **Repeat yesterday's meal** | "Swipe right just below the meal name to bring forward the foods last logged under that meal without needing to search or select individual items". The **•••** next to a meal copies it to another meal | [Today tab](https://support.myfitnesspal.com/hc/en-us/articles/39985611667341-Your-Today-tab) |
| Copy selected items | iOS: **Edit**, then check items (even across meals), then **Copy**, then pick a date. Android: ⋮ → **Edit Diary** → checkboxes | [Copy meal](https://support.myfitnesspal.com/hc/en-us/articles/360032622131-How-do-I-copy-a-meal-from-one-day-to-another) |
| Website multi-select | A list of frequent items with a checkbox on each, then **Add Checked** | [Quick Log](https://support.myfitnesspal.com/hc/en-us/articles/360032622491-Getting-started-with-Quick-Log) |
| Saved meals ("My Meals") | "Save a group of foods you eat together and log them all at once". Logged with a **+** on the meal row | [Saved meals](https://support.myfitnesspal.com/hc/en-us/articles/360032625331-Create-find-and-log-your-saved-meals) |
| Voice Log (Premium) | One sentence produces one result per food. "Tap any food to change the serving size…", then **Log**, or **Try again** | [Voice](https://support.myfitnesspal.com/hc/en-us/articles/30332897072269-How-to-log-food-with-your-voice) |
| Meal Scan (Premium) | Photo → suggestions → tap one to edit servings → **Log**. **Add more** searches the database without leaving the results screen | [Meal Scan](https://support.myfitnesspal.com/hc/en-us/articles/360045761612-How-to-use-the-Meal-Scanner) |
| Multi-Day Logging (Premium) | **Add to Multiple Days** on the food detail page, up to 7 days | [Multi-Day](https://support.myfitnesspal.com/hc/en-us/articles/33535658002061-Multi-Day-Logging-with-MyFitnessPal-Premium) |

Release-note signal that repeated adds from search are a main path: v26.23.0 says "Logging from
search results now remembers the chosen meal instead of asking for a meal for each item"
([App Store version history](https://apps.apple.com/us/app/myfitnesspal-calorie-counter/id341232718)).

Not documented: what the success notification looks like (toast or snackbar), and whether a
search row shows an "already logged" state.

### 4.2 Lose It!

**Does it have the problem?** Partly. Search is a session: you add several foods, then close it
with **Done**. Each food is still saved on its own **Add/Save**, and there is no cart.

| Mechanism | How it works in the UI | Source |
|---|---|---|
| Entry point | **Add (Meal Name) / Add Food** under a meal | [Log food](https://loseit.zendesk.com/hc/en-us/articles/49210381551380-How-to-Log-Food-in-Lose-It) |
| Search session | "Select the food(s) you want to add… Select a serving unit and quantity → Tap **Add/Save** → Tap **Done**" (iOS **Add**, Android **Save**). The barcode flow is the same: **Add** → **Done** | [Log food](https://loseit.zendesk.com/hc/en-us/articles/49210381551380-How-to-Log-Food-in-Lose-It); [Barcode](https://loseit.zendesk.com/hc/en-us/articles/49209634235924-How-to-Use-the-Barcode-Scanner) |
| History in search | The Search tab "will show you foods you often eat during the mealtime you pick and your recent meals for that time". The **My Foods** tab lists everything you've logged | [Log food](https://loseit.zendesk.com/hc/en-us/articles/49210381551380-How-to-Log-Food-in-Lose-It); [My Foods](https://loseit.zendesk.com/hc/en-us/articles/49210308470164-My-Foods) |
| **Previous Meals** | The **Meals** tab "lists meals you've logged in the past few weeks". Select one, then **Add**. It can be filtered to the same meal slot | [Previous Meals](https://loseit.zendesk.com/hc/en-us/articles/49209714942996-Previous-Meals) |
| Meal → Recipe | ⋯ next to a meal → **Add Meal to Recipes** | [Recipes](https://loseit.zendesk.com/hc/en-us/articles/47345201948052-Using-Recipes-in-Lose-It) |
| Snap It (Premium) | Photo → "a page listing the detected food(s) and their estimated serving size" → **Edit** each (number pad or scroll wheel), **Swap** for a different match → **Save** | [Snap It](https://loseit.zendesk.com/hc/en-us/articles/47771695186580-How-to-Use-Snap-It) |
| Say It | Voice search, English only | [Log food](https://loseit.zendesk.com/hc/en-us/articles/49210381551380-How-to-Log-Food-in-Lose-It) |

Not documented: whether the search screen stays open after **Add** (the **Add → Done** steps
suggest it does, but this is an inference), how success is shown, and whether search rows have a
one-tap **+**. FLSI rates Lose It!'s multi-add at 7 actions without saying how
([FLSI 2024](https://macrofactor.com/fastest-food-logger/)).

### 4.3 Cronometer

**Does it have the problem?** It solved it with **exactly the pattern in your note**. Multi-add is
**opt-in** through a toggle.

| Mechanism | How it works in the UI | Source |
|---|---|---|
| **Multi-Add** | "Tap on the Filter Icon → Toggle on **Enable Multi-Add** → Check the boxes of the foods you wish to add → Tap on **Review Items** to see a list of your selection → Tap on **Add to Diary**" | [Add a Food](https://support.cronometer.com/hc/en-us/articles/360018955211-Mobile-Add-a-Food) |
| Where the toggle lives | In the **Food Search Options** side panel (the filter icon next to the search field), next to Category Tabs and Sort. It is a persistent preference, not a per-session mode (screenshot in the article above) | [Add a Food](https://support.cronometer.com/hc/en-us/articles/360018955211-Mobile-Add-a-Food) |
| History before typing | The search screen opens on a **Recents** list, sortable by **Most Frequent / Most Recent**. Each row shows the last serving ("1 medium", "2 medium"…) | [Add a Food](https://support.cronometer.com/hc/en-us/articles/360018955211-Mobile-Add-a-Food) (screenshot) |
| Single-food confirm | A full-screen food page (Amount, Serving Size, Timestamp, Group) with an **ADD TO DIARY** button pinned to the bottom and an **✕** at top left | [Add a Food](https://support.cronometer.com/hc/en-us/articles/360018955211-Mobile-Add-a-Food) (screenshots) |
| **Copy yesterday** | From the diary group header: **Copy Yesterday's Group**. For the whole day: **Copy Previous Day**. **Multi-Select** in the diary menu, then **Copy**/**Paste**, or **Copy To Today** | [Copy & Paste](https://support.cronometer.com/hc/en-us/articles/360018695932-Mobile-Copy-Paste) |
| Photo / Voice (Gold) | Matched foods are listed. Tap the "green underlined amount and serving size" to edit it, swipe left to delete, **Search For More** to add more, then **Add To Diary**. A "Do you also have…?" row suggests foods you may have missed | [Photo](https://support.cronometer.com/hc/en-us/articles/39013533811092-Mobile-Photo-Logging); [Voice](https://support.cronometer.com/hc/en-us/articles/47549391461780-Mobile-Voice-Logging) |
| Repeat Items (Gold) | Foods set to repeat on certain days. "Tap **Log Items** at the top of your Diary" | [Repeating Foods](https://support.cronometer.com/hc/en-us/articles/16510562495764-Mobile-Set-Repeating-Foods) |
| Custom Meals | Groups of foods "you frequently eat together" | [Foods Tab](https://support.cronometer.com/hc/en-us/articles/360019865411-Mobile-Foods-Tab) |

Platform gap: multi-add has been on mobile since at least 2021 (staff:
"You can multi-add foods on the mobile app!", [forum, 2021](https://forums.cronometer.com/discussion/comment/16921/)).
A user said in July 2025 that it is still missing on desktop
([forum, 2025](https://forums.cronometer.com/discussion/6766/multi-add-food)). *This is a forum
post, so lower confidence.*

Not documented: what the selected state looks like beyond "check the boxes", whether you can edit
the quantity of a checked item before **Review Items**, whether the review screen lets you edit or
remove items, and whether **Review Items** shows a count.

### 4.4 MacroFactor

**Does it have the problem?** No. Its whole logger is built around a staging area, the **Plate**,
and it advertises the result as "the fastest food logging workflows that exist"
([New food logger](https://macrofactor.com/new-food-logger/)).

| Mechanism | How it works in the UI | Source |
|---|---|---|
| **Plate** (staging) | Foods from search, barcode, AI and quick add land on the Plate. Each one is a tile showing calories and macros. "Swipe down or tap the down arrow" to review it, change quantities, remove foods and see totals | [How to log food](https://help.macrofactorapp.com/en/articles/215-how-to-log-food-in-macrofactor); [New food logger](https://macrofactor.com/new-food-logger/) |
| Two verbs | **Add** puts the selected food on the Plate. **Log Foods** "logs everything on your plate, including the currently selected food". Their advice for a multi-food meal is to tap Add for each food and Log Foods once at the end | [How to log food](https://help.macrofactorapp.com/en/articles/215-how-to-log-food-in-macrofactor) |
| **Multi-Add (+)** | "Tap the small plus on the right side of a food" in search. This adds its default serving to the Plate **without opening the food**. Then "tap the arrow in the upper-right corner to open your plate → adjust quantities → **Log Foods**" | [Multi-add](https://help.macrofactorapp.com/en/articles/40-multi-add-foods) |
| Search after adding | Speed mode returns you to search "to continue adding foods". After a multi-add the interface resets "to a state from which you can type your next query without any extra taps" | [New food logger](https://macrofactor.com/new-food-logger/) |
| **Speed vs Context** (a setting) | **Optimize for speed** (default) keeps you in search. **Optimize for context** "returns you to your plate after each food is added" | [Configure logger](https://help.macrofactorapp.com/en/articles/219-how-to-configure-your-food-logger) |
| Selection indicator | The **Logger Banner** can show "an indicator of plate contents". The search-tile **Highlight Element** can be set to **Multi-Add** (default), **Energy** or **None** | [Configure logger](https://help.macrofactorapp.com/en/articles/219-how-to-configure-your-food-logger) |
| Inline quantity | Tapping the serving field on a Plate tile opens a custom keypad. Changes made in Food Detail update the Plate immediately | [New food logger](https://macrofactor.com/new-food-logger/) |
| History before typing | Favorites, "hourly go-tos" and **Latest** appear before you type. It "remembers foods and servings you logged in the past" | [How to log food](https://help.macrofactorapp.com/en/articles/215-how-to-log-food-in-macrofactor); [New food logger](https://macrofactor.com/new-food-logger/) |
| **Create & Add** | After you create a custom food or recipe, it is added to the Plate straight away | [How to log food](https://help.macrofactorapp.com/en/articles/215-how-to-log-food-in-macrofactor) |
| AI (photo / text "Describe") | "Foods will stream into your plate". You review and edit them there, then **Log Foods** | [AI logging](https://help.macrofactorapp.com/en/articles/258-ai-food-logging); [AI blog](https://macrofactor.com/ai-food-logging/) |
| Copy / paste | Select one or more foods, a whole hour or the whole day, then paste **To Now / To Today / To Tomorrow / Paste Inline / To Dates** | [Copy and Paste](https://help.macrofactorapp.com/en/articles/95-copy-and-paste) |
| Log to another time | The calendar icon on the Plate → **Log to Date and Time** | [How to log food](https://help.macrofactorapp.com/en/articles/215-how-to-log-food-in-macrofactor) |

Not documented: what an item already on the Plate looks like in search results, whether tapping
**+** again removes it, and whether the plate indicator is a number.

---

## 5. Comparison table

| | MyFitnessPal | Lose It! | Cronometer | MacroFactor | **Food Diary today** |
|---|---|---|---|---|---|
| Multi-item model | Saves each food at once, search stays open | Saves on each Add, then **Done** | **Staged:** checkboxes → review → save | **Staged:** Plate → save | One food per dialog |
| One-tap select from search | **+** (logs at once) | Not documented | ☑ checkbox (multi-add mode) | **+** (to Plate) | — |
| Review / cart screen | — (voice and photo results only) | — (Snap It results only) | **Review Items** | **Plate** | — |
| Commit label | **Log** / ✓ | **Add** / **Save**, then **Done** | **Add to Diary** | **Log Foods** | **Add** |
| Entry label | **Log** (next to the meal) | **Add (Meal Name)** / **Add Food** | **Add Food** | **+** | **Add {meal}** |
| Success signal | Notification after each + | Not documented | Not documented | Plate indicator in banner (optional) | The dialog closes |
| Quantity in selection | "Current portion". Tap to edit | Unit + quantity per add | Not documented | Default serving. Keypad on Plate tile | `defaultQuantity` |
| Multi-select is opt-in? | No (always on) | — | **Yes, a toggle** | **Yes, a setting** (speed/context, highlight) | — |
| History before typing | Recent / Frequent | Frequent at this mealtime + recent meals | Recents, Most Frequent | Favorites, hourly go-tos, Latest | **None** (3-character minimum) |
| Copy previous meal | Swipe under the meal name | **Meals** tab | **Copy Yesterday's Group** | Copy / paste | **None** |
| Photo → several items | Meal Scan (Premium) | Snap It (Premium) | Photo (Gold) | AI → Plate | Uses the first item only |
| Create a new food and use it | — | — | — | **Create & Add** | Creates it, then opens the note form |
| FLSI multi-add (actions) | 9 (weak) | 7 (strong) | 9 (weak) | 6 (strong) | — |

---

## 6. Ideas to borrow (ranked by fit with STRATEGY.md and your flow)

STRATEGY.md says: "Build only what's actually needed". The relevant track is "AI-assisted logging
… reduce the friction of logging meals".

1. **A staged selection with one commit (Cronometer Review Items, MacroFactor Plate).** This is
   your flow, and it is proven in production by two of the four apps. **Fit: high.** It stays
   inside the existing Food Log concept: each selected row becomes one Food Log. It also removes
   N−1 server waits.
   - Saving needs either N `POST /api/v1/notes` calls or a new batch endpoint. The spec has to
     choose, and has to define what happens when only some of the saves succeed.
2. **Tapping a row toggles it with `defaultQuantity`, and quantity is edited through a separate
   target.** MacroFactor separates the **+** (add the default serving) from tapping the name
   (open the detail). MFP does the same with **+** vs tapping the item. Your note says a second
   tap removes the item, so a tap can't also open the editor. Put a **quantity chip** (for
   example "150 g ✎") on each selected row to open the editor. **Fit: high.**
3. **A selection counter and a sticky commit button.** MacroFactor's banner shows "an indicator
   of plate contents". Cronometer pins **ADD TO DIARY** to the bottom of the screen. Use one
   bottom bar: **"Log (3)"**, plus a "Review" affordance. A snackbar for each selection is not
   needed, because the row's own checked state already confirms it. MFP shows a notification only
   because its **+** saves straight to the server. **Fit: high.**
4. **Create & Add (MacroFactor).** A product you create, by typing or from a photo, comes back
   already selected. This matches step 2.2 of your note. **Fit: high. Cost: small.** Today the
   reducer `productDraftSaved` already puts the new product into the draft.
5. **A per-device opt-in toggle (Cronometer "Enable Multi-Add", MacroFactor speed/context).**
   This is a direct precedent for your "opt-in, both live in parallel" criterion. Both put the
   switch in the search or logger settings rather than in a global settings page. **Fit: high.**
6. **History before typing (all four).** Show this meal's recent and frequent products when the
   query is empty. In the leaders this is the biggest time saver, and it removes typing
   altogether. **Fit: high, but it is a separate issue.** It needs a source of history, either a
   new query or derived from notes history, and it is useful in both the old and the new UI.
7. **Copy yesterday's {meal} (MFP swipe, Cronometer "Copy Yesterday's Group", Lose It! Previous
   Meals).** One action logs a repeated breakfast. **Fit: medium-high.** It is a separate issue
   and should be considered only if your breakfasts actually repeat ("do I actually need
   this?").
8. **Photo → several items into the selection (MFP Meal Scan, Cronometer, Lose It! Snap It,
   MacroFactor AI).** The backend already returns `notes[]`, so the recognized items could arrive
   as pre-selected rows. **Fit: medium.** It belongs to the AI-assisted logging track, and is
   better done after the selection model exists.

## 7. Ideas to skip

| Idea | Seen in | Why it doesn't fit |
|---|---|---|
| Saved meals / recipes / custom meals | MFP, Lose It!, Cronometer, MacroFactor | A new aggregate to manage. Copying a previous meal covers the same need without a catalogue |
| Saving each food at once while search stays open (MFP Quick Log) | MFP | It is the simplest option, with no cart state, and is a valid **fallback** if the prototype feels heavy. But it contradicts your "not yet saved to server / review before save" requirement, and the only undo is deleting the log |
| Voice / text "Describe" logging | MFP, Lose It!, Cronometer, MacroFactor | Needs speech input plus a new AI endpoint. Possible later in the AI track, not part of this issue |
| Barcode scanning | All four | There is no product barcode database. The product database is personal |
| Quick Add (calories without a food) | MFP, MacroFactor | Breaks the model "Food Log = Product + grams" (GLOSSARY.md) |
| Multi-day logging / repeating items / timestamps | MFP, Cronometer, MacroFactor | Premium-tier extras. Food Diary has fixed meal slots and no time of day |
| Context vs speed modes, tile density, highlight settings | MacroFactor | One opt-in toggle is enough. More options means more surface area |

---

## 8. Open questions answered

### 8.1 Should the new UI use routes instead of dialogs?

**Yes, from a UX-pattern point of view, independent of the router-library research.**

- **Platform guidance.** Apple says to "keep modal tasks simple, short, and streamlined" and to
  "take care to avoid creating a modal experience that feels like an app within your app. In
  particular, presenting a hierarchy of views within a modal task can make people forget how to
  retrace their steps"
  ([HIG: Modality](https://developer.apple.com/design/human-interface-guidelines/modality)).
  Material reserves full-screen dialogs for "actions that require a series of tasks to complete"
  ([Material Components: Dialog](https://github.com/material-components/material-components-android/blob/master/docs/components/Dialog.md)).
  It means one form, such as a calendar event, not a navigable hierarchy.
- **The new flow is a hierarchy.** It has search/select, an item quantity editor, a review/cart
  screen, a product editor and a photo-recognition step. That is 3–5 screens with
  back-navigation between them. It is exactly what the HIG warns about putting inside a modal.
- **What the leaders do.** Not fully documented. From the documented controls, logging is a
  full-screen flow with its own back and close controls: Cronometer's **✕** plus a pinned
  **ADD TO DIARY**, MFP's top-right **Log**/✓, MacroFactor's Plate opened from an arrow at the
  top right. None of them describes a dialog stack.
- **What the repo has already decided.** TanStack Router was chosen for an AppBar with a back
  arrow on nested screens
  ([ADR-0004](../../docs/adr/0004-tanstack-router-for-typed-route-metadata.md)). The existing
  research explains that the X/back bug comes from routing: "any router fixes problem 1 only when
  the product screen is a child route"
  ([routes research §1.6](../routes-instead-of-modals/research.md)).
- **Practical shape for the opt-in.** Give the new flow its own routes, for example a meal-scoped
  `…/log` with children `review` and `product`. Keep the selection in Redux as the draft, with no
  `activeScreen`. Each child route needs a guard that redirects to the parent when the draft is
  missing after a refresh, as the routes research describes. The old `NoteInputDialog` stays
  untouched behind the toggle.
- **Accept with care:** the system back button now steps between screens instead of closing
  everything. That is the goal. But leaving the flow with a non-empty selection needs a "Discard
  N selected?" confirmation, because the HIG says "when necessary, help people avoid data loss by
  getting confirmation before closing".

### 8.2 What should the action be called?

| App | Entry | Puts a food into the selection | Commits |
|---|---|---|---|
| MyFitnessPal | **Log** (next to the meal) | — | **Log** / ✓ (web: **Add Checked**) |
| Lose It! | **Add (Meal Name)** | — | **Add** / **Save** → **Done** |
| Cronometer | **Add Food** | ☑ | **Review Items** → **Add to Diary** |
| MacroFactor | **+** | **Add** / **+** | **Log Foods** |

**Recommendation:**

- **The entry stays "Add breakfast".** It is the same label in the old and the new UI, so the
  opt-in toggle changes what happens after the tap, not where you tap. Lose It! uses the same
  label.
- **The commit is "Log (N)"**, or "Log N" if space is tight. Three reasons:
  - The only app with both a staging step and a one-word commit verb (MacroFactor) uses **Add**
    for staging and **Log** for committing. MFP uses **Log** for every commit.
  - `GLOSSARY.md` makes **Food Log** the canonical UI noun, so the verb matches the thing it
    creates.
  - "Add" is already overloaded in this flow: **Add breakfast**, **Add "query"** (create a
    product) and the current submit **Add**. A fourth "Add" for "save all" would be ambiguous.
- **Use no verb for selecting.** It is a checkbox-style toggle, as in Cronometer, so no button
  label is needed.
- **The review screen is titled after the meal** (e.g. "Breakfast · 3"). Its button is the same
  **Log (N)**.

---

## 9. Claims that could not be sourced

- **Lose It!:** whether search stays open after **Add** (inferred from "Add → Done"), the success
  signal, and whether there is a one-tap **+** on search rows.
- **Cronometer:** the look of a checked item, editing quantity before **Review Items**, editing
  and removing on the review screen, and a count on the button.
- **MacroFactor:** how an item already on the Plate looks in search, whether **+** toggles, and
  whether the plate indicator is a number.
- **MyFitnessPal:** what the Quick Log notification looks like.
- **Any app:** none of them documents a label with a count, such as "Log (3)". The counter idea
  comes from MacroFactor's "indicator of plate contents" and is not a copied label.
- **Lose It!:** the full logging screen flow. The official site `loseit.com` refuses automated
  fetches, so only its Zendesk help center was read.

---

## Sources

### Repo
- `src/frontend/src/features/manageNote/ui/AddNoteButton.tsx`, `NoteInputDialog.tsx`, `ProductSearchResults.tsx`, `ImageUploadStep.tsx`, `NoteForm.tsx`
- `src/frontend/src/features/manageNote/model/manageNoteSlice.ts`, `lib/searchProducts.ts`, `lib/useSubmitNote.ts`
- `src/frontend/src/entities/note/api/contracts.ts`
- `src/backend/src/FoodDiary.API/Controllers/v1/NotesController.cs`
- `STRATEGY.md`, `GLOSSARY.md`, `docs/adr/0004-tanstack-router-for-typed-route-metadata.md`, `.scratch/routes-instead-of-modals/research.md`

### MyFitnessPal (official help center, read via the Zendesk API, updated Sep–Oct 2026)
- [Getting started with Quick Log](https://support.myfitnesspal.com/hc/en-us/articles/360032622491-Getting-started-with-Quick-Log)
- [How to log food to your diary](https://support.myfitnesspal.com/hc/en-us/articles/360032274592-How-to-log-food-to-your-diary)
- [Your Today tab](https://support.myfitnesspal.com/hc/en-us/articles/39985611667341-Your-Today-tab)
- [How the Recent and Frequent lists work](https://support.myfitnesspal.com/hc/en-us/articles/360032622071-How-the-Recent-and-Frequent-lists-work)
- [How do I copy a meal from one day to another?](https://support.myfitnesspal.com/hc/en-us/articles/360032622131-How-do-I-copy-a-meal-from-one-day-to-another)
- [Create, find, and log your saved meals](https://support.myfitnesspal.com/hc/en-us/articles/360032625331-Create-find-and-log-your-saved-meals)
- [How to log food with your voice](https://support.myfitnesspal.com/hc/en-us/articles/30332897072269-How-to-log-food-with-your-voice)
- [How to use the Meal Scanner](https://support.myfitnesspal.com/hc/en-us/articles/360045761612-How-to-use-the-Meal-Scanner)
- [Multi-Day Logging](https://support.myfitnesspal.com/hc/en-us/articles/33535658002061-Multi-Day-Logging-with-MyFitnessPal-Premium)
- [App Store listing and version history](https://apps.apple.com/us/app/myfitnesspal-calorie-counter/id341232718) · [Google Play](https://play.google.com/store/apps/details?id=com.myfitnesspal.android)

### Lose It! (official help center, help.loseit.com → loseit.zendesk.com)
- [How to Log Food in Lose It!](https://loseit.zendesk.com/hc/en-us/articles/49210381551380-How-to-Log-Food-in-Lose-It)
- [Previous Meals](https://loseit.zendesk.com/hc/en-us/articles/49209714942996-Previous-Meals)
- [My Foods](https://loseit.zendesk.com/hc/en-us/articles/49210308470164-My-Foods)
- [How to Use Snap It](https://loseit.zendesk.com/hc/en-us/articles/47771695186580-How-to-Use-Snap-It)
- [How to Use the Barcode Scanner](https://loseit.zendesk.com/hc/en-us/articles/49209634235924-How-to-Use-the-Barcode-Scanner)
- [Using Recipes in Lose It!](https://loseit.zendesk.com/hc/en-us/articles/47345201948052-Using-Recipes-in-Lose-It)
- [App Store](https://apps.apple.com/us/app/lose-it-calorie-counter/id297368629) · [Google Play](https://play.google.com/store/apps/details?id=com.fitnow.loseit)

### Cronometer (official help center, read via the Zendesk API)
- [Mobile – Add a Food](https://support.cronometer.com/hc/en-us/articles/360018955211-Mobile-Add-a-Food) (incl. screenshots)
- [Mobile – Copy & Paste](https://support.cronometer.com/hc/en-us/articles/360018695932-Mobile-Copy-Paste)
- [Mobile – Photo-Logging](https://support.cronometer.com/hc/en-us/articles/39013533811092-Mobile-Photo-Logging)
- [Mobile – Voice Logging](https://support.cronometer.com/hc/en-us/articles/47549391461780-Mobile-Voice-Logging)
- [Mobile – Set Repeating Foods](https://support.cronometer.com/hc/en-us/articles/16510562495764-Mobile-Set-Repeating-Foods)
- [Mobile – Foods Tab](https://support.cronometer.com/hc/en-us/articles/360019865411-Mobile-Foods-Tab)
- Official forum: [staff reply, 2021](https://forums.cronometer.com/discussion/comment/16921/); [user thread, 2025 — lower confidence](https://forums.cronometer.com/discussion/6766/multi-add-food)
- [App Store](https://apps.apple.com/us/app/cronometer-calorie-counter/id1145935738) · [Google Play](https://play.google.com/store/apps/details?id=com.cronometer.android.gold)

### MacroFactor (official help center and blog)
- [Multi-add foods](https://help.macrofactorapp.com/en/articles/40-multi-add-foods)
- [How to log food in MacroFactor](https://help.macrofactorapp.com/en/articles/215-how-to-log-food-in-macrofactor)
- [How to configure your food logger](https://help.macrofactorapp.com/en/articles/219-how-to-configure-your-food-logger)
- [AI food logging](https://help.macrofactorapp.com/en/articles/258-ai-food-logging) · [AI blog post (updated 2025-04-08)](https://macrofactor.com/ai-food-logging/)
- [Copy and paste](https://help.macrofactorapp.com/en/articles/95-copy-and-paste) · [Save a meal for later use](https://help.macrofactorapp.com/en/articles/239-save-a-meal-for-later-use)
- [New food logger (updated 2024-09-25)](https://macrofactor.com/new-food-logger/)
- FLSI: [2024 (updated 2024-09-25)](https://macrofactor.com/fastest-food-logger/) · [2025 update (updated 2025-10-01)](https://macrofactor.com/fastest-food-logger-2025/). Vendor-authored, with a stated bias
- [App Store](https://apps.apple.com/us/app/macrofactor-macro-tracker/id1553503471) · [Google Play](https://play.google.com/store/apps/details?id=com.sbs.diet)

### Other apps (popularity only)
- [Yazio — Google Play](https://play.google.com/store/apps/details?id=com.yazio.android) · [FatSecret — Google Play](https://play.google.com/store/apps/details?id=com.fatsecret.android)

### Platform guidance
- [Apple HIG — Modality](https://developer.apple.com/design/human-interface-guidelines/modality) (change log: 2023-12-05)
- [Material Components for Android — Dialog (full-screen dialogs)](https://github.com/material-components/material-components-android/blob/master/docs/components/Dialog.md)
