import { screen } from '@testing-library/react';
import { render } from 'src/testing';
import AppButton from './AppButton';

test('displays loading indicator with disabled state when `isLoading` prop is true', async () => {
  render(<AppButton isLoading={true} />);

  expect(screen.getByRole('progressbar')).toBeVisible();
  expect(screen.getByRole('button')).toBeDisabled();
});
