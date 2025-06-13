import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ListItemButton, ListItemText, Stack, Collapse, Button, alpha } from '@mui/material';
import { useState, type FC, type MouseEventHandler } from 'react';
import { noteModel, type NoteItem } from '@/entities/note';
import { NutritionComponentLabel } from '@/entities/product/ui/NutritionComponentLabel';
import { EditNote } from '@/features/manageNote';
import { DeleteNote } from '@/features/note/delete';

interface Props {
  note: NoteItem;
}

export const NotesListItem: FC<Props> = ({ note }) => {
  const [expanded, setExpanded] = useState(false);
  const calories = noteModel.calculateCalories(note);

  const handleExpandToggle: MouseEventHandler = () => {
    setExpanded(prev => !prev);
  };

  return (
    <>
      <ListItemButton onClick={handleExpandToggle} selected={expanded}>
        <ListItemText primary={note.product.name} secondary={`${note.productQuantity} g`} />
        <Stack direction="row" spacing={1} alignItems="center">
          <NutritionComponentLabel
            nutritionComponentType="calories"
            value={calories}
            size="small"
          />
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Stack>
      </ListItemButton>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Stack
          direction="row"
          justifyContent="right"
          p={2}
          spacing={2}
          bgcolor={theme => alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity)}
        >
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
