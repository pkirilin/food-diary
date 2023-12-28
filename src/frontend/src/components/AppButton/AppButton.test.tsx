import { screen } from '@testing-library/react';
import { render } from 'src/testing';
import AppButton from './AppButton';

test('should be enabled by default', async () => {
  render(<AppButton />);

  expect(screen.getByRole('button')).toBeEnabled();
});

describe('when loading', () => {
  test('should disable button and show loader if disabled not specified', async () => {
    render(<AppButton isLoading={true} />);

    expect(screen.getByRole('progressbar')).toBeVisible();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('should disable button and show loader if not disabled', async () => {
    render(<AppButton disabled={false} isLoading={true} />);

    expect(screen.getByRole('progressbar')).toBeVisible();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
