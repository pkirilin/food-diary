import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@tests/render';
import { FilterNotesHistory } from './FilterNotesHistory';

const openFilter = async (): Promise<void> => {
  render(<FilterNotesHistory date={new Date(2023, 9, 19)} />);
  await userEvent.click(screen.getByRole('button', { name: /show filter/i }));
};

test('the dialog is the only place the filter can be confirmed or dismissed', async () => {
  await openFilter();

  expect(screen.getByRole('button', { name: /^cancel$/i })).toBeVisible();
  expect(screen.getByRole('button', { name: /^apply$/i })).toBeVisible();
  expect(screen.queryByRole('button', { name: /^ok$/i })).not.toBeInTheDocument();
});

test('the picked month survives until it is applied', async () => {
  await openFilter();

  await userEvent.click(screen.getByRole('radio', { name: /dec/i }));

  expect(screen.getByRole('radio', { name: /dec/i })).toBeChecked();
});
