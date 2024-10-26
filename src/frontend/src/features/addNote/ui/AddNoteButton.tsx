import AddIcon from '@mui/icons-material/Add';
import { type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { type noteModel } from '@/entities/note';
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
  const canSubmit = useAppSelector(state => state.addNote.draft?.isValid);
  const isSubmitting = useAppSelector(state => state.addNote.draft?.isSubmitting);
  const dialogVisible = useAppSelector(state => state.addNote.draft?.mealType === mealType);
  const dispatch = useAppDispatch();

  const closeDialog = (): void => {
    dispatch(actions.draftDiscarded());
  };

  return (
    <>
      <Button
        fullWidth
        startIcon={<AddIcon />}
        onClick={() => dispatch(actions.draftCreated({ date, mealType, displayOrder }))}
      >
        Add note (v2)
      </Button>
      <Dialog
        pinToTop
        renderMode="fullScreenOnMobile"
        title={dialogTitle}
        opened={dialogVisible}
        onClose={closeDialog}
        content={<NoteInputFlow />}
        renderCancel={props => (
          <Button {...props} type="button" onClick={closeDialog}>
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
            Save
          </Button>
        )}
      />
    </>
  );
};
