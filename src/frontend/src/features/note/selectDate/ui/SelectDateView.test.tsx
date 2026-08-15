import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
import { SelectDateView, type OnSubmitDateFn } from './SelectDateView';

test('should submit the picked date', async () => {
  const user = userEvent.setup();
  const onSubmitDate = vi.fn<OnSubmitDateFn>();

  render(
    <RootProvider store={configureStore()}>
      <SelectDateView currentDate={new Date(2023, 9, 19)} onSubmitDate={onSubmitDate} />
    </RootProvider>,
  );

  await user.click(screen.getByRole('button', { name: /19 oct 2023/i }));
  await user.click(screen.getByRole('gridcell', { name: '20' }));

  expect(onSubmitDate).toHaveBeenCalledExactlyOnceWith(new Date(2023, 9, 20));
});
