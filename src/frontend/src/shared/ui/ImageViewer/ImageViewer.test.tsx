import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
      footer={null}
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
      footer={null}
      onClose={vi.fn()}
    />,
  );

  expect(screen.getByRole('dialog', { name: 'Photo' })).toBeVisible();
});

test('should show the image when opened', () => {
  render(
    <ImageViewer
      opened
      src={ORIGINAL_SRC}
      fallbackSrc={FALLBACK_SRC}
      alt="Photo"
      footer={null}
      onClose={vi.fn()}
    />,
  );

  expect(screen.getByAltText('Photo')).toHaveAttribute('src', ORIGINAL_SRC);
});

test('should fall back to the resized copy when the original fails to load', () => {
  render(
    <ImageViewer
      opened
      src={ORIGINAL_SRC}
      fallbackSrc={FALLBACK_SRC}
      alt="Photo"
      footer={null}
      onClose={vi.fn()}
    />,
  );

  const image = screen.getByAltText('Photo');
  fireEvent.error(image);

  expect(image).toHaveAttribute('src', FALLBACK_SRC);
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
      footer={null}
      onClose={onClose}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'Close image viewer' }));

  expect(onClose).toHaveBeenCalled();
});

test('should show the footer expanded and allow collapsing it', async () => {
  const user = userEvent.setup();

  render(
    <ImageViewer
      opened
      src={ORIGINAL_SRC}
      fallbackSrc={FALLBACK_SRC}
      alt="Photo"
      footer={<p>Suggested product</p>}
      onClose={vi.fn()}
    />,
  );

  expect(within(screen.getByRole('dialog')).getByText('Suggested product')).toBeVisible();

  await user.click(screen.getByRole('button', { name: 'Collapse image details' }));

  await waitFor(() => {
    expect(screen.queryByText('Suggested product')).not.toBeInTheDocument();
  });
  expect(screen.getByRole('button', { name: 'Expand image details' })).toBeVisible();
});

test('should show no footer bar when there is no footer', () => {
  render(
    <ImageViewer
      opened
      src={ORIGINAL_SRC}
      fallbackSrc={FALLBACK_SRC}
      alt="Photo"
      footer={null}
      onClose={vi.fn()}
    />,
  );

  expect(screen.getByRole('dialog')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Collapse image details' })).not.toBeInTheDocument();
});
