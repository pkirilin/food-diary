import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { create } from 'src/test-utils';
import ExportDialog from './ExportDialog';

test('exports pages to Google Docs with valid period', () => {
  const onCloseFn = jest.fn();

  const ui = create
    .component(<ExportDialog isOpen={true} onClose={onCloseFn}></ExportDialog>)
    .withReduxStore()
    .withMuiPickersUtils()
    .please();

  render(ui);
  userEvent.type(screen.getByLabelText(/export start date/i), '01.01.2022');
  userEvent.type(screen.getByLabelText(/export end date/i), '01.01.2022');
  fireEvent.mouseDown(screen.getByLabelText(/export format/i));
  const exportMenu = within(screen.getByRole('listbox'));
  userEvent.click(exportMenu.getByText(/google docs/i));
  userEvent.click(screen.getByLabelText('Confirm export and continue'));

  expect(onCloseFn).toHaveBeenCalled();
});
