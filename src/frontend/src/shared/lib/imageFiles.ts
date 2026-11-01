import * as imageLib from './image';

const toResizedBase64 = async (file: File): Promise<string> => {
  const resizedImage = await imageLib.resize(file);
  return await imageLib.convertToBase64String(resizedImage);
};

export const toImages = async (files: File[]): Promise<imageLib.Image[]> => {
  const resizedImages = await Promise.all(files.map(toResizedBase64));

  return files.map((file, index) => ({
    id: crypto.randomUUID(),
    name: file.name,
    base64: resizedImages[index],
    originalUrl: URL.createObjectURL(file),
  }));
};
