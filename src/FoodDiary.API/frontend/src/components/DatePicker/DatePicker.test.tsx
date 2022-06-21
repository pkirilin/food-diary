import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { create } from 'src/test-utils';
import DatePicker from './DatePicker';

type DatePickerTestProps = {
  label: string;
  placeholder: string;
  date?: Date | null;
};

function DatePickerTest({ label, placeholder, date: initialDate = null }: DatePickerTestProps) {
  const [date, setDate] = useState<Date | null>(initialDate);

  return (
    <DatePicker
      label={label}
      placeholder={placeholder}
      date={date}
      onChange={value => setDate(value)}
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
