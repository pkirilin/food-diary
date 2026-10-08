import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Mock } from 'vitest';
import { render } from '@tests/render';
import { FilterNotesHistory, type OnApplyFilterFn } from './FilterNotesHistory';

const openFilter = async (): Promise<{ onApply: Mock<OnApplyFilterFn> }> => {
  const onApply = vi.fn<OnApplyFilterFn>();
  render(<FilterNotesHistory date={new Date(2023, 9, 19)} onApply={onApply} />);
  await userEvent.click(screen.getByRole('button', { name: /show filter/i }));
  return { onApply };
};

test('the dialog is the only place the filter can be confirmed or dismissed', async () => {
  await openFilter();

  expect(screen.getByRole('button', { name: /^cancel$/i })).toBeVisible();
  expect(screen.getByRole('button', { name: /^apply$/i })).toBeVisible();
  expect(screen.queryByRole('button', { name: /^ok$/i })).not.toBeInTheDocument();
});

test('the picked month survives until it is applied', async () => {
  const { onApply } = await openFilter();

  await userEvent.click(screen.getByRole('radio', { name: /dec/i }));
  await userEvent.click(screen.getByRole('button', { name: /^apply$/i }));

  expect(onApply).toHaveBeenCalledExactlyOnceWith<Parameters<OnApplyFilterFn>>(12, 2023);
});
