import AddIcon from '@mui/icons-material/Add';
import { type MouseEventHandler, type FC } from 'react';
import { useAppDispatch } from '@/app/store';
import { noteApi, noteModel } from '@/entities/note';
import { Button } from '@/shared/ui';
import { actions } from '../model';
import { NoteInputDialog } from './NoteInputDialog';

interface Props {
  date: string;
  mealType: noteModel.MealType;
}

export const AddNoteButton: FC<Props> = ({ date, mealType }) => {
  const { canAddNote, displayOrder } = noteApi.useNotesQuery(
    { date },
    {
      selectFromResult: ({ isLoading, isSuccess, data }) => ({
        canAddNote: !isLoading,
        displayOrder: isSuccess ? noteModel.querySelectors.nextDisplayOrder(data, mealType) : 0,
      }),
    },
  );

  const dispatch = useAppDispatch();

  const handleDialogOpen: MouseEventHandler = () => {
    dispatch(
      actions.noteDraftCreated({
        date,
        mealType,
        displayOrder,
        product: null,
        quantity: 100,
      }),
    );
  };

  return (
    <>
      <Button fullWidth startIcon={<AddIcon />} onClick={handleDialogOpen} disabled={!canAddNote}>
        Add note
      </Button>
      <NoteInputDialog date={date} mealType={mealType} />
    </>
  );
};
