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
          <NutritionComponentLabel type="calories" value={calories} size="small" />
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Stack>
      </ListItemButton>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Stack
          direction="column"
          px={2}
          spacing={2}
          bgcolor={theme => alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity)}
        >
          <Stack direction="row" py={1} spacing={2} overflow="scroll">
            <NutritionComponentLabel type="protein" size="small" value={123} />
            <NutritionComponentLabel type="fats" size="small" value={12} />
            <NutritionComponentLabel type="carbs" size="small" value={123} />
            <NutritionComponentLabel type="sugar" size="small" value={12} />
            <NutritionComponentLabel type="salt" size="small" value={12} />
          </Stack>
          <Stack direction="row" justifyContent="right" spacing={2}>
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
        </Stack>
      </Collapse>
    </>
  );
};
