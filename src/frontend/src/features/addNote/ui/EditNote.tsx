import { type ReactElement, type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { type NoteItem } from '@/entities/note';
import { Button, Dialog } from '@/shared/ui';
import { actions, selectors } from '../model';
import { NoteInputFlow } from './NoteInputFlow';

interface Props {
  note: NoteItem;
  renderTrigger: (openDialog: () => void) => ReactElement;
}

export const EditNote: FC<Props> = ({ note, renderTrigger }) => {
  const dialogTitle = useAppSelector(selectors.dialogTitle);
  const dialogVisible = useAppSelector(state => selectors.editDialogVisible(state, note));
  const activeFormId = useAppSelector(selectors.activeFormId);
  const canSubmit = useAppSelector(state => state.addNote.isValid);
  const isSubmitting = useAppSelector(state => state.addNote.isSubmitting);
  const dispatch = useAppDispatch();

  const handleDialogOpen = (): void => {
    dispatch(
      actions.noteDraftSaved({
        id: note.id,
        date: note.date,
        mealType: note.mealType,
        displayOrder: note.displayOrder,
        product: {
          id: note.productId,
          name: note.productName,
          defaultQuantity: note.productDefaultQuantity,
        },
        quantity: note.productQuantity,
      }),
    );
  };

  const handleDialogClose = (): void => {
    dispatch(actions.noteDraftDiscarded());
  };

  return (
    <>
      {renderTrigger(handleDialogOpen)}
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
            Save
          </Button>
        )}
      />
    </>
  );
};
