import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Fragment } from 'react';
import { useValidatedState } from 'src/hooks';
import { create } from 'src/test-utils';
import { validateDate } from 'src/utils';
import DatePicker from './DatePicker';

type DatePickerTestProps = {
  label: string;
  placeholder: string;
  date?: Date | null;
  errorHelperText?: string;
};

function DatePickerTest({
  label,
  placeholder,
  date: initialDate = null,
  errorHelperText = '',
}: DatePickerTestProps) {
  const { value, setValue, isInvalid, helperText } = useValidatedState<Date | null>({
    initialValue: initialDate,
    errorHelperText,
    validatorFunction: validateDate,
  });

  return (
    <DatePicker
      label={label}
      placeholder={placeholder}
      date={value}
      onChange={value => setValue(value)}
      isInvalid={isInvalid}
      helperText={helperText}
    ></DatePicker>
  );
}

test('date can be changed', async () => {
  const ui = create
    .component(
      <DatePickerTest
        label="Test date"
        placeholder="Select test date"
        date={new Date('2022-06-20')}
      ></DatePickerTest>,
    )
    .please();

  render(ui);
  const date = screen.getByRole('textbox', { name: /test date/i });
  await userEvent.clear(date);
  await userEvent.type(date, '19062022');

  expect(date).toHaveDisplayValue('19.06.2022');
});

test('date can be validated', async () => {
  const ui = create
    .component(
      <Fragment>
        <DatePickerTest
          label="First"
          placeholder="Select first"
          date={new Date('2022-06-26')}
          errorHelperText="First is invalid"
        ></DatePickerTest>
        <DatePickerTest
          label="Second"
          placeholder="Select second"
          date={new Date('2022-06-26')}
          errorHelperText="Second is invalid"
        ></DatePickerTest>
      </Fragment>,
    )
    .please();

  render(ui);
  const first = screen.getByRole('textbox', { name: /first/i });
  const second = screen.getByRole('textbox', { name: /second/i });
  await userEvent.clear(first);
  await userEvent.clear(second);
  await userEvent.type(second, '260620');

  expect(first).toBeInvalid();
  expect(second).toBeInvalid();
  expect(screen.getByText(/first is invalid/i)).toBeVisible();
  expect(screen.getByText(/second is invalid/i)).toBeVisible();
});
