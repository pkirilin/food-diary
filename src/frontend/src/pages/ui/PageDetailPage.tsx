import { type FC } from 'react';
import { useLoaderData } from 'react-router-dom';
import { store } from '@/app/store';
import { noteApi, noteLib } from '@/entities/note';
import { pagesApi, PageDetailHeader } from '@/features/pages';
import { PrivateLayout } from '@/widgets/layout';
import { MealsList } from '@/widgets/MealsList';
import { withAuthStatusCheck, usePageFromLoader } from '../lib';

interface LoaderData {
  pageId: number;
}

export const loader = withAuthStatusCheck(async ({ params }) => {
  const pageId = Number(params.pageId);

  const queryPromises = [
    store.dispatch(pagesApi.endpoints.getPageById.initiate(pageId)),
    store.dispatch(noteApi.endpoints.getNotes.initiate({ pageId })),
  ];

  const queries = await Promise.all(queryPromises);
  queryPromises.forEach(promise => promise.unsubscribe());

  if (queries.some(query => query.isError)) {
    return new Response(null, { status: 500 });
  }

  return { pageId } satisfies LoaderData;
});

export const Component: FC = () => {
  const { pageId } = useLoaderData() as LoaderData;
  const page = usePageFromLoader(pageId);
  const notes = noteLib.useNotes(pageId);

  return (
    <PrivateLayout subheader={<PageDetailHeader page={page} />}>
      <MealsList pageId={pageId} notes={notes.data} />
    </PrivateLayout>
  );
};
