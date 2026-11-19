import { Blob as NodeBlob, File as NodeFile } from 'node:buffer';
import { screen } from '@testing-library/react';
import { type UserEvent } from '@testing-library/user-event';
import { imageLib } from '@/shared/lib';

// Vitest's jsdom environment fails to send a jsdom FormData holding a Blob (it reads jsdom
// internals that jsdom 30 no longer has), so the recognition request is built from Node's classes
const sendMultipartRequestsWithNodeClasses = async (): Promise<void> => {
  const nodeFormData = await new Response(new URLSearchParams()).formData();
  vi.stubGlobal('Blob', NodeBlob);
  vi.stubGlobal('File', NodeFile);
  vi.stubGlobal('FormData', nodeFormData.constructor);
};

export const pickPhotosForRecognition = async (
  user: UserEvent,
  photoNames: string[],
): Promise<void> => {
  // Created before the stubs, as jsdom reads only its own files
  const photos = photoNames.map(name => new File([name], name, { type: 'image/jpeg' }));
  await sendMultipartRequestsWithNodeClasses();
  // jsdom draws no images, so resizing passes the picked file through
  const resize = vi
    .spyOn(imageLib, 'resize')
    .mockImplementation(async file => await Promise.resolve(file));
  onTestFinished(() => {
    resize.mockRestore();
    vi.unstubAllGlobals();
  });

  await user.upload(
    await screen.findByLabelText('Recognize product from photos', { selector: 'input' }),
    photos,
  );
};
