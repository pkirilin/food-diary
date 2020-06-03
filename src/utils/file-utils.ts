/**
 * A helper function for downloading file represented as blob from browser
 * @param blob File blob
 * @param fileName Downloaded file name
 */
export function downloadFile(blob: Blob, fileName: string): void {
  const downloadLink = document.createElement('a');
  downloadLink.href = window.URL.createObjectURL(blob);
  downloadLink.download = fileName;
  downloadLink.click();
  window.URL.revokeObjectURL(downloadLink.href);
}
