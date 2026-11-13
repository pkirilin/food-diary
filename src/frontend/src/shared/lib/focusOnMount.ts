// Replaces `autoFocus` for fields inside a full-screen dialog. The dialog slides in from below, and
// iOS Safari scrolls the page behind it to reveal a field focused mid-slide, leaving a blank screen.
export const focusOnMount = (element: HTMLElement | null): void => {
  element?.focus({ preventScroll: true });
};
