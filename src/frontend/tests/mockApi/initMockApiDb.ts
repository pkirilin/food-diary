export const initMockApiDb = async (): Promise<void> => {
  const { drop } = await import('@mswjs/data');
  const { db } = await import('./db');
  const { fillUsers } = await import('./user');
  const { fillPages } = await import('./pages');
  const { fillNotes } = await import('./notes');
  const { fillProducts } = await import('./products');
  const { fillCategories } = await import('./categories');

  drop(db);
  fillUsers();
  fillPages();
  fillNotes();
  fillProducts();
  fillCategories();
};
