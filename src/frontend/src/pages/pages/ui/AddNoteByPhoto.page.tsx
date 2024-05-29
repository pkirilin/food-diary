import { CircularProgress, ImageList, ImageListItem, Stack } from '@mui/material';
import { useEffect, type FC } from 'react';
import {
  type ActionFunction,
  useLoaderData,
  redirect,
  useNavigate,
  useSubmit,
} from 'react-router-dom';
import { store } from '@/app/store';
import { categoryApi, categoryLib } from '@/entities/category';
import { noteApi, type noteModel } from '@/entities/note';
import { ProductAutocomplete, productApi, productLib } from '@/entities/product';
import {
  NoteInputForm,
  addEditNoteLib,
  type NoteInputFormSubmitHandler,
} from '@/features/note/addEdit';
import { pagesApi } from '@/features/pages';
import { Button, Dialog } from '@/shared/ui';
import { withAuthStatusCheck } from '../../lib';
import { usePageFromLoader } from '../lib';

interface LoaderData {
  pageId: number;
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

  const pageId = Number(params.pageId);

  const queryPromises = [
    store.dispatch(pagesApi.endpoints.getPageById.initiate(pageId)),
    store.dispatch(productApi.endpoints.getProductSelectOptions.initiate()),
    store.dispatch(categoryApi.endpoints.getCategorySelectOptions.initiate()),
  ];

  const queries = await Promise.all(queryPromises);
  queryPromises.forEach(promise => promise.unsubscribe());

  if (queries.some(query => query.isError)) {
    return new Response(null, { status: 500 });
  }

  return {
    pageId,
    mealType,
    displayOrder,
    photoUrls,
  } satisfies LoaderData;
});

export const action: ActionFunction = async ({ request, params }) => {
  const pageId = Number(params.pageId);
  const formData = await request.formData();
  const note = addEditNoteLib.mapNoteFromFormData(formData);
  const productId = await addEditNoteLib.addProductIfNotExists(note.product);
  const createNoteRequest = addEditNoteLib.mapToCreateNoteRequest(note, productId);
  await store.dispatch(noteApi.endpoints.createNote.initiate(createNoteRequest));
  return redirect(`/pages/${pageId}`);
};

export const Component: FC = () => {
  const { pageId, mealType, displayOrder, photoUrls } = useLoaderData() as LoaderData;
  const page = usePageFromLoader(pageId);
  const productAutocomplete = productLib.useAutocompleteData();
  const categorySelect = categoryLib.useCategorySelectData();

  const navigate = useNavigate();
  const submit = useSubmit();

  const productAutocompleteInput = productLib.useAutocompleteInput();
  const { setValue: setProduct } = productAutocompleteInput;
  const { values: productFormValues } = productLib.useFormValues();
  const [recognizeNote, recognizeNoteResponse] = noteApi.useRecognizeMutation();

  useEffect(() => {
    recognizeNote({
      files: photoUrls.map(url => ({ url })),
    });
  }, [photoUrls, recognizeNote]);

  useEffect(() => {
    if (!recognizeNoteResponse.isSuccess) {
      return;
    }

    const note = recognizeNoteResponse.data.notes?.at(0);
    const category = categorySelect.data.at(0);

    if (!note || !category) {
      return;
    }

    setProduct({
      freeSolo: true,
      editing: true,
      name: note.productName,
      caloriesCost: note.productCaloriesCost,
      defaultQuantity: note.productQuantity,
      category,
    });
  }, [
    categorySelect.data,
    recognizeNoteResponse.data?.notes,
    recognizeNoteResponse.isSuccess,
    setProduct,
  ]);

  const handleCancel = (): void => {
    navigate(`/pages/${page.id}`);
  };

  const handleSubmit: NoteInputFormSubmitHandler = note => {
    const formData = addEditNoteLib.mapToFormData(note);
    submit(formData, { method: 'post', action: `/pages/${page.id}/notes/by-photo` });
    return Promise.resolve();
  };

  return (
    <Dialog
      opened
      renderMode="fullScreenOnMobile"
      title="New note"
      onClose={handleCancel}
      content={
        <Stack spacing={3}>
          <ImageList cols={2}>
            {photoUrls.map((photoUrl, index) => (
              <ImageListItem key={index}>
                <img src={photoUrl} alt={`Uploaded photo ${index + 1}`} loading="lazy" />
              </ImageListItem>
            ))}
          </ImageList>
          {recognizeNoteResponse.isLoading && (
            <Stack justifyContent="center" alignItems="center">
              <CircularProgress sx={theme => ({ marginBottom: theme.spacing(2) })} />
            </Stack>
          )}
          {recognizeNoteResponse.isSuccess && (
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
                  formValues={productFormValues}
                  options={productAutocomplete.options}
                  loading={productAutocomplete.isLoading}
                />
              )}
              onSubmit={handleSubmit}
              onSubmitDisabledChange={() => {}}
            />
          )}
        </Stack>
      }
      renderSubmit={submitProps => (
        <Button
          {...submitProps}
          type="submit"
          form="note-input-form"
          disabled={recognizeNoteResponse.isLoading}
        >
          Add
        </Button>
      )}
      renderCancel={cancelProps => (
        <Button
          {...cancelProps}
          type="button"
          onClick={handleCancel}
          disabled={recognizeNoteResponse.isLoading}
        >
          Cancel
        </Button>
      )}
    />
  );
};
