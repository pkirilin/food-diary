export const initMockApiDb = async (): Promise<void> => {
  const { drop } = await import('@mswjs/data');
  const { db } = await import('./db');
  const { fillUsers } = await import('./user');
  const { fillNotes } = await import('./notes');
  const { fillProducts } = await import('./products');
  const { fillCategories } = await import('./categories');
  const { fillWeightLogs } = await import('./weightLogs');
  const { fillMcpConsentRequests } = await import('./mcpConsent');

  drop(db);
  fillUsers();
  fillNotes();
  fillProducts();
  fillCategories();
  fillWeightLogs();
  fillMcpConsentRequests();
};
