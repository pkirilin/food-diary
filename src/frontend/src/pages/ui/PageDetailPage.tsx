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

  const pageQuery = await store.dispatch(pagesApi.endpoints.getPageById.initiate(pageId));

  if (!pageQuery.data) {
    return new Response(null, { status: 500 });
  }

  await store.dispatch(
    noteApi.endpoints.notesByDate.initiate({ date: pageQuery.data.currentPage.date }),
  );

  return { pageId } satisfies LoaderData;
});

export const Component: FC = () => {
  const { pageId } = useLoaderData() as LoaderData;
  const page = usePageFromLoader(pageId);
  const notes = noteLib.useNotes(page.date);

  return (
    <PrivateLayout subheader={<PageDetailHeader page={page} />}>
      <MealsList date={page.date} notes={notes.data} />
    </PrivateLayout>
  );
};
