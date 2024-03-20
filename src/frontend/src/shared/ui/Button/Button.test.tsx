import { render, screen } from '@testing-library/react';
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event';
import { Button } from './Button';

describe('when loading', () => {
  test('should show loader without text', () => {
    render(<Button loading>Test button</Button>);

    expect(screen.getByText(/test button/i)).not.toBeVisible();
    expect(screen.getByRole('progressbar')).toBeVisible();
  });

  test('should be disabled', () => {
    render(<Button loading>Test button</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('should not be clickable', async () => {
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
    const handleClick = vi.fn();

    render(
      <Button loading onClick={handleClick}>
        Test button
      </Button>,
    );

    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
