import { render, screen } from '@testing-library/react';
import { Button } from '../Button';
import FullScreenDialog from './FullScreenDialog';

const renderFullScreenDialog = (): void => {
  render(
    <FullScreenDialog
      title="Edit product"
      opened
      content={<p>Dialog content</p>}
      onClose={vi.fn<() => void>()}
      renderSubmit={props => <Button {...props}>Save</Button>}
    />,
  );
};

test('should render title, content and submit action', () => {
  renderFullScreenDialog();

  expect(screen.getByText('Edit product')).toBeVisible();
  expect(screen.getByText('Dialog content')).toBeVisible();
  expect(screen.getByRole('button', { name: /save/i })).toBeVisible();
});

// MUI's FocusTrap reaches the transition's DOM node through a cloned ref and focuses it on open.
// If the transition stops forwarding that ref, focus silently stays on <body> and the dialog
// becomes unreachable by keyboard.
test('should forward the transition ref so the dialog traps focus', () => {
  renderFullScreenDialog();

  // eslint-disable-next-line testing-library/no-node-access
  const focused = document.activeElement;

  expect(focused).not.toBe(document.body);
  expect(focused).toHaveAttribute('role', 'presentation');
});
