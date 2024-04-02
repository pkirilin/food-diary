import { type FC } from 'react';
import { useLoaderData } from 'react-router-dom';
import { notesApi, useNotes, MealsList } from '@/features/notes';
import { pagesApi, PageDetailHeader, type Page } from '@/features/pages';
import store from '@/store';
import { PrivateLayout } from '@/widgets/layout';
import { withAuthStatusCheck } from '../lib';

interface LoaderData {
  page: Page;
}

export const loader = withAuthStatusCheck(async ({ params }) => {
  const pageId = Number(params.id);
  const getPageByIdQuery = await store.dispatch(pagesApi.endpoints.getPageById.initiate(pageId));

  if (!getPageByIdQuery.isSuccess) {
    return new Response(null, { status: 500 });
  }

  await store.dispatch(notesApi.endpoints.getNotes.initiate({ pageId }));

  return { page: getPageByIdQuery.data.currentPage } satisfies LoaderData;
});

export const Component: FC = () => {
  const { page } = useLoaderData() as LoaderData;
  const notes = useNotes(page.id);

  return (
    <PrivateLayout subheader={<PageDetailHeader page={page} />}>
      <MealsList pageId={page.id} notes={notes.data} />
    </PrivateLayout>
  );
};
