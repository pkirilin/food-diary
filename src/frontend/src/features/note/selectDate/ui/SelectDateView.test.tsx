import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
import { SelectDateView, type OnSubmitDateFn } from './SelectDateView';

const currentDate = new Date(2023, 9, 19);

const renderSelectDate = (date = currentDate) => {
  const user = userEvent.setup();
  const onSubmitDate = vi.fn<OnSubmitDateFn>();

  render(
    <RootProvider store={configureStore()}>
      <SelectDateView currentDate={date} onSubmitDate={onSubmitDate} />
    </RootProvider>,
  );

  return { user, onSubmitDate };
};

afterEach(() => {
  vi.useRealTimers();
});

test('should submit the picked date', async () => {
  const { user, onSubmitDate } = renderSelectDate();

  await user.click(screen.getByRole('button', { name: /19 oct 2023/i }));
  await user.click(screen.getByRole('gridcell', { name: '20' }));
  await user.click(screen.getByRole('button', { name: /ok/i }));

  expect(onSubmitDate).toHaveBeenCalledExactlyOnceWith(new Date(2023, 9, 20));
});

test('should close without submitting when the picked date is cancelled', async () => {
  const { user, onSubmitDate } = renderSelectDate();

  await user.click(screen.getByRole('button', { name: /19 oct 2023/i }));
  await user.click(screen.getByRole('gridcell', { name: '20' }));
  await user.click(screen.getByRole('button', { name: /cancel/i }));

  expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  expect(onSubmitDate).not.toHaveBeenCalled();
});

test('should confirm the picked date in a single place', async () => {
  const { user } = renderSelectDate();

  await user.click(screen.getByRole('button', { name: /19 oct 2023/i }));
  await user.click(screen.getByRole('gridcell', { name: '20' }));

  expect(screen.getAllByRole('button', { name: /cancel/i })).toHaveLength(1);
  expect(screen.getAllByRole('button', { name: /ok/i })).toHaveLength(1);
});

test('should reopen on the current date after being dismissed', async () => {
  const { user } = renderSelectDate();

  await user.click(screen.getByRole('button', { name: /19 oct 2023/i }));
  await user.click(screen.getByRole('gridcell', { name: '20' }));
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('button', { name: /19 oct 2023/i }));

  expect(screen.getByRole('gridcell', { name: '19' })).toHaveAttribute('aria-selected', 'true');
});

test('should submit the previous day when the previous day arrow is tapped', async () => {
  const { user, onSubmitDate } = renderSelectDate();

  await user.click(screen.getByRole('button', { name: 'Previous day' }));

  expect(onSubmitDate).toHaveBeenCalledExactlyOnceWith(new Date(2023, 9, 18));
});

test('should submit the next day when the next day arrow is tapped', async () => {
  const { user, onSubmitDate } = renderSelectDate();

  await user.click(screen.getByRole('button', { name: 'Next day' }));

  expect(onSubmitDate).toHaveBeenCalledExactlyOnceWith(new Date(2023, 9, 20));
});

test('should submit a date after today when the next day arrow is tapped on today', async () => {
  vi.useFakeTimers({ toFake: ['Date'] }).setSystemTime(new Date(2023, 9, 19, 12));
  const { user, onSubmitDate } = renderSelectDate();

  await user.click(screen.getByRole('button', { name: 'Next day' }));

  expect(onSubmitDate).toHaveBeenCalledExactlyOnceWith(new Date(2023, 9, 20));
});

test('should start the calendar week on Monday', async () => {
  const { user } = renderSelectDate();

  await user.click(screen.getByRole('button', { name: /19 oct 2023/i }));

  expect(screen.getAllByRole('columnheader').at(0)).toHaveAccessibleName('Monday');
});

test('should submit a picked day from the previous month', async () => {
  const { user, onSubmitDate } = renderSelectDate();

  await user.click(screen.getByRole('button', { name: /19 oct 2023/i }));
  const [previousMonthDay] = screen.getAllByRole('gridcell', { name: '30' });
  await user.click(previousMonthDay);
  await user.click(screen.getByRole('button', { name: /ok/i }));

  expect(onSubmitDate).toHaveBeenCalledExactlyOnceWith(new Date(2023, 8, 30));
});

test('should show six weeks for a month that fits in four', async () => {
  const { user } = renderSelectDate(new Date(2021, 1, 10));

  await user.click(screen.getByRole('button', { name: /10 feb 2021/i }));
  const weeks = within(screen.getByRole('grid'))
    .getAllByRole('row')
    .filter(row => within(row).queryAllByRole('gridcell').length > 0);

  expect(weeks).toHaveLength(6);
});
