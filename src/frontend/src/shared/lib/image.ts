import { convertToBase64String } from './fileHelper';

export { convertToBase64String };

const replaceFileExtension = (fileNameWithExtension: string, newExtension: string): string =>
  fileNameWithExtension.replace(/\.[^/.]+$/, `.${newExtension}`);

export const resize = (
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.9,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();

    reader.onload = event => {
      img.onload = () => {
        let [width, height] = [img.width, img.height];

        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          blob => {
            if (blob) {
              const resizedFile = new File([blob], replaceFileExtension(file.name, 'jpg'), {
                type: 'image/jpeg',
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to create File object from blob'));
            }
          },
          'image/jpeg',
          quality,
        );
      };

      img.onerror = reject;

      if (typeof event.target?.result === 'string') {
        img.src = event.target?.result;
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
