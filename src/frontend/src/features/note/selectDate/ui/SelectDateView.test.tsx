import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
import { SelectDateView, type OnSubmitDateFn } from './SelectDateView';

const currentDate = new Date(2023, 9, 19);

const renderSelectDate = () => {
  const user = userEvent.setup();
  const onSubmitDate = vi.fn<OnSubmitDateFn>();

  render(
    <RootProvider store={configureStore()}>
      <SelectDateView currentDate={currentDate} onSubmitDate={onSubmitDate} />
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
