import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
import { dateLib } from '@/shared/lib';
import { WeightLogsList } from './WeightLogsList';

beforeEach(() => {
  vi.spyOn(dateLib, 'getCurrentDate').mockReturnValue(new Date('2022-01-30'));
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('I can log my current weight', async () => {
  const store = configureStore();
  const user = userEvent.setup();

  render(
    <RootProvider store={store}>
      <WeightLogsList weightLogsRequest={{ from: '2022-01-01', to: '2022-01-31' }} />
    </RootProvider>,
  );

  await user.click(screen.getByRole('button', { name: 'Log weight' }));
  expect(await screen.findByRole('dialog')).toBeVisible();
  expect(await screen.findByPlaceholderText(/weight/i)).toHaveValue('73');

  await user.clear(screen.getByPlaceholderText(/weight/i));
  await user.type(screen.getByPlaceholderText(/weight/i), '75');
  await user.click(screen.getByRole('button', { name: /save/i }));
  expect(await screen.findByRole('listitem', { name: /75 kg on 30 Jan 2022/i })).toBeVisible();
});
