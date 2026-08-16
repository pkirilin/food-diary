# The day switcher confirms date selection with OK

Status: accepted (2026-08-15)

Migrating MUI X from v7 to v9 changed how the app bar's day switcher behaves. The
switcher wraps a `StaticDatePicker` in a `Popover`. At v7 a static picker rendered as
a desktop wrapper defaulted its close-on-select behaviour to true and rendered no
action bar, so tapping a day fired `onAccept` immediately and the app navigated. From
v8 onward that default is applied only by the desktop picker component; the static
picker leaves it unset, so it renders a Cancel/OK action bar and tapping a day counts
as a set rather than an accept.

We accept the new behaviour. **Choosing a day now takes two taps: pick the day, then
confirm with OK.**

## Considered options

**Pass the close-on-select prop.** It belongs to the interface documented as "props
used to handle the value of non-static Pickers" and is absent from the static picker's
props, so passing it is a type error, not a one-line fix.

**Switch from the accept callback to the change callback and filter.** v9 dropped the
selection-state field from that callback's context, so there is no way to tell a
completed day selection from an intermediate year or month step. Reconstructing it
would mean tracking the open view by hand.

**Replace the popover-wrapped static picker with a `DesktopDatePicker` driven through
its trigger slot.** This is a real option and would keep the single tap, but it
restructures the widget rather than migrating it. It is worth its own issue if the
extra tap proves annoying in daily use.

## Consequences

Changing the day costs one more tap. In exchange the popover gains a Cancel button,
which it never had — previously the only way out was clicking outside it.

The switcher now owns a draft date. It was fully controlled by the `currentDate` prop
with no change handler, which worked only because accept fired on the first tap; with
confirmation, a selection has to live somewhere until OK. The component keeps the
pending date in state and resets it to `currentDate` each time the popover opens, so
dismissing without confirming does not leave a stale selection behind.

The history filter renders the same static picker inside its own Cancel/Apply dialog,
and it suppresses the picker's action bar with an empty `actions` array.

Leaving that bar in place was tried first, on the reasoning that the filter drives its
state from the change callback and so nothing about it could break. That was wrong.
The picker's Cancel fires the change callback with the *previous* value, so it reset
the filter's pending month without closing anything — and the dialog's Apply then
submitted the old month with nothing on screen to say the choice had been discarded.
Its OK did nothing at all, because the filter wires neither the accept nor the close
callback. Two confirmation pairs in one dialog, one of them silently destructive, is a
defect rather than a cosmetic wrinkle, so the inner pair is removed and the dialog
stays the only place the filter is confirmed or dismissed.

The switcher suppresses the picker's action bar the same way, and renders its own
Cancel/OK pair in the popover. There the pair is unambiguous: Cancel closes the
popover, nothing is submitted, and reopening shows the current date rather than the
abandoned selection, because the pending date resets on every open. Keeping the
picker's own bar would have worked too, but only by wiring its close callback, which
X marks as removed in the next major — so the switcher owns the bar rather than
depending on a callback that will disappear.

This decision is scoped to the day switcher's interaction. It is **not** a blanket
"we accept upstream defaults": the same migration turns the weight chart's per-entry
markers back on, because charts v9 flips that default off and the points carry
information the line alone does not. The rule is per-case — preserve a default where
it carries product meaning, accept the change where working around it costs more than
it returns.
