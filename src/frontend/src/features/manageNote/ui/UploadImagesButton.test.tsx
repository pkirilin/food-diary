import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
import { imageLib } from '@/shared/lib';
import { UploadImagesButton } from './UploadImagesButton';

vi.mock('../lib/useRecognizeNotes', () => ({
  useRecognizeNotes: () => vi.fn(),
}));

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

  await waitFor(() => {
    expect(createObjectURL).toHaveBeenCalledWith(file);
  });
  expect(createObjectURL).not.toHaveBeenCalledWith(resizedImage);
});

test('should not create viewer urls when one of the uploaded files fails to resize', async () => {
  const user = userEvent.setup();
  const store = configureStore();
  const goodFile = new File(['good'], 'good.jpg', { type: 'image/jpeg' });
  const badFile = new File(['bad'], 'bad.jpg', { type: 'image/jpeg' });

  vi.spyOn(imageLib, 'resize').mockImplementation(async file =>
    file === badFile
      ? await Promise.reject(new Error('unsupported image'))
      : new Blob(['resized'], { type: 'image/jpeg' }),
  );

  const createObjectURL = vi.spyOn(URL, 'createObjectURL');
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

  const { container } = render(
    <RootProvider store={store}>
      <UploadImagesButton />
    </RootProvider>,
  );

  const input = container.querySelector<HTMLInputElement>('input[type="file"]');

  if (input == null) {
    throw new Error('file input not found');
  }

  await user.upload(input, [goodFile, badFile]);

  await waitFor(() => {
    expect(input.value).toBe('');
  });
  expect(createObjectURL).not.toHaveBeenCalled();
  expect(store.getState().manageNote.images).toHaveLength(0);
  expect(consoleError).toHaveBeenCalledWith('Failed to upload images: ', expect.any(Error));
});
