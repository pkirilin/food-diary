import { ImageList, ImageListItem, Typography, Grid } from '@mui/material';
import { type FC } from 'react';
import { useLoaderData } from 'react-router-dom';
import { store } from '@/app/store';
import { type noteModel } from '@/entities/note';
import { ProductAutocomplete, productLib } from '@/entities/product';
import { NoteInputForm } from '@/features/note/addEdit';
import { pagesApi, type Page } from '@/features/pages';
import { PrivateLayout } from '@/widgets/layout';
import { withAuthStatusCheck } from '../../lib';
import { Subheader } from './Subheader';

interface LoaderData {
  page: Page;
  mealType: noteModel.MealType;
  displayOrder: number;
  photoUrls: string[];
}

export const loader = withAuthStatusCheck(async ({ request, params }) => {
  const url = new URL(request.url);
  const mealType: noteModel.MealType = Number(url.searchParams.get('mealType'));
  const displayOrder = Number(url.searchParams.get('displayOrder'));
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
    displayOrder,
    photoUrls,
  } satisfies LoaderData;
});

export const Component: FC = () => {
  const { page, mealType, displayOrder, photoUrls } = useLoaderData() as LoaderData;
  const productAutocompleteData = productLib.useAutocompleteData();
  const productAutocompleteInput = productLib.useAutocompleteInput();
  const { values: productFormValues } = productLib.useFormValues();

  return (
    <PrivateLayout subheader={<Subheader page={page} mealType={mealType} />}>
      <Typography variant="h5" component="h1" marginBottom={2}>
        New note by photo
      </Typography>
      <Grid container spacing={3} direction="row-reverse">
        <Grid item xs={12} md={6}>
          <ImageList cols={2}>
            {photoUrls.map((photoUrl, index) => (
              <ImageListItem key={index}>
                <img src={photoUrl} alt={`Uploaded photo ${index + 1}`} loading="lazy" />
              </ImageListItem>
            ))}
          </ImageList>
        </Grid>
        <Grid item xs={12} md={6}>
          <NoteInputForm
            id="note-input-form"
            pageId={page.id}
            mealType={mealType}
            displayOrder={displayOrder}
            quantity={100}
            productAutocompleteInput={productAutocompleteInput}
            renderProductAutocomplete={productAutocompleteProps => (
              <ProductAutocomplete
                {...productAutocompleteProps}
                autoFocus
                formValues={productFormValues}
                onChange={() => {}}
                options={productAutocompleteData.options}
                loading={productAutocompleteData.isLoading}
              />
            )}
            onSubmit={async () => {}}
            onSubmitDisabledChange={() => {}}
          />
        </Grid>
      </Grid>
    </PrivateLayout>
  );
};
