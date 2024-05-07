import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { create } from '@tests/dsl';
import PagesToolbar from '../PagesToolbar';

test('pages can be imported', async () => {
  const file = new File([], 'importFile');
  const ui = create
    .component(<PagesToolbar />)
    .withReduxStore()
    .please();

  render(ui);
  await userEvent.upload(screen.getByLabelText(/import file/i), file);
  const dialog = screen.getByRole('dialog');
  await userEvent.click(within(dialog).getByText(/yes/i));

  await waitForElementToBeRemoved(dialog);
});
