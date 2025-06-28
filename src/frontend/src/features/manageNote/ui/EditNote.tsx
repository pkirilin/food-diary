import { type ReactElement, type FC } from 'react';
import { useAppDispatch } from '@/app/store';
import { type NoteItem } from '@/entities/note';
import { actions } from '../model';
import { NoteInputDialog } from './NoteInputDialog';

interface Props {
  note: NoteItem;
  renderTrigger: (openDialog: () => void) => ReactElement;
}

export const EditNote: FC<Props> = ({ note, renderTrigger }) => {
  const dispatch = useAppDispatch();

  const handleDialogOpen = (): void => {
    dispatch(
      actions.noteDraftCreated({
        id: note.id,
        date: note.date,
        mealType: note.mealType,
        displayOrder: note.displayOrder,
        product: note.product,
        quantity: note.productQuantity,
      }),
    );
  };

  return (
    <>
      {renderTrigger(handleDialogOpen)}
      <NoteInputDialog date={note.date} mealType={note.mealType} note={note} />
    </>
  );
};
