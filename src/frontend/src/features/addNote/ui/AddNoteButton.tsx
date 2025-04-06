import AddIcon from '@mui/icons-material/Add';
import { type MouseEventHandler, type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { noteApi, noteModel } from '@/entities/note';
import { Button, Dialog } from '@/shared/ui';
import { actions, selectors } from '../model';
import { NoteInputFlow } from './NoteInputFlow';

interface Props {
  date: string;
  mealType: noteModel.MealType;
}

export const AddNoteButton: FC<Props> = ({ date, mealType }) => {
  const activeFormId = useAppSelector(selectors.activeFormId);
  const dialogVisible = useAppSelector(state => selectors.addDialogVisible(state, mealType));
  const dialogTitle = useAppSelector(selectors.dialogTitle);
  const submitText = useAppSelector(selectors.submitText);
  const submitDisabled = useAppSelector(state => state.addNote.submitDisabled);
  const isSubmitting = useAppSelector(state => state.addNote.isSubmitting);
  const dispatch = useAppDispatch();

  const { canAddNote, displayOrder } = noteApi.useNotesQuery(
    { date },
    {
      selectFromResult: ({ isLoading, isSuccess, data }) => ({
        canAddNote: !isLoading,
        displayOrder: isSuccess ? noteModel.querySelectors.nextDisplayOrder(data, mealType) : 0,
      }),
    },
  );

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
        content={<NoteInputFlow date={date} />}
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
            disabled={submitDisabled}
            loading={isSubmitting}
          >
            {submitText}
          </Button>
        )}
      />
    </>
  );
};
