import { type FC } from 'react';
import { useLoaderData } from 'react-router-dom';
import { notesApi, useNotes, MealsList } from '@/features/notes';
import { pagesApi, PageDetailHeader } from '@/features/pages';
import store from '@/store';
import { PrivateLayout } from '@/widgets/layout';
import { withAuthStatusCheck } from '../lib';

interface LoaderData {
  pageId: number;
}

export const loader = withAuthStatusCheck(async ({ params }) => {
  const pageId = Number(params.id);
  const getPageByIdQuery = await store.dispatch(pagesApi.endpoints.getPageById.initiate(pageId));

  if (!getPageByIdQuery.isSuccess) {
    return new Response(null, { status: 500 });
  }

  await store.dispatch(notesApi.endpoints.getNotes.initiate({ pageId }));

  return { pageId } satisfies LoaderData;
});

export const Component: FC = () => {
  const { pageId } = useLoaderData() as LoaderData;
  const getPageByIdQuery = pagesApi.useGetPageByIdQuery(pageId);
  const notes = useNotes(pageId);

  return (
    <PrivateLayout
      withAdditionalNavigation
      header={
        getPageByIdQuery.data && <PageDetailHeader page={getPageByIdQuery.data.currentPage} />
      }
    >
      <MealsList pageId={pageId} notes={notes.data} />
    </PrivateLayout>
  );
};
