import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import create from '../../../../test-utils';
import ProductCreateEditDialog from '../ProductCreateEditDialog';

describe('ProductCreateEditDialog', () => {
  describe('category autocomplete', () => {
    test('starts loading options on open', () => {
      const ui = create
        .component(
          <ProductCreateEditDialog
            open
            onDialogConfirm={jest.fn()}
            onDialogCancel={jest.fn()}
          ></ProductCreateEditDialog>,
        )
        .withReduxStore()
        .please();

      render(ui);
      const input = screen.getByRole('textbox', { name: /category/i });
      userEvent.click(input);

      const autocomplete = screen.getByRole('combobox', { expanded: true });
      const loader = within(autocomplete).getByRole('progressbar');
      expect(loader).toBeInTheDocument();
    });

    test('displays all options on open', () => {});

    test('displays loaded options matching input value', () => {});

    test('displays empty message for empty autocomplete', () => {});

    test('displays empty message if input value does not match any loaded option', () => {});
  });
});
