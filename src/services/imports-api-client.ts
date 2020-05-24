import { API_URL } from '../config';

const importsApiUrl = `${API_URL}/v1/imports`;

export const importPagesAsync = async (importFile: File): Promise<Response> => {
  const formData = new FormData();
  formData.append('importFile', importFile, importFile.name);
  return await fetch(`${importsApiUrl}/json`, {
    method: 'POST',
    body: formData,
  });
};
