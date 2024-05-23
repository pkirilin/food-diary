import { type FC } from 'react';
import { useLoaderData } from 'react-router-dom';
import { store } from '@/app/store';
import { pagesApi, type Page, PageDetailHeader } from '@/features/pages';
import { PrivateLayout } from '@/widgets/layout';
import { withAuthStatusCheck } from '../../lib';

interface LoaderData {
  page: Page;
  photoUrls: string[];
}

export const loader = withAuthStatusCheck(async ({ request, params }) => {
  const url = new URL(request.url);
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
    photoUrls,
  } satisfies LoaderData;
});

export const Component: FC = () => {
  const { page, photoUrls } = useLoaderData() as LoaderData;

  return (
    <PrivateLayout subheader={<PageDetailHeader page={page} />}>
      <h1>Add note by photo</h1>
      <p>
        Page: {page.id}, {page.date}
      </p>
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
