export const captureFocusDuring = (eventType: 'click' | 'submit'): (() => Element | null) => {
  let focused: Element | null = null;
  window.addEventListener(
    eventType,
    () => {
      focused = document.activeElement;
    },
    { once: true },
  );
  return () => focused;
};
