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

export const compressImage = (base64Image: string, size: number): Promise<string> =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = base64Image;

    image.onload = () => {
      const width = Math.min(size, image.width);
      const height = (image.height / image.width) * width;

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);

      const compressedBase64Image = canvas.toDataURL(`image/jpeg`, 1);

      return resolve(compressedBase64Image);
    };

    image.onerror = reject;
  });
