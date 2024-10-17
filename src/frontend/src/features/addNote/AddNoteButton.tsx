import AddIcon from '@mui/icons-material/Add';
import { type FC } from 'react';
import { useToggle } from '@/shared/hooks';
import { Button, Dialog } from '@/shared/ui';
import { SearchProducts } from './SearchProducts';

const formId = 'add-note-form';

export const AddNoteButton: FC = () => {
  const [dialogVisible, toggleDialog] = useToggle();

  return (
    <div>
      <Button startIcon={<AddIcon />} onClick={toggleDialog}>
        Add note
      </Button>
      <Dialog
        pinToTop
        renderMode="fullScreenOnMobile"
        title="New note"
        opened={dialogVisible}
        onClose={toggleDialog}
        content={
          <form id={formId}>
            <SearchProducts />
          </form>
        }
        renderCancel={props => (
          <Button {...props} type="button">
            Cancel
          </Button>
        )}
        renderSubmit={props => (
          <Button {...props} type="submit" form={formId}>
            Add
          </Button>
        )}
      />
    </div>
  );
};
