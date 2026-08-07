import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
import { imageLib } from '@/shared/lib';
import { UploadImagesButton } from './UploadImagesButton';

afterEach(() => {
  vi.restoreAllMocks();
});

test('should create the viewer url from the original file, not the resized copy', async () => {
  const user = userEvent.setup();
  const store = configureStore();
  const resizedImage = new Blob(['resized'], { type: 'image/jpeg' });
  vi.spyOn(imageLib, 'resize').mockResolvedValue(resizedImage);
  const createObjectURL = vi.spyOn(URL, 'createObjectURL');

  const { container } = render(
    <RootProvider store={store}>
      <UploadImagesButton />
    </RootProvider>,
  );

  const file = new File(['original'], 'photo.jpg', { type: 'image/jpeg' });
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');

  if (input == null) {
    throw new Error('file input not found');
  }

  await user.upload(input, file);

  expect(createObjectURL).toHaveBeenCalledWith(file);
  expect(createObjectURL).not.toHaveBeenCalledWith(resizedImage);
});
