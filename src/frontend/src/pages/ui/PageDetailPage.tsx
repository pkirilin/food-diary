import { type FC } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import { notesApi } from '@/features/notes';
import { MealsList } from '@/features/notes/components';
import { pagesApi } from '@/features/pages';
import PageContentHeader from '@/features/pages/components/PageContentHeader';
import store from '@/store';
import { PrivateLayout } from '@/widgets/layout';
import { withAuthStatusCheck } from '../lib';

interface LoaderData {
  pageId: number;
}

export const loader = withAuthStatusCheck(async ({ params }) => {
  const pageId = Number(params.id);
  const pageResponse = await store.dispatch(pagesApi.endpoints.getPageById.initiate(pageId));

  if (pageResponse.isError) {
    return new Response(null, { status: 500 });
  }

  const notesResponse = await store.dispatch(notesApi.endpoints.getNotes.initiate({ pageId }));

  if (notesResponse.isError) {
    return new Response(null, { status: 500 });
  }

  return { pageId } satisfies LoaderData;
});

export const Component: FC = () => {
  const { pageId } = useLoaderData() as LoaderData;
  const getPageByIdQuery = pagesApi.useGetPageByIdQuery(pageId);
  const getNotesQuery = notesApi.useGetNotesQuery({ pageId });

  return (
    <PrivateLayout
      header={
        getPageByIdQuery.data && <PageContentHeader page={getPageByIdQuery.data.currentPage} />
      }
    >
      <MealsList notes={getNotesQuery.data ?? []} />
      <Outlet />
    </PrivateLayout>
  );
};
