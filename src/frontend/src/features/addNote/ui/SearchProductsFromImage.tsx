import { type FC } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { actions } from '../model';
import { FoundProductsList } from './FoundProductsList';
import { ImagePreview } from './ImagePreview';

export const SearchProductsFromImage: FC = () => {
  const image = useAppSelector(state => state.addNote.image);
  const dispatch = useAppDispatch();

  if (!image) {
    return null;
  }

  // TODO: recognize logic
  return (
    <>
      <ImagePreview image={image} onRemove={() => dispatch(actions.imageRemoved())} />
      <FoundProductsList foundProducts={[]} query={'TEST'} />
    </>
  );
};
