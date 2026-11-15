import { holdSoftKeyboardForNextField, releaseSoftKeyboardHold } from './softKeyboard';

const getFocusedElement = (): Element | null => document.activeElement;

test('a held soft keyboard focuses a text input until the next field takes the focus', () => {
  const nextField = document.createElement('input');
  document.body.appendChild(nextField);
  onTestFinished(() => {
    nextField.remove();
  });

  holdSoftKeyboardForNextField();

  const placeholder = getFocusedElement();
  expect(placeholder).toBeInstanceOf(HTMLInputElement);
  expect(placeholder).not.toBe(nextField);

  nextField.focus();

  expect(nextField).toHaveFocus();
  expect(placeholder).not.toBeInTheDocument();
});

test('releasing a held soft keyboard drops the focus', () => {
  holdSoftKeyboardForNextField();

  releaseSoftKeyboardHold();

  expect(document.body).toHaveFocus();
});
