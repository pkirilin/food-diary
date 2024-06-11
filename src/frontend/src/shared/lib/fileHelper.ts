/**
 * A helper function for downloading file represented as blob from browser
 * @param blob File blob
 * @param fileName Downloaded file name
 */
export function downloadFile(blob: Blob, fileName: string): void {
  // do not download file while running tests
  if (import.meta.env.MODE === 'test') {
    return;
  }

  const downloadLink = document.createElement('a');
  downloadLink.href = window.URL.createObjectURL(blob);
  downloadLink.download = fileName;
  downloadLink.click();
  window.URL.revokeObjectURL(downloadLink.href);
}

export const convertToBase64String = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error());
      }
    };

    reader.onerror = error => reject(error);

    reader.readAsDataURL(file);
  });

const replaceFileExtension = (fileNameWithExtension: string, newExtension: string): string =>
  fileNameWithExtension.replace(/\.[^/.]+$/, `.${newExtension}`);

export const resizeImage = (base64: string, size: number, fileName: string): Promise<File> =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = base64;

    image.onload = () => {
      const width = Math.min(size, image.width);
      const height = (image.height / image.width) * width;

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        blob => {
          if (blob) {
            const compressedFile = new File([blob], replaceFileExtension(fileName, 'jpg'), {
              type: 'image/jpeg',
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to create File object from blob'));
          }
        },
        'image/jpeg',
        1,
      );
    };

    image.onerror = reject;
  });
