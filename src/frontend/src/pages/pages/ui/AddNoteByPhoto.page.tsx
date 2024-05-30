import { CircularProgress, ImageList, ImageListItem, Stack } from '@mui/material';
import { useEffect, type FC } from 'react';
import {
  type ActionFunction,
  useLoaderData,
  redirect,
  useNavigate,
  useSubmit,
  type LoaderFunction,
  useNavigation,
} from 'react-router-dom';
import { store } from '@/app/store';
import { categoryApi, categoryLib } from '@/entities/category';
import { noteApi, noteLib, type noteModel } from '@/entities/note';
import { ProductAutocomplete, productApi, productLib } from '@/entities/product';
import {
  NoteInputForm,
  addEditNoteLib,
  type NoteInputFormSubmitHandler,
} from '@/features/note/addEdit';
import { pagesApi } from '@/features/pages';
import { Button, Dialog } from '@/shared/ui';
import { usePageFromLoader } from '../lib';

interface LoaderData {
  pageId: number;
  mealType: noteModel.MealType;
  photoUrls: string[];
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const mealType = noteLib.tryParseMealType(params.mealType);
  const photoUrls = url.searchParams.get('photoUrls')?.split(',') ?? [];

  if (mealType === null || photoUrls.length < 1) {
    return new Response(null, { status: 400 });
  }

  const pageId = Number(params.pageId);

  const queryPromises = [
    store.dispatch(pagesApi.endpoints.getPageById.initiate(pageId)),
    store.dispatch(noteApi.endpoints.getNotes.initiate({ pageId })),
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
    photoUrls,
  } satisfies LoaderData;
};

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
  const { pageId, mealType, photoUrls } = useLoaderData() as LoaderData;
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submit = useSubmit();
  const page = usePageFromLoader(pageId);
  const nextDisplayOrder = noteLib.useNextDisplayOrder(pageId, mealType);
  const productAutocomplete = productLib.useAutocompleteData();
  const categorySelect = categoryLib.useCategorySelectData();
  const productAutocompleteInput = productLib.useAutocompleteInput();
  const { setValue: setProduct } = productAutocompleteInput;
  const { values: productFormValues } = productLib.useFormValues();
  const [recognizeNote, recognizeNoteResponse] = noteApi.useRecognizeMutation();
  const submitDisabled = recognizeNoteResponse.isLoading || navigation.state === 'submitting';

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
    submit(formData, { method: 'post', action: `/pages/${page.id}/notes/${mealType}/by-photo` });
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
              displayOrder={nextDisplayOrder}
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
          disabled={submitDisabled}
          loading={navigation.state === 'submitting'}
        >
          Add
        </Button>
      )}
      renderCancel={cancelProps => (
        <Button {...cancelProps} type="button" onClick={handleCancel} disabled={submitDisabled}>
          Cancel
        </Button>
      )}
    />
  );
};
