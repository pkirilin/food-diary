import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton, ListItemButton, ListItemText, Stack, Collapse, Button } from '@mui/material';
import { useState, type FC, type MouseEventHandler } from 'react';
import { type NoteItem } from '@/entities/note';
import { NutritionComponentLabel } from '@/entities/product/ui/NutritionComponentLabel';
import { EditNote } from '@/features/manageNote';
import { DeleteNote } from '@/features/note/delete';

interface Props {
  note: NoteItem;
}

export const NotesListItem: FC<Props> = ({ note }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandToggle: MouseEventHandler = () => {
    setExpanded(prev => !prev);
  };

  return (
    <>
      <ListItemButton onClick={handleExpandToggle}>
        <ListItemText primary={note.productName} secondary={`${note.productQuantity} g`} />
        <Stack direction="row" spacing={1} alignItems="center">
          <NutritionComponentLabel nutritionComponentType="calories" value={note.calories} />
          <IconButton onClick={handleExpandToggle}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>
      </ListItemButton>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Stack direction="row" justifyContent="right" p={2} spacing={2}>
          <EditNote
            note={note}
            renderTrigger={openDialog => (
              <Button startIcon={<EditIcon />} color="info" onClick={openDialog}>
                Edit
              </Button>
            )}
          />
          <DeleteNote
            note={note}
            renderTrigger={openDeleteDialog => (
              <Button startIcon={<DeleteIcon />} color="error" onClick={openDeleteDialog}>
                Delete
              </Button>
            )}
          />
        </Stack>
      </Collapse>
    </>
  );
};
