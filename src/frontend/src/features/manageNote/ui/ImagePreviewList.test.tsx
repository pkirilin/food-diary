import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Image } from '../model';
import { ImagePreviewList } from './ImagePreviewList';

const createImage = (name: string): Image => ({
  id: `id-${name}`,
  name,
  base64: `data:image/jpeg;base64,${name}`,
  originalUrl: `blob:original-${name}`,
});

test('should show one button per image', () => {
  render(<ImagePreviewList images={[createImage('a'), createImage('b')]} />);

  expect(screen.getByRole('button', { name: 'Open uploaded image preview 1' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Open uploaded image preview 2' })).toBeVisible();
});

test('should open the original image and not the resized copy', async () => {
  const user = userEvent.setup();
  const image = createImage('a');

  render(<ImagePreviewList images={[image]} />);
  await user.click(screen.getByRole('button', { name: 'Open uploaded image preview 1' }));

  const viewerImage = within(screen.getByRole('dialog')).getByAltText('Uploaded image preview 1');

  expect(viewerImage).toHaveAttribute('src', image.originalUrl);
  expect(viewerImage).not.toHaveAttribute('src', image.base64);
});

test('should open the second image when its thumbnail tapped', async () => {
  const user = userEvent.setup();
  const imageA = createImage('a');
  const imageB = createImage('b');

  render(<ImagePreviewList images={[imageA, imageB]} />);
  await user.click(screen.getByRole('button', { name: 'Open uploaded image preview 2' }));

  const viewerImage = within(screen.getByRole('dialog')).getByAltText('Uploaded image preview 2');

  expect(viewerImage).toHaveAttribute('src', imageB.originalUrl);
});

test('should dismiss the viewer on close', async () => {
  const user = userEvent.setup();

  render(<ImagePreviewList images={[createImage('a')]} />);
  await user.click(screen.getByRole('button', { name: 'Open uploaded image preview 1' }));
  await user.click(screen.getByRole('button', { name: 'Close image viewer' }));

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
