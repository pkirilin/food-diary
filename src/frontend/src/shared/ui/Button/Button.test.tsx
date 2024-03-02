import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('should be enabled by default', async () => {
  render(<Button />);

  expect(screen.getByRole('button')).toBeEnabled();
});

describe('when loading', () => {
  test('should disable button and show loader if disabled not specified', async () => {
    render(<Button loading={true} />);

    expect(screen.getByRole('progressbar')).toBeVisible();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('should disable button and show loader if not disabled', async () => {
    render(<Button disabled={false} loading={true} />);

    expect(screen.getByRole('progressbar')).toBeVisible();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
