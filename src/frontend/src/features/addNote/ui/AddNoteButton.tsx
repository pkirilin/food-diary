import AddIcon from '@mui/icons-material/Add';
import { type MouseEventHandler, type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { noteApi, type noteModel } from '@/entities/note';
import { Button, Dialog } from '@/shared/ui';
import { actions, selectors } from '../model';
import { NoteInputFlow } from './NoteInputFlow';

interface Props {
  date: string;
  mealType: noteModel.MealType;
  displayOrder: number;
}

export const AddNoteButton: FC<Props> = ({ date, mealType, displayOrder }) => {
  const activeFormId = useAppSelector(selectors.activeFormId);
  const dialogTitle = useAppSelector(selectors.dialogTitle);
  const canSubmit = useAppSelector(state => state.addNote.isValid);
  const isSubmitting = useAppSelector(state => state.addNote.isSubmitting);
  const dialogVisible = useAppSelector(state => state.addNote.note?.mealType === mealType);
  const dispatch = useAppDispatch();

  const { canAddNote } = noteApi.useNotesQuery(
    { date },
    {
      selectFromResult: ({ isLoading }) => ({ canAddNote: !isLoading }),
    },
  );

  const handleDialogOpen: MouseEventHandler = () => {
    dispatch(
      actions.noteDraftSaved({
        date,
        mealType,
        displayOrder,
        product: null,
        quantity: 100,
      }),
    );
  };

  const handleDialogClose = (): void => {
    dispatch(actions.noteDraftDiscarded());
  };

  return (
    <>
      <Button fullWidth startIcon={<AddIcon />} onClick={handleDialogOpen} disabled={!canAddNote}>
        Add note
      </Button>
      <Dialog
        pinToTop
        renderMode="fullScreenOnMobile"
        title={dialogTitle}
        opened={dialogVisible}
        onClose={handleDialogClose}
        content={<NoteInputFlow />}
        renderCancel={props => (
          <Button {...props} type="button" onClick={handleDialogClose}>
            Cancel
          </Button>
        )}
        renderSubmit={props => (
          <Button
            {...props}
            type="submit"
            form={activeFormId}
            disabled={!canSubmit}
            loading={isSubmitting}
          >
            Add
          </Button>
        )}
      />
    </>
  );
};
