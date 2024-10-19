import AddIcon from '@mui/icons-material/Add';
import { type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { Button, Dialog } from '@/shared/ui';
import { actions } from './model';
import { NoteInputFlow } from './NoteInputFlow';

export const AddNoteButton: FC = () => {
  const noteDraft = useAppSelector(state => state.addNote.draft);
  const dispatch = useAppDispatch();

  return (
    <div>
      <Button startIcon={<AddIcon />} onClick={() => dispatch(actions.draftCreated())}>
        Add note
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
    </div>
  );
};
