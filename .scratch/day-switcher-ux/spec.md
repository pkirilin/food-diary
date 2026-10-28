# Spec: Day switcher UX

Status: resolved

Vocabulary: [GLOSSARY.md](../../GLOSSARY.md) — **Food Log** is used with that exact meaning below.

Decision records: [ADR-0002](../../docs/adr/0002-day-switcher-confirms-date-selection.md) stays in force — selecting a date in the calendar is still confirmed with OK.

## Problem Statement

The day switcher in the app bar of the Food Logs page is awkward to use, especially on a phone:

1. After switching to a month, the days of the previous month are not visible.
2. Going to yesterday or back to today takes three taps — open the calendar, pick the day, press OK.
3. The week starts on Sunday instead of Monday.
4. The day buttons are too small to hit reliably on a phone.
5. The calendar popover opens right under the date button and covers part of the app bar.

## Solution

Previous/next-day arrows around the date in the app bar move one day per tap, without opening the calendar. The calendar itself drops down from the bottom edge of the app bar — full width on a phone, like the Google Calendar mobile app — with a fixed six-row grid that includes the neighbouring months' days, large day cells, and weeks starting on Monday. Picking a day in the calendar is still confirmed with OK.

## User Stories

1. As the owner, I want to go to the previous day with one tap, so that logging yesterday's food is quick.
2. As the owner, I want to go to the next day with one tap, so that returning to today from yesterday is quick.
3. As the owner, I want the day arrows to keep working past today, so that I can log a planned meal ahead of time.
4. As the owner, I want the calendar's weeks to start on Monday, so that the grid matches how I think about a week.
5. As the owner, I want to see and pick the trailing days of the previous month and the leading days of the next one, so that dates around a month boundary are one tap away.
6. As the owner, I want the calendar grid to keep the same height in every month, so that the OK and Cancel buttons do not jump around.
7. As the owner, I want day cells large enough to tap with a thumb, so that I do not pick the wrong day on a phone.
8. As the owner, I want the calendar to open below the app bar rather than over it, so that the app bar stays readable while I pick a date.
9. As the owner, I want the calendar to span the screen width on a phone, so that it uses the space it has.
10. As the owner, I want a tap anywhere outside the calendar, the app bar included, to close it without changing the date, so that dismissing it is effortless.

## Implementation Decisions

### Day arrows

- `SelectDateView` (`features/note/selectDate/ui/`) renders an icon button on each side of the date button, labelled **"Previous day"** and **"Next day"**.
- An arrow submits `currentDate ± 1 day` through the existing `onSubmitDate` immediately — no confirmation. ADR-0002 governs selection inside the calendar only; an arrow tap is a single, trivially reversible step.
- No upper or lower bound: the arrows and the calendar both allow dates after today, as they do now.

### Calendar selection (unchanged)

- The picker's own action bar stays suppressed and the popover keeps its own Cancel/OK pair, per ADR-0002.
- The pending date still resets to `currentDate` on every open.

### Week start

- Monday is the first day of the week **app-wide**, set once on the shared `LocalizationProvider` in `app/RootProvider.tsx` (an `adapterLocale` derived from date-fns `enUS` with `weekStartsOn: 1`). English text and the existing date formats stay as they are.
- This also reaches the weight log `DatePicker`. The history filter shows only year and month views, so it is unaffected.
- No user setting.

### Grid (day switcher only)

- Days outside the current month are shown, dimmed, and selectable (`showDaysOutsideCurrentMonth`).
- The grid always renders six weeks (`fixedWeekNumber={6}`).
- Day cells are at least **48 px** square.
- The year → month → day drill-down via the header and the month arrows stay.
- None of these change the weight log `DatePicker` or the history filter.

### Placement

- The calendar's top edge sits on the app bar's bottom edge, not on the date button's.
- Below MUI's `sm` breakpoint (600 px) it spans the full viewport width, and day cells stretch to fill it (≈51 px at 360 px wide).
- From `sm` up it keeps a capped width sized to seven 48 px cells, left-aligned under the date.
- A visible scrim dims only the content below the app bar.
- A tap anywhere outside the calendar — the app bar and its arrows included — closes it like Cancel; the arrows are not operable while the calendar is open.

## Testing Decisions

- Extend `SelectDateView.test.tsx`:
  - the previous/next arrows submit the adjacent dates;
  - a date after today is reachable via the next arrow;
  - the grid's first column is Monday;
  - a day from the previous month is shown and can be picked and confirmed;
  - the existing OK, Cancel and reopen-resets tests keep passing.
- Verify the layout in the browser with `yarn playwright-cli` at a phone width (360 px) and a desktop width: the calendar's top edge aligns with the app bar's bottom edge, the width rules hold, cells are ≥ 48 px, and the app bar is not covered.

## Out of Scope

- Changing how a calendar selection is confirmed (ADR-0002).
- A configurable first day of the week.
- Swipe gestures between days.
- Restricting navigation to past dates.
- Grid or layout changes to the weight log `DatePicker` and the history filter.
