import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
import { dateLib } from '@/shared/lib';
import { WeightLogsList } from './WeightLogsList';

afterEach(() => {
  vi.restoreAllMocks();
});

test('I can log my current weight', async () => {
  const store = configureStore();
  const user = userEvent.setup();
  vi.spyOn(dateLib, 'getCurrentDate').mockReturnValue(new Date('2022-01-30'));

  render(
    <RootProvider store={store}>
      <WeightLogsList weightLogsRequest={{ from: '2022-01-01', to: '2022-01-31' }} />
    </RootProvider>,
  );

  await user.click(screen.getByRole('button', { name: /log weight/i }));
  expect(await screen.findByRole('dialog')).toBeVisible();

  const dateField = await screen.findByRole('textbox', { name: /date/i });
  const weightField = await screen.findByPlaceholderText(/weight/i);
  expect(dateField).toHaveValue('30 Jan 2022');
  expect(weightField).toHaveValue('73');

  await user.click(screen.getByRole('button', { name: /choose date/i }));
  await user.click(
    within(screen.getByRole('dialog', { name: /date/i })).getByRole('gridcell', { name: '29' }),
  );

  await user.clear(weightField);
  await user.type(weightField, '75');

  await user.click(screen.getByRole('button', { name: /save/i }));
  expect(await screen.findByRole('listitem', { name: /75 kg on 29 Jan 2022/i })).toBeVisible();
});
