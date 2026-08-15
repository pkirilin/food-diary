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

test('should reopen on the current date after being dismissed', async () => {
  const { user } = renderSelectDate();

  await user.click(screen.getByRole('button', { name: /19 oct 2023/i }));
  await user.click(screen.getByRole('gridcell', { name: '20' }));
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('button', { name: /19 oct 2023/i }));

  expect(screen.getByRole('gridcell', { name: '19' })).toHaveAttribute('aria-selected', 'true');
});
