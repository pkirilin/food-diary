const MAX_WAIT_FOR_NEXT_FIELD_MS = 5000;

// iOS Safari opens the on-screen keyboard only for a focus made during a user gesture, but keeps it
// open while focus moves to another field. Call this in the gesture's handler when the field that
// should receive the typing mounts later, after a navigation.
export const holdSoftKeyboardForNextField = (): void => {
  const placeholder = document.createElement('input');
  placeholder.tabIndex = -1;
  // A font size below 16px makes iOS zoom the page on focus
  placeholder.style.cssText =
    'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;pointer-events:none;';

  const giveUpTimer = setTimeout(() => placeholder.blur(), MAX_WAIT_FOR_NEXT_FIELD_MS);

  placeholder.addEventListener(
    'blur',
    () => {
      clearTimeout(giveUpTimer);
      placeholder.remove();
    },
    { once: true },
  );

  document.body.appendChild(placeholder);
  placeholder.focus();
};
