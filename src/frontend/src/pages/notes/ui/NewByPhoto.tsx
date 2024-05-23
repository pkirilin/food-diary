import { Typography } from '@mui/material';
import { type FC } from 'react';
import { useLoaderData } from 'react-router-dom';
import { store } from '@/app/store';
import { type noteModel } from '@/entities/note';
import { pagesApi, type Page } from '@/features/pages';
import { PrivateLayout } from '@/widgets/layout';
import { withAuthStatusCheck } from '../../lib';
import { Subheader } from './Subheader';

interface LoaderData {
  page: Page;
  mealType: noteModel.MealType;
  photoUrls: string[];
}

export const loader = withAuthStatusCheck(async ({ request, params }) => {
  const url = new URL(request.url);
  const mealType: noteModel.MealType = Number(url.searchParams.get('mealType'));
  const photoUrls = url.searchParams.get('photoUrls')?.split(',') ?? [];

  if (photoUrls.length < 1) {
    return new Response(null, { status: 400 });
  }

  const pageId = Number(params.id);
  const getPageByIdQuery = await store.dispatch(pagesApi.endpoints.getPageById.initiate(pageId));

  if (!getPageByIdQuery.isSuccess) {
    return new Response(null, { status: 500 });
  }

  return {
    page: getPageByIdQuery.data.currentPage,
    mealType,
    photoUrls,
  } satisfies LoaderData;
});

export const Component: FC = () => {
  const { page, mealType, photoUrls } = useLoaderData() as LoaderData;

  return (
    <PrivateLayout subheader={<Subheader page={page} mealType={mealType} />}>
      <Typography variant="h5" component="h1" marginTop={1}>
        New note
      </Typography>
      <ul>
        {photoUrls.map((photoUrl, index) => (
          <li key={index}>
            <img src={photoUrl} alt="Photo" />
          </li>
        ))}
      </ul>
    </PrivateLayout>
  );
};
