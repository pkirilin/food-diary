import { type FC } from 'react';
import { type ActionFunction, useLoaderData, redirect } from 'react-router-dom';
import { store } from '@/app/store';
import { fileApi } from '@/entities/file';
import { noteApi, noteLib } from '@/entities/note';
import { pagesApi, PageDetailHeader } from '@/features/pages';
import { PrivateLayout } from '@/widgets/layout';
import { MealsList } from '@/widgets/MealsList';
import { withAuthStatusCheck } from '../../lib';
import { usePageLoaderQuery } from '../lib';

interface LoaderData {
  pageId: number;
}

export const loader = withAuthStatusCheck(async ({ params }) => {
  const pageId = Number(params.id);

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

export const action: ActionFunction = async ({ request, params }) => {
  const pageId = Number(params.id);
  const formData = await request.formData();
  const mealType = formData.get('mealType')?.toString();
  const displayOrder = formData.get('displayOrder')?.toString();
  const photos = formData.getAll('photos');

  if (!mealType || !displayOrder || photos.length < 1) {
    return redirect(`/pages/${pageId}`);
  }

  const { files } = await store.dispatch(fileApi.endpoints.uploadFiles.initiate(formData)).unwrap();

  if (files.length < 1) {
    return new Response(null, { status: 500 });
  }

  const photoUrls = files.map(file => file.url).join(',');

  const url = `/pages/${pageId}/notes/new/by-photo?${new URLSearchParams({
    mealType,
    displayOrder,
    photoUrls,
  }).toString()}`;

  return redirect(url);
};

export const Component: FC = () => {
  const { pageId } = useLoaderData() as LoaderData;
  const page = usePageLoaderQuery(pageId);
  const notes = noteLib.useNotes(pageId);

  return (
    <PrivateLayout subheader={<PageDetailHeader page={page} />}>
      <MealsList pageId={pageId} notes={notes.data} />
    </PrivateLayout>
  );
};
