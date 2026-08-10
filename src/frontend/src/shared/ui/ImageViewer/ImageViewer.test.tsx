import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageViewer } from './ImageViewer';

const ORIGINAL_SRC = 'blob:original';
const FALLBACK_SRC = 'data:image/jpeg;base64,resized';

test('should show nothing when closed', () => {
  render(
    <ImageViewer
      opened={false}
      src={ORIGINAL_SRC}
      fallbackSrc={FALLBACK_SRC}
      alt="Photo"
      onClose={vi.fn()}
    />,
  );

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('should expose the dialog with an accessible name', () => {
  render(
    <ImageViewer
      opened
      src={ORIGINAL_SRC}
      fallbackSrc={FALLBACK_SRC}
      alt="Photo"
      onClose={vi.fn()}
    />,
  );

  expect(screen.getByRole('dialog', { name: 'Photo' })).toBeVisible();
});

test('should show the resized copy as soon as it is opened', () => {
  render(
    <ImageViewer
      opened
      src={ORIGINAL_SRC}
      fallbackSrc={FALLBACK_SRC}
      alt="Photo"
      onClose={vi.fn()}
    />,
  );

  expect(screen.getByAltText('Photo')).toHaveAttribute('src', FALLBACK_SRC);
});

test('should show the original once it has decoded', async () => {
  render(
    <ImageViewer
      opened
      src={ORIGINAL_SRC}
      fallbackSrc={FALLBACK_SRC}
      alt="Photo"
      onClose={vi.fn()}
    />,
  );

  await waitFor(() => {
    expect(screen.getByAltText('Photo')).toHaveAttribute('src', ORIGINAL_SRC);
  });
});

test('should keep the resized copy when the original cannot be decoded', async () => {
  vi.spyOn(HTMLImageElement.prototype, 'decode').mockRejectedValue(new Error('decode failed'));

  render(
    <ImageViewer
      opened
      src={ORIGINAL_SRC}
      fallbackSrc={FALLBACK_SRC}
      alt="Photo"
      onClose={vi.fn()}
    />,
  );

  await waitFor(() => {
    expect(HTMLImageElement.prototype.decode).toHaveBeenCalled();
  });

  expect(screen.getByAltText('Photo')).toHaveAttribute('src', FALLBACK_SRC);
});

test('should close on close button click', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();

  render(
    <ImageViewer
      opened
      src={ORIGINAL_SRC}
      fallbackSrc={FALLBACK_SRC}
      alt="Photo"
      onClose={onClose}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'Close image viewer' }));

  expect(onClose).toHaveBeenCalled();
});
