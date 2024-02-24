import { type FC } from 'react';
import {
  type LoaderFunction,
  type ActionFunction,
  useLoaderData,
  useNavigate,
  redirect,
  useNavigation,
} from 'react-router-dom';
import { MealType, NoteInputDialog, notesApi } from '@/features/notes';
import store from '@/store';
import { badRequest, withAuthStatusCheck } from '../lib';

interface LoaderData {
  pageId: number;
  mealType: MealType;
}

export const loader: LoaderFunction = withAuthStatusCheck(({ params, request }) => {
  const pageId = Number(params.id);
  const mealType = new URL(request.url).searchParams.get('mealType');

  return {
    pageId,
    mealType: mealType ? (Number(mealType) as MealType) : MealType.Breakfast,
  } satisfies LoaderData;
});

export const action: ActionFunction = withAuthStatusCheck(async ({ request }) => {
  const formData = await request.formData();
  const pageId = formData.get('pageId');
  const mealType = formData.get('mealType');

  if (pageId === null) {
    return badRequest('pageId is required');
  }

  if (mealType === null) {
    return badRequest('mealType is required');
  }

  await store.dispatch(
    notesApi.endpoints.createNote.initiate({
      pageId: Number(pageId),
      mealType: Number(mealType),
      productId: 1,
      productQuantity: 123,
      displayOrder: 2,
    }),
  );

  return redirect(`/pages/${Number(pageId)}`);
});

export const Component: FC = () => {
  const { pageId, mealType } = useLoaderData() as LoaderData;
  const navigate = useNavigate();
  const navigation = useNavigation();

  const handleClose = (): void => {
    navigate(`/pages/${pageId}`);
  };

  return (
    <NoteInputDialog
      title="New note"
      submitInProgress={navigation.state === 'submitting'}
      pageId={pageId}
      mealType={mealType}
      onClose={handleClose}
    />
  );
};
