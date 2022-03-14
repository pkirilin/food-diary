import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import create from '../../../../test-utils';
import { CategoryAutocompleteOption } from '../../../categories/models';
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

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('displays all options on open', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(
        create
          .response()
          .withJsonData<CategoryAutocompleteOption[]>([
            {
              id: 1,
              name: 'Category 1',
            },
            {
              id: 2,
              name: 'Category 2',
            },
          ])
          .please(),
      );

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

      const options = await screen.findAllByRole('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent('Category 1');
      expect(options[1]).toHaveTextContent('Category 2');
    });

    test('displays loaded options matching input value', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(
        create
          .response()
          .withJsonData<CategoryAutocompleteOption[]>([
            {
              id: 1,
              name: 'My first category',
            },
            {
              id: 2,
              name: 'My second category',
            },
            {
              id: 3,
              name: 'Another category',
            },
          ])
          .please(),
      );

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
      userEvent.type(input, 'My');

      const options = await screen.findAllByRole('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent('My first category');
      expect(options[1]).toHaveTextContent('My second category');
    });

    test('displays empty message for empty autocomplete', () => {});

    test('displays empty message if input value does not match any loaded option', () => {});
  });
});
