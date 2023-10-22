import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { create } from 'src/test-utils';
import { PageCreateEdit } from '../../models';
import PageCreateEditDialog from './PageCreateEditDialog';

test('page can be created', async () => {
  const submitFn = vi.fn();
  const ui = create
    .component(
      <PageCreateEditDialog open={true} onDialogConfirm={submitFn} onDialogCancel={vi.fn()} />,
    )
    .withReduxStore()
    .please();

  render(ui);
  const pageDate = screen.getByRole('textbox', { name: /page date/i });
  await waitFor(() => expect(pageDate).toHaveDisplayValue('22.10.2023'));
  await userEvent.click(screen.getByText(/create/i));

  expect(submitFn).toHaveBeenCalledWith({
    date: '2023-10-22',
  } as PageCreateEdit);
});
