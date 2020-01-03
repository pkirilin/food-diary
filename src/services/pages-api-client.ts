export const loadPages = async (): Promise<Response> => {
  return await fetch('pages-list-data.json');
};
