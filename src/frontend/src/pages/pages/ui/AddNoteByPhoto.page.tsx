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
import { categoryApi, type categoryModel } from '@/entities/category';
import { noteApi, type noteModel } from '@/entities/note';
import { ProductAutocomplete, productApi, productLib, type productModel } from '@/entities/product';
import {
  NoteInputForm,
  addEditNoteLib,
  type NoteInputFormSubmitHandler,
} from '@/features/note/addEdit';
import { pagesApi, type Page } from '@/features/pages';
import { Button, Dialog } from '@/shared/ui';
import { withAuthStatusCheck } from '../../lib';

interface LoaderData {
  page: Page;
  mealType: noteModel.MealType;
  displayOrder: number;
  photoUrls: string[];
  productAutocompleteOptions: productModel.AutocompleteOption[];
  categoryAutocompleteOptions: categoryModel.AutocompleteOption[];
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

  const [pageQuery, productAutocompleteQuery, categoryAutocompleteQuery] = await Promise.all([
    store.dispatch(pagesApi.endpoints.getPageById.initiate(pageId)),
    store.dispatch(productApi.endpoints.getProductSelectOptions.initiate()),
    store.dispatch(categoryApi.endpoints.getCategorySelectOptions.initiate()),
  ]);

  if (
    !pageQuery.isSuccess ||
    !productAutocompleteQuery.isSuccess ||
    !categoryAutocompleteQuery.isSuccess
  ) {
    return new Response(null, { status: 500 });
  }

  return {
    page: pageQuery.data.currentPage,
    mealType,
    displayOrder,
    photoUrls,
    productAutocompleteOptions:
      productAutocompleteQuery.data?.map(productLib.mapToAutocompleteOption) ?? [],
    categoryAutocompleteOptions: categoryAutocompleteQuery.data ?? [],
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
  const {
    page,
    mealType,
    displayOrder,
    photoUrls,
    productAutocompleteOptions,
    categoryAutocompleteOptions,
  } = useLoaderData() as LoaderData;

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
    const category = categoryAutocompleteOptions.at(0);

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
    categoryAutocompleteOptions,
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
                  options={productAutocompleteOptions}
                  loading={false}
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
