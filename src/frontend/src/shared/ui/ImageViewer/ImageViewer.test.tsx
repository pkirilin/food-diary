import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageViewer } from './ImageViewer';

const ORIGINAL_SRC = 'blob:original';
const FALLBACK_SRC = 'data:image/jpeg;base64,resized';

// The viewer decodes the original out of band, so every test that opens it must await the swap -
// otherwise the state update lands after the test body and React warns about updates outside act()
const waitForOriginalToDecode = async (): Promise<void> => {
  await waitFor(() => {
    expect(screen.getByAltText('Photo')).toHaveAttribute('src', ORIGINAL_SRC);
  });
};

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

test('should expose the dialog with an accessible name', async () => {
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

  await waitForOriginalToDecode();
});

test('should show the resized copy as soon as it is opened', async () => {
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

  await waitForOriginalToDecode();
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

  await waitForOriginalToDecode();
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
