import { createFileRoute } from '@tanstack/react-router';
import { categoryApi } from '@/entities/category';
import { CategoriesPage } from '@/pages/ui/CategoriesPage';

export const Route = createFileRoute('/_app/categories')({
  staticData: {
    appBar: { variant: 'menu', title: 'Categories' },
  },
  loader: async ({ context }) => {
    const categoriesQueryPromise = context.store.dispatch(
      categoryApi.endpoints.getCategories.initiate({}),
    );

    try {
      await categoriesQueryPromise;
    } finally {
      categoriesQueryPromise.unsubscribe();
    }
  },
  component: CategoriesPage,
});
