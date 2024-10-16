import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import SearchIcon from '@mui/icons-material/Search';
import {
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  TextField,
} from '@mui/material';
import { type FC } from 'react';
import { useToggle } from '@/shared/hooks';
import { Button, Dialog } from '@/shared/ui';

const formId = 'add-note-form';

export const AddNoteButton: FC = () => {
  const [dialogVisible, toggleDialog] = useToggle();

  return (
    <div>
      <Button startIcon={<AddIcon />} onClick={toggleDialog}>
        Add note
      </Button>
      <Dialog
        renderMode="fullScreenOnMobile"
        title="New note"
        opened={dialogVisible}
        onClose={toggleDialog}
        content={
          <form id={formId}>
            <TextField
              fullWidth
              variant="outlined"
              type="search"
              placeholder="Search products"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end">
                        <InsertPhotoIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <List dense>
              <ListSubheader disableGutters>Recently added</ListSubheader>
              <ListItem disableGutters disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <HistoryIcon />
                  </ListItemIcon>
                  <ListItemText secondary="200 g">Chicken</ListItemText>
                </ListItemButton>
              </ListItem>
              <ListItem disableGutters disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <HistoryIcon />
                  </ListItemIcon>
                  <ListItemText secondary="120 g">Rice</ListItemText>
                </ListItemButton>
              </ListItem>
            </List>
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
