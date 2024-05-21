import { type FC } from 'react';
import { type ActionFunction, useLoaderData, redirect } from 'react-router-dom';
import { store } from '@/app/store';
import { fileApi } from '@/entities/file';
import { noteApi, noteLib } from '@/entities/note';
import { pagesApi, PageDetailHeader, type Page } from '@/features/pages';
import { PrivateLayout } from '@/widgets/layout';
import { MealsList } from '@/widgets/MealsList';
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

  await store.dispatch(noteApi.endpoints.getNotes.initiate({ pageId }));

  return { page: getPageByIdQuery.data.currentPage } satisfies LoaderData;
});

export const action: ActionFunction = async ({ request, params }) => {
  const pageId = Number(params.id);
  const formData = await request.formData();
  const photos = formData.getAll('photos');

  if (photos.length < 1) {
    return redirect(`/pages/${pageId}`);
  }

  const { files } = await store.dispatch(fileApi.endpoints.uploadFiles.initiate(formData)).unwrap();

  if (files.length < 1) {
    return new Response(null, { status: 500 });
  }

  const photoUrls = files.map(file => file.url).join(',');

  const url = `/pages/${pageId}/add-note-by-photo?${new URLSearchParams({
    photoUrls,
  }).toString()}`;

  return redirect(url);
};

export const Component: FC = () => {
  const { page } = useLoaderData() as LoaderData;
  const notes = noteLib.useNotes(page.id);

  return (
    <PrivateLayout subheader={<PageDetailHeader page={page} />}>
      <MealsList pageId={page.id} notes={notes.data} />
    </PrivateLayout>
  );
};
