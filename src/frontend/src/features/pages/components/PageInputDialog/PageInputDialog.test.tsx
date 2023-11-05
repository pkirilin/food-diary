import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { create } from 'src/test-utils';
import { PageCreateEdit } from '../../models';
import PageInputDialog from './PageInputDialog';

describe('when initial date is specified', () => {
  test('should create new page with that date', async () => {
    const submitFn = vi.fn();
    const ui = create
      .component(
        <PageInputDialog
          title="Test dialog"
          submitText="Create"
          isOpened
          initialDate={new Date('2023-10-22')}
          onSubmit={submitFn}
          onClose={vi.fn()}
        />,
      )
      .please();

    render(ui);
    const createButton = await screen.findByRole('button', { name: /create/i });
    await userEvent.click(createButton);

    expect(submitFn).toHaveBeenCalledWith<[PageCreateEdit]>({ date: '2023-10-22' });
  });
});
