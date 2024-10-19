import AddIcon from '@mui/icons-material/Add';
import { type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { type noteModel } from '@/entities/note';
import { Button, Dialog } from '@/shared/ui';
import { actions } from '../model';
import { NoteInputFlow } from './NoteInputFlow';

interface Props {
  date: string;
  mealType: noteModel.MealType;
  displayOrder: number;
}

export const AddNoteButton: FC<Props> = ({ date, mealType, displayOrder }) => {
  const noteDraft = useAppSelector(state => state.addNote.draft);
  const dispatch = useAppDispatch();

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
        title="New note"
        opened={!!noteDraft}
        onClose={() => dispatch(actions.draftDiscarded())}
        content={<NoteInputFlow />}
        renderCancel={props => (
          <Button {...props} type="button">
            Cancel
          </Button>
        )}
        // TODO: make prop optional?
        renderSubmit={() => <div></div>}
      />
    </>
  );
};
