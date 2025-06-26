import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
  ListItemButton,
  ListItemText,
  Stack,
  Collapse,
  Button,
  alpha,
  Badge,
  Typography,
  Alert,
} from '@mui/material';
import { useState, type FC, type MouseEventHandler } from 'react';
import { noteModel, type NoteItem } from '@/entities/note';
import { NutritionValueDisplay } from '@/entities/product/ui/NutritionValueDisplay';
import { EditNote } from '@/features/manageNote';
import { DeleteNote } from '@/features/note/delete';

interface Props {
  note: NoteItem;
}

export const NotesListItem: FC<Props> = ({ note }) => {
  const [expanded, setExpanded] = useState(false);

  const { calories, protein, fats, carbs, sugar, salt } = noteModel.calculateNutritionValues([
    note,
  ]);

  const hasNutritionalValues = noteModel.hasNutritionalValues(note);

  const handleExpandToggle: MouseEventHandler = () => {
    setExpanded(prev => !prev);
  };

  return (
    <>
      <ListItemButton onClick={handleExpandToggle} selected={expanded}>
        <ListItemText
          primary={
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body1" component="span">
                {note.product.name}
              </Typography>
              {!hasNutritionalValues && <Badge color="warning" variant="dot" />}
            </Stack>
          }
          secondary={`${note.productQuantity} g`}
        />
        <Stack direction="row" spacing={1} alignItems="center">
          <NutritionValueDisplay type="calories" value={calories} size="small" />
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Stack>
      </ListItemButton>
      <Collapse in={expanded}>
        <Stack
          direction="column"
          px={2}
          pb={2}
          spacing={2}
          bgcolor={theme => alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity)}
        >
          <Stack direction="row" py={1} spacing={2} overflow={['auto', 'hidden']}>
            <NutritionValueDisplay type="protein" size="small" value={protein} />
            <NutritionValueDisplay type="fats" size="small" value={fats} />
            <NutritionValueDisplay type="carbs" size="small" value={carbs} />
            <NutritionValueDisplay type="sugar" size="small" value={sugar} />
            <NutritionValueDisplay type="salt" size="small" value={salt} />
          </Stack>
          {!hasNutritionalValues && (
            <Alert severity="warning" icon={<WarningAmberOutlinedIcon sx={{ fontSize: 20 }} />}>
              Nutritional values are missing
            </Alert>
          )}
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
