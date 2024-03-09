import { type FC } from 'react';
import { useLoaderData } from 'react-router-dom';
import { notesApi, MealsList, NotesTable, useNotes } from '@/features/notes';
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
      header={
        getPageByIdQuery.data && <PageContentHeader page={getPageByIdQuery.data.currentPage} />
      }
    >
      <MealsList
        notes={notes.data}
        renderItem={(notesGroup, mealType) => (
          <NotesTable
            mealType={mealType}
            notes={notesGroup}
            notesChanged={notes.isChanged}
            notesFetching={notes.isFetching}
          />
        )}
      />
    </PrivateLayout>
  );
};
